package com.greenbasket.modules.orders.dto.response;

import com.greenbasket.modules.orders.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class OrderSummaryResponse {

    private final UUID id;
    private final String orderNumber;
    private final OrderStatus status;
    private final BigDecimal totalAmount;
    private final Instant createdAt;
    private final int totalItems;
    private final String productNamesSummary;
}
