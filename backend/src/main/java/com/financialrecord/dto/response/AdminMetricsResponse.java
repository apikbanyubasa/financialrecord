package com.financialrecord.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMetricsResponse {

    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long totalTransactions;
    private BigDecimal totalMoneyVolume;
    private long totalAiRequests;
    private BigDecimal totalAiCostUsd;
    private double avgAiLatencyMs;
}
