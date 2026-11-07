
-- ============================================
-- SMART INVENTORY MANAGEMENT SYSTEM
-- AUTOMATED LOW-STOCK DETECTION
-- ============================================

-- Generate unique purchase order numbers.
CREATE SEQUENCE IF NOT EXISTS purchase_order_number_seq;


-- 1. LOW-STOCK RESTOCK FUNCTION

CREATE OR REPLACE FUNCTION create_restock_order_if_needed(
    p_product_id INTEGER,
    p_user_id INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_safety_stock INTEGER;
    v_reorder_quantity INTEGER;
    v_unit_cost NUMERIC(12,2);
    v_current_stock INTEGER;

    v_supplier_id INTEGER;
    v_supplier_email VARCHAR(255);

    v_purchase_order_id INTEGER;
    v_po_number VARCHAR(30);
BEGIN

    -- Prevent concurrent duplicate orders for the same product.
    PERFORM pg_advisory_xact_lock(74101, p_product_id);

    -- 1. Read product and inventory information.
    SELECT
        p.safety_stock,
        p.reorder_quantity,
        p.unit_cost,
        i.quantity_on_hand
    INTO
        v_safety_stock,
        v_reorder_quantity,
        v_unit_cost,
        v_current_stock
    FROM products p
    JOIN inventory i
        ON i.product_id = p.product_id
    WHERE p.product_id = p_product_id
      AND p.is_active = TRUE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- 2. Check whether stock is below the safety threshold.
    IF v_current_stock > v_safety_stock THEN
        RETURN;
    END IF;

    -- 3. Avoid duplicate open purchase orders.
    IF EXISTS (
        SELECT 1
        FROM purchase_orders po
        JOIN purchase_order_items poi
            ON poi.purchase_order_id = po.purchase_order_id
        WHERE poi.product_id = p_product_id
          AND po.status IN (
              'DRAFT',
              'PENDING',
              'APPROVED',
              'ORDERED'
          )
    ) THEN
        RETURN;
    END IF;

    -- 4. Find the preferred active supplier.
    SELECT
        s.supplier_id,
        s.email
    INTO
        v_supplier_id,
        v_supplier_email
    FROM product_suppliers ps
    JOIN suppliers s
        ON s.supplier_id = ps.supplier_id
    WHERE ps.product_id = p_product_id
      AND ps.is_preferred = TRUE
      AND s.is_active = TRUE
    LIMIT 1;

    IF NOT FOUND OR v_supplier_email IS NULL THEN
        RAISE NOTICE
            'No preferred supplier with email found for product %',
            p_product_id;
        RETURN;
    END IF;

    -- 5. Generate a purchase order number.
    v_po_number :=
        'PO-' ||
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') ||
        '-' ||
        LPAD(
            NEXTVAL('purchase_order_number_seq')::TEXT,
            6,
            '0'
        );

    -- 6. Create a draft purchase order.
    INSERT INTO purchase_orders (
        po_number,
        supplier_id,
        created_by,
        status,
        notes
    )
    VALUES (
        v_po_number,
        v_supplier_id,
        p_user_id,
        'DRAFT',
        'Automatically generated due to low inventory'
    )
    RETURNING purchase_order_id
    INTO v_purchase_order_id;

    -- 7. Add the product to the purchase order.
    INSERT INTO purchase_order_items (
        purchase_order_id,
        product_id,
        quantity,
        unit_cost
    )
    VALUES (
        v_purchase_order_id,
        p_product_id,
        v_reorder_quantity,
        v_unit_cost
    );

    -- 8. Queue supplier notification.
    INSERT INTO supplier_notifications (
        purchase_order_id,
        recipient_email,
        notification_type,
        notification_status
    )
    VALUES (
        v_purchase_order_id,
        v_supplier_email,
        'PURCHASE_ORDER',
        'PENDING'
    );

    RAISE NOTICE
        'Purchase order % created for product %',
        v_po_number,
        p_product_id;

END;
$$;


-- 2. TRIGGER FUNCTION

CREATE OR REPLACE FUNCTION check_low_stock_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    PERFORM create_restock_order_if_needed(
        NEW.product_id,
        NEW.performed_by
    );

    RETURN NEW;

END;
$$;


-- 3. AUTOMATIC TRIGGER

CREATE TRIGGER trg_automatic_low_stock
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION check_low_stock_trigger();


-- ============================================
-- END OF AUTOMATED RESTOCK MODULE
-- ============================================
