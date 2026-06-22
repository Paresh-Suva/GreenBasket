package com.greenbasket.modules.dashboard.service;

import com.greenbasket.modules.dashboard.dto.response.DashboardSummaryResponse;
import com.greenbasket.modules.orders.repository.OrderRepository;
import com.greenbasket.modules.products.repository.ProductRepository;
import com.greenbasket.modules.support.repository.SupportTicketRepository;
import com.greenbasket.modules.users.repository.UserRepository;
import com.greenbasket.modules.categories.repository.CategoryRepository;
import com.greenbasket.modules.auth.repository.UserRoleRepository;
import com.greenbasket.modules.auth.enums.RoleCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final CategoryRepository categoryRepository;
    private final UserRoleRepository userRoleRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        // In a real application, you would use custom queries for these calculations
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == com.greenbasket.modules.orders.enums.OrderStatus.DELIVERED)
                .map(com.greenbasket.modules.orders.entity.Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Simple mock for today's orders count
        long newOrdersToday = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(java.time.Instant.now().minus(1, java.time.temporal.ChronoUnit.DAYS)))
                .count();

        long activeSupportTickets = supportTicketRepository.findAll().stream()
                .filter(t -> t.getStatus() == com.greenbasket.modules.support.enums.SupportTicketStatus.OPEN
                        || t.getStatus() == com.greenbasket.modules.support.enums.SupportTicketStatus.IN_PROGRESS)
                .count();

        long totalCategories = categoryRepository.count();
        long activeProducts = productRepository.countByActive(true);
        long outOfStockProducts = productRepository.countByStockQuantityLessThanEqual(0);
        long featuredProducts = productRepository.countByFeatured(true);
        long totalCustomers = userRoleRepository.countByRole_Code(RoleCode.CUSTOMER);

        return DashboardSummaryResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .newOrdersToday(newOrdersToday)
                .activeSupportTickets(activeSupportTickets)
                .totalCategories(totalCategories)
                .activeProducts(activeProducts)
                .outOfStockProducts(outOfStockProducts)
                .featuredProducts(featuredProducts)
                .totalCustomers(totalCustomers)
                .build();
    }
}
