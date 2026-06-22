package com.greenbasket.modules.payments.mapper;

import com.greenbasket.modules.payments.dto.response.PaymentResponse;
import com.greenbasket.modules.payments.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getPublicId())
                .orderId(payment.getOrder().getPublicId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .transactionReference(payment.getTransactionReference())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
