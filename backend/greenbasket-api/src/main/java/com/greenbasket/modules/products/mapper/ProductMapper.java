package com.greenbasket.modules.products.mapper;

import com.greenbasket.modules.products.dto.response.ProductImageResponse;
import com.greenbasket.modules.products.dto.response.ProductResponse;
import com.greenbasket.modules.products.dto.response.ProductSummaryResponse;
import com.greenbasket.modules.products.entity.Product;
import com.greenbasket.modules.products.entity.ProductImage;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product, List<ProductImage> images) {
        BigDecimal effectivePrice = computeEffectivePrice(product);
        List<ProductImageResponse> imageResponses = images != null
                ? images.stream()
                    .sorted(Comparator.comparingInt(ProductImage::getSortOrder))
                    .map(this::toImageResponse)
                    .toList()
                : Collections.emptyList();

        return ProductResponse.builder()
                .id(product.getId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .effectivePrice(effectivePrice)
                .stockQuantity(product.getStockQuantity())
                .inStock(product.getStockQuantity() > 0)
                .weight(product.getWeight())
                .unit(product.getUnit().name())
                .brand(product.getBrand())
                .featured(product.isFeatured())
                .active(product.isActive())
                .images(imageResponses)
                .build();
    }

    public ProductSummaryResponse toSummaryResponse(Product product, List<ProductImage> images) {
        BigDecimal effectivePrice = computeEffectivePrice(product);
        String primaryImageUrl = images != null
                ? images.stream()
                    .filter(ProductImage::isPrimaryImage)
                    .findFirst()
                    .map(ProductImage::getImageUrl)
                    .orElse(images.isEmpty() ? null : images.getFirst().getImageUrl())
                : null;

        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .effectivePrice(effectivePrice)
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .inStock(product.getStockQuantity() > 0)
                .featured(product.isFeatured())
                .primaryImageUrl(primaryImageUrl)
                .categoryName(product.getCategory().getName())
                .build();
    }

    public ProductImageResponse toImageResponse(ProductImage image) {
        return ProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .altText(image.getAltText())
                .primaryImage(image.isPrimaryImage())
                .sortOrder(image.getSortOrder())
                .build();
    }

    private BigDecimal computeEffectivePrice(Product product) {
        if (product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0) {
            return product.getDiscountPrice();
        }
        return product.getPrice();
    }
}
