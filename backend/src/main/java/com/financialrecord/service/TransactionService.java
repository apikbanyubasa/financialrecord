package com.financialrecord.service;

import com.financialrecord.dto.request.TransactionRequest;
import com.financialrecord.dto.response.DashboardSummaryResponse;
import com.financialrecord.dto.response.TransactionResponse;
import com.financialrecord.entity.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface TransactionService {

    Page<TransactionResponse> getTransactions(
            UUID userId,
            TransactionType type,
            UUID categoryId,
            UUID walletId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    TransactionResponse getTransactionById(UUID id, UUID userId);

    TransactionResponse createTransaction(UUID userId, TransactionRequest request);

    java.util.List<TransactionResponse> createTransactionsBatch(UUID userId, java.util.List<TransactionRequest> requests);

    TransactionResponse updateTransaction(UUID id, UUID userId, TransactionRequest request);

    void deleteTransaction(UUID id, UUID userId);

    DashboardSummaryResponse getDashboardSummary(UUID userId);
}
