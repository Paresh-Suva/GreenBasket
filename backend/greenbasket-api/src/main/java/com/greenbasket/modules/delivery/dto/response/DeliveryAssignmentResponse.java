package com.greenbasket.modules.delivery.dto.response;

import com.greenbasket.modules.delivery.enums.DeliveryAssignmentStatus;
import com.greenbasket.modules.orders.entity.DeliveryAddressSnapshot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class DeliveryAssignmentResponse {

    private final Long id;
    private final UUID orderId;
    private final String orderNumber;
    private final Long deliveryPartnerId;
    private final String deliveryPartnerName;
    private final DeliveryAssignmentStatus status;
    private final Instant assignedAt;
    private final Instant pickedUpAt;
    private final Instant deliveredAt;
    private final String notes;
    private final DeliveryAddressSnapshot deliveryAddress;
}
