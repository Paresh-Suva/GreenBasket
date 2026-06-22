package com.greenbasket.modules.payments.dto.response;

import com.greenbasket.modules.payments.enums.PaymentMethod;
import com.greenbasket.modules.payments.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class PaymentResponse {

    private final UUID id;
    private final UUID orderId;
    private final String orderNumber;
    private final BigDecimal amount;
    private final PaymentMethod method;
    private final PaymentStatus status;
    private final String transactionReference;
    private final Instant paidAt;
    private final Instant createdAt;
}
