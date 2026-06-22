package com.greenbasket.modules.wishlist.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class WishlistResponse {

    private final List<WishlistItemResponse> items;
    private final int totalItems;
}
