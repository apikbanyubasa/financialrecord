package com.financialrecord.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeleteAccountRequest {

    @NotBlank(message = "Password konfirmasi wajib diisi untuk menonaktifkan akun")
    private String password;

    @NotBlank(message = "Frase konfirmasi 'HAPUS AKUN SAYA' wajib diisi")
    private String confirmationPhrase;
}
