package com.greenbasket.modules.orders.dto.request;

import com.greenbasket.modules.payments.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceOrderRequest {

    @NotNull(message = "Delivery address is required")
    private Long deliveryAddressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    private String couponCode;

    private Boolean useWallet;
}
