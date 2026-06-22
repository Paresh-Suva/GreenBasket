package com.greenbasket.modules.products.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class ProductSummaryResponse {

    private final Long id;
    private final String name;
    private final String slug;
    private final BigDecimal effectivePrice;
    private final BigDecimal price;
    private final BigDecimal discountPrice;
    private final boolean inStock;
    private final boolean featured;
    private final String primaryImageUrl;
    private final String categoryName;
}
