package com.greenbasket.modules.support.repository;

import com.greenbasket.modules.support.entity.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {

    List<SupportMessage> findByTicket_Id(Long ticketId);
}
