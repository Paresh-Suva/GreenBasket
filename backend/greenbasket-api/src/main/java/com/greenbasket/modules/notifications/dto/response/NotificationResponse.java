package com.greenbasket.modules.notifications.dto.response;

import com.greenbasket.modules.notifications.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class NotificationResponse {

    private final Long id;
    private final NotificationType type;
    private final String title;
    private final String message;
    private final boolean read;
    private final Instant sentAt;
    private final Instant readAt;
    private final String referenceType;
    private final Long referenceId;
}
