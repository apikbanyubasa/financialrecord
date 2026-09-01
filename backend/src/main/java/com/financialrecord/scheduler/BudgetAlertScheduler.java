package com.financialrecord.scheduler;

import com.financialrecord.entity.Budget;
import com.financialrecord.repository.BudgetRepository;
import com.financialrecord.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BudgetAlertScheduler {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    // Run daily at 08:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void checkBudgetThresholds() {
        String currentPeriod = YearMonth.now().toString();
        log.info("Checking budget thresholds for period: {}", currentPeriod);

        YearMonth ym = YearMonth.parse(currentPeriod);
        LocalDateTime startOfMonth = ym.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = ym.atEndOfMonth().atTime(LocalTime.MAX);

        List<Budget> budgets = budgetRepository.findAllByPeriodMonthYearWithCategory(currentPeriod);

        for (Budget budget : budgets) {
            BigDecimal spent = transactionRepository.sumExpenseByUserIdAndCategoryAndDateRange(
                    budget.getUser().getId(), budget.getCategory().getId(), startOfMonth, endOfMonth);

            if (budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
                double percentage = spent.divide(budget.getMonthlyLimit(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")).doubleValue();

                if (percentage >= 100.0) {
                    log.warn("🚨 BUDGET OVERRUN ALERT: User {} exceeded budget for category '{}' (Spent: Rp {}, Limit: Rp {})",
                            budget.getUser().getEmail(), budget.getCategory().getName(), spent, budget.getMonthlyLimit());
                } else if (percentage >= 80.0) {
                    log.info("⚠️ BUDGET WARNING: User {} reached {}% of budget for category '{}'",
                            budget.getUser().getEmail(), String.format("%.1f", percentage), budget.getCategory().getName());
                }
            }
        }
    }
}
