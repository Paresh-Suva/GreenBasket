package com.greenbasket.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.greenbasket.common.constant.ApiConstants;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private final String status;
    private final String code;
    private final String message;
    private final List<FieldViolation> errors;
    private final String path;
    private final Instant timestamp;

    public static ApiErrorResponse of(String code, String message, String path) {
        return ApiErrorResponse.builder()
                .status(ApiConstants.RESPONSE_STATUS_ERROR)
                .code(code)
                .message(message)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }

    public static ApiErrorResponse of(String code, String message, String path, List<FieldViolation> errors) {
        return ApiErrorResponse.builder()
                .status(ApiConstants.RESPONSE_STATUS_ERROR)
                .code(code)
                .message(message)
                .errors(errors)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }

    @Getter
    @Builder
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class FieldViolation {

        private final String field;
        private final String message;
        private final Object rejectedValue;
    }
}
