package com.financialrecord.dto.response;

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
public class BudgetResponse {

    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal monthlyLimit;
    private BigDecimal currentSpent;
    private BigDecimal remainingAmount;
    private double percentageUsed;
    private String periodMonthYear;
    private boolean isOverBudget;
    private LocalDateTime createdAt;
}
