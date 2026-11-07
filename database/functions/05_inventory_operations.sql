
-- ============================================
-- INVENTORY OPERATIONS
-- Stock IN, Stock OUT and Adjustments
-- ============================================

CREATE OR REPLACE FUNCTION apply_stock_movement(
    p_product_id INTEGER,
    p_user_id INTEGER,
    p_movement_type VARCHAR(20),
    p_quantity_change INTEGER,
    p_reason TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_quantity INTEGER;
    v_new_quantity INTEGER;
BEGIN

    -- 1. Validate the movement type
    IF p_movement_type NOT IN ('IN', 'OUT', 'ADJUSTMENT') THEN
        RAISE EXCEPTION 'Invalid movement type: %',
            p_movement_type;
    END IF;

    -- 2. Validate the quantity
    IF p_quantity_change = 0 THEN
        RAISE EXCEPTION 'Quantity change cannot be zero';
    END IF;

    IF p_movement_type = 'IN' AND p_quantity_change < 0 THEN
        RAISE EXCEPTION 'Stock IN requires a positive quantity';
    END IF;

    IF p_movement_type = 'OUT' AND p_quantity_change > 0 THEN
        RAISE EXCEPTION 'Stock OUT requires a negative quantity';
    END IF;

    -- 3. Lock the inventory row
    SELECT quantity_on_hand
    INTO v_current_quantity
    FROM inventory
    WHERE product_id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory record not found for product %',
            p_product_id;
    END IF;

    -- 4. Calculate the new stock quantity
    v_new_quantity :=
        v_current_quantity + p_quantity_change;

    -- 5. Prevent negative inventory
    IF v_new_quantity < 0 THEN
        RAISE EXCEPTION
            'Insufficient stock. Available: %, Requested: %',
            v_current_quantity,
            ABS(p_quantity_change);
    END IF;

    -- 6. Update current inventory
    UPDATE inventory
    SET
        quantity_on_hand = v_new_quantity,
        last_updated = CURRENT_TIMESTAMP
    WHERE product_id = p_product_id;

    -- 7. Record the stock movement
    INSERT INTO stock_movements (
        product_id,
        performed_by,
        movement_type,
        quantity_change,
        reason
    )
    VALUES (
        p_product_id,
        p_user_id,
        p_movement_type,
        p_quantity_change,
        p_reason
    );

    RETURN v_new_quantity;

END;
$$;
