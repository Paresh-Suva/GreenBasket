package com.greenbasket.modules.products.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.categories.entity.Category;
import com.greenbasket.modules.categories.repository.CategoryRepository;
import com.greenbasket.modules.products.dto.request.CreateProductRequest;
import com.greenbasket.modules.products.dto.request.ProductImageRequest;
import com.greenbasket.modules.products.dto.request.UpdateProductRequest;
import com.greenbasket.modules.products.dto.request.UpdateStockRequest;
import com.greenbasket.modules.products.dto.response.ProductResponse;
import com.greenbasket.modules.products.dto.response.ProductSummaryResponse;
import com.greenbasket.modules.products.entity.Product;
import com.greenbasket.modules.products.entity.ProductImage;
import com.greenbasket.modules.products.mapper.ProductMapper;
import com.greenbasket.modules.products.repository.ProductImageRepository;
import com.greenbasket.modules.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BusinessException(ErrorCode.PRODUCT_SKU_EXISTS);
        }
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new BusinessException(ErrorCode.PRODUCT_SLUG_EXISTS);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        Product product = Product.builder()
                .category(category)
                .sku(request.getSku().trim())
                .name(request.getName().trim())
                .slug(request.getSlug().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .stockQuantity(request.getStockQuantity())
                .weight(request.getWeight())
                .unit(request.getUnit())
                .brand(request.getBrand())
                .featured(request.isFeatured())
                .active(request.isActive())
                .build();

        product = productRepository.save(product);
        return productMapper.toResponse(product, List.of());
    }

    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = findProductById(id);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }
        if (request.getName() != null) {
            product.setName(request.getName().trim());
        }
        if (request.getSlug() != null) {
            productRepository.findBySlug(request.getSlug())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new BusinessException(ErrorCode.PRODUCT_SLUG_EXISTS);
                    });
            product.setSlug(request.getSlug().trim());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getDiscountPrice() != null) {
            product.setDiscountPrice(request.getDiscountPrice());
        }
        if (request.getWeight() != null) {
            product.setWeight(request.getWeight());
        }
        if (request.getUnit() != null) {
            product.setUnit(request.getUnit());
        }
        if (request.getBrand() != null) {
            product.setBrand(request.getBrand());
        }
        if (request.getFeatured() != null) {
            product.setFeatured(request.getFeatured());
        }

        product = productRepository.save(product);
        List<ProductImage> images = productImageRepository.findByProduct_Id(id);
        return productMapper.toResponse(product, images);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse activateProduct(Long id) {
        Product product = findProductById(id);
        product.setActive(true);
        product = productRepository.save(product);
        List<ProductImage> images = productImageRepository.findByProduct_Id(id);
        return productMapper.toResponse(product, images);
    }

    @Transactional
    public ProductResponse deactivateProduct(Long id) {
        Product product = findProductById(id);
        product.setActive(false);
        product = productRepository.save(product);
        List<ProductImage> images = productImageRepository.findByProduct_Id(id);
        return productMapper.toResponse(product, images);
    }

    @Transactional
    public ProductResponse addProductImage(Long productId, ProductImageRequest request) {
        Product product = findProductById(productId);

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(request.getImageUrl())
                .altText(request.getAltText())
                .primaryImage(request.isPrimaryImage())
                .sortOrder(request.getSortOrder())
                .build();

        productImageRepository.save(image);
        List<ProductImage> images = productImageRepository.findByProduct_Id(productId);
        return productMapper.toResponse(product, images);
    }

    @Transactional
    public void removeProductImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Product image not found"));
        productImageRepository.delete(image);
    }

    @Transactional
    public ProductResponse updateStock(Long productId, UpdateStockRequest request) {
        Product product = findProductById(productId);
        product.setStockQuantity(request.getStockQuantity());
        product = productRepository.save(product);
        List<ProductImage> images = productImageRepository.findByProduct_Id(productId);
        return productMapper.toResponse(product, images);
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getProducts(
            Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
            Boolean featured, String search, Pageable pageable) {

        Specification<Product> spec = Specification.where(ProductSpecification.isActive());

        if (categoryId != null) {
            spec = spec.and(ProductSpecification.hasCategoryId(categoryId));
        }
        if (minPrice != null) {
            spec = spec.and(ProductSpecification.hasPriceGreaterThanOrEqual(minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and(ProductSpecification.hasPriceLessThanOrEqual(maxPrice));
        }
        if (featured != null) {
            spec = spec.and(ProductSpecification.isFeatured(featured));
        }
        if (search != null && !search.isBlank()) {
            spec = spec.and(ProductSpecification.containsSearchTerm(search.trim()));
        }

        Page<Product> page = productRepository.findAll(spec, pageable);
        List<ProductSummaryResponse> content = page.getContent().stream()
                .map(product -> {
                    List<ProductImage> images = productImageRepository.findByProduct_Id(product.getId());
                    return productMapper.toSummaryResponse(product, images);
                })
                .toList();

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .filter(Product::isActive)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
        List<ProductImage> images = productImageRepository.findByProduct_Id(product.getId());
        return productMapper.toResponse(product, images);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductByIdAdmin(Long id) {
        Product product = findProductById(id);
        List<ProductImage> images = productImageRepository.findByProduct_Id(id);
        return productMapper.toResponse(product, images);
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> getFeaturedProducts() {
        Specification<Product> spec = Specification.where(ProductSpecification.isActive())
                .and(ProductSpecification.isFeatured(true));

        return productRepository.findAll(spec).stream()
                .map(product -> {
                    List<ProductImage> images = productImageRepository.findByProduct_Id(product.getId());
                    return productMapper.toSummaryResponse(product, images);
                })
                .toList();
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
    }
}
