package com.greenbasket.modules.wishlist.mapper;

import com.greenbasket.modules.products.entity.Product;
import com.greenbasket.modules.products.entity.ProductImage;
import com.greenbasket.modules.products.repository.ProductImageRepository;
import com.greenbasket.modules.wishlist.dto.response.WishlistItemResponse;
import com.greenbasket.modules.wishlist.dto.response.WishlistResponse;
import com.greenbasket.modules.wishlist.entity.WishlistItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WishlistMapper {

    private final ProductImageRepository productImageRepository;

    public WishlistResponse toResponse(List<WishlistItem> items) {
        List<WishlistItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .toList();
        return WishlistResponse.builder()
                .items(itemResponses)
                .totalItems(itemResponses.size())
                .build();
    }

    public WishlistItemResponse toItemResponse(WishlistItem item) {
        Product product = item.getProduct();
        List<ProductImage> images = productImageRepository.findByProduct_Id(product.getId());
        String primaryImageUrl = images.stream()
                .filter(ProductImage::isPrimaryImage)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(images.isEmpty() ? null : images.getFirst().getImageUrl());

        BigDecimal effectivePrice = product.getDiscountPrice() != null
                && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                ? product.getDiscountPrice() : product.getPrice();

        return WishlistItemResponse.builder()
                .itemId(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .effectivePrice(effectivePrice)
                .inStock(product.getStockQuantity() > 0)
                .primaryImageUrl(primaryImageUrl)
                .addedAt(item.getCreatedAt())
                .build();
    }
}
