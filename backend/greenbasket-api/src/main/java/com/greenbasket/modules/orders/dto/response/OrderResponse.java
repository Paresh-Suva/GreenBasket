package com.greenbasket.modules.orders.dto.response;

import com.greenbasket.modules.orders.entity.DeliveryAddressSnapshot;
import com.greenbasket.modules.orders.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class OrderResponse {

    private final UUID id;
    private final String orderNumber;
    private final OrderStatus status;
    private final BigDecimal subtotal;
    private final BigDecimal discountAmount;
    private final BigDecimal taxAmount;
    private final BigDecimal deliveryFee;
    private final BigDecimal totalAmount;
    private final DeliveryAddressSnapshot deliveryAddress;
    private final String notes;
    private final Instant createdAt;
    private final List<OrderItemResponse> items;
}
