package com.greenbasket.modules.support.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class SupportMessageResponse {

    private final Long id;
    private final String senderName;
    private final String message;
    private final boolean staffReply;
    private final Instant createdAt;
}
