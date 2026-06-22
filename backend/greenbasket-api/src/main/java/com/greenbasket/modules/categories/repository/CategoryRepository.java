package com.greenbasket.modules.categories.repository;

import com.greenbasket.modules.categories.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByParent_Id(Long parentId);

    List<Category> findByParentIsNull();
}
