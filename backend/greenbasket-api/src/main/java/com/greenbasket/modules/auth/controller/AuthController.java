package com.greenbasket.modules.auth.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.auth.dto.request.ForgotPasswordRequest;
import com.greenbasket.modules.auth.dto.request.LoginRequest;
import com.greenbasket.modules.auth.dto.request.LogoutRequest;
import com.greenbasket.modules.auth.dto.request.RefreshTokenRequest;
import com.greenbasket.modules.auth.dto.request.RegisterRequest;
import com.greenbasket.modules.auth.dto.request.ResetPasswordRequest;
import com.greenbasket.modules.auth.dto.request.VerifyEmailRequest;
import com.greenbasket.modules.auth.dto.response.AuthResponse;
import com.greenbasket.modules.auth.dto.response.MessageResponse;
import com.greenbasket.modules.auth.dto.response.RegisterResponse;
import com.greenbasket.modules.auth.dto.response.UserProfileResponse;
import com.greenbasket.modules.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ApiResponse.success("Registration successful", response);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request, httpRequest);
        return ApiResponse.success("Login successful", response);
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.refreshTokens(request.getRefreshToken(), httpRequest);
        return ApiResponse.success("Token refreshed successfully", response);
    }

    @PostMapping("/logout")
    public ApiResponse<MessageResponse> logout(@Valid @RequestBody LogoutRequest request) {
        MessageResponse response = authService.logout(request.getRefreshToken());
        return ApiResponse.success(response.getMessage(), response);
    }

    @PostMapping("/logout-all")
    public ApiResponse<MessageResponse> logoutAll() {
        MessageResponse response = authService.logoutAll();
        return ApiResponse.success(response.getMessage(), response);
    }

    @PostMapping("/verify-email")
    public ApiResponse<MessageResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        MessageResponse response = authService.verifyEmail(request.getToken());
        return ApiResponse.success(response.getMessage(), response);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.forgotPassword(request);
        return ApiResponse.success(response.getMessage(), response);
    }

    @PostMapping("/reset-password")
    public ApiResponse<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.resetPassword(request);
        return ApiResponse.success(response.getMessage(), response);
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getCurrentUser() {
        UserProfileResponse response = authService.getCurrentUserProfile();
        return ApiResponse.success(response);
    }
}
