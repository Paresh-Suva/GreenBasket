package com.greenbasket.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

public final class SecurityUtils {

    private static final String SYSTEM_USER = "system";

    private SecurityUtils() {
    }

    public static Optional<AuthenticatedUser> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthenticatedUser authenticatedUser) {
            return Optional.of(authenticatedUser);
        }
        return Optional.empty();
    }

    public static String getCurrentAuditor() {
        return getCurrentUser()
                .map(AuthenticatedUser::getEmail)
                .orElse(SYSTEM_USER);
    }

    public static UUID getCurrentUserPublicId() {
        return getCurrentUser()
                .map(AuthenticatedUser::getPublicId)
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));
    }

    public static Long getCurrentUserId() {
        return getCurrentUser()
                .map(AuthenticatedUser::getUserId)
                .orElseThrow(() -> new IllegalStateException("No authenticated user"));
    }
}
