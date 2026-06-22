package com.greenbasket.infrastructure.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/uploads")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Uploads", description = "Admin file upload APIs")
public class UploadController {

    private final Path uploadDir = Paths.get("uploads");

    @PostMapping("/image")
    @Operation(summary = "Upload product/category image")
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
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
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadDir.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path matching context-path
            String relativeUrl = "/uploads/" + filename;
            return ApiResponse.success("Image uploaded successfully", Map.of("imageUrl", relativeUrl));
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to store uploaded image: " + e.getMessage());
        }
    }
}
