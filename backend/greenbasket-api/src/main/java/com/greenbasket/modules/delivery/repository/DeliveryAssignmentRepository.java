package com.greenbasket.modules.delivery.repository;

import com.greenbasket.modules.delivery.entity.DeliveryAssignment;
import com.greenbasket.modules.delivery.enums.DeliveryAssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

    Optional<DeliveryAssignment> findByOrder_Id(Long orderId);

    List<DeliveryAssignment> findByDeliveryPartner_Id(Long deliveryPartnerId);

    List<DeliveryAssignment> findByDeliveryPartner_IdAndStatus(Long deliveryPartnerId, DeliveryAssignmentStatus status);
}
