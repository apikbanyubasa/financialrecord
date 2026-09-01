package com.financialrecord.service;

import com.financialrecord.dto.request.BudgetRequest;
import com.financialrecord.dto.response.BudgetResponse;

import java.util.List;
import java.util.UUID;

public interface BudgetService {

    List<BudgetResponse> getBudgetsByPeriod(UUID userId, String periodMonthYear);

    BudgetResponse setBudget(UUID userId, BudgetRequest request);

    void deleteBudget(UUID id, UUID userId);
}
