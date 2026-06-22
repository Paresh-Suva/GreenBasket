package com.greenbasket.modules.auth.mapper;

import com.greenbasket.modules.auth.dto.response.UserProfileResponse;
import com.greenbasket.modules.auth.entity.UserRole;
import com.greenbasket.modules.users.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserProfileMapper {

    public UserProfileResponse toResponse(User user, List<UserRole> userRoles) {
        List<String> roles = userRoles.stream()
                .map(userRole -> userRole.getRole().getCode().name())
                .toList();

        return UserProfileResponse.builder()
                .publicId(user.getPublicId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImageUrl(user.getProfileImageUrl())
                .status(user.getStatus().name())
                .accountStatus(user.getAccountStatus().name())
                .emailVerified(user.isEmailVerified())
                .lastLoginAt(user.getLastLoginAt())
                .roles(roles)
                .walletBalance(user.getWalletBalance())
                .build();
    }
}
