package com.greenbasket.modules.support.dto.response;

import com.greenbasket.modules.support.enums.SupportTicketPriority;
import com.greenbasket.modules.support.enums.SupportTicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class SupportTicketResponse {

    private final UUID id;
    private final Long userId;
    private final String userName;
    private final String subject;
    private final String category;
    private final SupportTicketStatus status;
    private final SupportTicketPriority priority;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final List<SupportMessageResponse> messages;
}
