package com.greenbasket.modules.delivery.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.delivery.dto.request.AssignDeliveryRequest;
import com.greenbasket.modules.delivery.dto.request.CreateDeliveryPartnerRequest;
import com.greenbasket.modules.delivery.dto.response.DeliveryAssignmentResponse;
import com.greenbasket.modules.delivery.dto.response.DeliveryPartnerResponse;
import com.greenbasket.modules.delivery.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/delivery")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Delivery", description = "Admin delivery management APIs")
public class AdminDeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/partners")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create delivery partner")
    public ApiResponse<DeliveryPartnerResponse> createDeliveryPartner(@Valid @RequestBody CreateDeliveryPartnerRequest request) {
        return ApiResponse.success("Delivery partner created", deliveryService.createDeliveryPartner(request));
    }

    @GetMapping("/partners")
    @Operation(summary = "Get all delivery partners")
    public ApiResponse<List<DeliveryPartnerResponse>> getAllDeliveryPartners() {
        return ApiResponse.success(deliveryService.getAllDeliveryPartners());
    }

    @PostMapping("/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Assign delivery to partner")
    public ApiResponse<DeliveryAssignmentResponse> assignDelivery(@Valid @RequestBody AssignDeliveryRequest request) {
        return ApiResponse.success("Delivery assigned", deliveryService.assignDelivery(request));
    }

    @GetMapping("/assignments")
    @Operation(summary = "Get all delivery assignments")
    public ApiResponse<List<DeliveryAssignmentResponse>> getAllAssignments() {
        return ApiResponse.success(deliveryService.getAllAssignments());
    }
}
