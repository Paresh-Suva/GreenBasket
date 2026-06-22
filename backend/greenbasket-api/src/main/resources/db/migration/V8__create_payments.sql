-- GreenBasket: Payment domain

CREATE TABLE payments (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    public_id               VARCHAR(36)     NOT NULL,
    order_id                BIGINT          NOT NULL,
    amount                  DECIMAL(12, 2)  NOT NULL,
    method                  VARCHAR(20)     NOT NULL,
    status                  VARCHAR(20)     NOT NULL,
    transaction_reference   VARCHAR(100)    NULL,
    paid_at                 TIMESTAMP(6)    NULL,
    created_at              TIMESTAMP(6)    NOT NULL,
    updated_at              TIMESTAMP(6)    NOT NULL,
    created_by              VARCHAR(100)    NOT NULL,
    updated_by              VARCHAR(100)    NOT NULL,
    version                 BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_payments_public_id UNIQUE (public_id),
    CONSTRAINT uk_payments_order_id UNIQUE (order_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_method ON payments (method);
