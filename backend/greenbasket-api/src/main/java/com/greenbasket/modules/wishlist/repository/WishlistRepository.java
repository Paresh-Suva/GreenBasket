package com.greenbasket.modules.wishlist.repository;

import com.greenbasket.modules.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Optional<Wishlist> findByUser_Id(Long userId);
}
