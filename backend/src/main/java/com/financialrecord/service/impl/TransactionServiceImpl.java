package com.financialrecord.service.impl;

import com.financialrecord.dto.request.TransactionRequest;
import com.financialrecord.dto.response.DashboardSummaryResponse;
import com.financialrecord.dto.response.TransactionResponse;
import com.financialrecord.dto.response.WalletResponse;
import com.financialrecord.entity.Category;
import com.financialrecord.entity.Transaction;
import com.financialrecord.entity.User;
import com.financialrecord.entity.Wallet;
import com.financialrecord.entity.enums.PocketType;
import com.financialrecord.entity.enums.TransactionType;
import com.financialrecord.entity.enums.WalletType;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.repository.CategoryRepository;
import com.financialrecord.repository.TransactionRepository;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.repository.WalletRepository;
import com.financialrecord.service.TransactionService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;


    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(
            UUID userId,
            TransactionType type,
            UUID categoryId,
            UUID walletId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    ) {
        Specification<Transaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (walletId != null) {
                predicates.add(cb.equal(root.get("wallet").get("id"), walletId));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return transactionRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(UUID id, UUID userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaksi tidak ditemukan"));
        return mapToResponse(transaction);
    }

    @Override
    @Transactional
    public TransactionResponse createTransaction(UUID userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        TransactionType txType = request.getType() != null ? request.getType() : TransactionType.EXPENSE;
        PocketType targetPocketType = (txType == TransactionType.INCOME) ? PocketType.INCOME : PocketType.EXPENSE;

        // 1. Resolve Wallet (Guarantee non-null wallet)
        Wallet wallet = null;
        if (request.getWalletId() != null) {
            wallet = walletRepository.findByIdAndUserIdForUpdate(request.getWalletId(), userId).orElse(null);
        }
        if (wallet == null) {
            List<Wallet> userWallets = walletRepository.findByUserIdOrderByCreatedAtAsc(userId);
            // Look for matching pocketType first
            wallet = userWallets.stream()
                    .filter(w -> w.getPocketType() == targetPocketType)
                    .findFirst()
                    .orElse(userWallets.isEmpty() ? null : userWallets.get(0));

            if (wallet == null) {
                String defaultName = (txType == TransactionType.INCOME) ? "Kantong Pemasukan Utama" : "Kantong Pengeluaran Harian";
                wallet = walletRepository.save(Wallet.builder()
                        .user(user)
                        .name(defaultName)
                        .type(WalletType.BANK)
                        .pocketType(targetPocketType)
                        .aiGenerated(true)
                        .aiInsight("Dibuat otomatis oleh AI saat transaksi dicatat")
                        .balance(BigDecimal.ZERO)
                        .build());
            }
        }

        // 2. Resolve Category (Guarantee non-null category)
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }
        if (category == null) {
            List<Category> allCats = categoryRepository.findAllByUserIdOrSystemDefault(userId);
            TransactionType targetType = request.getType() != null ? request.getType() : TransactionType.EXPENSE;
            category = allCats.stream()
                    .filter(c -> c.getType() == targetType)
                    .findFirst()
                    .orElse(allCats.isEmpty() ? null : allCats.get(0));
        }

        // 3. Adjust wallet balance
        BigDecimal amount = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;

        if (txType == TransactionType.EXPENSE) {
            wallet.setBalance(wallet.getBalance().subtract(amount));
        } else if (txType == TransactionType.INCOME) {
            wallet.setBalance(wallet.getBalance().add(amount));
        }
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .user(user)
                .wallet(wallet)
                .category(category)
                .amount(amount)
                .type(txType)
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now())
                .description(request.getDescription() != null && !request.getDescription().trim().isEmpty() ? request.getDescription().trim() : (category != null ? category.getName() : "Transaksi"))
                .receiptImageUrl(request.getReceiptImageUrl())
                .isRecurring(request.isRecurring())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public List<TransactionResponse> createTransactionsBatch(UUID userId, List<TransactionRequest> requests) {
        List<TransactionResponse> results = new ArrayList<>();
        for (TransactionRequest req : requests) {
            results.add(createTransaction(userId, req));
        }
        return results;
    }

    @Override
    @Transactional
    public TransactionResponse updateTransaction(UUID id, UUID userId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaksi tidak ditemukan"));

        // Reverse old transaction impact on old wallet
        Wallet oldWallet = walletRepository.findByIdAndUserIdForUpdate(transaction.getWallet().getId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Dompet asal tidak ditemukan"));

        if (transaction.getType() == TransactionType.EXPENSE) {
            oldWallet.setBalance(oldWallet.getBalance().add(transaction.getAmount()));
        } else if (transaction.getType() == TransactionType.INCOME) {
            oldWallet.setBalance(oldWallet.getBalance().subtract(transaction.getAmount()));
        }
        walletRepository.save(oldWallet);

        // Apply new transaction impact on target wallet
        Wallet newWallet;
        if (request.getWalletId() != null && request.getWalletId().equals(oldWallet.getId())) {
            newWallet = oldWallet;
        } else if (request.getWalletId() != null) {
            newWallet = walletRepository.findByIdAndUserIdForUpdate(request.getWalletId(), userId)
                    .orElse(oldWallet);
        } else {
            newWallet = oldWallet;
        }

        if (request.getType() == TransactionType.EXPENSE) {
            newWallet.setBalance(newWallet.getBalance().subtract(request.getAmount()));
        } else if (request.getType() == TransactionType.INCOME) {
            newWallet.setBalance(newWallet.getBalance().add(request.getAmount()));
        }
        walletRepository.save(newWallet);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElse(transaction.getCategory());

        transaction.setWallet(newWallet);
        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setReceiptImageUrl(request.getReceiptImageUrl());
        transaction.setRecurring(request.isRecurring());

        Transaction updated = transactionRepository.save(transaction);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTransaction(UUID id, UUID userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaksi tidak ditemukan"));

        // Reverse transaction impact from wallet
        Wallet wallet = walletRepository.findByIdAndUserIdForUpdate(transaction.getWallet().getId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Dompet tidak ditemukan"));

        if (transaction.getType() == TransactionType.EXPENSE) {
            wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
        } else if (transaction.getType() == TransactionType.INCOME) {
            wallet.setBalance(wallet.getBalance().subtract(transaction.getAmount()));
        }
        walletRepository.save(wallet);

        transactionRepository.delete(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(UUID userId) {
        YearMonth currentYearMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentYearMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentYearMonth.atEndOfMonth().atTime(LocalTime.MAX);

        // 1. Total Balance Across All Wallets
        BigDecimal totalBalance = walletRepository.sumBalanceByUserId(userId);
        if (totalBalance == null) totalBalance = BigDecimal.ZERO;

        // 2. Month Income & Expense
        BigDecimal totalIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.INCOME, startOfMonth, endOfMonth);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpense = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startOfMonth, endOfMonth);
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netSavings = totalIncome.subtract(totalExpense);
        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        }

        // 3. Category Breakdown for Expenses
        List<Object[]> expenseGroups = transactionRepository.sumAmountByCategoryGroup(
                userId, TransactionType.EXPENSE, startOfMonth, endOfMonth);
        List<DashboardSummaryResponse.CategoryBreakdownItem> categoryExpenses = new ArrayList<>();
        for (Object[] row : expenseGroups) {
            UUID catId = (UUID) row[0];
            String name = (String) row[1];
            String icon = (String) row[2];
            String color = (String) row[3];
            BigDecimal amount = (BigDecimal) row[4];
            double percentage = 0.0;
            if (totalExpense.compareTo(BigDecimal.ZERO) > 0) {
                percentage = amount.divide(totalExpense, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")).doubleValue();
            }
            categoryExpenses.add(new DashboardSummaryResponse.CategoryBreakdownItem(
                    catId != null ? catId.toString() : "", name, icon, color, amount, percentage));
        }

        // 5. Category Breakdown for Incomes
        List<Object[]> incomeGroups = transactionRepository.sumAmountByCategoryGroup(
                userId, TransactionType.INCOME, startOfMonth, endOfMonth);
        List<DashboardSummaryResponse.CategoryBreakdownItem> categoryIncomes = new ArrayList<>();
        for (Object[] row : incomeGroups) {
            UUID catId = (UUID) row[0];
            String name = (String) row[1];
            String icon = (String) row[2];
            String color = (String) row[3];
            BigDecimal amount = (BigDecimal) row[4];
            double percentage = 0.0;
            if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
                percentage = amount.divide(totalIncome, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")).doubleValue();
            }
            categoryIncomes.add(new DashboardSummaryResponse.CategoryBreakdownItem(
                    catId != null ? catId.toString() : "", name, icon, color, amount, percentage));
        }

        // 6. Cashflow Trend (Past 14 days) - Single aggregated query to prevent N+1 queries
        LocalDate today = LocalDate.now();
        LocalDate startDate14 = today.minusDays(13);
        LocalDateTime rangeStart = startDate14.atStartOfDay();
        LocalDateTime rangeEnd = today.atTime(LocalTime.MAX);

        List<Object[]> dailyRows = transactionRepository.sumDailyAmountByUserIdAndDateRange(
                userId, rangeStart, rangeEnd);

        Map<LocalDate, Map<TransactionType, BigDecimal>> dailyMap = new HashMap<>();
        for (Object[] row : dailyRows) {
            LocalDate rowDate = null;
            if (row[0] instanceof LocalDate) {
                rowDate = (LocalDate) row[0];
            } else if (row[0] instanceof java.sql.Date) {
                rowDate = ((java.sql.Date) row[0]).toLocalDate();
            } else if (row[0] != null) {
                try {
                    rowDate = LocalDate.parse(row[0].toString());
                } catch (Exception ignored) {}
            }

            TransactionType type = (TransactionType) row[1];
            BigDecimal amount = (BigDecimal) row[2];

            if (rowDate != null && type != null) {
                dailyMap.computeIfAbsent(rowDate, k -> new HashMap<>())
                        .put(type, amount != null ? amount : BigDecimal.ZERO);
            }
        }

        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<DashboardSummaryResponse.CashflowDataPoint> cashflowTrend = new ArrayList<>();

        for (int i = 13; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<TransactionType, BigDecimal> typeMap = dailyMap.getOrDefault(date, Collections.emptyMap());
            BigDecimal dayIncome = typeMap.getOrDefault(TransactionType.INCOME, BigDecimal.ZERO);
            BigDecimal dayExpense = typeMap.getOrDefault(TransactionType.EXPENSE, BigDecimal.ZERO);

            cashflowTrend.add(new DashboardSummaryResponse.CashflowDataPoint(
                    date.format(df),
                    dayIncome,
                    dayExpense,
                    dayIncome.subtract(dayExpense)
            ));
        }

        // 7. Active Wallets
        List<WalletResponse> wallets = walletRepository.findByUserIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(w -> WalletResponse.builder()
                        .id(w.getId())
                        .name(w.getName())
                        .type(w.getType())
                        .pocketType(w.getPocketType() != null ? w.getPocketType() : PocketType.EXPENSE)
                        .aiGenerated(Boolean.TRUE.equals(w.getAiGenerated()))
                        .aiInsight(w.getAiInsight())
                        .balance(w.getBalance())
                        .createdAt(w.getCreatedAt())
                        .updatedAt(w.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        // 8. Recent 10 Transactions
        List<TransactionResponse> recentTransactions = transactionRepository.findTop10ByUserIdOrderByTransactionDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalBalance(totalBalance)
                .totalIncomeThisMonth(totalIncome)
                .totalExpenseThisMonth(totalExpense)
                .netSavingsThisMonth(netSavings)
                .savingsRatePercentage(savingsRate)
                .categoryExpenses(categoryExpenses)
                .categoryIncomes(categoryIncomes)
                .cashflowTrend(cashflowTrend)
                .wallets(wallets)
                .recentTransactions(recentTransactions)
                .build();
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .walletId(t.getWallet() != null ? t.getWallet().getId() : null)
                .walletName(t.getWallet() != null ? t.getWallet().getName() : "Dompet Utama")
                .categoryId(t.getCategory() != null ? t.getCategory().getId() : null)
                .categoryName(t.getCategory() != null ? t.getCategory().getName() : "Umum")
                .categoryIcon(t.getCategory() != null ? t.getCategory().getIcon() : "Tag")
                .categoryColor(t.getCategory() != null ? t.getCategory().getColor() : "#10B981")
                .amount(t.getAmount())
                .type(t.getType())
                .transactionDate(t.getTransactionDate())
                .description(t.getDescription())
                .receiptImageUrl(t.getReceiptImageUrl())
                .isRecurring(t.isRecurring())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
