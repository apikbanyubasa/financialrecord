package com.financialrecord.repository;

import com.financialrecord.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUserIdAndPeriodMonthYear(UUID userId, String periodMonthYear);

    Optional<Budget> findByUserIdAndCategoryIdAndPeriodMonthYear(UUID userId, UUID categoryId, String periodMonthYear);

    Optional<Budget> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT b FROM Budget b JOIN FETCH b.category WHERE b.periodMonthYear = :periodMonthYear")
    List<Budget> findAllByPeriodMonthYearWithCategory(@Param("periodMonthYear") String periodMonthYear);
}
