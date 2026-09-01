package com.financialrecord.controller.admin;

import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.UserProfileResponse;
import com.financialrecord.service.admin.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin Users", description = "Endpoints untuk Tata Kelola & Status Pengguna")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Daftar Semua Pengguna dengan Pagination")
    public ResponseEntity<ApiResponse<Page<UserProfileResponse>>> getAllUsers(
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<UserProfileResponse> users = adminUserService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Toggle Status Akun User (Aktif / Suspend)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> toggleUserStatus(
            @PathVariable UUID id,
            @RequestParam boolean isActive
    ) {
        UserProfileResponse updatedUser = adminUserService.toggleUserStatus(id, isActive);
        String msg = isActive ? "Akun berhasil diaktifkan" : "Akun berhasil dinonaktifkan (suspend)";
        return ResponseEntity.ok(ApiResponse.ok(msg, updatedUser));
    }
}
