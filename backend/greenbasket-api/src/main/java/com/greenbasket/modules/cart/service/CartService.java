package com.greenbasket.modules.cart.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.cart.dto.request.AddCartItemRequest;
import com.greenbasket.modules.cart.dto.request.UpdateCartItemRequest;
import com.greenbasket.modules.cart.dto.response.CartResponse;
import com.greenbasket.modules.cart.entity.Cart;
import com.greenbasket.modules.cart.entity.CartItem;
import com.greenbasket.modules.cart.mapper.CartMapper;
import com.greenbasket.modules.cart.repository.CartItemRepository;
import com.greenbasket.modules.cart.repository.CartRepository;
import com.greenbasket.modules.products.entity.Product;
import com.greenbasket.modules.products.repository.ProductRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.repository.UserRepository;
import com.greenbasket.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Transactional(readOnly = true)
    public CartResponse getCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        Cart cart = getOrCreateCart(userId);
        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());
        return cartMapper.toResponse(items);
    }

    @Transactional
    public CartResponse addItem(AddCartItemRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK);
        }

        List<CartItem> existingItems = cartItemRepository.findByCart_Id(cart.getId());
        Optional<CartItem> existingItem = existingItems.stream()
                .filter(item -> item.getProduct().getId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK);
            }
            item.setQuantity(newQuantity);
            item.setUnitPriceSnapshot(product.getPrice());
            item.setDiscountPriceSnapshot(product.getDiscountPrice());
            item.setProductNameSnapshot(product.getName());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPriceSnapshot(product.getPrice())
                    .discountPriceSnapshot(product.getDiscountPrice())
                    .productNameSnapshot(product.getName())
                    .build();
            cartItemRepository.save(newItem);
        }

        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());
        return cartMapper.toResponse(items);
    }

    @Transactional
    public CartResponse updateItemQuantity(Long itemId, UpdateCartItemRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        Product product = item.getProduct();
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK);
        }

        item.setQuantity(request.getQuantity());
        item.setUnitPriceSnapshot(product.getPrice());
        item.setDiscountPriceSnapshot(product.getDiscountPrice());
        item.setProductNameSnapshot(product.getName());
        cartItemRepository.save(item);

        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());
        return cartMapper.toResponse(items);
    }

    @Transactional
    public CartResponse removeItem(Long itemId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        cartItemRepository.delete(item);
        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());
        return cartMapper.toResponse(items);
    }

    @Transactional
    public void clearCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        Cart cart = getOrCreateCart(userId);
        List<CartItem> items = cartItemRepository.findByCart_Id(cart.getId());
        cartItemRepository.deleteAll(items);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED));
                    Cart cart = Cart.builder().user(user).build();
                    return cartRepository.save(cart);
                });
    }
}
