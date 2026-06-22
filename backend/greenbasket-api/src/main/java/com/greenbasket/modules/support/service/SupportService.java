package com.greenbasket.modules.support.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.support.dto.request.CreateTicketRequest;
import com.greenbasket.modules.support.dto.request.ReplyTicketRequest;
import com.greenbasket.modules.support.dto.request.UpdateTicketStatusRequest;
import com.greenbasket.modules.support.dto.response.SupportTicketResponse;
import com.greenbasket.modules.support.dto.response.SupportTicketSummaryResponse;
import com.greenbasket.modules.support.entity.SupportMessage;
import com.greenbasket.modules.support.entity.SupportTicket;
import com.greenbasket.modules.support.enums.SupportTicketStatus;
import com.greenbasket.modules.support.mapper.SupportMapper;
import com.greenbasket.modules.support.repository.SupportMessageRepository;
import com.greenbasket.modules.support.repository.SupportTicketRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.repository.UserRepository;
import com.greenbasket.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository supportTicketRepository;
    private final SupportMessageRepository supportMessageRepository;
    private final UserRepository userRepository;
    private final SupportMapper supportMapper;

    @Transactional
    public SupportTicketResponse createTicket(CreateTicketRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED));

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(request.getSubject())
                .category(request.getCategory())
                .status(SupportTicketStatus.OPEN)
                .priority(request.getPriority())
                .build();
        ticket = supportTicketRepository.save(ticket);

        SupportMessage initialMessage = SupportMessage.builder()
                .ticket(ticket)
                .sender(user)
                .message(request.getMessage())
                .staffReply(false)
                .build();
        supportMessageRepository.save(initialMessage);

        List<SupportMessage> messages = supportMessageRepository.findByTicket_Id(ticket.getId());
        return supportMapper.toResponse(ticket, messages);
    }

    @Transactional
    public SupportTicketResponse replyToTicket(UUID ticketId, ReplyTicketRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED));

        SupportTicket ticket = supportTicketRepository.findByPublicId(ticketId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        if (ticket.getStatus() == SupportTicketStatus.CLOSED) {
            throw new BusinessException(ErrorCode.TICKET_CLOSED);
        }

        SupportMessage message = SupportMessage.builder()
                .ticket(ticket)
                .sender(user)
                .message(request.getMessage())
                .staffReply(false)
                .build();
        supportMessageRepository.save(message);

        // Update status to IN_PROGRESS if it was OPEN
        if (ticket.getStatus() == SupportTicketStatus.OPEN) {
            ticket.setStatus(SupportTicketStatus.IN_PROGRESS);
            supportTicketRepository.save(ticket);
        }

        List<SupportMessage> messages = supportMessageRepository.findByTicket_Id(ticket.getId());
        return supportMapper.toResponse(ticket, messages);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketSummaryResponse> getMyTickets() {
        Long userId = SecurityUtils.getCurrentUserId();
        return supportTicketRepository.findByUser_Id(userId).stream()
                .map(supportMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupportTicketResponse getTicketById(UUID ticketId) {
        Long userId = SecurityUtils.getCurrentUserId();
        SupportTicket ticket = supportTicketRepository.findByPublicId(ticketId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        if (!ticket.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        List<SupportMessage> messages = supportMessageRepository.findByTicket_Id(ticket.getId());
        return supportMapper.toResponse(ticket, messages);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketSummaryResponse> getAllTicketsAdmin() {
        return supportTicketRepository.findAll().stream()
                .map(supportMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupportTicketResponse getTicketByIdAdmin(UUID ticketId) {
        SupportTicket ticket = supportTicketRepository.findByPublicId(ticketId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        List<SupportMessage> messages = supportMessageRepository.findByTicket_Id(ticket.getId());
        return supportMapper.toResponse(ticket, messages);
    }

    @Transactional
    public SupportTicketResponse replyToTicketAdmin(UUID ticketId, ReplyTicketRequest request) {
        Long adminId = SecurityUtils.getCurrentUserId();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED));

        SupportTicket ticket = supportTicketRepository.findByPublicId(ticketId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        SupportMessage message = SupportMessage.builder()
                .ticket(ticket)
                .sender(admin)
                .message(request.getMessage())
                .staffReply(true)
                .build();
        supportMessageRepository.save(message);

        // Update status to OPEN if it was RESOLVED or CLOSED and user replies
        if (ticket.getStatus() == SupportTicketStatus.CLOSED || ticket.getStatus() == SupportTicketStatus.RESOLVED) {
            ticket.setStatus(SupportTicketStatus.OPEN);
            supportTicketRepository.save(ticket);
        }

        List<SupportMessage> messages = supportMessageRepository.findByTicket_Id(ticket.getId());
        return supportMapper.toResponse(ticket, messages);
    }

    @Transactional
    public SupportTicketResponse updateTicketStatusAdmin(UUID ticketId, UpdateTicketStatusRequest request) {
        SupportTicket ticket = supportTicketRepository.findByPublicId(ticketId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TICKET_NOT_FOUND));

        ticket.setStatus(request.getStatus());
        ticket = supportTicketRepository.save(ticket);

        List<SupportMessage> messages = supportMessageRepository.findByTicket_Id(ticket.getId());
        return supportMapper.toResponse(ticket, messages);
    }
}
