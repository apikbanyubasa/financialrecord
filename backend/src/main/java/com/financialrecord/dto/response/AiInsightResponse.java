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
public class AiInsightResponse {

    private String title;
    private int healthScore; // 1-100
    private String summaryText;
    private String sentiment; // EXCELLENT, GOOD, WARNING, CRITICAL
    private List<AdvisorRecommendation> recommendations;
    private LocalDateTime generatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvisorRecommendation {
        private String category;
        private String action;
        private String impact;
    }
}
