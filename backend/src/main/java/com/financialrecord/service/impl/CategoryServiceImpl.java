package com.financialrecord.service.impl;

import com.financialrecord.dto.request.CategoryRequest;
import com.financialrecord.dto.response.CategoryResponse;
import com.financialrecord.entity.Category;
import com.financialrecord.entity.User;
import com.financialrecord.entity.enums.TransactionType;
import com.financialrecord.exception.BadRequestException;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.repository.CategoryRepository;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByUserId(UUID userId) {
        return categoryRepository.findAllByUserIdOrSystemDefault(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByUserIdAndType(UUID userId, TransactionType type) {
        return categoryRepository.findAllByUserIdOrSystemDefaultAndType(userId, type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse createCustomCategory(UUID userId, CategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Category category = Category.builder()
                .user(user)
                .name(request.getName().trim())
                .type(request.getType())
                .icon(request.getIcon() != null ? request.getIcon() : "tag")
                .color(request.getColor() != null ? request.getColor() : "#10B981")
                .isSystemDefault(false)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse createDefaultCategory(CategoryRequest request) {
        Category category = Category.builder()
                .user(null) // Global
                .name(request.getName().trim())
                .type(request.getType())
                .icon(request.getIcon() != null ? request.getIcon() : "tag")
                .color(request.getColor() != null ? request.getColor() : "#10B981")
                .isSystemDefault(true)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCustomCategory(UUID id, UUID userId) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori tidak ditemukan atau tidak dapat dihapus"));

        if (category.isSystemDefault()) {
            throw new BadRequestException("Kategori bawaan sistem tidak dapat dihapus");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isSystemDefault(category.isSystemDefault())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
