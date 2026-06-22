package com.greenbasket.security.jwt;

public final class JwtClaims {

    public static final String TOKEN_TYPE = "type";
    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";
    public static final String USER_ID = "uid";
    public static final String ROLES = "roles";
    public static final String PERMISSIONS = "permissions";

    private JwtClaims() {
    }
}
