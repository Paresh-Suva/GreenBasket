-- GreenBasket: Support domain

CREATE TABLE support_tickets (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    public_id       VARCHAR(36)     NOT NULL,
    user_id         BIGINT          NOT NULL,
    subject         VARCHAR(255)    NOT NULL,
    category        VARCHAR(50)     NOT NULL,
    status          VARCHAR(30)     NOT NULL,
    priority        VARCHAR(20)     NOT NULL,
    created_at      TIMESTAMP(6)    NOT NULL,
    updated_at      TIMESTAMP(6)    NOT NULL,
    created_by      VARCHAR(100)    NOT NULL,
    updated_by      VARCHAR(100)    NOT NULL,
    version         BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_support_tickets_public_id UNIQUE (public_id),
    CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE support_messages (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    ticket_id       BIGINT          NOT NULL,
    sender_user_id  BIGINT          NOT NULL,
    message         TEXT            NOT NULL,
    is_staff_reply  BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP(6)    NOT NULL,
    updated_at      TIMESTAMP(6)    NOT NULL,
    created_by      VARCHAR(100)    NOT NULL,
    updated_by      VARCHAR(100)    NOT NULL,
    version         BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_support_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets (id),
    CONSTRAINT fk_support_messages_sender FOREIGN KEY (sender_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_support_tickets_user_id ON support_tickets (user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets (status);
CREATE INDEX idx_support_messages_ticket_id ON support_messages (ticket_id);
