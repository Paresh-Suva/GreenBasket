package com.greenbasket.modules.cart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class CartResponse {

    private final List<CartItemResponse> items;
    private final BigDecimal subtotal;
    private final int totalItems;
    private final int totalQuantity;
}
