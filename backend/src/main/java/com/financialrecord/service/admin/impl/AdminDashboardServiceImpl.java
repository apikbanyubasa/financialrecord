package com.financialrecord.service.admin.impl;

import com.financialrecord.dto.response.AdminMetricsResponse;
import com.financialrecord.dto.response.AiUsageLogResponse;
import com.financialrecord.dto.response.AiUsageStatsResponse;
import com.financialrecord.entity.AiUsageLog;
import com.financialrecord.repository.AiUsageLogRepository;
import com.financialrecord.repository.TransactionRepository;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AiUsageLogRepository aiUsageLogRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminMetricsResponse getPlatformMetrics() {
        long totalUsers = userRepository.countTotalUsers();
        long activeUsers = userRepository.countActiveUsers();
        long suspendedUsers = totalUsers - activeUsers;
        long totalTransactions = transactionRepository.countTotalTransactions();
        BigDecimal totalVolume = transactionRepository.sumTotalVolume();
        long totalAiRequests = aiUsageLogRepository.countTotalRequests();
        BigDecimal totalAiCost = aiUsageLogRepository.sumTotalEstimatedCost();
        double avgLatency = aiUsageLogRepository.avgLatencyMs();

        return AdminMetricsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .suspendedUsers(suspendedUsers)
                .totalTransactions(totalTransactions)
                .totalMoneyVolume(totalVolume)
                .totalAiRequests(totalAiRequests)
                .totalAiCostUsd(totalAiCost)
                .avgAiLatencyMs(avgLatency)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AiUsageStatsResponse getAiUsageStats() {
        long totalRequests = aiUsageLogRepository.countTotalRequests();
        long failedRequests = aiUsageLogRepository.countFailedRequests();
        long successRequests = totalRequests - failedRequests;
        double successRate = totalRequests > 0 ? ((double) successRequests / totalRequests) * 100.0 : 100.0;

        long totalTokens = aiUsageLogRepository.sumTotalTokens();
        long promptTokens = aiUsageLogRepository.sumPromptTokens();
        long completionTokens = aiUsageLogRepository.sumCompletionTokens();
        BigDecimal totalCost = aiUsageLogRepository.sumTotalEstimatedCost();
        double avgLatency = aiUsageLogRepository.avgLatencyMs();

        List<Object[]> featureRows = aiUsageLogRepository.getUsageByFeatureType();
        List<AiUsageStatsResponse.FeatureUsageBreakdown> breakdowns = new ArrayList<>();
        for (Object[] row : featureRows) {
            String featureName = row[0].toString();
            long count = ((Number) row[1]).longValue();
            long tokens = ((Number) row[2]).longValue();
            BigDecimal cost = (BigDecimal) row[3];
            breakdowns.add(new AiUsageStatsResponse.FeatureUsageBreakdown(featureName, count, tokens, cost));
        }

        return AiUsageStatsResponse.builder()
                .totalRequests(totalRequests)
                .successRequests(successRequests)
                .failedRequests(failedRequests)
                .successRatePercentage(successRate)
                .totalTokens(totalTokens)
                .promptTokens(promptTokens)
                .completionTokens(completionTokens)
                .totalCostUsd(totalCost)
                .avgLatencyMs(avgLatency)
                .featureBreakdowns(breakdowns)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AiUsageLogResponse> getAiUsageLogs(Pageable pageable) {
        Page<AiUsageLog> logs = aiUsageLogRepository.findByFeatureType(com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT, pageable);
        return logs.map(l -> AiUsageLogResponse.builder()
                .id(l.getId())
                .userId(l.getUser() != null ? l.getUser().getId() : null)
                .featureType(l.getFeatureType() != null ? l.getFeatureType().name() : "NLP_INPUT")
                .modelName(l.getModelName())
                .promptTokens(l.getPromptTokens())
                .completionTokens(l.getCompletionTokens())
                .totalTokens(l.getTotalTokens())
                .estimatedCostUsd(l.getEstimatedCostUsd())
                .latencyMs(l.getLatencyMs())
                .status(l.getStatus())
                .errorMessage(l.getErrorMessage())
                .createdAt(l.getCreatedAt())
                .build()
        );
    }
}
