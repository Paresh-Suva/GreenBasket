package com.greenbasket.modules.payments.repository;

import com.greenbasket.modules.payments.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPublicId(UUID publicId);

    Optional<Payment> findByOrder_Id(Long orderId);
}
