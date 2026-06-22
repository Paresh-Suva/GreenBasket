package com.greenbasket.modules.reviews.repository;

import com.greenbasket.modules.reviews.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProduct_Id(Long productId);

    List<Review> findByUser_Id(Long userId);

    Optional<Review> findByUser_IdAndProduct_Id(Long userId, Long productId);
}
