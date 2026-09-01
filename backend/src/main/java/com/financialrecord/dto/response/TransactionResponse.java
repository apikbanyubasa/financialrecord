package com.financialrecord.dto.response;

import com.financialrecord.entity.enums.TransactionType;
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
public class TransactionResponse {

    private UUID id;
    private UUID walletId;
    private String walletName;
    private UUID categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDateTime transactionDate;
    private String description;
    private String receiptImageUrl;
    private boolean isRecurring;
    private LocalDateTime createdAt;
}
