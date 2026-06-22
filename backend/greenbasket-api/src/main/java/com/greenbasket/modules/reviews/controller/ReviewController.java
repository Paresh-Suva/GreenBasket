package com.greenbasket.modules.reviews.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.reviews.dto.request.CreateReviewRequest;
import com.greenbasket.modules.reviews.dto.request.UpdateReviewRequest;
import com.greenbasket.modules.reviews.dto.response.ProductRatingSummary;
import com.greenbasket.modules.reviews.dto.response.ReviewResponse;
import com.greenbasket.modules.reviews.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Customer review APIs")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/products/{productId}/reviews")
    @Operation(summary = "Get published reviews for a product")
    public ApiResponse<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        return ApiResponse.success(reviewService.getProductReviews(productId));
    }

    @GetMapping("/products/{productId}/reviews/summary")
    @Operation(summary = "Get review summary for a product")
    public ApiResponse<ProductRatingSummary> getProductRatingSummary(@PathVariable Long productId) {
        return ApiResponse.success(reviewService.getProductRatingSummary(productId));
    }

    @GetMapping("/reviews/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get current user's reviews")
    public ApiResponse<List<ReviewResponse>> getMyReviews() {
        return ApiResponse.success(reviewService.getMyReviews());
    }

    @PostMapping("/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Create a product review")
    public ApiResponse<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ApiResponse.success("Review submitted", reviewService.createReview(request));
    }

    @PutMapping("/reviews/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Update a review")
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {
        return ApiResponse.success("Review updated", reviewService.updateReview(reviewId, request));
    }

    @DeleteMapping("/reviews/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Delete a review")
    public ApiResponse<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ApiResponse.success("Review deleted");
    }
}
