package com.financialrecord.controller.user;

import com.financialrecord.dto.request.CategoryRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.CategoryResponse;
import com.financialrecord.entity.enums.TransactionType;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Endpoints untuk Mengambil & Mengelola Kategori Transaksi")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Daftar Kategori (Bawaan Sistem + Custom User)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) TransactionType type
    ) {
        List<CategoryResponse> categories = (type != null)
                ? categoryService.getCategoriesByUserIdAndType(principal.getId(), type)
                : categoryService.getCategoriesByUserId(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @PostMapping
    @Operation(summary = "Buat Kategori Kustom Baru")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCustomCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse category = categoryService.createCustomCategory(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Kategori kustom berhasil dibuat", category));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hapus Kategori Kustom")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        categoryService.deleteCustomCategory(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Kategori kustom berhasil dihapus", null));
    }
}
