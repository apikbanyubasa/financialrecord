package com.financialrecord.repository;

import com.financialrecord.entity.Transaction;
import com.financialrecord.entity.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    Page<Transaction> findByUserIdOrderByTransactionDateDesc(UUID userId, Pageable pageable);

    List<Transaction> findTop10ByUserIdOrderByTransactionDateDesc(UUID userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    BigDecimal sumAmountByUserIdAndTypeAndDateRange(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t.category.id, t.category.name, t.category.icon, t.category.color, SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate " +
           "GROUP BY t.category.id, t.category.name, t.category.icon, t.category.color " +
           "ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumAmountByCategoryGroup(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE' AND t.amount <= :threshold AND t.transactionDate >= :startDate ORDER BY t.transactionDate DESC")
    List<Transaction> findMicroExpenses(
            @Param("userId") UUID userId,
            @Param("threshold") BigDecimal threshold,
            @Param("startDate") LocalDateTime startDate
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.category.id = :categoryId AND t.type = 'EXPENSE' AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    BigDecimal sumExpenseByUserIdAndCategoryAndDateRange(
            @Param("userId") UUID userId,
            @Param("categoryId") UUID categoryId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t.category.id, t.category.name, t.category.icon, t.category.color, t.type, SUM(t.amount), COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "GROUP BY t.category.id, t.category.name, t.category.icon, t.category.color, t.type " +
           "HAVING COUNT(t) > 0 AND SUM(t.amount) > 0 " +
           "ORDER BY SUM(t.amount) DESC")
    List<Object[]> findActivePocketsFromTransactions(@Param("userId") UUID userId);

    // Wallet Transaction Aggregates
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.wallet.id = :walletId AND t.type = :type")
    BigDecimal sumAmountByWalletIdAndType(@Param("walletId") UUID walletId, @Param("type") TransactionType type);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.wallet.id = :walletId")
    long countByWalletId(@Param("walletId") UUID walletId);

    // Global Admin Aggregates
    @Query("SELECT COUNT(t) FROM Transaction t")
    long countTotalTransactions();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t")
    BigDecimal sumTotalVolume();
}
