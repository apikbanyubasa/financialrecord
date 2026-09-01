package com.financialrecord.dto.request;

import com.financialrecord.entity.enums.PocketType;
import com.financialrecord.entity.enums.WalletType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletRequest {

    @NotBlank(message = "Nama dompet wajib diisi")
    private String name;

    @NotNull(message = "Tipe dompet wajib dipilih")
    private WalletType type;

    private PocketType pocketType;

    private Boolean aiGenerated;

    private String aiInsight;

    @NotNull(message = "Saldo awal tidak boleh kosong")
    @DecimalMin(value = "0.0", inclusive = true, message = "Saldo tidak boleh negatif")
    private BigDecimal initialBalance;
}
