package com.greenbasket.modules.cart.mapper;

import com.greenbasket.modules.cart.dto.response.CartItemResponse;
import com.greenbasket.modules.cart.dto.response.CartResponse;
import com.greenbasket.modules.cart.entity.CartItem;
import com.greenbasket.modules.products.entity.Product;
import com.greenbasket.modules.products.entity.ProductImage;
import com.greenbasket.modules.products.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CartMapper {

    private final ProductImageRepository productImageRepository;

    public CartResponse toResponse(List<CartItem> items) {
        List<CartItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalQuantity = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .items(itemResponses)
                .subtotal(subtotal)
                .totalItems(itemResponses.size())
                .totalQuantity(totalQuantity)
                .build();
    }

    public CartItemResponse toItemResponse(CartItem item) {
        Product product = item.getProduct();
        BigDecimal effectivePrice = item.getDiscountPriceSnapshot() != null
                && item.getDiscountPriceSnapshot().compareTo(BigDecimal.ZERO) > 0
                ? item.getDiscountPriceSnapshot() : item.getUnitPriceSnapshot();
        BigDecimal lineTotal = effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        List<ProductImage> images = productImageRepository.findByProduct_Id(product.getId());
        String productImageUrl = images.stream()
                .filter(ProductImage::isPrimaryImage)
                .findFirst()
                .or(() -> images.stream().findFirst())
                .map(ProductImage::getImageUrl)
                .orElse(null);

        return CartItemResponse.builder()
                .itemId(item.getId())
                .productId(product.getId())
                .productName(item.getProductNameSnapshot())
                .productSku(product.getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPriceSnapshot())
                .discountPrice(item.getDiscountPriceSnapshot())
                .lineTotal(lineTotal)
                .inStock(product.getStockQuantity() > 0)
                .availableStock(product.getStockQuantity())
                .productImageUrl(productImageUrl)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .build();
    }
}
