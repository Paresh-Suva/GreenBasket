package com.greenbasket.security;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.auth.entity.RolePermission;
import com.greenbasket.modules.auth.entity.UserRole;
import com.greenbasket.modules.auth.repository.RolePermissionRepository;
import com.greenbasket.modules.auth.repository.UserRoleRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.enums.AccountStatus;
import com.greenbasket.modules.users.enums.UserStatus;
import com.greenbasket.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return buildAuthenticatedUser(user);
    }

    @Transactional(readOnly = true)
    public AuthenticatedUser loadUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED, "User not found"));
        return buildAuthenticatedUser(user);
    }

    private AuthenticatedUser buildAuthenticatedUser(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUser_Id(user.getId());
        List<String> roleCodes = userRoles.stream()
                .map(userRole -> userRole.getRole().getCode().name())
                .toList();

        Set<String> permissionCodes = new LinkedHashSet<>();
        for (UserRole userRole : userRoles) {
            List<RolePermission> rolePermissions = rolePermissionRepository.findByRole_Id(userRole.getRole().getId());
            rolePermissions.forEach(rolePermission ->
                    permissionCodes.add(rolePermission.getPermission().getCode()));
        }

        return AuthenticatedUser.builder()
                .userId(user.getId())
                .publicId(user.getPublicId())
                .email(user.getEmail())
                .passwordHash(user.getPasswordHash())
                .roleCodes(new ArrayList<>(roleCodes))
                .permissionCodes(new ArrayList<>(permissionCodes))
                .accountNonExpired(user.getStatus() != UserStatus.DELETED)
                .accountNonLocked(user.getAccountStatus() != AccountStatus.LOCKED)
                .credentialsNonExpired(true)
                .enabled(user.getStatus() == UserStatus.ACTIVE
                        && user.getAccountStatus() == AccountStatus.ENABLED)
                .build();
    }
}
