package com.financialrecord.security.ratelimit;

/**
 * Enum kategori tingkat rate limit berdasarkan sensitivitas endpoint.
 */
public enum RateLimitTier {
    AUTH,       // Login, Register (Per IP)
    AI_NLP,     // NLP Parser, Batch AI (Per User ID / IP)
    USER_API,   // Transaksi, Dompet, Budget, Kategori (Per User ID)
    ADMIN_API,  // Dashboard Admin, Monitoring (Per Admin ID)
    PUBLIC      // Actuator, Swagger (Per IP)
}
