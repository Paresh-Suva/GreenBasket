package com.greenbasket.modules.reviews.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.reviews.dto.response.ReviewResponse;
import com.greenbasket.modules.reviews.enums.ReviewStatus;
import com.greenbasket.modules.reviews.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Reviews", description = "Admin review management APIs")
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all reviews")
    public ApiResponse<List<ReviewResponse>> getAllReviews() {
        return ApiResponse.success(reviewService.getAllReviewsAdmin());
    }

    @PatchMapping("/{reviewId}/status")
    @Operation(summary = "Update review status")
    public ApiResponse<ReviewResponse> updateReviewStatus(
            @PathVariable Long reviewId,
            @RequestParam ReviewStatus status) {
        return ApiResponse.success("Review status updated", reviewService.updateReviewStatusAdmin(reviewId, status));
    }

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete a review (admin)")
    public ApiResponse<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReviewAdmin(reviewId);
        return ApiResponse.success("Review deleted");
    }
}
