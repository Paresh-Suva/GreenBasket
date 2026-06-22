package com.greenbasket.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class DashboardSummaryResponse {

    private final long totalUsers;
    private final long totalProducts;
    private final long totalOrders;
    private final BigDecimal totalRevenue;
    private final long newOrdersToday;
    private final long activeSupportTickets;
    
    private final long totalCategories;
    private final long activeProducts;
    private final long outOfStockProducts;
    private final long featuredProducts;
    private final long totalCustomers;
}
