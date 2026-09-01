package com.financialrecord.controller.user;

import com.financialrecord.dto.request.BudgetRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.BudgetResponse;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Endpoints untuk Mengatur & Memantau Limit Budget Bulanan per Kategori")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Daftar Budget untuk Periode Tertentu (Format: YYYY-MM)")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String period
    ) {
        String queryPeriod = (period != null && !period.trim().isEmpty()) ? period : YearMonth.now().toString();
        List<BudgetResponse> budgets = budgetService.getBudgetsByPeriod(principal.getId(), queryPeriod);
        return ResponseEntity.ok(ApiResponse.ok(budgets));
    }

    @PostMapping
    @Operation(summary = "Set atau Update Limit Budget Kategori")
    public ResponseEntity<ApiResponse<BudgetResponse>> setBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BudgetRequest request
    ) {
        BudgetResponse budget = budgetService.setBudget(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Limit budget berhasil disimpan", budget));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hapus Limit Budget")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        budgetService.deleteBudget(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Budget berhasil dihapus", null));
    }
}
