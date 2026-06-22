package com.greenbasket.modules.cart.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.cart.dto.request.AddCartItemRequest;
import com.greenbasket.modules.cart.dto.request.UpdateCartItemRequest;
import com.greenbasket.modules.cart.dto.response.CartResponse;
import com.greenbasket.modules.cart.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Cart", description = "Customer shopping cart APIs")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get cart")
    public ApiResponse<CartResponse> getCart() {
        return ApiResponse.success(cartService.getCart());
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add item to cart")
    public ApiResponse<CartResponse> addItem(@Valid @RequestBody AddCartItemRequest request) {
        return ApiResponse.success("Item added to cart", cartService.addItem(request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update item quantity")
    public ApiResponse<CartResponse> updateItemQuantity(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.success("Cart item updated", cartService.updateItemQuantity(itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ApiResponse<CartResponse> removeItem(@PathVariable Long itemId) {
        return ApiResponse.success("Item removed from cart", cartService.removeItem(itemId));
    }

    @DeleteMapping
    @Operation(summary = "Clear cart")
    public ApiResponse<Void> clearCart() {
        cartService.clearCart();
        return ApiResponse.success("Cart cleared");
    }
}
