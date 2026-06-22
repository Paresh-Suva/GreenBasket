-- GreenBasket: Order domain

CREATE TABLE orders (
    id                          BIGINT          NOT NULL AUTO_INCREMENT,
    public_id                   VARCHAR(36)     NOT NULL,
    user_id                     BIGINT          NOT NULL,
    order_number                VARCHAR(30)     NOT NULL,
    status                      VARCHAR(30)     NOT NULL,
    subtotal                    DECIMAL(12, 2)  NOT NULL,
    discount_amount             DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    tax_amount                  DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    delivery_fee                DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    total_amount                DECIMAL(12, 2)  NOT NULL,
    delivery_address_id         BIGINT          NULL,
    delivery_address_type       VARCHAR(20)     NULL,
    delivery_label              VARCHAR(100)    NULL,
    delivery_address_line1      VARCHAR(255)    NULL,
    delivery_address_line2      VARCHAR(255)    NULL,
    delivery_city               VARCHAR(100)    NULL,
    delivery_state              VARCHAR(100)    NULL,
    delivery_postal_code        VARCHAR(20)     NULL,
    delivery_country            VARCHAR(100)    NULL,
    notes                       VARCHAR(1000)   NULL,
    created_at                  TIMESTAMP(6)    NOT NULL,
    updated_at                  TIMESTAMP(6)    NOT NULL,
    created_by                  VARCHAR(100)    NOT NULL,
    updated_by                  VARCHAR(100)    NOT NULL,
    version                     BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_orders_public_id UNIQUE (public_id),
    CONSTRAINT uk_orders_order_number UNIQUE (order_number),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_orders_delivery_address FOREIGN KEY (delivery_address_id) REFERENCES user_addresses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    order_id        BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    product_name    VARCHAR(255)    NOT NULL,
    product_sku     VARCHAR(50)     NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(12, 2)  NOT NULL,
    discount_price  DECIMAL(12, 2)  NULL,
    line_total      DECIMAL(12, 2)  NOT NULL,
    created_at      TIMESTAMP(6)    NOT NULL,
    updated_at      TIMESTAMP(6)    NOT NULL,
    created_by      VARCHAR(100)    NOT NULL,
    updated_by      VARCHAR(100)    NOT NULL,
    version         BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
