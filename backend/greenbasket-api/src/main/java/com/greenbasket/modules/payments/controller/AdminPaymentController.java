package com.greenbasket.modules.payments.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.payments.dto.request.UpdatePaymentStatusRequest;
import com.greenbasket.modules.payments.dto.response.PaymentResponse;
import com.greenbasket.modules.payments.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Payments", description = "Admin payment management APIs")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Get all payments")
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        return ApiResponse.success(paymentService.getAllPaymentsAdmin());
    }

    @GetMapping("/{paymentId}")
    @Operation(summary = "Get payment details (admin)")
    public ApiResponse<PaymentResponse> getPaymentById(@PathVariable UUID paymentId) {
        return ApiResponse.success(paymentService.getPaymentByIdAdmin(paymentId));
    }

    @PatchMapping("/{paymentId}/status")
    @Operation(summary = "Update payment status")
    public ApiResponse<PaymentResponse> updatePaymentStatus(
            @PathVariable UUID paymentId,
            @Valid @RequestBody UpdatePaymentStatusRequest request) {
        return ApiResponse.success("Payment status updated", paymentService.updatePaymentStatusAdmin(paymentId, request));
    }
}
