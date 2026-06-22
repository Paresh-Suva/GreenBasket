package com.greenbasket.modules.orders.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.cart.entity.Cart;
import com.greenbasket.modules.cart.entity.CartItem;
import com.greenbasket.modules.cart.repository.CartItemRepository;
import com.greenbasket.modules.cart.repository.CartRepository;
import com.greenbasket.modules.orders.dto.request.PlaceOrderRequest;
import com.greenbasket.modules.orders.dto.request.UpdateOrderStatusRequest;
import com.greenbasket.modules.orders.dto.response.OrderResponse;
import com.greenbasket.modules.orders.dto.response.OrderSummaryResponse;
import com.greenbasket.modules.orders.entity.DeliveryAddressSnapshot;
import com.greenbasket.modules.orders.entity.Order;
import com.greenbasket.modules.orders.entity.OrderItem;
import com.greenbasket.modules.orders.enums.OrderStatus;
import com.greenbasket.modules.orders.mapper.OrderMapper;
import com.greenbasket.modules.orders.repository.OrderItemRepository;
import com.greenbasket.modules.orders.repository.OrderRepository;
import com.greenbasket.modules.payments.entity.Payment;
import com.greenbasket.modules.payments.enums.PaymentMethod;
import com.greenbasket.modules.payments.enums.PaymentStatus;
import com.greenbasket.modules.payments.repository.PaymentRepository;
import com.greenbasket.modules.products.entity.Product;
import com.greenbasket.modules.products.repository.ProductRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.entity.UserAddress;
import com.greenbasket.modules.users.repository.UserAddressRepository;
import com.greenbasket.modules.users.repository.UserRepository;
import com.greenbasket.security.AuthenticatedUser;
import com.greenbasket.security.SecurityUtils;
import com.greenbasket.modules.orders.dto.response.OrderTrackingResponse;
import com.greenbasket.modules.warehouse.service.WarehouseService;
import com.greenbasket.modules.warehouse.dto.response.WarehouseResponse;
import com.greenbasket.modules.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final OrderMapper orderMapper;
    private final WarehouseService warehouseService;
    private final WalletService walletService;

    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED));

        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_EMPTY));

        List<CartItem> cartItems = cartItemRepository.findByCart_Id(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BusinessException(ErrorCode.CART_EMPTY);
        }

        UserAddress address = userAddressRepository.findById(request.getDeliveryAddressId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Delivery address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        DeliveryAddressSnapshot addressSnapshot = DeliveryAddressSnapshot.builder()
                .addressType(address.getAddressType().name())
                .label(address.getLabel())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BusinessException(ErrorCode.INSUFFICIENT_STOCK, "Insufficient stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal effectivePrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                    ? product.getDiscountPrice() : product.getPrice();
            BigDecimal lineTotal = effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);
        }

        String orderNumber = "ORD-" + System.currentTimeMillis();
        
        // Calculate standard delivery fee (4.99 below 35, FREE above) and tax (8%)
        BigDecimal deliveryFee = subtotal.compareTo(BigDecimal.valueOf(35)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(4.99);
        BigDecimal taxAmount = subtotal.multiply(BigDecimal.valueOf(0.08)).setScale(2, java.math.RoundingMode.HALF_UP);
        
        // Calculate coupon discount
        BigDecimal discountAmount = calculateCouponDiscount(request.getCouponCode(), subtotal, cartItems).setScale(2, java.math.RoundingMode.HALF_UP);
        
        // Calculate subtotal after coupon
        BigDecimal totalAfterCoupon = subtotal.subtract(discountAmount).add(deliveryFee).add(taxAmount);
        if (totalAfterCoupon.compareTo(BigDecimal.ZERO) < 0) {
            totalAfterCoupon = BigDecimal.ZERO;
        }

        // Apply wallet discount
        BigDecimal walletDiscount = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(request.getUseWallet())) {
            BigDecimal userWalletBalance = user.getWalletBalance();
            if (userWalletBalance.compareTo(BigDecimal.ZERO) > 0) {
                if (userWalletBalance.compareTo(totalAfterCoupon) >= 0) {
                    walletDiscount = totalAfterCoupon;
                } else {
                    walletDiscount = userWalletBalance;
                }
            }
        }
        
        BigDecimal totalAmount = totalAfterCoupon.subtract(walletDiscount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }
        
        // Update user's wallet balance if wallet was used
        if (walletDiscount.compareTo(BigDecimal.ZERO) > 0) {
            walletService.addTransaction(user, walletDiscount, "SPENT", "Used for order " + orderNumber);
        }

        Order order = Order.builder()
                .user(user)
                .orderNumber(orderNumber)
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .discountAmount(discountAmount.add(walletDiscount)) // Storing both coupon and wallet discounts in discountAmount
                .taxAmount(taxAmount)
                .deliveryFee(deliveryFee)
                .totalAmount(totalAmount)
                .deliveryAddress(address)
                .deliveryAddressSnapshot(addressSnapshot)
                .notes(request.getNotes())
                .build();

        order = orderRepository.save(order);
        
        // Earn cashback (₹2 per ₹50 transacted)
        BigDecimal cashback = BigDecimal.valueOf(Math.floor(totalAmount.doubleValue() / 50.0) * 2.0);
        if (cashback.compareTo(BigDecimal.ZERO) > 0) {
            walletService.addTransaction(user, cashback, "EARNED", "Cashback earned for order " + orderNumber);
        }

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            BigDecimal effectivePrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                    ? product.getDiscountPrice() : product.getPrice();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productSku(product.getSku())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .discountPrice(product.getDiscountPrice())
                    .lineTotal(effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
            orderItemRepository.save(orderItem);
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(totalAmount)
                .method(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        cartItemRepository.deleteAll(cartItems);

        List<OrderItem> savedOrderItems = orderItemRepository.findByOrder_Id(order.getId());
        return orderMapper.toResponse(order, savedOrderItems);
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getMyOrders() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<Order> orders = orderRepository.findByUser_Id(userId);

        return orders.stream()
                .map(order -> {
                    checkAndUpdateSimulatedStatus(order);
                    List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
                    int totalItems = items.stream()
                            .mapToInt(OrderItem::getQuantity)
                            .sum();
                    String productNamesSummary = items.stream()
                            .map(OrderItem::getProductName)
                            .collect(Collectors.joining(", "));
                    return orderMapper.toSummaryResponse(order, totalItems, productNamesSummary);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findByPublicId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        Long userId = SecurityUtils.getCurrentUserId();
        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        checkAndUpdateSimulatedStatus(order);

        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
        return orderMapper.toResponse(order, items);
    }

    @Transactional
    public OrderResponse cancelOrder(UUID orderId) {
        Order order = orderRepository.findByPublicId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        Long userId = SecurityUtils.getCurrentUserId();
        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BusinessException(ErrorCode.ORDER_CANNOT_CANCEL, "Orders can only be cancelled before they are packed");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        return orderMapper.toResponse(order, items);
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getAllOrdersAdmin() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(order -> {
                    checkAndUpdateSimulatedStatus(order);
                    List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
                    int totalItems = items.stream()
                            .mapToInt(OrderItem::getQuantity)
                            .sum();
                    String productNamesSummary = items.stream()
                            .map(OrderItem::getProductName)
                            .collect(Collectors.joining(", "));
                    return orderMapper.toSummaryResponse(order, totalItems, productNamesSummary);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAdmin(UUID orderId) {
        Order order = orderRepository.findByPublicId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        checkAndUpdateSimulatedStatus(order);

        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
        return orderMapper.toResponse(order, items);
    }

    @Transactional
    public OrderResponse updateOrderStatusAdmin(UUID orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findByPublicId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.ORDER_INVALID_STATUS_TRANSITION);
        }

        if (request.getStatus() == OrderStatus.CANCELLED) {
            List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
            for (OrderItem item : items) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(request.getStatus());
        order = orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());
        return orderMapper.toResponse(order, items);
    }

    private void checkAndUpdateSimulatedStatus(Order order) {
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            return;
        }
        if (order.getCreatedAt() == null) {
            return;
        }
        long elapsedSeconds = java.time.Duration.between(order.getCreatedAt(), java.time.Instant.now()).toSeconds();
        OrderStatus targetStatus = order.getStatus();

        if (elapsedSeconds >= 50) {
            targetStatus = OrderStatus.DELIVERED;
        } else if (elapsedSeconds >= 30) {
            targetStatus = OrderStatus.OUT_FOR_DELIVERY;
        } else if (elapsedSeconds >= 20) {
            targetStatus = OrderStatus.PACKED;
        } else if (elapsedSeconds >= 10) {
            targetStatus = OrderStatus.CONFIRMED;
        } else {
            targetStatus = OrderStatus.PENDING;
        }

        if (targetStatus.ordinal() > order.getStatus().ordinal()) {
            order.setStatus(targetStatus);
            orderRepository.save(order);
        }
    }

    @Transactional(readOnly = true)
    public OrderTrackingResponse getTrackingInfo(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Order not found"));

        AuthenticatedUser currentUser = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED));

        boolean isOwner = order.getUser().getId().equals(currentUser.getUserId());
        boolean hasAdminOrDeliveryRole = currentUser.getRoleCodes().contains("ADMIN") || currentUser.getRoleCodes().contains("DELIVERY");

        if (!isOwner && !hasAdminOrDeliveryRole) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        checkAndUpdateSimulatedStatus(order);

        WarehouseResponse warehouse = warehouseService.getWarehouse();
        BigDecimal whLat = warehouse != null ? warehouse.getLatitude() : new BigDecimal("12.9716");
        BigDecimal whLng = warehouse != null ? warehouse.getLongitude() : new BigDecimal("77.5946");
        String whName = warehouse != null ? warehouse.getName() : "GreenBasket Hub";
        String whAddr = warehouse != null ? (warehouse.getAddress() + ", " + warehouse.getCity() + ", " + warehouse.getState()) : "Bangalore Center";

        DeliveryAddressSnapshot deliveryAddr = order.getDeliveryAddressSnapshot();

        String label = deliveryAddr != null ? deliveryAddr.getLabel() : "Customer";
        String name = label;
        String phone = "0000000000";
        if (label != null && label.contains(" - ")) {
            String[] parts = label.split(" - ");
            name = parts[0];
            phone = "0000000000";
        }

        BigDecimal custLat = deliveryAddr != null && deliveryAddr.getLatitude() != null ? deliveryAddr.getLatitude() : new BigDecimal("12.9304");
        BigDecimal custLng = deliveryAddr != null && deliveryAddr.getLongitude() != null ? deliveryAddr.getLongitude() : new BigDecimal("77.6784");

        String formattedAddress = "";
        if (deliveryAddr != null) {
            formattedAddress = deliveryAddr.getAddressLine1() +
                    (deliveryAddr.getAddressLine2() != null ? ", " + deliveryAddr.getAddressLine2() : "") +
                    ", " + deliveryAddr.getCity() +
                    ", " + deliveryAddr.getState() +
                    " - " + deliveryAddr.getPostalCode();
        }

        return OrderTrackingResponse.builder()
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .customerName(name)
                .customerPhone(phone)
                .customerAddress(formattedAddress)
                .customerLatitude(custLat)
                .customerLongitude(custLng)
                .warehouseName(whName)
                .warehouseAddress(whAddr)
                .warehouseContact("0000000000")
                .warehouseLatitude(whLat)
                .warehouseLongitude(whLng)
                .build();
    }

    public BigDecimal calculateCouponDiscount(String couponCode, BigDecimal subtotal, List<CartItem> cartItems) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        String code = couponCode.trim().toUpperCase();
        
        switch (code) {
            case "WELCOME10":
                if (subtotal.compareTo(BigDecimal.valueOf(100)) >= 0) {
                    return subtotal.multiply(BigDecimal.valueOf(0.10));
                }
                break;
            case "VEGGIE15":
                return calculateCategoryDiscount(cartItems, "fresh-vegetables", 0.15, 150);
            case "FRUIT20":
                return calculateCategoryDiscount(cartItems, "fresh-fruits", 0.20, 200);
            case "DAIRY12":
                return calculateMultipleCategoriesDiscount(cartItems, List.of("fresh-milk", "gourmet-cheese", "butter-cream", "yogurt-curd"), 0.12, 150);
            case "BAKERY20":
                return calculateMultipleCategoriesDiscount(cartItems, List.of("fresh-bread", "buns-rolls", "cakes-pastries"), 0.20, 200);
            case "MEAT15":
                return calculateMultipleCategoriesDiscount(cartItems, List.of("fresh-poultry", "red-meat"), 0.15, 300);
            case "SEAFOOD10":
                return calculateCategoryDiscount(cartItems, "fresh-seafood", 0.10, 250);
            case "STAPLES10":
                return calculateMultipleCategoriesDiscount(cartItems, List.of("cooking-oils", "rice-grains", "flours-atta", "pulses-lentils"), 0.10, 250);
            case "DRINKS15":
                return calculateMultipleCategoriesDiscount(cartItems, List.of("soft-drinks", "fruit-juices"), 0.15, 150);
            case "SNACKS15":
                return calculateMultipleCategoriesDiscount(cartItems, List.of("chips-crisps", "cookies-biscuits"), 0.15, 150);
            default:
                break;
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateCategoryDiscount(List<CartItem> cartItems, String categorySlug, double discountRate, double minAmount) {
        BigDecimal categorySubtotal = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getCategory() != null && categorySlug.equalsIgnoreCase(product.getCategory().getSlug())) {
                BigDecimal effectivePrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                        ? product.getDiscountPrice() : product.getPrice();
                categorySubtotal = categorySubtotal.add(effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }
        if (categorySubtotal.compareTo(BigDecimal.valueOf(minAmount)) >= 0) {
            return categorySubtotal.multiply(BigDecimal.valueOf(discountRate));
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateMultipleCategoriesDiscount(List<CartItem> cartItems, List<String> categorySlugs, double discountRate, double minAmount) {
        BigDecimal categorySubtotal = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getCategory() != null) {
                String slug = product.getCategory().getSlug();
                boolean matches = false;
                for (String categorySlug : categorySlugs) {
                    if (categorySlug.equalsIgnoreCase(slug)) {
                        matches = true;
                        break;
                    }
                }
                if (matches) {
                    BigDecimal effectivePrice = product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(BigDecimal.ZERO) > 0
                            ? product.getDiscountPrice() : product.getPrice();
                    categorySubtotal = categorySubtotal.add(effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
        }
        if (categorySubtotal.compareTo(BigDecimal.valueOf(minAmount)) >= 0) {
            return categorySubtotal.multiply(BigDecimal.valueOf(discountRate));
        }
        return BigDecimal.ZERO;
    }
}
