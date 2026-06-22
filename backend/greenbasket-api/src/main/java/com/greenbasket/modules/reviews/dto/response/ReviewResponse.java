package com.greenbasket.modules.reviews.dto.response;

import com.greenbasket.modules.reviews.enums.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class ReviewResponse {

    private final Long id;
    private final Long productId;
    private final String productName;
    private final Long userId;
    private final String userName;
    private final int rating;
    private final String reviewText;
    private final boolean verifiedPurchase;
    private final ReviewStatus status;
    private final Instant createdAt;
    private final Instant updatedAt;
}
