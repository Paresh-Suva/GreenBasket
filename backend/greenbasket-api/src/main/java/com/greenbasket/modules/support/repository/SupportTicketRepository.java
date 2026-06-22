package com.greenbasket.modules.support.repository;

import com.greenbasket.modules.support.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    Optional<SupportTicket> findByPublicId(UUID publicId);

    List<SupportTicket> findByUser_Id(Long userId);
}
