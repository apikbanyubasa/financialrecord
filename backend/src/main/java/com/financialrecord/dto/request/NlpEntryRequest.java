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
public class NlpEntryRequest {

    @NotBlank(message = "Teks transaksi tidak boleh kosong")
    private String text;
}
