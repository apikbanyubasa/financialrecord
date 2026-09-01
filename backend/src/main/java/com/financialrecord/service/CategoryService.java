package com.financialrecord.service;

import com.financialrecord.dto.request.CategoryRequest;
import com.financialrecord.dto.response.CategoryResponse;
import com.financialrecord.entity.enums.TransactionType;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    List<CategoryResponse> getCategoriesByUserId(UUID userId);

    List<CategoryResponse> getCategoriesByUserIdAndType(UUID userId, TransactionType type);

    CategoryResponse createCustomCategory(UUID userId, CategoryRequest request);

    CategoryResponse createDefaultCategory(CategoryRequest request);

    void deleteCustomCategory(UUID id, UUID userId);
}
