package com.greenbasket.modules.categories.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.categories.dto.request.CreateCategoryRequest;
import com.greenbasket.modules.categories.dto.request.UpdateCategoryRequest;
import com.greenbasket.modules.categories.dto.response.CategoryResponse;
import com.greenbasket.modules.categories.dto.response.CategoryTreeResponse;
import com.greenbasket.modules.categories.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    // ── Customer APIs (public) ──

    @GetMapping
    @Operation(summary = "Get all active categories")
    public ApiResponse<List<CategoryResponse>> getAllActiveCategories() {
        return ApiResponse.success(categoryService.getAllActiveCategories());
    }

    @GetMapping("/tree")
    @Operation(summary = "Get category tree")
    public ApiResponse<List<CategoryTreeResponse>> getCategoryTree() {
        return ApiResponse.success(categoryService.getCategoryTree());
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get category by slug")
    public ApiResponse<CategoryResponse> getCategoryBySlug(@PathVariable String slug) {
        return ApiResponse.success(categoryService.getCategoryBySlug(slug));
    }
}
