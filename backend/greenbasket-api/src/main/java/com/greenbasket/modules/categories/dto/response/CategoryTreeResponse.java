package com.greenbasket.modules.categories.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class CategoryTreeResponse {

    private final Long id;
    private final String name;
    private final String slug;
    private final String description;
    private final String imageUrl;
    private final int sortOrder;
    private final boolean active;
    private final List<CategoryTreeResponse> children;
}
