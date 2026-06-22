package com.greenbasket.modules.categories.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CategoryResponse {

    private final Long id;
    private final String name;
    private final String slug;
    private final String description;
    private final String imageUrl;
    private final int sortOrder;
    private final boolean active;
    private final Long parentId;
    private final String parentName;
}
