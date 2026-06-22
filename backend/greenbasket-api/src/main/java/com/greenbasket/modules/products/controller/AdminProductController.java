package com.greenbasket.modules.products.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.products.dto.request.CreateProductRequest;
import com.greenbasket.modules.products.dto.request.ProductImageRequest;
import com.greenbasket.modules.products.dto.request.UpdateProductRequest;
import com.greenbasket.modules.products.dto.request.UpdateStockRequest;
import com.greenbasket.modules.products.dto.response.ProductResponse;
import com.greenbasket.modules.products.service.ProductService;
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

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Products", description = "Admin product management APIs")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create product")
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return ApiResponse.success("Product created successfully", productService.createProduct(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID (admin)")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id) {
        return ApiResponse.success(productService.getProductByIdAdmin(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        return ApiResponse.success("Product updated successfully", productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete product")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponse.success("Product deleted successfully");
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate product")
    public ApiResponse<ProductResponse> activateProduct(@PathVariable Long id) {
        return ApiResponse.success("Product activated", productService.activateProduct(id));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate product")
    public ApiResponse<ProductResponse> deactivateProduct(@PathVariable Long id) {
        return ApiResponse.success("Product deactivated", productService.deactivateProduct(id));
    }

    @PostMapping("/{id}/images")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add product image")
    public ApiResponse<ProductResponse> addProductImage(
            @PathVariable Long id,
            @Valid @RequestBody ProductImageRequest request) {
        return ApiResponse.success("Image added successfully", productService.addProductImage(id, request));
    }

    @DeleteMapping("/images/{imageId}")
    @Operation(summary = "Remove product image")
    public ApiResponse<Void> removeProductImage(@PathVariable Long imageId) {
        productService.removeProductImage(imageId);
        return ApiResponse.success("Image removed successfully");
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Update product stock")
    public ApiResponse<ProductResponse> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStockRequest request) {
        return ApiResponse.success("Stock updated successfully", productService.updateStock(id, request));
    }
}
