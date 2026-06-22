package com.greenbasket.modules.orders.repository;

import com.greenbasket.modules.orders.entity.Order;
import com.greenbasket.modules.orders.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByPublicId(UUID publicId);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUser_Id(Long userId);

    List<Order> findByUser_IdAndStatus(Long userId, OrderStatus status);
}
