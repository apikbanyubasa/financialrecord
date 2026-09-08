package com.financialrecord.dto.request;

import com.financialrecord.entity.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    @NotNull(message = "Dompet (Wallet) wajib dipilih")
    private UUID walletId;

    @NotNull(message = "Kategori wajib dipilih")
    private UUID categoryId;

    @NotNull(message = "Nominal transaksi tidak boleh kosong")
    @DecimalMin(value = "0.01", message = "Nominal harus lebih dari 0")
    private BigDecimal amount;

    @NotNull(message = "Tipe transaksi wajib ditentukan")
    private TransactionType type;

    @NotNull(message = "Tanggal transaksi wajib diisi")
    private LocalDateTime transactionDate;

    private String description;

    @Builder.Default
    private boolean isRecurring = false;
}
