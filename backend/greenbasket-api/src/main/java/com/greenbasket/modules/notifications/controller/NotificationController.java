package com.greenbasket.modules.notifications.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.notifications.dto.response.NotificationResponse;
import com.greenbasket.modules.notifications.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all my notifications")
    public ApiResponse<List<NotificationResponse>> getMyNotifications() {
        return ApiResponse.success(notificationService.getMyNotifications());
    }

    @GetMapping("/unread")
    @Operation(summary = "Get my unread notifications")
    public ApiResponse<List<NotificationResponse>> getMyUnreadNotifications() {
        return ApiResponse.success(notificationService.getMyUnreadNotifications());
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark a notification as read")
    public ApiResponse<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ApiResponse.success("Notification marked as read");
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ApiResponse<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ApiResponse.success("All notifications marked as read");
    }
}
