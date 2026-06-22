package com.greenbasket.modules.delivery.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.delivery.dto.request.UpdateDeliveryStatusRequest;
import com.greenbasket.modules.delivery.dto.response.DeliveryAssignmentResponse;
import com.greenbasket.modules.delivery.service.DeliveryService;
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

@RestController
@RequestMapping("/delivery/assignments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
@Tag(name = "Delivery", description = "Delivery partner APIs")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    @Operation(summary = "Get my assignments")
    public ApiResponse<List<DeliveryAssignmentResponse>> getMyAssignments() {
        return ApiResponse.success(deliveryService.getMyAssignments());
    }

    @PatchMapping("/{assignmentId}/status")
    @Operation(summary = "Update assignment status")
    public ApiResponse<DeliveryAssignmentResponse> updateDeliveryStatus(
            @PathVariable Long assignmentId,
            @Valid @RequestBody UpdateDeliveryStatusRequest request) {
        return ApiResponse.success("Status updated", deliveryService.updateDeliveryStatus(assignmentId, request));
    }
}
