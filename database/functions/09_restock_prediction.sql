
-- ============================================
-- STEP 12: RESTOCK PREDICTION ENGINE
-- ============================================

CREATE OR REPLACE VIEW restock_predictions AS

WITH movement_history AS (
    SELECT
        product_id,
        SUM(ABS(quantity_change)) AS total_consumed,
        MIN(created_at::date) AS first_movement_date
    FROM stock_movements
    WHERE movement_type = 'OUT'
      AND created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY product_id
),


burn_rates AS (
    SELECT
        product_id,
        total_consumed,
        30 AS observed_days,
        ROUND(
            total_consumed::numeric / 30,
            2
        ) AS daily_burn_rate
    FROM movement_history
)


SELECT
    p.product_id,
    p.product_name,
    p.sku,

    i.quantity_on_hand,
    p.safety_stock,
    p.reorder_quantity,

    COALESCE(br.total_consumed, 0) AS units_consumed,
    COALESCE(br.observed_days, 0) AS observed_days,
    COALESCE(br.daily_burn_rate, 0) AS daily_burn_rate,

    CASE
        WHEN COALESCE(br.daily_burn_rate, 0) > 0
        THEN ROUND(
            i.quantity_on_hand::numeric /
            br.daily_burn_rate,
            1
        )
        ELSE NULL
    END AS days_until_stockout,

    COALESCE(ps.lead_time_days, 0) AS lead_time_days,

    CEIL(
        p.safety_stock +
        COALESCE(br.daily_burn_rate, 0) *
        COALESCE(ps.lead_time_days, 0)
    ) AS reorder_point,

    CASE
        WHEN i.quantity_on_hand <=
            p.safety_stock +
            COALESCE(br.daily_burn_rate, 0) *
            COALESCE(ps.lead_time_days, 0)
        THEN 'REORDER REQUIRED'
        ELSE 'STOCK SUFFICIENT'
    END AS restock_status,

    CASE
        WHEN i.quantity_on_hand <=
            p.safety_stock +
            COALESCE(br.daily_burn_rate, 0) *
            COALESCE(ps.lead_time_days, 0)
        THEN GREATEST(
            p.reorder_quantity,
            CEIL(
                p.safety_stock +
                COALESCE(br.daily_burn_rate, 0) *
                COALESCE(ps.lead_time_days, 0) -
                i.quantity_on_hand
            )::integer
        )
        ELSE 0
    END AS recommended_order_quantity,

    s.supplier_name,
    s.email AS supplier_email

FROM products p

JOIN inventory i
    ON i.product_id = p.product_id

LEFT JOIN burn_rates br
    ON br.product_id = p.product_id

LEFT JOIN product_suppliers ps
    ON ps.product_id = p.product_id
    AND ps.is_preferred = TRUE

LEFT JOIN suppliers s
    ON s.supplier_id = ps.supplier_id

WHERE p.is_active = TRUE;
