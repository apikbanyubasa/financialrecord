package com.financialrecord.dto.response;

import com.financialrecord.entity.enums.PocketType;
import com.financialrecord.entity.enums.WalletType;
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
public class WalletResponse {

    private UUID id;
    private String name;
    private WalletType type;
    private PocketType pocketType;
    private Boolean aiGenerated;
    private String aiInsight;
    private String icon;
    private String color;
    private String categoryName;
    private BigDecimal balance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private Long transactionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
