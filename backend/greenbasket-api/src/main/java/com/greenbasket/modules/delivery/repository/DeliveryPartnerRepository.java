package com.greenbasket.modules.delivery.repository;

import com.greenbasket.modules.delivery.entity.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {

    Optional<DeliveryPartner> findByUser_Id(Long userId);
}
