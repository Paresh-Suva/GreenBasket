package com.greenbasket.modules.wishlist.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.products.entity.Product;
import com.greenbasket.modules.products.repository.ProductRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.repository.UserRepository;
import com.greenbasket.modules.wishlist.dto.request.AddWishlistItemRequest;
import com.greenbasket.modules.wishlist.dto.response.WishlistResponse;
import com.greenbasket.modules.wishlist.entity.Wishlist;
import com.greenbasket.modules.wishlist.entity.WishlistItem;
import com.greenbasket.modules.wishlist.mapper.WishlistMapper;
import com.greenbasket.modules.wishlist.repository.WishlistItemRepository;
import com.greenbasket.modules.wishlist.repository.WishlistRepository;
import com.greenbasket.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final WishlistMapper wishlistMapper;

    @Transactional(readOnly = true)
    public WishlistResponse getWishlist() {
        Long userId = SecurityUtils.getCurrentUserId();
        Wishlist wishlist = getOrCreateWishlist(userId);
        List<WishlistItem> items = wishlistItemRepository.findByWishlist_Id(wishlist.getId());
        return wishlistMapper.toResponse(items);
    }

    @Transactional
    public WishlistResponse addItem(AddWishlistItemRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Wishlist wishlist = getOrCreateWishlist(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        List<WishlistItem> existingItems = wishlistItemRepository.findByWishlist_Id(wishlist.getId());
        boolean alreadyExists = existingItems.stream()
                .anyMatch(item -> item.getProduct().getId().equals(request.getProductId()));
        if (alreadyExists) {
            throw new BusinessException(ErrorCode.WISHLIST_ITEM_EXISTS);
        }

        WishlistItem item = WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .build();
        wishlistItemRepository.save(item);

        List<WishlistItem> items = wishlistItemRepository.findByWishlist_Id(wishlist.getId());
        return wishlistMapper.toResponse(items);
    }

    @Transactional
    public WishlistResponse removeItem(Long itemId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Wishlist wishlist = getOrCreateWishlist(userId);

        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WISHLIST_ITEM_NOT_FOUND));

        if (!item.getWishlist().getId().equals(wishlist.getId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        wishlistItemRepository.delete(item);
        List<WishlistItem> items = wishlistItemRepository.findByWishlist_Id(wishlist.getId());
        return wishlistMapper.toResponse(items);
    }

    @Transactional
    public void clearWishlist() {
        Long userId = SecurityUtils.getCurrentUserId();
        Wishlist wishlist = getOrCreateWishlist(userId);
        List<WishlistItem> items = wishlistItemRepository.findByWishlist_Id(wishlist.getId());
        wishlistItemRepository.deleteAll(items);
    }

    private Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED));
                    Wishlist wishlist = Wishlist.builder().user(user).build();
                    return wishlistRepository.save(wishlist);
                });
    }
}
