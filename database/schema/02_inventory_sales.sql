
-- ============================================
-- SMART INVENTORY MANAGEMENT SYSTEM
-- INVENTORY AND SALES TABLES
-- ============================================

-- 1. INVENTORY
-- Stores the current stock of each product.
-- Single warehouse: one inventory record per product.

CREATE TABLE inventory (
    inventory_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id INTEGER NOT NULL UNIQUE,

    quantity_on_hand INTEGER NOT NULL DEFAULT 0,

    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_inventory_quantity
        CHECK (quantity_on_hand >= 0)
);


-- 2. SALES
-- Stores individual sales transactions.

CREATE TABLE sales (
    sale_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    sold_by INTEGER NOT NULL,

    sale_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    sale_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',

    CONSTRAINT fk_sale_user
        FOREIGN KEY (sold_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_sale_status
        CHECK (
            sale_status IN ('COMPLETED', 'CANCELLED')
        )
);


-- 3. SALE ITEMS
-- Stores the products belonging to each sale.

CREATE TABLE sale_items (
    sale_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    sale_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    unit_price NUMERIC(12,2) NOT NULL,

    line_total NUMERIC(14,2)
        GENERATED ALWAYS AS (quantity * unit_price) STORED,

    CONSTRAINT fk_sale_item_sale
        FOREIGN KEY (sale_id)
        REFERENCES sales(sale_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_sale_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_sale_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_sale_item_price
        CHECK (unit_price >= 0),

    CONSTRAINT uq_sale_product
        UNIQUE (sale_id, product_id)
);


-- 4. STOCK MOVEMENTS
-- Records every inventory change.
-- Positive quantity_change = stock received.
-- Negative quantity_change = stock issued.

CREATE TABLE stock_movements (
    movement_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    product_id INTEGER NOT NULL,

    performed_by INTEGER NOT NULL,

    sale_id INTEGER,

    movement_type VARCHAR(20) NOT NULL,

    quantity_change INTEGER NOT NULL,

    reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movement_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_movement_user
        FOREIGN KEY (performed_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_movement_sale
        FOREIGN KEY (sale_id)
        REFERENCES sales(sale_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_movement_type
        CHECK (
            movement_type IN ('IN', 'OUT', 'ADJUSTMENT')
        ),

    CONSTRAINT chk_movement_quantity
        CHECK (quantity_change <> 0),

    CONSTRAINT chk_movement_direction
        CHECK (
            (movement_type = 'IN' AND quantity_change > 0)
            OR
            (movement_type = 'OUT' AND quantity_change < 0)
            OR
            (movement_type = 'ADJUSTMENT')
        ),

    CONSTRAINT chk_out_movement_sale
        CHECK (
            movement_type <> 'OUT' OR sale_id IS NOT NULL
        )
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_inventory_quantity
ON inventory(quantity_on_hand);

CREATE INDEX idx_sales_date
ON sales(sale_date);

CREATE INDEX idx_sales_user
ON sales(sold_by);

CREATE INDEX idx_sale_items_product
ON sale_items(product_id);

CREATE INDEX idx_stock_movements_product
ON stock_movements(product_id);

CREATE INDEX idx_stock_movements_date
ON stock_movements(created_at);

CREATE INDEX idx_stock_movements_type
ON stock_movements(movement_type);


-- ============================================
-- END OF INVENTORY AND SALES TABLES
-- ============================================
