package com.greenbasket.modules.wishlist.repository;

import com.greenbasket.modules.wishlist.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByWishlist_Id(Long wishlistId);
}
