package com.financialrecord.controller.admin;

import com.financialrecord.dto.response.AdminMetricsResponse;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.service.admin.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Endpoints untuk Statistik & Metrik Platform Khusus Administrator")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/metrics")
    @Operation(summary = "Metrik Agregat Platform (Total User, Transaksi, Volume Uang, AI Stats)")
    public ResponseEntity<ApiResponse<AdminMetricsResponse>> getPlatformMetrics() {
        AdminMetricsResponse metrics = adminDashboardService.getPlatformMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }
}
