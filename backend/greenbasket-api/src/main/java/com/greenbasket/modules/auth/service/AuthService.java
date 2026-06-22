package com.greenbasket.modules.auth.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.auth.dto.request.ForgotPasswordRequest;
import com.greenbasket.modules.auth.dto.request.LoginRequest;
import com.greenbasket.modules.auth.dto.request.RegisterRequest;
import com.greenbasket.modules.auth.dto.request.ResetPasswordRequest;
import com.greenbasket.modules.auth.dto.response.AuthResponse;
import com.greenbasket.modules.auth.dto.response.MessageResponse;
import com.greenbasket.modules.auth.dto.response.RegisterResponse;
import com.greenbasket.modules.auth.dto.response.UserProfileResponse;
import com.greenbasket.modules.auth.entity.RefreshToken;
import com.greenbasket.modules.auth.entity.Role;
import com.greenbasket.modules.auth.entity.UserRole;
import com.greenbasket.modules.auth.enums.RoleCode;
import com.greenbasket.modules.auth.mapper.UserProfileMapper;
import com.greenbasket.modules.auth.repository.RoleRepository;
import com.greenbasket.modules.auth.repository.UserRoleRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.enums.AccountStatus;
import com.greenbasket.modules.users.enums.UserStatus;
import com.greenbasket.modules.users.repository.UserRepository;
import com.greenbasket.security.AuthenticatedUser;
import com.greenbasket.security.CustomUserDetailsService;
import com.greenbasket.security.SecurityUtils;
import com.greenbasket.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String BEARER = "Bearer";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;
    private final AccountSecurityValidator accountSecurityValidator;
    private final UserProfileMapper userProfileMapper;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()
                && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BusinessException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(normalizedEmail)
                .phoneNumber(blankToNull(request.getPhoneNumber()))
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .accountStatus(AccountStatus.PENDING_ACTIVATION)
                .build();

        user = userRepository.save(user);
        assignCustomerRole(user);

        String verificationToken = emailVerificationService.createVerificationToken(user);

        return RegisterResponse.builder()
                .publicId(user.getPublicId())
                .email(user.getEmail())
                .message("Registration successful. Please verify your email to activate your account.")
                .verificationToken(verificationToken)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_INVALID_CREDENTIALS));

        accountSecurityValidator.validateAuthenticationEligibility(user);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.AUTH_INVALID_CREDENTIALS);
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        AuthenticatedUser authenticatedUser = userDetailsService.loadUserById(user.getId());
        return buildAuthResponse(authenticatedUser, user, httpRequest);
    }

    @Transactional
    public AuthResponse refreshTokens(String rawRefreshToken, HttpServletRequest httpRequest) {
        RefreshToken storedToken = refreshTokenService.validateRefreshToken(rawRefreshToken);
        User user = storedToken.getUser();

        accountSecurityValidator.validateAuthenticationEligibility(user);

        AuthenticatedUser authenticatedUser = userDetailsService.loadUserById(user.getId());

        refreshTokenService.revokeToken(storedToken);
        return buildAuthResponse(authenticatedUser, user, httpRequest);
    }

    @Transactional
    public MessageResponse logout(String rawRefreshToken) {
        refreshTokenService.revokeTokenByRawValue(rawRefreshToken);
        return MessageResponse.builder()
                .message("Logged out successfully")
                .build();
    }

    @Transactional
    public MessageResponse logoutAll() {
        Long userId = SecurityUtils.getCurrentUserId();
        refreshTokenService.revokeAllUserTokens(userId);
        return MessageResponse.builder()
                .message("Logged out from all devices successfully")
                .build();
    }

    @Transactional
    public MessageResponse verifyEmail(String rawToken) {
        User user = emailVerificationService.verifyEmail(rawToken);
        userRepository.save(user);
        return MessageResponse.builder()
                .message("Email verified successfully. You can now log in.")
                .build();
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        userRepository.findByEmail(normalizedEmail).ifPresent(passwordResetService::createResetToken);

        return MessageResponse.builder()
                .message("If an account exists with this email, a password reset link has been generated.")
                .build();
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = passwordResetService.validateResetToken(request.getToken());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        passwordResetService.markTokenUsed(request.getToken());
        refreshTokenService.revokeAllUserTokens(user.getId());

        return MessageResponse.builder()
                .message("Password reset successfully")
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED, "User not found"));
        List<UserRole> userRoles = userRoleRepository.findByUser_Id(userId);
        return userProfileMapper.toResponse(user, userRoles);
    }

    private AuthResponse buildAuthResponse(
            AuthenticatedUser authenticatedUser,
            User user,
            HttpServletRequest httpRequest) {

        String accessToken = jwtTokenProvider.generateAccessToken(authenticatedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authenticatedUser);

        refreshTokenService.createRefreshToken(
                user,
                refreshToken,
                httpRequest.getHeader("User-Agent"),
                httpRequest.getRemoteAddr());

        List<UserRole> userRoles = userRoleRepository.findByUser_Id(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType(BEARER)
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(userProfileMapper.toResponse(user, userRoles))
                .build();
    }

    private void assignCustomerRole(User user) {
        Role customerRole = roleRepository.findByCode(RoleCode.CUSTOMER)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.INTERNAL_ERROR,
                        "Default customer role is not configured"));

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(customerRole)
                .build();
        userRoleRepository.save(userRole);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
