
-- ============================================
-- SMART INVENTORY MANAGEMENT SYSTEM
-- Core Database Tables
-- ============================================

-- 1. ROLES
CREATE TABLE roles (
    role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 2. USERS
CREATE TABLE users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id INTEGER NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON DELETE RESTRICT
);

-- 3. CATEGORIES
CREATE TABLE categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. SUPPLIERS
CREATE TABLE suppliers (
    supplier_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS
CREATE TABLE products (
    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    unit_price NUMERIC(12,2) NOT NULL,
    unit_cost NUMERIC(12,2) NOT NULL,
    safety_stock INTEGER NOT NULL DEFAULT 10,
    reorder_quantity INTEGER NOT NULL DEFAULT 20,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_product_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_product_cost
        CHECK (unit_cost >= 0),

    CONSTRAINT chk_safety_stock
        CHECK (safety_stock >= 0),

    CONSTRAINT chk_reorder_quantity
        CHECK (reorder_quantity > 0)
);

-- 6. PRODUCT_SUPPLIERS
-- Resolves the many-to-many relationship.

CREATE TABLE product_suppliers (
    product_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    supplier_product_code VARCHAR(100),
    lead_time_days INTEGER NOT NULL DEFAULT 0,
    is_preferred BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (product_id, supplier_id),

    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_lead_time
        CHECK (lead_time_days >= 0)
);

-- Only one preferred supplier per product.
CREATE UNIQUE INDEX idx_one_preferred_supplier
ON product_suppliers(product_id)
WHERE is_preferred = TRUE;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_products_category
ON products(category_id);

CREATE INDEX idx_suppliers_name
ON suppliers(supplier_name);

CREATE INDEX idx_product_suppliers_supplier
ON product_suppliers(supplier_id);

-- ============================================
-- INITIAL ROLE DATA
-- ============================================

INSERT INTO roles (role_name, description)
VALUES
    ('Admin', 'Full system administration access'),
    ('Warehouse Staff', 'Inventory and stock management access')
ON CONFLICT (role_name) DO NOTHING;
