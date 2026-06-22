package com.greenbasket.modules.delivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DeliveryPartnerResponse {

    private final Long id;
    private final Long userId;
    private final String name;
    private final String email;
    private final String phone;
    private final String vehicleType;
    private final String vehicleNumber;
    private final boolean active;
    private final boolean available;
}
