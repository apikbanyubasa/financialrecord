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
public class ResetDataRequest {

    @NotBlank(message = "Password konfirmasi wajib diisi untuk mereset seluruh data finansial")
    private String password;
}
