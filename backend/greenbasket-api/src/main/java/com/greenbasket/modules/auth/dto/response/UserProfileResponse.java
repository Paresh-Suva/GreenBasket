package com.greenbasket.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class UserProfileResponse {

    private final UUID publicId;
    private final String email;
    private final String phoneNumber;
    private final String firstName;
    private final String lastName;
    private final String profileImageUrl;
    private final String status;
    private final String accountStatus;
    private final boolean emailVerified;
    private final Instant lastLoginAt;
    private final List<String> roles;
    private final java.math.BigDecimal walletBalance;
}
