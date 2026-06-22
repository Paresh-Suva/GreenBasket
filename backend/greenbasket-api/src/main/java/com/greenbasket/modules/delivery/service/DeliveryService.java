package com.greenbasket.modules.delivery.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.delivery.dto.request.AssignDeliveryRequest;
import com.greenbasket.modules.delivery.dto.request.CreateDeliveryPartnerRequest;
import com.greenbasket.modules.delivery.dto.request.UpdateDeliveryStatusRequest;
import com.greenbasket.modules.delivery.dto.response.DeliveryAssignmentResponse;
import com.greenbasket.modules.delivery.dto.response.DeliveryPartnerResponse;
import com.greenbasket.modules.delivery.entity.DeliveryAssignment;
import com.greenbasket.modules.delivery.entity.DeliveryPartner;
import com.greenbasket.modules.delivery.enums.DeliveryAssignmentStatus;
import com.greenbasket.modules.delivery.mapper.DeliveryMapper;
import com.greenbasket.modules.delivery.repository.DeliveryAssignmentRepository;
import com.greenbasket.modules.delivery.repository.DeliveryPartnerRepository;
import com.greenbasket.modules.orders.entity.Order;
import com.greenbasket.modules.orders.repository.OrderRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.repository.UserRepository;
import com.greenbasket.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryMapper deliveryMapper;

    @Transactional
    public DeliveryPartnerResponse createDeliveryPartner(CreateDeliveryPartnerRequest request) {
        if (deliveryPartnerRepository.findByUser_Id(request.getUserId()).isPresent()) {
            throw new BusinessException(ErrorCode.DELIVERY_PARTNER_ALREADY_EXISTS);
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        DeliveryPartner partner = DeliveryPartner.builder()
                .user(user)
                .vehicleType(request.getVehicleType())
                .vehicleNumber(request.getVehicleNumber())
                .licenseNumber(request.getLicenseNumber())
                .active(true)
                .build();

        partner = deliveryPartnerRepository.save(partner);
        return deliveryMapper.toPartnerResponse(partner);
    }

    @Transactional(readOnly = true)
    public List<DeliveryPartnerResponse> getAllDeliveryPartners() {
        return deliveryPartnerRepository.findAll().stream()
                .map(deliveryMapper::toPartnerResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryAssignmentResponse assignDelivery(AssignDeliveryRequest request) {
        Order order = orderRepository.findByPublicId(request.getOrderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (deliveryAssignmentRepository.findByOrder_Id(order.getId()).isPresent()) {
            throw new BusinessException(ErrorCode.DELIVERY_ALREADY_ASSIGNED);
        }

        DeliveryPartner partner = deliveryPartnerRepository.findById(request.getDeliveryPartnerId())
                .orElseThrow(() -> new BusinessException(ErrorCode.DELIVERY_PARTNER_NOT_FOUND));

        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .order(order)
                .deliveryPartner(partner)
                .status(DeliveryAssignmentStatus.ASSIGNED)
                .assignedAt(Instant.now())
                .build();

        assignment = deliveryAssignmentRepository.save(assignment);
        return deliveryMapper.toAssignmentResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<DeliveryAssignmentResponse> getMyAssignments() {
        Long userId = SecurityUtils.getCurrentUserId();
        DeliveryPartner partner = deliveryPartnerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DELIVERY_PARTNER_NOT_FOUND));

        return deliveryAssignmentRepository.findByDeliveryPartner_Id(partner.getId()).stream()
                .map(deliveryMapper::toAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryAssignmentResponse updateDeliveryStatus(Long assignmentId, UpdateDeliveryStatusRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        DeliveryPartner partner = deliveryPartnerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DELIVERY_PARTNER_NOT_FOUND));

        DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DELIVERY_NOT_FOUND));

        if (!assignment.getDeliveryPartner().getId().equals(partner.getId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        assignment.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            assignment.setNotes(request.getNotes());
        }

        if (request.getStatus() == DeliveryAssignmentStatus.PICKED_UP && assignment.getPickedUpAt() == null) {
            assignment.setPickedUpAt(Instant.now());
        } else if (request.getStatus() == DeliveryAssignmentStatus.DELIVERED && assignment.getDeliveredAt() == null) {
            assignment.setDeliveredAt(Instant.now());
        }

        assignment = deliveryAssignmentRepository.save(assignment);
        return deliveryMapper.toAssignmentResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<DeliveryAssignmentResponse> getAllAssignments() {
        return deliveryAssignmentRepository.findAll().stream()
                .map(deliveryMapper::toAssignmentResponse)
                .collect(Collectors.toList());
    }
}
