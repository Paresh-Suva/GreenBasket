-- GreenBasket: Wishlist domain

CREATE TABLE wishlists (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    created_at      TIMESTAMP(6)    NOT NULL,
    updated_at      TIMESTAMP(6)    NOT NULL,
    created_by      VARCHAR(100)    NOT NULL,
    updated_by      VARCHAR(100)    NOT NULL,
    version         BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_wishlists_user_id UNIQUE (user_id),
    CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wishlist_items (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    wishlist_id     BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    created_at      TIMESTAMP(6)    NOT NULL,
    updated_at      TIMESTAMP(6)    NOT NULL,
    created_by      VARCHAR(100)    NOT NULL,
    updated_by      VARCHAR(100)    NOT NULL,
    version         BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_wishlist_items_wishlist_product UNIQUE (wishlist_id, product_id),
    CONSTRAINT fk_wishlist_items_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists (id),
    CONSTRAINT fk_wishlist_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items (wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items (product_id);
