package com.financialrecord.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotBlank(message = "Password lama tidak boleh kosong")
    private String currentPassword;

    @NotBlank(message = "Password baru tidak boleh kosong")
    @Size(min = 8, max = 100, message = "Password baru minimal harus 8 karakter")
    private String newPassword;

    @NotBlank(message = "Konfirmasi password baru tidak boleh kosong")
    private String confirmPassword;
}
