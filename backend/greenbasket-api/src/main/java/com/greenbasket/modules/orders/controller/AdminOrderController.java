package com.greenbasket.modules.orders.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.orders.dto.request.UpdateOrderStatusRequest;
import com.greenbasket.modules.orders.dto.response.OrderResponse;
import com.greenbasket.modules.orders.dto.response.OrderSummaryResponse;
import com.greenbasket.modules.orders.service.OrderService;
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
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Orders", description = "Admin order management APIs")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all orders")
    public ApiResponse<List<OrderSummaryResponse>> getAllOrders() {
        return ApiResponse.success(orderService.getAllOrdersAdmin());
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details (admin)")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable UUID orderId) {
        return ApiResponse.success(orderService.getOrderByIdAdmin(orderId));
    }

    @PatchMapping("/{orderId}/status")
    @Operation(summary = "Update order status")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable UUID orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ApiResponse.success("Order status updated", orderService.updateOrderStatusAdmin(orderId, request));
    }
}
