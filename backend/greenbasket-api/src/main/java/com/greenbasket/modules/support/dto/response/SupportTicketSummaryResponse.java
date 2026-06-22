package com.greenbasket.modules.support.dto.response;

import com.greenbasket.modules.support.enums.SupportTicketPriority;
import com.greenbasket.modules.support.enums.SupportTicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class SupportTicketSummaryResponse {

    private final UUID id;
    private final String subject;
    private final String category;
    private final SupportTicketStatus status;
    private final SupportTicketPriority priority;
    private final Instant createdAt;
    private final Instant updatedAt;
}
