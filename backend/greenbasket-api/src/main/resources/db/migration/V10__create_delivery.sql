-- GreenBasket: Delivery domain

CREATE TABLE delivery_partners (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    vehicle_type    VARCHAR(50)     NOT NULL,
    vehicle_number  VARCHAR(30)     NOT NULL,
    license_number  VARCHAR(50)     NOT NULL,
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP(6)    NOT NULL,
    updated_at      TIMESTAMP(6)    NOT NULL,
    created_by      VARCHAR(100)    NOT NULL,
    updated_by      VARCHAR(100)    NOT NULL,
    version         BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_delivery_partners_user_id UNIQUE (user_id),
    CONSTRAINT fk_delivery_partners_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE delivery_assignments (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    order_id            BIGINT          NOT NULL,
    delivery_partner_id BIGINT          NOT NULL,
    status              VARCHAR(30)     NOT NULL,
    assigned_at         TIMESTAMP(6)    NOT NULL,
    picked_up_at        TIMESTAMP(6)    NULL,
    delivered_at        TIMESTAMP(6)    NULL,
    notes               VARCHAR(1000)   NULL,
    created_at          TIMESTAMP(6)    NOT NULL,
    updated_at          TIMESTAMP(6)    NOT NULL,
    created_by          VARCHAR(100)    NOT NULL,
    updated_by          VARCHAR(100)    NOT NULL,
    version             BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_delivery_assignments_order_id UNIQUE (order_id),
    CONSTRAINT fk_delivery_assignments_order FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_delivery_assignments_partner FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_delivery_assignments_partner_id ON delivery_assignments (delivery_partner_id);
CREATE INDEX idx_delivery_assignments_status ON delivery_assignments (status);
