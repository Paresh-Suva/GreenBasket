package com.greenbasket.modules.products.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProductImageResponse {

    private final Long id;
    private final String imageUrl;
    private final String altText;
    private final boolean primaryImage;
    private final int sortOrder;
}
