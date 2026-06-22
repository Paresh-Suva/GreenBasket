package com.greenbasket.security.jwt;

import com.greenbasket.security.AuthenticatedUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;

    public String generateAccessToken(AuthenticatedUser user) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(jwtProperties.getAccessTokenExpirationMs());

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getPublicId().toString())
                .issuer(jwtProperties.getIssuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim(JwtClaims.TOKEN_TYPE, JwtClaims.TOKEN_TYPE_ACCESS)
                .claim(JwtClaims.USER_ID, user.getUserId())
                .claim("email", user.getEmail())
                .claim(JwtClaims.ROLES, user.getRoleCodes())
                .claim(JwtClaims.PERMISSIONS, user.getPermissionCodes())
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(AuthenticatedUser user) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(jwtProperties.getRefreshTokenExpirationMs());

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getPublicId().toString())
                .issuer(jwtProperties.getIssuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim(JwtClaims.TOKEN_TYPE, JwtClaims.TOKEN_TYPE_REFRESH)
                .claim(JwtClaims.USER_ID, user.getUserId())
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer(jwtProperties.getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (SignatureException | MalformedJwtException | UnsupportedJwtException |
                 IllegalArgumentException exception) {
            log.warn("Invalid JWT token: {}", exception.getMessage());
            return false;
        } catch (ExpiredJwtException exception) {
            log.warn("Expired JWT token: {}", exception.getMessage());
            return false;
        }
    }

    public boolean isAccessToken(Claims claims) {
        return JwtClaims.TOKEN_TYPE_ACCESS.equals(claims.get(JwtClaims.TOKEN_TYPE, String.class));
    }

    public boolean isRefreshToken(Claims claims) {
        return JwtClaims.TOKEN_TYPE_REFRESH.equals(claims.get(JwtClaims.TOKEN_TYPE, String.class));
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(Claims claims) {
        Object roles = claims.get(JwtClaims.ROLES);
        if (roles instanceof List<?> roleList) {
            return roleList.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(Claims claims) {
        Object permissions = claims.get(JwtClaims.PERMISSIONS);
        if (permissions instanceof List<?> permissionList) {
            return permissionList.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    public long getAccessTokenExpirationMs() {
        return jwtProperties.getAccessTokenExpirationMs();
    }

    public long getRefreshTokenExpirationMs() {
        return jwtProperties.getRefreshTokenExpirationMs();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            keyBytes = Decoders.BASE64.decode(
                    java.util.Base64.getEncoder().encodeToString(keyBytes));
        }
        return Keys.hmacShaKeyFor(keyBytes.length >= 32 ? keyBytes : padKey(keyBytes));
    }

    private byte[] padKey(byte[] keyBytes) {
        byte[] padded = new byte[32];
        System.arraycopy(keyBytes, 0, padded, 0, Math.min(keyBytes.length, 32));
        return padded;
    }
}
