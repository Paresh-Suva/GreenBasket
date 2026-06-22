package com.greenbasket.modules.orders.dto.response;

import com.greenbasket.modules.orders.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTrackingResponse {
    private String orderNumber;
    private OrderStatus status;
    private Instant createdAt;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private BigDecimal customerLatitude;
    private BigDecimal customerLongitude;
    private String warehouseName;
    private String warehouseAddress;
    private String warehouseContact;
    private BigDecimal warehouseLatitude;
    private BigDecimal warehouseLongitude;
}
