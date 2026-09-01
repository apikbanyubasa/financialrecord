package com.financialrecord.service.impl;

import com.financialrecord.dto.request.BudgetRequest;
import com.financialrecord.dto.response.BudgetResponse;
import com.financialrecord.entity.Budget;
import com.financialrecord.entity.Category;
import com.financialrecord.entity.User;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.repository.BudgetRepository;
import com.financialrecord.repository.CategoryRepository;
import com.financialrecord.repository.TransactionRepository;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetsByPeriod(UUID userId, String periodMonthYear) {
        YearMonth ym = YearMonth.parse(periodMonthYear);
        LocalDateTime startOfMonth = ym.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = ym.atEndOfMonth().atTime(LocalTime.MAX);

        List<Budget> budgets = budgetRepository.findByUserIdAndPeriodMonthYear(userId, periodMonthYear);

        return budgets.stream().map(budget -> {
            BigDecimal currentSpent = transactionRepository.sumExpenseByUserIdAndCategoryAndDateRange(
                    userId, budget.getCategory().getId(), startOfMonth, endOfMonth);

            BigDecimal remaining = budget.getMonthlyLimit().subtract(currentSpent);
            double percentage = 0.0;
            if (budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
                percentage = currentSpent.divide(budget.getMonthlyLimit(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")).doubleValue();
            }

            boolean isOver = currentSpent.compareTo(budget.getMonthlyLimit()) > 0;

            return BudgetResponse.builder()
                    .id(budget.getId())
                    .categoryId(budget.getCategory().getId())
                    .categoryName(budget.getCategory().getName())
                    .categoryIcon(budget.getCategory().getIcon())
                    .categoryColor(budget.getCategory().getColor())
                    .monthlyLimit(budget.getMonthlyLimit())
                    .currentSpent(currentSpent)
                    .remainingAmount(remaining)
                    .percentageUsed(percentage)
                    .periodMonthYear(budget.getPeriodMonthYear())
                    .isOverBudget(isOver)
                    .createdAt(budget.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BudgetResponse setBudget(UUID userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategori tidak ditemukan"));

        Optional<Budget> existing = budgetRepository.findByUserIdAndCategoryIdAndPeriodMonthYear(
                userId, request.getCategoryId(), request.getPeriodMonthYear());

        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setMonthlyLimit(request.getMonthlyLimit());
        } else {
            budget = Budget.builder()
                    .user(user)
                    .category(category)
                    .monthlyLimit(request.getMonthlyLimit())
                    .periodMonthYear(request.getPeriodMonthYear())
                    .build();
        }

        Budget saved = budgetRepository.save(budget);

        YearMonth ym = YearMonth.parse(request.getPeriodMonthYear());
        LocalDateTime startOfMonth = ym.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = ym.atEndOfMonth().atTime(LocalTime.MAX);

        BigDecimal currentSpent = transactionRepository.sumExpenseByUserIdAndCategoryAndDateRange(
                userId, category.getId(), startOfMonth, endOfMonth);

        BigDecimal remaining = saved.getMonthlyLimit().subtract(currentSpent);
        double percentage = 0.0;
        if (saved.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
            percentage = currentSpent.divide(saved.getMonthlyLimit(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        }

        return BudgetResponse.builder()
                .id(saved.getId())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .categoryIcon(category.getIcon())
                .categoryColor(category.getColor())
                .monthlyLimit(saved.getMonthlyLimit())
                .currentSpent(currentSpent)
                .remainingAmount(remaining)
                .percentageUsed(percentage)
                .periodMonthYear(saved.getPeriodMonthYear())
                .isOverBudget(currentSpent.compareTo(saved.getMonthlyLimit()) > 0)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteBudget(UUID id, UUID userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget tidak ditemukan"));
        budgetRepository.delete(budget);
    }
}
