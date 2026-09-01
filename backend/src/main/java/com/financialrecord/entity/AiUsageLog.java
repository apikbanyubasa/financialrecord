package com.financialrecord.entity;

import com.financialrecord.entity.enums.AiFeatureType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_usage_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "feature_type", nullable = false, length = 50)
    private AiFeatureType featureType;

    @Column(name = "model_name", nullable = false, length = 50)
    private String modelName;

    @Column(name = "prompt_tokens", nullable = false)
    @Builder.Default
    private Integer promptTokens = 0;

    @Column(name = "completion_tokens", nullable = false)
    @Builder.Default
    private Integer completionTokens = 0;

    @Column(name = "total_tokens", nullable = false)
    @Builder.Default
    private Integer totalTokens = 0;

    @Column(name = "estimated_cost_usd", nullable = false, precision = 10, scale = 6)
    @Builder.Default
    private BigDecimal estimatedCostUsd = BigDecimal.ZERO;

    @Column(name = "latency_ms", nullable = false)
    @Builder.Default
    private Integer latencyMs = 0;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "SUCCESS"; // SUCCESS or FAILED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
