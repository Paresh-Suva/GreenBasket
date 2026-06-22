package com.greenbasket.modules.reviews.mapper;

import com.greenbasket.modules.reviews.dto.response.ProductRatingSummary;
import com.greenbasket.modules.reviews.dto.response.ReviewResponse;
import com.greenbasket.modules.reviews.entity.Review;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFirstName() + " " + review.getUser().getLastName())
                .rating(review.getRating())
                .reviewText(review.getReviewText())
                .verifiedPurchase(review.isVerifiedPurchase())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    public ProductRatingSummary toSummaryResponse(Long productId, List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return ProductRatingSummary.builder()
                    .productId(productId)
                    .averageRating(0.0)
                    .totalReviews(0)
                    .fiveStarCount(0)
                    .fourStarCount(0)
                    .threeStarCount(0)
                    .twoStarCount(0)
                    .oneStarCount(0)
                    .build();
        }

        long totalReviews = reviews.size();
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Map<Integer, Long> ratingCounts = reviews.stream()
                .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));

        return ProductRatingSummary.builder()
                .productId(productId)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .fiveStarCount(ratingCounts.getOrDefault(5, 0L))
                .fourStarCount(ratingCounts.getOrDefault(4, 0L))
                .threeStarCount(ratingCounts.getOrDefault(3, 0L))
                .twoStarCount(ratingCounts.getOrDefault(2, 0L))
                .oneStarCount(ratingCounts.getOrDefault(1, 0L))
                .build();
    }
}
