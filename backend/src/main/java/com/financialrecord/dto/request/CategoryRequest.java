package com.financialrecord.dto.request;

import com.financialrecord.entity.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Nama kategori wajib diisi")
    private String name;

    @NotNull(message = "Tipe transaksi wajib ditentukan (EXPENSE atau INCOME)")
    private TransactionType type;

    private String icon;
    private String color;
}
