package com.financialrecord.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private BigDecimal totalBalance;
    private BigDecimal totalIncomeThisMonth;
    private BigDecimal totalExpenseThisMonth;
    private BigDecimal netSavingsThisMonth;
    private double savingsRatePercentage;

    // Bocor halus (micro-spending) summary
    private BigDecimal bocorHalusTotal;
    private int bocorHalusCount;

    // Category breakdown for charts
    private List<CategoryBreakdownItem> categoryExpenses;
    private List<CategoryBreakdownItem> categoryIncomes;

    // Cashflow time-series for AreaChart
    private List<CashflowDataPoint> cashflowTrend;

    // Wallets & Recent Transactions
    private List<WalletResponse> wallets;
    private List<TransactionResponse> recentTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdownItem {
        private String categoryId;
        private String categoryName;
        private String icon;
        private String color;
        private BigDecimal amount;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashflowDataPoint {
        private String date; // YYYY-MM-DD
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal net;
    }
}
