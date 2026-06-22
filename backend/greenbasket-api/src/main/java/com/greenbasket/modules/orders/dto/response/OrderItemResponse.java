package com.greenbasket.modules.orders.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class OrderItemResponse {

    private final Long id;
    private final Long productId;
    private final String productName;
    private final String productSku;
    private final int quantity;
    private final BigDecimal unitPrice;
    private final BigDecimal discountPrice;
    private final BigDecimal lineTotal;
    private final String productImageUrl;
}
