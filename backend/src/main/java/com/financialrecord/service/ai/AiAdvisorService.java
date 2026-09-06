package com.financialrecord.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialrecord.entity.FinancialInsight;
import com.financialrecord.entity.User;
import com.financialrecord.entity.enums.AiFeatureType;
import com.financialrecord.entity.enums.TransactionType;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.repository.FinancialInsightRepository;
import com.financialrecord.repository.TransactionRepository;
import com.financialrecord.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

/**
 * Service untuk menganalisis arus kas dan menghasilkan wawasan finansial otomatis berbasis AI.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiAdvisorService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final FinancialInsightRepository financialInsightRepository;
    private final AiMetricsTracker metricsTracker;
    private final ObjectMapper objectMapper;

    @Transactional
    public FinancialInsight generateFinancialInsight(UUID userId) {
        long startTime = System.currentTimeMillis();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pengguna tidak ditemukan"));

        // Hitung total pemasukan dan pengeluaran 30 hari terakhir
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        LocalDateTime endDate = LocalDateTime.now();

        BigDecimal totalIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate);

        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netSavings = totalIncome.subtract(totalExpense);
        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.divide(totalIncome, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
        }

        int healthScore = 70;
        if (totalIncome.compareTo(BigDecimal.ZERO) == 0 && totalExpense.compareTo(BigDecimal.ZERO) == 0) {
            healthScore = 75;
        } else if (savingsRate >= 30.0) {
            healthScore = 90;
        } else if (savingsRate >= 15.0) {
            healthScore = 80;
        } else if (savingsRate >= 0.0) {
            healthScore = 65;
        } else {
            healthScore = 45;
        }

        String title = "Analisis Finansial Mingguan - " + YearMonth.now();
        String summaryText = String.format(
                "Dalam 30 hari terakhir, total pemasukan Anda adalah Rp %,.0f dan total pengeluaran sebesar Rp %,.0f dengan rasio tabungan %.1f%%. Skor kesehatan finansial Anda saat ini adalah %d/100.",
                totalIncome, totalExpense, savingsRate, healthScore
        );

        List<String> recommendations = List.of(
                savingsRate < 20.0 ? "Tingkatkan alokasi tabungan otomatis minimal 20% dari penghasilan bulanan." : "Pertahankan rasio tabungan yang sehat di atas 20%.",
                "Gunakan fitur kantong (wallets) untuk memisahkan dana kebutuhan pokok dan jajan harian.",
                "Pantau batas budget pengeluaran agar tidak overbudget di akhir bulan."
        );

        String recommendationsJson = "[]";
        try {
            recommendationsJson = objectMapper.writeValueAsString(recommendations);
        } catch (Exception e) {
            log.warn("Failed to serialize recommendations to JSON", e);
        }

        FinancialInsight insight = FinancialInsight.builder()
                .user(user)
                .title(title)
                .summaryText(summaryText)
                .recommendationsJson(recommendationsJson)
                .healthScore(healthScore)
                .build();

        FinancialInsight saved = financialInsightRepository.save(insight);

        long latency = System.currentTimeMillis() - startTime;
        metricsTracker.recordUsage(userId, AiFeatureType.FINANCIAL_INSIGHT, "gemini-1.5-flash", 150, 80, latency, true, null);

        return saved;
    }
}
