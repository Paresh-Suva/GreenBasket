package com.greenbasket.modules.auth.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.auth.entity.RefreshToken;
import com.greenbasket.modules.auth.repository.RefreshTokenRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.security.AuthenticatedUser;
import com.greenbasket.security.jwt.JwtTokenProvider;
import com.greenbasket.util.TokenUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public RefreshToken createRefreshToken(
            User user,
            String rawRefreshToken,
            String userAgent,
            String ipAddress) {

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenUtils.hashToken(rawRefreshToken))
                .expiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpirationMs()))
                .revoked(false)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String rawRefreshToken) {
        if (!jwtTokenProvider.validateToken(rawRefreshToken)) {
            throw new BusinessException(ErrorCode.AUTH_INVALID_TOKEN, "Invalid refresh token");
        }

        Claims claims = jwtTokenProvider.parseClaims(rawRefreshToken);
        if (!jwtTokenProvider.isRefreshToken(claims)) {
            throw new BusinessException(ErrorCode.AUTH_INVALID_TOKEN, "Invalid refresh token type");
        }

        RefreshToken storedToken = refreshTokenRepository
                .findByTokenHash(TokenUtils.hashToken(rawRefreshToken))
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_INVALID_TOKEN, "Refresh token not found"));

        if (storedToken.isRevoked()) {
            throw new BusinessException(ErrorCode.AUTH_INVALID_TOKEN, "Refresh token has been revoked");
        }
        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException(ErrorCode.AUTH_INVALID_TOKEN, "Refresh token has expired");
        }

        return storedToken;
    }

    @Transactional
    public void revokeToken(RefreshToken refreshToken) {
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void revokeTokenByRawValue(String rawRefreshToken) {
        refreshTokenRepository.findByTokenHash(TokenUtils.hashToken(rawRefreshToken))
                .ifPresent(this::revokeToken);
    }

    @Transactional
    public void revokeAllUserTokens(Long userId) {
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUser_IdAndRevokedFalse(userId);
        activeTokens.forEach(token -> token.setRevoked(true));
        refreshTokenRepository.saveAll(activeTokens);
    }

    @Transactional
    public void rotateToken(RefreshToken oldToken, RefreshToken newToken) {
        oldToken.setRevoked(true);
        oldToken.setReplacedByToken(newToken);
        refreshTokenRepository.save(oldToken);
    }
}
