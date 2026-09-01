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
public class AiUsageStatsResponse {

    private long totalRequests;
    private long successRequests;
    private long failedRequests;
    private double successRatePercentage;

    private long totalTokens;
    private long promptTokens;
    private long completionTokens;

    private BigDecimal totalCostUsd;
    private double avgLatencyMs;

    private List<FeatureUsageBreakdown> featureBreakdowns;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeatureUsageBreakdown {
        private String featureType;
        private long requestCount;
        private long totalTokens;
        private BigDecimal costUsd;
    }
}
