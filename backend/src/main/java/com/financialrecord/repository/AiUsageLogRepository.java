package com.financialrecord.repository;

import com.financialrecord.entity.AiUsageLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, UUID> {

    Page<AiUsageLog> findByFeatureType(com.financialrecord.entity.enums.AiFeatureType featureType, Pageable pageable);

    @Query("SELECT COUNT(l) FROM AiUsageLog l WHERE l.featureType = com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT")
    long countTotalRequests();

    @Query("SELECT COALESCE(SUM(l.totalTokens), 0) FROM AiUsageLog l WHERE l.featureType = com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT")
    long sumTotalTokens();

    @Query("SELECT COALESCE(SUM(l.promptTokens), 0) FROM AiUsageLog l WHERE l.featureType = com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT")
    long sumPromptTokens();

    @Query("SELECT COALESCE(SUM(l.completionTokens), 0) FROM AiUsageLog l WHERE l.featureType = com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT")
    long sumCompletionTokens();

    @Query("SELECT COALESCE(SUM(l.estimatedCostUsd), 0) FROM AiUsageLog l WHERE l.featureType = com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT")
    BigDecimal sumTotalEstimatedCost();

    @Query("SELECT COALESCE(AVG(l.latencyMs), 0) FROM AiUsageLog l WHERE l.status = 'SUCCESS' AND l.featureType = com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT")
    double avgLatencyMs();

    @Query("SELECT COUNT(l) FROM AiUsageLog l WHERE l.status = 'FAILED' AND l.featureType = com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT")
    long countFailedRequests();

    @Query("SELECT l.featureType, COUNT(l), SUM(l.totalTokens), SUM(l.estimatedCostUsd) " +
           "FROM AiUsageLog l " +
           "WHERE l.featureType = com.financialrecord.entity.enums.AiFeatureType.NLP_INPUT " +
           "GROUP BY l.featureType")
    List<Object[]> getUsageByFeatureType();
}
