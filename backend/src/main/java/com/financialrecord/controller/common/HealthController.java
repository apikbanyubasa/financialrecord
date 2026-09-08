package com.financialrecord.controller.common;

import com.financialrecord.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/health", "/api/v1/health"})
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Health Check", description = "Enterprise Uptime & Infrastructure Health Status")
public class HealthController {

    private final DataSource dataSource;

    @GetMapping
    @Operation(summary = "Pemeriksaan Kesehatan Sistem", description = "Mengembalikan status operasional database, memori, dan uptime sistem")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("service", "FinancialRecord API Server");
        details.put("status", "UP");
        details.put("timestamp", LocalDateTime.now());

        // Check Database Connectivity
        boolean dbHealthy = false;
        long dbLatencyMs = -1;
        try {
            long start = System.currentTimeMillis();
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                stmt.execute("SELECT 1");
                dbHealthy = true;
                dbLatencyMs = System.currentTimeMillis() - start;
            }
        } catch (Exception e) {
            log.error("Health check database probe failed: {}", e.getMessage());
        }

        Map<String, Object> dbDetails = new LinkedHashMap<>();
        dbDetails.put("status", dbHealthy ? "CONNECTED" : "DISCONNECTED");
        dbDetails.put("latencyMs", dbLatencyMs);
        details.put("database", dbDetails);

        // System Metrics & Memory
        Runtime runtime = Runtime.getRuntime();
        long totalMemoryMb = runtime.totalMemory() / (1024 * 1024);
        long freeMemoryMb = runtime.freeMemory() / (1024 * 1024);
        long usedMemoryMb = totalMemoryMb - freeMemoryMb;

        Map<String, Object> memoryDetails = new LinkedHashMap<>();
        memoryDetails.put("totalMb", totalMemoryMb);
        memoryDetails.put("usedMb", usedMemoryMb);
        memoryDetails.put("freeMb", freeMemoryMb);
        details.put("memory", memoryDetails);

        // Disk space
        File root = new File(".");
        long freeDiskGb = root.getFreeSpace() / (1024 * 1024 * 1024);
        details.put("freeDiskGb", freeDiskGb);

        // JVM Uptime
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        details.put("uptimeSeconds", uptimeSeconds);

        if (!dbHealthy) {
            details.put("status", "DEGRADED");
            return ResponseEntity.status(503).body(ApiResponse.ok("Layanan sedang terdegradasi (Database tidak responsif)", details));
        }

        return ResponseEntity.ok(ApiResponse.ok("Sistem beroperasi normal dan sehat", details));
    }
}
