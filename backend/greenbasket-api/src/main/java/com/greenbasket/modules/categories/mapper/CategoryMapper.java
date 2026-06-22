package com.greenbasket.modules.categories.mapper;

import com.greenbasket.modules.categories.dto.response.CategoryResponse;
import com.greenbasket.modules.categories.dto.response.CategoryTreeResponse;
import com.greenbasket.modules.categories.entity.Category;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .sortOrder(category.getSortOrder())
                .active(category.isActive())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .build();
    }

    public CategoryTreeResponse toTreeResponse(Category category, List<Category> allCategories) {
        List<CategoryTreeResponse> children = allCategories.stream()
                .filter(c -> c.getParent() != null && c.getParent().getId().equals(category.getId()))
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .map(child -> toTreeResponse(child, allCategories))
                .toList();

        return CategoryTreeResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .sortOrder(category.getSortOrder())
                .active(category.isActive())
                .children(children)
                .build();
    }
}
