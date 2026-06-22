package com.greenbasket.modules.products.repository;

import com.greenbasket.modules.products.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    long countByActive(boolean active);

    long countByCategory_Id(Long categoryId);

    long countByStockQuantityLessThanEqual(int quantity);

    long countByFeatured(boolean featured);
}

