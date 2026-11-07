
-- ============================================
-- SMART INVENTORY MANAGEMENT SYSTEM
-- SAMPLE DATA
-- ============================================

-- 1. CATEGORIES

INSERT INTO categories (category_name, description)
VALUES
    ('Electronics', 'Electronic products and accessories'),
    ('Computer Accessories', 'Computer peripherals and accessories'),
    ('Office Supplies', 'Office and stationery products')
ON CONFLICT (category_name) DO NOTHING;


-- 2. SUPPLIERS

INSERT INTO suppliers (supplier_name, email, phone, address)
VALUES
    (
        'Tech Supplies Ltd.',
        'sales@techsupplies.example',
        '9876543210',
        'Bengaluru, Karnataka'
    ),
    (
        'Global Electronics',
        'orders@globalelectronics.example',
        '9876543211',
        'Mumbai, Maharashtra'
    ),
    (
        'Office Mart',
        'contact@officemart.example',
        '9876543212',
        'Chennai, Tamil Nadu'
    )
ON CONFLICT (email) DO NOTHING;


-- 3. USERS
-- These are development-only accounts.
-- The password_hash values below are NOT real password hashes.
-- Replace them with actual bcrypt hashes before implementing login.

INSERT INTO users (role_id, full_name, email, password_hash)
SELECT
    r.role_id,
    v.full_name,
    v.email,
    'DEVELOPMENT_ONLY_NOT_A_REAL_HASH'
FROM (
    VALUES
        ('Admin', 'Project Administrator', 'admin@smartinventory.local'),
        ('Warehouse Staff', 'Warehouse Operator', 'staff@smartinventory.local')
) AS v(role_name, full_name, email)
JOIN roles r ON r.role_name = v.role_name
ON CONFLICT (email) DO NOTHING;


-- 4. PRODUCTS

INSERT INTO products (
    category_id,
    product_name,
    sku,
    description,
    unit_price,
    unit_cost,
    safety_stock,
    reorder_quantity
)
SELECT
    c.category_id,
    v.product_name,
    v.sku,
    v.description,
    v.unit_price,
    v.unit_cost,
    v.safety_stock,
    v.reorder_quantity
FROM (
    VALUES
    (
        'Electronics',
        'Wireless Mouse',
        'ELEC-001',
        'Wireless optical mouse',
        799.00::NUMERIC,
        450.00::NUMERIC,
        20,
        50
    ),
    (
        'Electronics',
        'USB-C Hub',
        'ELEC-002',
        'Multiport USB-C adapter',
        1499.00::NUMERIC,
        900.00::NUMERIC,
        15,
        30
    ),
    (
        'Computer Accessories',
        'Mechanical Keyboard',
        'COMP-001',
        'Mechanical keyboard with RGB lighting',
        2499.00::NUMERIC,
        1700.00::NUMERIC,
        10,
        25
    ),
    (
        'Computer Accessories',
        'Laptop Stand',
        'COMP-002',
        'Adjustable aluminium laptop stand',
        1199.00::NUMERIC,
        700.00::NUMERIC,
        15,
        30
    ),
    (
        'Office Supplies',
        'Notebook',
        'OFF-001',
        'A4 ruled notebook',
        120.00::NUMERIC,
        65.00::NUMERIC,
        25,
        100
    )
) AS v(
    category_name,
    product_name,
    sku,
    description,
    unit_price,
    unit_cost,
    safety_stock,
    reorder_quantity
)
JOIN categories c
    ON c.category_name = v.category_name
ON CONFLICT (sku) DO NOTHING;


-- 5. PRODUCT-SUPPLIER RELATIONSHIPS

INSERT INTO product_suppliers (
    product_id,
    supplier_id,
    lead_time_days,
    is_preferred
)
SELECT
    p.product_id,
    s.supplier_id,
    v.lead_time_days,
    TRUE
FROM (
    VALUES
        ('ELEC-001', 'sales@techsupplies.example', 3),
        ('ELEC-002', 'sales@techsupplies.example', 4),
        ('COMP-001', 'orders@globalelectronics.example', 5),
        ('COMP-002', 'orders@globalelectronics.example', 4),
        ('OFF-001', 'contact@officemart.example', 2)
) AS v(sku, supplier_email, lead_time_days)
JOIN products p ON p.sku = v.sku
JOIN suppliers s ON s.email = v.supplier_email
ON CONFLICT (product_id, supplier_id) DO NOTHING;


-- 6. INITIAL INVENTORY

INSERT INTO inventory (product_id, quantity_on_hand)
SELECT
    p.product_id,
    v.initial_quantity
FROM (
    VALUES
        ('ELEC-001', 8),
        ('ELEC-002', 45),
        ('COMP-001', 30),
        ('COMP-002', 5),
        ('OFF-001', 120)
) AS v(sku, initial_quantity)
JOIN products p ON p.sku = v.sku
ON CONFLICT (product_id) DO NOTHING;


-- ============================================
-- END OF SAMPLE DATA
-- ============================================

-- 7. RECORD OPENING STOCK MOVEMENTS

INSERT INTO stock_movements (
    product_id,
    performed_by,
    movement_type,
    quantity_change,
    reason
)
SELECT
    p.product_id,
    u.user_id,
    'IN',
    i.quantity_on_hand,
    'Initial opening stock'
FROM inventory i
JOIN products p ON p.product_id = i.product_id
CROSS JOIN users u
WHERE u.email = 'admin@smartinventory.local'
AND i.quantity_on_hand > 0
AND NOT EXISTS (
    SELECT 1
    FROM stock_movements sm
    WHERE sm.product_id = i.product_id
      AND sm.reason = 'Initial opening stock'
);
