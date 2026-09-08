package com.financialrecord.controller.user;

import com.financialrecord.dto.request.ChangePasswordRequest;
import com.financialrecord.dto.request.DeleteAccountRequest;
import com.financialrecord.dto.request.ResetDataRequest;
import com.financialrecord.dto.request.UpdateProfileRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.UserProfileResponse;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.user.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Endpoints Pengaturan Akun, Profil, Keamanan, dan Tata Kelola Data Pengguna")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    @Operation(summary = "Dapatkan Profil Pengguna Saat Ini")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UserProfileResponse profile = userProfileService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Data profil berhasil dimuat", profile));
    }

    @PutMapping
    @Operation(summary = "Perbarui Profil Pengguna (Nama & Email)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UserProfileResponse updated = userProfileService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profil berhasil diperbarui", updated));
    }

    @PutMapping("/password")
    @Operation(summary = "Ubah Kata Sandi Akun")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userProfileService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password berhasil diubah", null));
    }

    @PostMapping("/reset-data")
    @Operation(summary = "Reset Seluruh Data Transaksi dan Saldo Dompet")
    public ResponseEntity<ApiResponse<Void>> resetUserData(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ResetDataRequest request
    ) {
        userProfileService.resetUserData(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Seluruh data transaksi berhasil direset", null));
    }

    @DeleteMapping
    @Operation(summary = "Hapus / Nonaktifkan Akun Pengguna")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DeleteAccountRequest request
    ) {
        userProfileService.deleteAccount(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Akun berhasil dinonaktifkan", null));
    }
}
