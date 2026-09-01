package com.financialrecord.repository;

import com.financialrecord.entity.FinancialInsight;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialInsightRepository extends JpaRepository<FinancialInsight, UUID> {

    List<FinancialInsight> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<FinancialInsight> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);
}
