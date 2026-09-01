package com.financialrecord.controller.user;

import com.financialrecord.dto.request.WalletRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.WalletResponse;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user/wallets")
@RequiredArgsConstructor
@Tag(name = "Wallets", description = "Endpoints untuk Mengelola Akun Dompet / Rekening Bank / E-Wallet")
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    @Operation(summary = "Daftar Dompet Pengguna")
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getWallets(@AuthenticationPrincipal UserPrincipal principal) {
        List<WalletResponse> wallets = walletService.getWalletsByUserId(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(wallets));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detail Dompet")
    public ResponseEntity<ApiResponse<WalletResponse>> getWalletById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        WalletResponse wallet = walletService.getWalletById(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(wallet));
    }

    @PostMapping
    @Operation(summary = "Tambah Dompet Baru")
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WalletRequest request
    ) {
        WalletResponse wallet = walletService.createWallet(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Dompet baru berhasil ditambahkan", wallet));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Data Dompet")
    public ResponseEntity<ApiResponse<WalletResponse>> updateWallet(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody WalletRequest request
    ) {
        WalletResponse wallet = walletService.updateWallet(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Dompet berhasil diperbarui", wallet));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hapus Dompet")
    public ResponseEntity<ApiResponse<Void>> deleteWallet(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        walletService.deleteWallet(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Dompet berhasil dihapus", null));
    }
}
