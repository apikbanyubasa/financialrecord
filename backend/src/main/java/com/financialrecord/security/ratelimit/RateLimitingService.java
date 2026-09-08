package com.financialrecord.security.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service untuk mengelola Token Bucket Rate Limiting & Throttling berbasis Bucket4j.
 * Menyimpan bucket in-memory per client identifier (IP Address atau User ID) dan tier.
 */
@Service
@Slf4j
public class RateLimitingService {

    @Getter
    @Value("${app.rate-limiting.enabled:true}")
    private boolean enabled;

    @Value("${app.rate-limiting.auth-limit-per-minute:10}")
    private long authLimitPerMinute;

    @Value("${app.rate-limiting.ai-limit-per-minute:20}")
    private long aiLimitPerMinute;

    @Value("${app.rate-limiting.user-limit-per-minute:120}")
    private long userLimitPerMinute;

    @Value("${app.rate-limiting.admin-limit-per-minute:200}")
    private long adminLimitPerMinute;

    @Value("${app.rate-limiting.public-limit-per-minute:300}")
    private long publicLimitPerMinute;

    // Cache bucket in-memory thread-safe
    private final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    /**
     * Mencoba mengonsumsi 1 token dari bucket untuk client & tier tertentu.
     *
     * @param clientKey identifier client (misal: "ip:127.0.0.1" atau "user:uuid")
     * @param tier kategori endpoint
     * @return ConsumptionProbe berisi status apakah token berhasil dikonsumsi, sisa token, dan waktu tunggu refill
     */
    public ConsumptionProbe tryConsume(String clientKey, RateLimitTier tier) {
        String cacheKey = tier.name() + ":" + clientKey;
        Bucket bucket = bucketCache.computeIfAbsent(cacheKey, k -> createNewBucket(tier));
        return bucket.tryConsumeAndReturnRemaining(1);
    }

    /**
     * Mendapatkan nilai kapasitas limit per menit untuk tier tertentu.
     */
    public long getLimitForTier(RateLimitTier tier) {
        return switch (tier) {
            case AUTH -> authLimitPerMinute;
            case AI_NLP -> aiLimitPerMinute;
            case USER_API -> userLimitPerMinute;
            case ADMIN_API -> adminLimitPerMinute;
            case PUBLIC -> publicLimitPerMinute;
        };
    }

    /**
     * Membuat Bucket baru dengan alokasi bandwidth dan algoritma Greedy Refill per 1 menit.
     */
    private Bucket createNewBucket(RateLimitTier tier) {
        long limit = getLimitForTier(tier);
        Bandwidth bandwidth = Bandwidth.builder()
                .capacity(limit)
                .refillGreedy(limit, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(bandwidth)
                .build();
    }

    /**
     * Membersihkan bucket yang sudah idle (kapasitas token penuh) secara berkala setiap 30 menit
     * untuk mencegah akumulasi memori akibat entri IP anonim yang tidak aktif.
     */
    @Scheduled(fixedRate = 1800000)
    public void cleanupIdleBuckets() {
        if (bucketCache.isEmpty()) {
            return;
        }
        int initialSize = bucketCache.size();
        bucketCache.entrySet().removeIf(entry -> {
            Bucket bucket = entry.getValue();
            return bucket.getAvailableTokens() >= getLimitForCacheKey(entry.getKey());
        });
        int removed = initialSize - bucketCache.size();
        if (removed > 0) {
            log.debug("RateLimitingService: Membersihkan {} bucket idle dari memori. Sisa bucket aktif: {}", removed, bucketCache.size());
        }
    }

    private long getLimitForCacheKey(String cacheKey) {
        for (RateLimitTier tier : RateLimitTier.values()) {
            if (cacheKey.startsWith(tier.name() + ":")) {
                return getLimitForTier(tier);
            }
        }
        return publicLimitPerMinute;
    }

    /**
     * Membersihkan cache bucket jika diperlukan (misal: saat testing / periodic maintenance).
     */
    public void clearCache() {
        bucketCache.clear();
        log.info("Rate limit bucket cache cleared.");
    }
}
