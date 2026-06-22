package com.greenbasket.modules.products.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.common.response.PageResponse;
import com.greenbasket.modules.products.dto.response.ProductResponse;
import com.greenbasket.modules.products.dto.response.ProductSummaryResponse;
import com.greenbasket.modules.products.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product browsing APIs")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Browse products with filters and pagination")
    public ApiResponse<PageResponse<ProductSummaryResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductSummaryResponse> page = productService.getProducts(
                categoryId, minPrice, maxPrice, featured, search, pageable);
        return ApiResponse.success(PageResponse.from(page));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get product details by slug")
    public ApiResponse<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success(productService.getProductBySlug(slug));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products")
    public ApiResponse<List<ProductSummaryResponse>> getFeaturedProducts() {
        return ApiResponse.success(productService.getFeaturedProducts());
    }
}
