package com.financialrecord.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequest {

    @NotNull(message = "Kategori wajib dipilih")
    private UUID categoryId;

    @NotNull(message = "Limit budget bulanan tidak boleh kosong")
    @DecimalMin(value = "1000", message = "Limit budget minimal Rp 1.000")
    private BigDecimal monthlyLimit;

    @NotBlank(message = "Periode bulan/tahun wajib diisi")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Format periode harus YYYY-MM (contoh: 2026-09)")
    private String periodMonthYear;
}
