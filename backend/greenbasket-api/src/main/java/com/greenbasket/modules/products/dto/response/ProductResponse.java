package com.greenbasket.modules.products.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ProductResponse {

    private final Long id;
    private final Long categoryId;
    private final String categoryName;
    private final String sku;
    private final String name;
    private final String slug;
    private final String description;
    private final BigDecimal price;
    private final BigDecimal discountPrice;
    private final BigDecimal effectivePrice;
    private final int stockQuantity;
    private final boolean inStock;
    private final BigDecimal weight;
    private final String unit;
    private final String brand;
    private final boolean featured;
    private final boolean active;
    private final List<ProductImageResponse> images;
}
