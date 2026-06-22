-- GreenBasket: Category domain

CREATE TABLE categories (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    parent_id       BIGINT          NULL,
    name            VARCHAR(150)    NOT NULL,
    slug            VARCHAR(200)    NOT NULL,
    description     TEXT            NULL,
    image_url       VARCHAR(500)    NULL,
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMP(6)    NOT NULL,
    updated_at      TIMESTAMP(6)    NOT NULL,
    created_by      VARCHAR(100)    NOT NULL,
    updated_by      VARCHAR(100)    NOT NULL,
    version         BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT uk_categories_slug UNIQUE (slug),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_active ON categories (active);
CREATE INDEX idx_categories_sort_order ON categories (sort_order);
