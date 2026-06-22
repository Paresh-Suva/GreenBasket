-- GreenBasket: Seed default roles

INSERT INTO roles (code, name, description, created_at, updated_at, created_by, updated_by, version)
VALUES
    ('ADMIN', 'Administrator', 'Platform administrator with management access', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
    ('CUSTOMER', 'Customer', 'Standard customer account', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
    ('DELIVERY_PARTNER', 'Delivery Partner', 'Delivery partner responsible for order fulfillment', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
    ('SUPER_ADMIN', 'Super Administrator', 'Full platform super administrator', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0);
