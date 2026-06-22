package com.greenbasket.modules.wishlist.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.wishlist.dto.request.AddWishlistItemRequest;
import com.greenbasket.modules.wishlist.dto.response.WishlistResponse;
import com.greenbasket.modules.wishlist.service.WishlistService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Wishlist", description = "Customer wishlist APIs")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get wishlist")
    public ApiResponse<WishlistResponse> getWishlist() {
        return ApiResponse.success(wishlistService.getWishlist());
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add item to wishlist")
    public ApiResponse<WishlistResponse> addItem(@Valid @RequestBody AddWishlistItemRequest request) {
        return ApiResponse.success("Item added to wishlist", wishlistService.addItem(request));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from wishlist")
    public ApiResponse<WishlistResponse> removeItem(@PathVariable Long itemId) {
        return ApiResponse.success("Item removed from wishlist", wishlistService.removeItem(itemId));
    }

    @DeleteMapping
    @Operation(summary = "Clear wishlist")
    public ApiResponse<Void> clearWishlist() {
        wishlistService.clearWishlist();
        return ApiResponse.success("Wishlist cleared");
    }
}
