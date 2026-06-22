package com.greenbasket.modules.users.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.auth.dto.response.UserProfileResponse;
import com.greenbasket.modules.auth.entity.UserRole;
import com.greenbasket.modules.auth.mapper.UserProfileMapper;
import com.greenbasket.modules.auth.repository.UserRoleRepository;
import com.greenbasket.modules.users.dto.request.ChangePasswordRequest;
import com.greenbasket.modules.users.dto.request.UpdateProfileRequest;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserProfileMapper userProfileMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        // Check if phone number is already registered by another user
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            userRepository.findByPhoneNumber(request.getPhoneNumber().trim())
                    .filter(existing -> !existing.getId().equals(userId))
                    .ifPresent(existing -> {
                        throw new BusinessException(ErrorCode.PHONE_ALREADY_EXISTS);
                    });
            user.setPhoneNumber(request.getPhoneNumber().trim());
        } else {
            user.setPhoneNumber(null);
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());

        user = userRepository.save(user);

        List<UserRole> roles = userRoleRepository.findByUser_Id(userId);
        return userProfileMapper.toResponse(user, roles);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "New password and password confirmation do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserProfileResponse updateProfileImage(Long userId, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "File is required and cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Only image files (JPEG, PNG, WEBP, etc.) are allowed");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = ".png";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String extLower = extension.toLowerCase();
        if (!extLower.equals(".jpg") && !extLower.equals(".jpeg") && !extLower.equals(".png") && !extLower.equals(".webp") && !extLower.equals(".gif")) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Invalid file extension. Only JPG, JPEG, PNG, WEBP, and GIF are allowed");
        }

        try {
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }

            String filename = java.util.UUID.randomUUID().toString() + extension;
            java.nio.file.Path filePath = uploadDir.resolve(filename);

            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String relativeUrl = "/uploads/" + filename;
            user.setProfileImageUrl(relativeUrl);
            user = userRepository.save(user);

            List<UserRole> roles = userRoleRepository.findByUser_Id(userId);
            return userProfileMapper.toResponse(user, roles);
        } catch (java.io.IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to store uploaded image: " + e.getMessage());
        }
    }
}
