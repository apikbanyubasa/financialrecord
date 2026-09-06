package com.financialrecord.controller.auth;

import com.financialrecord.dto.request.LoginRequest;
import com.financialrecord.dto.request.RegisterRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.AuthResponse;
import com.financialrecord.dto.response.UserProfileResponse;
import com.financialrecord.exception.UnauthorizedException;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints untuk Registrasi, Login, dan Profil User")
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/login")
    @Operation(summary = "Login Pengguna", description = "Mengatur HttpOnly cookie auth_token dan mengembalikan info pengguna")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        ResponseCookie authCookie = buildAuthCookie(response.getToken(), jwtExpirationMs / 1000);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookie.toString())
                .body(ApiResponse.ok("Login berhasil", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Registrasi Pengguna Baru", description = "Membuat akun baru dengan role ROLE_USER dan mengatur auth cookie")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        ResponseCookie authCookie = buildAuthCookie(response.getToken(), jwtExpirationMs / 1000);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, authCookie.toString())
                .body(ApiResponse.ok("Registrasi akun berhasil", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout Pengguna", description = "Menghapus cookie autentikasi")
    public ResponseEntity<ApiResponse<Void>> logout() {
        ResponseCookie expiredCookie = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .body(ApiResponse.ok("Logout berhasil", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Data Profil Saat Ini", description = "Mendapatkan profil pengguna yang sedang login")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Sesi login tidak valid atau token telah kedaluwarsa.");
        }
        UserProfileResponse response = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private ResponseCookie buildAuthCookie(String token, long maxAgeSeconds) {
        return ResponseCookie.from("auth_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
    }
}
