package com.greenbasket.security.jwt;

import com.greenbasket.common.response.ApiErrorResponse;
import com.greenbasket.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final SecurityErrorResponseWriter securityErrorResponseWriter;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        ApiErrorResponse errorResponse = ApiErrorResponse.of(
                ErrorCode.AUTH_UNAUTHORIZED.getCode(),
                ErrorCode.AUTH_UNAUTHORIZED.getDefaultMessage(),
                request.getRequestURI());

        securityErrorResponseWriter.write(
                response,
                ErrorCode.AUTH_UNAUTHORIZED.getHttpStatus().value(),
                errorResponse);
    }
}
