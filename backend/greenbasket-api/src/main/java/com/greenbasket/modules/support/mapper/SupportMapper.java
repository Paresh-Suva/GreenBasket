package com.greenbasket.modules.support.mapper;

import com.greenbasket.modules.support.dto.response.SupportMessageResponse;
import com.greenbasket.modules.support.dto.response.SupportTicketResponse;
import com.greenbasket.modules.support.dto.response.SupportTicketSummaryResponse;
import com.greenbasket.modules.support.entity.SupportMessage;
import com.greenbasket.modules.support.entity.SupportTicket;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SupportMapper {

    public SupportTicketResponse toResponse(SupportTicket ticket, List<SupportMessage> messages) {
        List<SupportMessageResponse> messageResponses = messages.stream()
                .map(this::toMessageResponse)
                .toList();

        return SupportTicketResponse.builder()
                .id(ticket.getPublicId())
                .userId(ticket.getUser().getId())
                .userName(ticket.getUser().getFirstName() + " " + ticket.getUser().getLastName())
                .subject(ticket.getSubject())
                .category(ticket.getCategory())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .messages(messageResponses)
                .build();
    }

    public SupportTicketSummaryResponse toSummaryResponse(SupportTicket ticket) {
        return SupportTicketSummaryResponse.builder()
                .id(ticket.getPublicId())
                .subject(ticket.getSubject())
                .category(ticket.getCategory())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    public SupportMessageResponse toMessageResponse(SupportMessage message) {
        return SupportMessageResponse.builder()
                .id(message.getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .message(message.getMessage())
                .staffReply(message.isStaffReply())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
