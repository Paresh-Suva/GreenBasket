package com.greenbasket.modules.payments.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.payments.dto.request.UpdatePaymentStatusRequest;
import com.greenbasket.modules.payments.dto.response.PaymentResponse;
import com.greenbasket.modules.payments.entity.Payment;
import com.greenbasket.modules.payments.enums.PaymentStatus;
import com.greenbasket.modules.payments.mapper.PaymentMapper;
import com.greenbasket.modules.payments.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPaymentsAdmin() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByIdAdmin(UUID paymentId) {
        Payment payment = paymentRepository.findByPublicId(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));
        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public PaymentResponse updatePaymentStatusAdmin(UUID paymentId, UpdatePaymentStatusRequest request) {
        Payment payment = paymentRepository.findByPublicId(paymentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        payment.setStatus(request.getStatus());

        if (request.getTransactionReference() != null) {
            payment.setTransactionReference(request.getTransactionReference());
        }

        if (request.getStatus() == PaymentStatus.COMPLETED && payment.getPaidAt() == null) {
            payment.setPaidAt(Instant.now());
        }

        payment = paymentRepository.save(payment);
        return paymentMapper.toResponse(payment);
    }
}
