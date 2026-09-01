package com.financialrecord.controller.user;

import com.financialrecord.dto.request.TransactionRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.TransactionResponse;
import com.financialrecord.entity.enums.TransactionType;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Endpoints untuk Pencatatan Transaksi Pemasukan & Pengeluaran")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "Daftar Transaksi dengan Filter & Pagination")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID walletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 15, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<TransactionResponse> transactions = transactionService.getTransactions(
                principal.getId(), type, categoryId, walletId, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.ok(transactions));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detail Transaksi berdasarkan ID")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        TransactionResponse transaction = transactionService.getTransactionById(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(transaction));
    }

    @PostMapping
    @Operation(summary = "Catat Transaksi Baru (Pemasukan / Pengeluaran)")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TransactionRequest request
    ) {
        TransactionResponse transaction = transactionService.createTransaction(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Transaksi berhasil dicatat", transaction));
    }

    @PostMapping("/batch")
    @Operation(summary = "Catat Banyak Transaksi Sekaligus (Batch Import / Multi-NLP)")
    public ResponseEntity<ApiResponse<java.util.List<TransactionResponse>>> createTransactionsBatch(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody java.util.List<TransactionRequest> requests
    ) {
        java.util.List<TransactionResponse> transactions = transactionService.createTransactionsBatch(principal.getId(), requests);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Berhasil menyimpan " + transactions.size() + " transaksi sekaligus", transactions));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Perbarui Transaksi")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request
    ) {
        TransactionResponse transaction = transactionService.updateTransaction(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Transaksi berhasil diperbarui", transaction));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hapus Transaksi")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        transactionService.deleteTransaction(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Transaksi berhasil dihapus", null));
    }
}
