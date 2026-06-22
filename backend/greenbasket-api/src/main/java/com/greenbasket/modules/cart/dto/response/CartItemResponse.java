package com.greenbasket.modules.cart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class CartItemResponse {

    private final Long itemId;
    private final Long productId;
    private final String productName;
    private final String productSku;
    private final int quantity;
    private final BigDecimal unitPrice;
    private final BigDecimal discountPrice;
    private final BigDecimal lineTotal;
    private final boolean inStock;
    private final int availableStock;
    private final String productImageUrl;
    private final String categorySlug;
}
