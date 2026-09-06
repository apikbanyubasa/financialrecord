package com.financialrecord.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.security.UserPrincipal;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter untuk memvalidasi limit request per detik/menit (Rate Limiting & Throttling)
 * pada setiap request yang masuk ke API FinancialRecord.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Lewatkan langsung jika rate limiting dimatikan atau request berupa CORS Preflight (OPTIONS)
        if (!rateLimitingService.isEnabled() || HttpMethod.OPTIONS.matches(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        RateLimitTier tier = determineTier(uri);
        String clientKey = resolveClientKey(request);

        ConsumptionProbe probe = rateLimitingService.tryConsume(clientKey, tier);

        if (probe.isConsumed()) {
            // Berhasil mengonsumsi token, tambahkan header informatif
            response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimitingService.getLimitForTier(tier)));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            // Limit terlampaui -> Berikan HTTP 429 Too Many Requests
            long waitForSeconds = Math.max(1, (probe.getNanosToWaitForRefill() + 999_999_999L) / 1_000_000_000L);

            log.warn("Rate limit exceeded for client: [{}] on tier: [{}] for URI: [{}]. Retry after: {}s",
                    clientKey, tier, uri, waitForSeconds);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimitingService.getLimitForTier(tier)));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("X-RateLimit-Reset", String.valueOf(waitForSeconds));
            response.setHeader("Retry-After", String.valueOf(waitForSeconds));

            ApiResponse<Object> errorResponse = ApiResponse.error(
                    "Terlalu banyak permintaan (Rate limit exceeded). Silakan coba lagi dalam " + waitForSeconds + " detik."
            );

            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        }
    }

    /**
     * Mengidentifikasi kategori tier rate limit berdasarkan path URI request.
     */
    private RateLimitTier determineTier(String uri) {
        if (uri.startsWith("/api/v1/auth/login") || uri.startsWith("/api/v1/auth/register")) {
            return RateLimitTier.AUTH;
        } else if (uri.startsWith("/api/v1/user/ai/")) {
            return RateLimitTier.AI_NLP;
        } else if (uri.startsWith("/api/v1/admin/")) {
            return RateLimitTier.ADMIN_API;
        } else if (uri.startsWith("/api/v1/user/")) {
            return RateLimitTier.USER_API;
        } else {
            return RateLimitTier.PUBLIC;
        }
    }

    /**
     * Menentukan identifier unik client:
     * Menggunakan User ID jika request terotentikasi, atau IP Address jika anonim.
     */
    private String resolveClientKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal principal) {
            return "user:" + principal.getId();
        }

        return "ip:" + getClientIp(request);
    }

    /**
     * Mengekstrak alamat IP asli klien dengan mempertimbangkan header reverse proxy (X-Forwarded-For).
     */
    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.trim().isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
