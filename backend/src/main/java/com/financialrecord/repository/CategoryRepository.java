package com.financialrecord.repository;

import com.financialrecord.entity.Category;
import com.financialrecord.entity.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT c FROM Category c WHERE c.isSystemDefault = true OR c.user.id = :userId ORDER BY c.name ASC")
    List<Category> findAllByUserIdOrSystemDefault(@Param("userId") UUID userId);

    @Query("SELECT c FROM Category c WHERE (c.isSystemDefault = true OR c.user.id = :userId) AND c.type = :type ORDER BY c.name ASC")
    List<Category> findAllByUserIdOrSystemDefaultAndType(@Param("userId") UUID userId, @Param("type") TransactionType type);

    Optional<Category> findByIdAndUserId(UUID id, UUID userId);

    List<Category> findByIsSystemDefaultTrueOrderByNameAsc();

    Optional<Category> findByNameIgnoreCaseAndType(String name, TransactionType type);
}
