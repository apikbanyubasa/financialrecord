package com.financialrecord.controller.admin;

import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.AiUsageStatsResponse;
import com.financialrecord.entity.AiUsageLog;
import com.financialrecord.service.admin.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/ai-monitoring")
@RequiredArgsConstructor
@Tag(name = "Admin AI Monitoring", description = "Endpoints untuk Memantau Konsumsi Token AI, Biaya API, dan Log Latensi")
public class AdminAiMonitorController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Statistik Agregat Penggunaan Token AI & Biaya USD")
    public ResponseEntity<ApiResponse<AiUsageStatsResponse>> getAiUsageStats() {
        AiUsageStatsResponse stats = adminDashboardService.getAiUsageStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/logs")
    @Operation(summary = "Log Riwayat Pemanggilan AI Per Request")
    public ResponseEntity<ApiResponse<Page<AiUsageLog>>> getAiUsageLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AiUsageLog> logs = adminDashboardService.getAiUsageLogs(pageable);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
