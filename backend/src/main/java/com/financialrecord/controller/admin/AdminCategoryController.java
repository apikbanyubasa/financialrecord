package com.financialrecord.controller.admin;

import com.financialrecord.dto.request.CategoryRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.CategoryResponse;
import com.financialrecord.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
@Tag(name = "Admin Categories", description = "Endpoints untuk Mengelola Master Kategori Bawaan Sistem")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping("/default")
    @Operation(summary = "Tambah Kategori Bawaan Sistem Global")
    public ResponseEntity<ApiResponse<CategoryResponse>> createDefaultCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createDefaultCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Kategori bawaan sistem berhasil ditambahkan", category));
    }
}
