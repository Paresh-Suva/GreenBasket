package com.greenbasket.modules.categories.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.categories.dto.request.CreateCategoryRequest;
import com.greenbasket.modules.categories.dto.request.UpdateCategoryRequest;
import com.greenbasket.modules.categories.dto.response.CategoryResponse;
import com.greenbasket.modules.categories.dto.response.CategoryTreeResponse;
import com.greenbasket.modules.categories.entity.Category;
import com.greenbasket.modules.categories.mapper.CategoryMapper;
import com.greenbasket.modules.categories.repository.CategoryRepository;
import com.greenbasket.modules.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new BusinessException(ErrorCode.CATEGORY_SLUG_EXISTS);
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND, "Parent category not found"));
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(request.getSlug().trim())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder())
                .active(request.isActive())
                .parent(parent)
                .build();

        category = categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = findCategoryById(id);

        if (request.getName() != null) {
            category.setName(request.getName().trim());
        }
        if (request.getSlug() != null) {
            categoryRepository.findBySlug(request.getSlug())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new BusinessException(ErrorCode.CATEGORY_SLUG_EXISTS);
                    });
            category.setSlug(request.getSlug().trim());
        }
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST, "Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND, "Parent category not found"));
            category.setParent(parent);
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        category = categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);

        List<Category> children = categoryRepository.findByParent_Id(id);
        if (!children.isEmpty()) {
            throw new BusinessException(ErrorCode.CATEGORY_HAS_CHILDREN);
        }

        long productCount = productRepository.countByCategory_Id(id);
        if (productCount > 0) {
            throw new BusinessException(ErrorCode.CATEGORY_HAS_PRODUCTS);
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public CategoryResponse activateCategory(Long id) {
        Category category = findCategoryById(id);
        category.setActive(true);
        category = categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse deactivateCategory(Long id) {
        Category category = findCategoryById(id);
        category.setActive(false);
        category = categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .sorted(Comparator.comparingInt(Category::getSortOrder))
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryTreeResponse> getCategoryTree() {
        List<Category> allActive = categoryRepository.findAll().stream()
                .filter(Category::isActive)
                .toList();

        return allActive.stream()
                .filter(c -> c.getParent() == null)
                .sorted(Comparator.comparingInt(Category::getSortOrder))
                .map(root -> categoryMapper.toTreeResponse(root, allActive))
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .filter(Category::isActive)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoryMapper.toResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesAdmin() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Category::getSortOrder))
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryByIdAdmin(Long id) {
        return categoryMapper.toResponse(findCategoryById(id));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
    }
}
