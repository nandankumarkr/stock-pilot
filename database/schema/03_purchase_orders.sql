
-- ============================================
-- SMART INVENTORY MANAGEMENT SYSTEM
-- PURCHASE ORDER MODULE
-- ============================================

-- 1. PURCHASE ORDERS
-- One purchase order belongs to one supplier.

CREATE TABLE purchase_orders (
    purchase_order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    po_number VARCHAR(30) NOT NULL UNIQUE,

    supplier_id INTEGER NOT NULL,

    created_by INTEGER NOT NULL,

    order_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    expected_delivery_date DATE,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_po_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_po_user
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_po_status
        CHECK (
            status IN (
                'DRAFT',
                'PENDING',
                'APPROVED',
                'ORDERED',
                'RECEIVED',
                'CANCELLED'
            )
        ),

    CONSTRAINT chk_delivery_date
        CHECK (
            expected_delivery_date IS NULL
            OR expected_delivery_date >= order_date::DATE
        )
);


-- 2. PURCHASE ORDER ITEMS
-- Multiple products can belong to one purchase order.

CREATE TABLE purchase_order_items (
    purchase_order_item_id INTEGER
        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    purchase_order_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    unit_cost NUMERIC(12,2) NOT NULL,

    line_total NUMERIC(14,2)
        GENERATED ALWAYS AS (quantity * unit_cost) STORED,

    CONSTRAINT fk_poi_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders(purchase_order_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_poi_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_poi_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_poi_unit_cost
        CHECK (unit_cost >= 0),

    CONSTRAINT uq_po_product
        UNIQUE (purchase_order_id, product_id)
);


-- 3. SUPPLIER NOTIFICATIONS
-- Records notification attempts for purchase orders.

CREATE TABLE supplier_notifications (
    notification_id INTEGER
        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    purchase_order_id INTEGER NOT NULL,

    recipient_email VARCHAR(255) NOT NULL,

    notification_type VARCHAR(30) NOT NULL DEFAULT 'PURCHASE_ORDER',

    notification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    attempt_count INTEGER NOT NULL DEFAULT 0,

    sent_at TIMESTAMPTZ,

    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders(purchase_order_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_notification_type
        CHECK (
            notification_type IN (
                'PURCHASE_ORDER',
                'LOW_STOCK_ALERT'
            )
        ),

    CONSTRAINT chk_notification_status
        CHECK (
            notification_status IN (
                'PENDING',
                'SENT',
                'FAILED'
            )
        ),

    CONSTRAINT chk_attempt_count
        CHECK (attempt_count >= 0)
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_po_supplier
ON purchase_orders(supplier_id);

CREATE INDEX idx_po_status
ON purchase_orders(status);

CREATE INDEX idx_po_date
ON purchase_orders(order_date);

CREATE INDEX idx_poi_product
ON purchase_order_items(product_id);

CREATE INDEX idx_notification_status
ON supplier_notifications(notification_status);

CREATE INDEX idx_notification_order
ON supplier_notifications(purchase_order_id);


-- ============================================
-- END OF PURCHASE ORDER MODULE
-- ============================================
