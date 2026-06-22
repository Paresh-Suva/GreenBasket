package com.greenbasket.security;

import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Getter
@Builder
public class AuthenticatedUser implements UserDetails {

    private final Long userId;
    private final UUID publicId;
    private final String email;
    private final String passwordHash;
    private final List<String> roleCodes;
    private final List<String> permissionCodes;
    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    private final boolean enabled;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Stream<SimpleGrantedAuthority> roles = roleCodes.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role));
        Stream<SimpleGrantedAuthority> permissions = permissionCodes.stream()
                .map(SimpleGrantedAuthority::new);
        return Stream.concat(roles, permissions).toList();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
