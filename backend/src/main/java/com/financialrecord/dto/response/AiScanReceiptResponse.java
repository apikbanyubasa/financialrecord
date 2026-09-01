package com.financialrecord.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiScanReceiptResponse {

    private String merchant;
    private LocalDateTime transactionDate;
    private BigDecimal totalAmount;
    private String suggestedCategory;
    private String type; // EXPENSE
    private String detectedPaymentMethod; // CASH | BANK | EWALLET
    private List<ReceiptItem> items;
    private double confidenceScore;
    private String notes;
    private String receiptImageUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiptItem {
        private String name;
        private int qty;
        private BigDecimal price;
    }
}
