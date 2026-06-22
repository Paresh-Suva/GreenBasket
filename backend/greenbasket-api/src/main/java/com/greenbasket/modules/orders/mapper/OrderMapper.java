package com.greenbasket.modules.orders.mapper;

import com.greenbasket.modules.orders.dto.response.OrderItemResponse;
import com.greenbasket.modules.orders.dto.response.OrderResponse;
import com.greenbasket.modules.orders.dto.response.OrderSummaryResponse;
import com.greenbasket.modules.orders.entity.Order;
import com.greenbasket.modules.orders.entity.OrderItem;
import com.greenbasket.modules.products.entity.ProductImage;
import com.greenbasket.modules.products.repository.ProductImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final ProductImageRepository productImageRepository;

    public OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getPublicId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .taxAmount(order.getTaxAmount())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddressSnapshot())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }

    public OrderItemResponse toItemResponse(OrderItem item) {
        List<ProductImage> images = productImageRepository.findByProduct_Id(item.getProduct().getId());
        String productImageUrl = images.stream()
                .filter(ProductImage::isPrimaryImage)
                .findFirst()
                .or(() -> images.stream().findFirst())
                .map(ProductImage::getImageUrl)
                .orElse(null);

        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .productSku(item.getProductSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discountPrice(item.getDiscountPrice())
                .lineTotal(item.getLineTotal())
                .productImageUrl(productImageUrl)
                .build();
    }

    public OrderSummaryResponse toSummaryResponse(Order order, int totalItems, String productNamesSummary) {
        return OrderSummaryResponse.builder()
                .id(order.getPublicId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .totalItems(totalItems)
                .productNamesSummary(productNamesSummary)
                .build();
    }
}
