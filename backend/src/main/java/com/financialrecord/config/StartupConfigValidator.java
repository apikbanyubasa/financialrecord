package com.financialrecord.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Validates critical environment variables and secrets at application startup.
 * Enforces Zero-Trust & Fail-Fast enterprise principles: halts server startup
 * with clear diagnostics if mandatory production parameters are missing or weak.
 */
@Component
@Order(1)
@Slf4j
public class StartupConfigValidator implements ApplicationRunner {

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:}")
    private String datasourceUsername;

    @Value("${app.jwt.secret:}")
    private String jwtSecret;

    @Value("${app.ai.provider:gemini}")
    private String aiProvider;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.openai.api-key:}")
    private String openAiApiKey;

    @Override
    public void run(ApplicationArguments args) {
        log.info("🔍 [StartupValidator] Memeriksa kelayakan parameter konfigurasi & variabel lingkungan...");

        List<String> violations = new ArrayList<>();

        // 1. Database Configuration Check
        if (datasourceUrl == null || datasourceUrl.trim().isEmpty()) {
            violations.add("SPRING_DATASOURCE_URL tidak boleh kosong. Harap tentukan URL database JDBC PostgreSQL.");
        }
        if (datasourceUsername == null || datasourceUsername.trim().isEmpty()) {
            violations.add("SPRING_DATASOURCE_USERNAME tidak boleh kosong.");
        }

        // 2. JWT Secret Cryptographic Strength Check (Enterprise Grade: min 32 chars / 256 bits)
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            violations.add("JWT_SECRET belum ditentukan di file .env atau variabel lingkungan.");
        } else if (jwtSecret.trim().length() < 32) {
            violations.add("JWT_SECRET terlalu pendek (" + jwtSecret.trim().length() + " karakter). " +
                    "Standar keamanan enterprise mewajibkan secret key minimal 32 karakter (256-bit) untuk algoritma HS256.");
        }

        // 3. AI Service Key Verification
        if ("gemini".equalsIgnoreCase(aiProvider)) {
            if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("your_gemini_api_key")) {
                log.warn("⚠️ [StartupValidator] GEMINI_API_KEY belum terisi atau masih memakai placeholder. Fitur AI NLP Catat Cepat akan dinonaktifkan.");
            } else {
                log.info("✅ [StartupValidator] GEMINI_API_KEY terdeteksi dan aktif.");
            }
        } else if ("openai".equalsIgnoreCase(aiProvider)) {
            if (openAiApiKey == null || openAiApiKey.trim().isEmpty() || openAiApiKey.contains("your_openai_api_key")) {
                log.warn("⚠️ [StartupValidator] OPENAI_API_KEY belum terisi. Fitur AI akan dinonaktifkan.");
            }
        }

        // Fail-Fast: Hentikan eksekusi jika ada pelanggaran fatal
        if (!violations.isEmpty()) {
            log.error("================================================================================");
            log.error("❌ [STARTUP CONFIGURATION ERROR] Aplikasi gagal dinyalakan karena konfigurasi tidak valid:");
            for (int i = 0; i < violations.size(); i++) {
                log.error("   {}. {}", i + 1, violations.get(i));
            }
            log.error("Periksa kembali template di backend/.env.example dan lengkapi file .env Anda.");
            log.error("================================================================================");
            throw new IllegalStateException("Startup configuration validation failed with " + violations.size() + " critical issue(s).");
        }

        log.info("✅ [StartupValidator] Seluruh konfigurasi inti valid. Server siap melayani request.");
    }
}
