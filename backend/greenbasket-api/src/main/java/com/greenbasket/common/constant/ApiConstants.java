package com.greenbasket.common.constant;

public final class ApiConstants {

    public static final String API_VERSION = "v1";
    public static final String API_BASE_PATH = "/v1";

    public static final String RESPONSE_STATUS_SUCCESS = "success";
    public static final String RESPONSE_STATUS_ERROR = "error";

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";
    public static final String MDC_CORRELATION_ID = "correlationId";

    private ApiConstants() {
    }
}
