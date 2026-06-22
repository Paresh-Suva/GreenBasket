package com.greenbasket.modules.delivery.mapper;

import com.greenbasket.modules.delivery.dto.response.DeliveryAssignmentResponse;
import com.greenbasket.modules.delivery.dto.response.DeliveryPartnerResponse;
import com.greenbasket.modules.delivery.entity.DeliveryAssignment;
import com.greenbasket.modules.delivery.entity.DeliveryPartner;
import org.springframework.stereotype.Component;

@Component
public class DeliveryMapper {

    public DeliveryPartnerResponse toPartnerResponse(DeliveryPartner partner) {
        return DeliveryPartnerResponse.builder()
                .id(partner.getId())
                .userId(partner.getUser().getId())
                .name(partner.getUser().getFirstName() + " " + partner.getUser().getLastName())
                .email(partner.getUser().getEmail())
                .phone(partner.getUser().getPhoneNumber())
                .vehicleType(partner.getVehicleType())
                .vehicleNumber(partner.getVehicleNumber())
                .active(partner.isActive())
                .available(true)
                .build();
    }

    public DeliveryAssignmentResponse toAssignmentResponse(DeliveryAssignment assignment) {
        return DeliveryAssignmentResponse.builder()
                .id(assignment.getId())
                .orderId(assignment.getOrder().getPublicId())
                .orderNumber(assignment.getOrder().getOrderNumber())
                .deliveryPartnerId(assignment.getDeliveryPartner().getId())
                .deliveryPartnerName(assignment.getDeliveryPartner().getUser().getFirstName() + " " + assignment.getDeliveryPartner().getUser().getLastName())
                .status(assignment.getStatus())
                .assignedAt(assignment.getAssignedAt())
                .pickedUpAt(assignment.getPickedUpAt())
                .deliveredAt(assignment.getDeliveredAt())
                .notes(assignment.getNotes())
                .deliveryAddress(assignment.getOrder().getDeliveryAddressSnapshot())
                .build();
    }
}
