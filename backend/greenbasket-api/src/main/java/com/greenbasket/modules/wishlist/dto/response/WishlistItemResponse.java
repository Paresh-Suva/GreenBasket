package com.greenbasket.modules.wishlist.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class WishlistItemResponse {

    private final Long itemId;
    private final Long productId;
    private final String productName;
    private final String productSlug;
    private final BigDecimal effectivePrice;
    private final boolean inStock;
    private final String primaryImageUrl;
    private final Instant addedAt;
}
