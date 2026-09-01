package com.financialrecord.service.ai;

import com.financialrecord.entity.AiUsageLog;
import com.financialrecord.entity.User;
import com.financialrecord.entity.enums.AiFeatureType;
import com.financialrecord.repository.AiUsageLogRepository;
import com.financialrecord.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiMetricsTracker {

    private final AiUsageLogRepository aiUsageLogRepository;
    private final UserRepository userRepository;

    // Pricing estimation per 1M tokens (e.g. Gemini 1.5 Flash: $0.075 / 1M prompt, $0.30 / 1M completion)
    private static final BigDecimal PROMPT_TOKEN_RATE = new BigDecimal("0.000000075");
    private static final BigDecimal COMPLETION_TOKEN_RATE = new BigDecimal("0.000000300");

    @Transactional
    public void recordUsage(
            UUID userId,
            AiFeatureType featureType,
            String modelName,
            int promptTokens,
            int completionTokens,
            long latencyMs,
            boolean isSuccess,
            String errorMessage
    ) {
        try {
            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
            }

            int totalTokens = promptTokens + completionTokens;

            BigDecimal promptCost = BigDecimal.valueOf(promptTokens).multiply(PROMPT_TOKEN_RATE);
            BigDecimal completionCost = BigDecimal.valueOf(completionTokens).multiply(COMPLETION_TOKEN_RATE);
            BigDecimal totalCost = promptCost.add(completionCost).setScale(6, RoundingMode.HALF_UP);

            AiUsageLog logEntry = AiUsageLog.builder()
                    .user(user)
                    .featureType(featureType)
                    .modelName(modelName != null ? modelName : "gemini-1.5-flash")
                    .promptTokens(promptTokens)
                    .completionTokens(completionTokens)
                    .totalTokens(totalTokens)
                    .estimatedCostUsd(totalCost)
                    .latencyMs((int) latencyMs)
                    .status(isSuccess ? "SUCCESS" : "FAILED")
                    .errorMessage(errorMessage)
                    .build();

            aiUsageLogRepository.save(logEntry);
            log.info("AI Usage recorded: Feature={}, Model={}, Tokens={}, Cost=${}, Latency={}ms, Status={}",
                    featureType, modelName, totalTokens, totalCost, latencyMs, isSuccess ? "SUCCESS" : "FAILED");
        } catch (Exception e) {
            log.error("Failed to record AI usage log", e);
        }
    }
}
