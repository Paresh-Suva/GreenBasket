package com.greenbasket.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class RegisterResponse {

    private final UUID publicId;
    private final String email;
    private final String message;
    private final String verificationToken;
}
