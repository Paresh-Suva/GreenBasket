package com.greenbasket.modules.orders.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.orders.dto.response.OrderTrackingResponse;
import com.greenbasket.modules.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders/tracking")
@RequiredArgsConstructor
@Tag(name = "Order Tracking", description = "Public tracking API")
public class OrderTrackingController {

    private final OrderService orderService;

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Get tracking details by order number")
    public ApiResponse<OrderTrackingResponse> getTrackingInfo(@PathVariable String orderNumber) {
        return ApiResponse.success(orderService.getTrackingInfo(orderNumber));
    }
}
