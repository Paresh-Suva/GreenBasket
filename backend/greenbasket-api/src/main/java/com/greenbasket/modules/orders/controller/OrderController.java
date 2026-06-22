package com.greenbasket.modules.orders.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.orders.dto.request.PlaceOrderRequest;
import com.greenbasket.modules.orders.dto.response.OrderResponse;
import com.greenbasket.modules.orders.dto.response.OrderSummaryResponse;
import com.greenbasket.modules.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Orders", description = "Customer order APIs")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Place a new order")
    public ApiResponse<OrderResponse> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        return ApiResponse.success("Order placed successfully", orderService.placeOrder(request));
    }

    @GetMapping
    @Operation(summary = "Get user orders")
    public ApiResponse<List<OrderSummaryResponse>> getMyOrders() {
        return ApiResponse.success(orderService.getMyOrders());
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable UUID orderId) {
        return ApiResponse.success(orderService.getOrderById(orderId));
    }

    @PatchMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel an order")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable UUID orderId) {
        return ApiResponse.success("Order cancelled", orderService.cancelOrder(orderId));
    }
}
