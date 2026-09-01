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
public class AiPromptRequest {

    @NotBlank(message = "Pesan prompt wajib diisi")
    private String prompt;
}
