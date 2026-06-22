package com.greenbasket.modules.auth.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.enums.AccountStatus;
import com.greenbasket.modules.users.enums.UserStatus;
import org.springframework.stereotype.Component;

@Component
public class AccountSecurityValidator {

    public void validateAuthenticationEligibility(User user) {
        if (user.getStatus() == UserStatus.DELETED) {
            throw new BusinessException(ErrorCode.AUTH_ACCOUNT_INACTIVE, "Account is no longer available");
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BusinessException(ErrorCode.AUTH_ACCOUNT_SUSPENDED, "Account is suspended");
        }
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new BusinessException(ErrorCode.AUTH_ACCOUNT_INACTIVE, "Account is inactive");
        }
        if (user.getAccountStatus() == AccountStatus.DISABLED) {
            throw new BusinessException(ErrorCode.AUTH_ACCOUNT_DISABLED, "Account is disabled");
        }
        if (user.getAccountStatus() == AccountStatus.LOCKED) {
            throw new BusinessException(ErrorCode.AUTH_ACCOUNT_LOCKED, "Account is locked");
        }
        if (user.getAccountStatus() == AccountStatus.PENDING_ACTIVATION) {
            throw new BusinessException(ErrorCode.AUTH_ACCOUNT_PENDING, "Please verify your email before logging in");
        }
    }
}
