
-- ============================================
-- SMART INVENTORY MANAGEMENT SYSTEM
-- SALES MANAGEMENT
-- ============================================

CREATE OR REPLACE FUNCTION process_sale(
    p_user_id INTEGER,
    p_items JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_sale_id INTEGER;
    v_product_id INTEGER;
    v_quantity INTEGER;
    v_current_stock INTEGER;
    v_unit_price NUMERIC(12,2);
    v_new_stock INTEGER;
    v_item JSONB;
BEGIN

    -- 1. Validate input
    IF p_items IS NULL
       OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Sale must contain at least one item';
    END IF;

    -- 2. Validate product IDs and quantities
    IF EXISTS (
        SELECT 1
        FROM jsonb_to_recordset(p_items)
             AS x(product_id INTEGER, quantity INTEGER)
        WHERE product_id IS NULL
           OR quantity IS NULL
           OR product_id <= 0
           OR quantity <= 0
    ) THEN
        RAISE EXCEPTION
            'Each sale item must have a valid product_id and positive quantity';
    END IF;

    -- 3. Prevent duplicate products in one sale
    IF EXISTS (
        SELECT product_id
        FROM jsonb_to_recordset(p_items)
             AS x(product_id INTEGER, quantity INTEGER)
        GROUP BY product_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'A product can appear only once in a sale';
    END IF;

    -- 4. Create the sale header
    INSERT INTO sales (sold_by)
    VALUES (p_user_id)
    RETURNING sale_id INTO v_sale_id;

    -- 5. Process products in sorted order.
    -- This reduces the possibility of deadlocks
    -- when multiple sales happen simultaneously.

    FOR v_item IN
        SELECT value
        FROM jsonb_array_elements(p_items)
        ORDER BY (value->>'product_id')::INTEGER
    LOOP

        v_product_id :=
            (v_item->>'product_id')::INTEGER;

        v_quantity :=
            (v_item->>'quantity')::INTEGER;

        -- 6. Lock the inventory row
        SELECT
            i.quantity_on_hand,
            p.unit_price
        INTO
            v_current_stock,
            v_unit_price
        FROM inventory i
        JOIN products p
            ON p.product_id = i.product_id
        WHERE i.product_id = v_product_id
          AND p.is_active = TRUE
        FOR UPDATE OF i;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Product % does not exist, is inactive, or has no inventory record',
                v_product_id;
        END IF;

        -- 7. Prevent overselling
        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION
                'Insufficient stock for product %. Available: %, Requested: %',
                v_product_id,
                v_current_stock,
                v_quantity;
        END IF;

        -- 8. Insert sale item
        INSERT INTO sale_items (
            sale_id,
            product_id,
            quantity,
            unit_price
        )
        VALUES (
            v_sale_id,
            v_product_id,
            v_quantity,
            v_unit_price
        );

        -- 9. Deduct inventory
        v_new_stock := v_current_stock - v_quantity;

        UPDATE inventory
        SET
            quantity_on_hand = v_new_stock,
            last_updated = CURRENT_TIMESTAMP
        WHERE product_id = v_product_id;

        -- 10. Record stock movement
        INSERT INTO stock_movements (
            product_id,
            performed_by,
            sale_id,
            movement_type,
            quantity_change,
            reason
        )
        VALUES (
            v_product_id,
            p_user_id,
            v_sale_id,
            'OUT',
            -v_quantity,
            'Customer sale'
        );

    END LOOP;

    -- 11. Return generated sale ID
    RETURN v_sale_id;

END;
$$;


-- ============================================
-- END OF SALES MANAGEMENT FUNCTION
-- ============================================
