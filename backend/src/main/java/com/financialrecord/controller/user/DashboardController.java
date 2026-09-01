package com.financialrecord.controller.user;

import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.DashboardSummaryResponse;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user/dashboard")
@RequiredArgsConstructor
@Tag(name = "User Dashboard", description = "Endpoints untuk Ringkasan Cashflow, Alokasi Pengeluaran, dan Metrik Finansial")
public class DashboardController {

    private final TransactionService transactionService;

    @GetMapping("/summary")
    @Operation(summary = "Ringkasan Dashboard Finansial", description = "Mengambil total pemasukan, rincian pengeluaran, rasio tabungan, bocor halus, dan grafik cashflow")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(@AuthenticationPrincipal UserPrincipal principal) {
        DashboardSummaryResponse summary = transactionService.getDashboardSummary(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }
}
