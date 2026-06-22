package com.greenbasket.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    VALIDATION_ERROR("GB-400-001", "Validation failed", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("GB-400-002", "Invalid request", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND("GB-404-001", "Resource not found", HttpStatus.NOT_FOUND),
    ACCESS_DENIED("GB-403-001", "Access denied", HttpStatus.FORBIDDEN),
    AUTH_INVALID_CREDENTIALS("GB-401-001", "Invalid email or password", HttpStatus.UNAUTHORIZED),
    AUTH_UNAUTHORIZED("GB-401-002", "Authentication required", HttpStatus.UNAUTHORIZED),
    AUTH_INVALID_TOKEN("GB-401-003", "Invalid or expired token", HttpStatus.UNAUTHORIZED),
    AUTH_ACCOUNT_DISABLED("GB-403-010", "Account is disabled", HttpStatus.FORBIDDEN),
    AUTH_ACCOUNT_LOCKED("GB-403-011", "Account is locked", HttpStatus.FORBIDDEN),
    AUTH_ACCOUNT_PENDING("GB-403-012", "Account pending email verification", HttpStatus.FORBIDDEN),
    AUTH_ACCOUNT_SUSPENDED("GB-403-013", "Account is suspended", HttpStatus.FORBIDDEN),
    AUTH_ACCOUNT_INACTIVE("GB-403-014", "Account is inactive", HttpStatus.FORBIDDEN),
    EMAIL_ALREADY_EXISTS("GB-409-001", "Email is already registered", HttpStatus.CONFLICT),
    PHONE_ALREADY_EXISTS("GB-409-002", "Phone number is already registered", HttpStatus.CONFLICT),

    // Category
    CATEGORY_NOT_FOUND("GB-404-010", "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_SLUG_EXISTS("GB-409-010", "Category slug is already in use", HttpStatus.CONFLICT),
    CATEGORY_HAS_CHILDREN("GB-422-010", "Cannot delete category with sub-categories", HttpStatus.UNPROCESSABLE_ENTITY),
    CATEGORY_HAS_PRODUCTS("GB-422-011", "Cannot delete category that has products", HttpStatus.UNPROCESSABLE_ENTITY),

    // Product
    PRODUCT_NOT_FOUND("GB-404-020", "Product not found", HttpStatus.NOT_FOUND),
    PRODUCT_SKU_EXISTS("GB-409-020", "Product SKU is already in use", HttpStatus.CONFLICT),
    PRODUCT_SLUG_EXISTS("GB-409-021", "Product slug is already in use", HttpStatus.CONFLICT),
    INSUFFICIENT_STOCK("GB-422-020", "Insufficient stock available", HttpStatus.UNPROCESSABLE_ENTITY),

    // Wishlist
    WISHLIST_ITEM_EXISTS("GB-409-025", "Product is already in wishlist", HttpStatus.CONFLICT),
    WISHLIST_ITEM_NOT_FOUND("GB-404-025", "Wishlist item not found", HttpStatus.NOT_FOUND),

    // Cart
    CART_EMPTY("GB-422-030", "Cart is empty", HttpStatus.UNPROCESSABLE_ENTITY),
    CART_ITEM_NOT_FOUND("GB-404-030", "Cart item not found", HttpStatus.NOT_FOUND),

    // Order
    ORDER_NOT_FOUND("GB-404-040", "Order not found", HttpStatus.NOT_FOUND),
    ORDER_INVALID_STATUS_TRANSITION("GB-422-040", "Invalid order status transition", HttpStatus.UNPROCESSABLE_ENTITY),
    ORDER_CANNOT_CANCEL("GB-422-041", "Order cannot be cancelled in its current status", HttpStatus.UNPROCESSABLE_ENTITY),

    // Payment
    PAYMENT_NOT_FOUND("GB-404-050", "Payment not found", HttpStatus.NOT_FOUND),

    // Review
    REVIEW_NOT_FOUND("GB-404-060", "Review not found", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS("GB-409-060", "You have already reviewed this product", HttpStatus.CONFLICT),

    // Delivery
    DELIVERY_NOT_FOUND("GB-404-070", "Delivery assignment not found", HttpStatus.NOT_FOUND),
    DELIVERY_ALREADY_ASSIGNED("GB-409-070", "Order already has a delivery assignment", HttpStatus.CONFLICT),
    DELIVERY_PARTNER_NOT_FOUND("GB-404-071", "Delivery partner not found", HttpStatus.NOT_FOUND),
    DELIVERY_PARTNER_ALREADY_EXISTS("GB-409-071", "User is already a delivery partner", HttpStatus.CONFLICT),

    // Support
    TICKET_NOT_FOUND("GB-404-080", "Support ticket not found", HttpStatus.NOT_FOUND),
    TICKET_CLOSED("GB-422-080", "Cannot reply to a closed ticket", HttpStatus.UNPROCESSABLE_ENTITY),

    // Notification
    NOTIFICATION_NOT_FOUND("GB-404-090", "Notification not found", HttpStatus.NOT_FOUND),

    // Generic
    UNAUTHORIZED_ACCESS("GB-403-099", "You do not have access to this resource", HttpStatus.FORBIDDEN),

    INTERNAL_ERROR("GB-500-001", "An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String defaultMessage, HttpStatus httpStatus) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }
}
