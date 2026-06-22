package com.greenbasket.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.greenbasket.common.constant.ApiConstants;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final String status;
    private final String message;
    private final T data;
    private final Instant timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return success("Request completed successfully", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(ApiConstants.RESPONSE_STATUS_SUCCESS)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static ApiResponse<Void> success(String message) {
        return ApiResponse.<Void>builder()
                .status(ApiConstants.RESPONSE_STATUS_SUCCESS)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}
