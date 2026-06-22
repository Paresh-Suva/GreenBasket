package com.greenbasket.modules.delivery.dto.request;

import com.greenbasket.modules.delivery.enums.DeliveryAssignmentStatus;
import jakarta.validation.constraints.NotNull;
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
public class UpdateDeliveryStatusRequest {

    @NotNull(message = "Status is required")
    private DeliveryAssignmentStatus status;

    private String notes;
}
