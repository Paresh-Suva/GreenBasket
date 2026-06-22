package com.greenbasket.modules.users.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.auth.dto.response.UserProfileResponse;
import com.greenbasket.modules.users.dto.request.ChangePasswordRequest;
import com.greenbasket.modules.users.dto.request.UpdateProfileRequest;
import com.greenbasket.modules.users.service.UserService;
import com.greenbasket.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Users", description = "Endpoints for user profile and settings")
public class UserController {

    private final UserService userService;

    @PutMapping("/profile")
    @Operation(summary = "Update logged-in user profile details")
    public ApiResponse<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Profile updated successfully", userService.updateProfile(userId, request));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change logged-in user password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        userService.changePassword(userId, request);
        return ApiResponse.success("Password changed successfully");
    }

    @PutMapping(value = "/profile/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload user profile image")
    public ApiResponse<UserProfileResponse> uploadProfileImage(@org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Profile image updated successfully", userService.updateProfileImage(userId, file));
    }
}
