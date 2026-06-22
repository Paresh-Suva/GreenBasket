-- GreenBasket: Warehouse and Order Delivery Coordinate Snapshot

CREATE TABLE warehouse (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    name                VARCHAR(255)    NOT NULL,
    address             VARCHAR(255)    NOT NULL,
    city                VARCHAR(100)    NOT NULL,
    state               VARCHAR(100)    NOT NULL,
    pincode             VARCHAR(20)     NOT NULL,
    contact_number      VARCHAR(20)     NOT NULL,
    latitude            DECIMAL(10, 7)  NOT NULL,
    longitude           DECIMAL(10, 7)  NOT NULL,
    created_at          TIMESTAMP(6)    NOT NULL,
    updated_at          TIMESTAMP(6)    NOT NULL,
    created_by          VARCHAR(100)    NOT NULL,
    updated_by          VARCHAR(100)    NOT NULL,
    version             BIGINT          NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE orders ADD COLUMN delivery_latitude DECIMAL(10, 7) NULL;
ALTER TABLE orders ADD COLUMN delivery_longitude DECIMAL(10, 7) NULL;
