package com.financialrecord.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isOverBudget")
    private boolean isOverBudget;

    private LocalDateTime createdAt;

    @JsonProperty("isOverBudget")
    public boolean isOverBudget() {
        return isOverBudget;
    }

    @JsonProperty("isOverBudget")
    public void setOverBudget(boolean overBudget) {
        this.isOverBudget = overBudget;
    }
}
