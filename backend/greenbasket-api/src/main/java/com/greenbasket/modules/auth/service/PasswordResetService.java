package com.greenbasket.modules.auth.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.auth.config.AuthProperties;
import com.greenbasket.modules.auth.entity.PasswordResetToken;
import com.greenbasket.modules.auth.repository.PasswordResetTokenRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.util.TokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AuthProperties authProperties;

    @Transactional
    public Optional<String> createResetToken(User user) {
        passwordResetTokenRepository.deleteByUser_Id(user.getId());

        String rawToken = TokenUtils.generateSecureToken();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(TokenUtils.hashToken(rawToken))
                .expiresAt(Instant.now().plusMillis(authProperties.getPasswordResetExpirationMs()))
                .build();

        passwordResetTokenRepository.save(resetToken);
        return Optional.of(rawToken);
    }

    @Transactional
    public User validateResetToken(String rawToken) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHash(TokenUtils.hashToken(rawToken))
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.AUTH_INVALID_TOKEN,
                        "Invalid password reset token"));

        if (resetToken.isUsed()) {
            throw new BusinessException(ErrorCode.AUTH_INVALID_TOKEN, "Password reset token has already been used");
        }
        if (resetToken.isExpired()) {
            throw new BusinessException(ErrorCode.AUTH_INVALID_TOKEN, "Password reset token has expired");
        }

        return resetToken.getUser();
    }

    @Transactional
    public void markTokenUsed(String rawToken) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHash(TokenUtils.hashToken(rawToken))
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.AUTH_INVALID_TOKEN,
                        "Invalid password reset token"));
        resetToken.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(resetToken);
    }
}
