package com.greenbasket.modules.auth.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.auth.config.AuthProperties;
import com.greenbasket.modules.auth.entity.EmailVerificationToken;
import com.greenbasket.modules.auth.repository.EmailVerificationTokenRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.enums.AccountStatus;
import com.greenbasket.util.TokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final AuthProperties authProperties;

    @Transactional
    public String createVerificationToken(User user) {
        emailVerificationTokenRepository.deleteByUser_Id(user.getId());

        String rawToken = TokenUtils.generateSecureToken();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .tokenHash(TokenUtils.hashToken(rawToken))
                .expiresAt(Instant.now().plusMillis(authProperties.getEmailVerificationExpirationMs()))
                .build();

        emailVerificationTokenRepository.save(verificationToken);
        return rawToken;
    }

    @Transactional
    public User verifyEmail(String rawToken) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository
                .findByTokenHash(TokenUtils.hashToken(rawToken))
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.AUTH_INVALID_TOKEN,
                        "Invalid verification token"));

        if (verificationToken.isUsed()) {
            throw new BusinessException(
                    ErrorCode.AUTH_INVALID_TOKEN,
                    "Verification token has already been used");
        }
        if (verificationToken.isExpired()) {
            throw new BusinessException(
                    ErrorCode.AUTH_INVALID_TOKEN,
                    "Verification token has expired");
        }

        verificationToken.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(verificationToken);

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        user.setAccountStatus(AccountStatus.ENABLED);
        return user;
    }
}
