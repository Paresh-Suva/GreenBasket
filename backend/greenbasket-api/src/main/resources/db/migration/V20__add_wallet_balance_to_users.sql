-- Migration: Add wallet balance to users and create wallet transactions table

ALTER TABLE users
ADD COLUMN wallet_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

CREATE TABLE wallet_transactions (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    user_id             BIGINT          NOT NULL,
    amount              DECIMAL(12, 2)  NOT NULL,
    transaction_type    VARCHAR(20)     NOT NULL, -- 'EARNED', 'SPENT'
    description         VARCHAR(255)    NULL,
    created_at          TIMESTAMP(6)    NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_wallet_transactions_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions (user_id);
