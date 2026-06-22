package com.greenbasket.modules.reviews.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProductRatingSummary {

    private final Long productId;
    private final double averageRating;
    private final long totalReviews;
    private final long fiveStarCount;
    private final long fourStarCount;
    private final long threeStarCount;
    private final long twoStarCount;
    private final long oneStarCount;
}
