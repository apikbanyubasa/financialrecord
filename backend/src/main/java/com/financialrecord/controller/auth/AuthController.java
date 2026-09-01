package com.financialrecord.controller.auth;

import com.financialrecord.dto.request.LoginRequest;
import com.financialrecord.dto.request.RegisterRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.AuthResponse;
import com.financialrecord.dto.response.UserProfileResponse;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints untuk Registrasi, Login, dan Profil User")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login Pengguna", description = "Mengembalikan JWT Bearer Token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login berhasil", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Registrasi Pengguna Baru", description = "Membuat akun baru dengan role ROLE_USER")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registrasi akun berhasil", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Data Profil Saat Ini", description = "Mendapatkan profil pengguna yang sedang login")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponse response = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
