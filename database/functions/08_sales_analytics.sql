
-- ============================================
-- SALES ANALYTICS
-- ============================================

-- 1. DAILY REVENUE

CREATE OR REPLACE VIEW daily_revenue AS
SELECT
    DATE(s.sale_date) AS sale_day,
    COUNT(DISTINCT s.sale_id) AS total_sales,
    SUM(si.quantity) AS units_sold,
    SUM(si.line_total) AS total_revenue
FROM sales s
JOIN sale_items si
    ON si.sale_id = s.sale_id
WHERE s.sale_status = 'COMPLETED'
GROUP BY DATE(s.sale_date)
ORDER BY sale_day DESC;

-- 2. PRODUCT SALES SUMMARY

CREATE OR REPLACE VIEW product_sales_summary AS
SELECT
    p.product_id,
    p.product_name,
    p.sku,
    COALESCE(SUM(si.quantity), 0) AS total_units_sold,
    COALESCE(SUM(si.line_total), 0) AS total_revenue,
    COUNT(DISTINCT s.sale_id) AS number_of_sales
FROM products p
LEFT JOIN sale_items si
    ON si.product_id = p.product_id
LEFT JOIN sales s
    ON s.sale_id = si.sale_id
    AND s.sale_status = 'COMPLETED'
GROUP BY
    p.product_id,
    p.product_name,
    p.sku;

-- 3. SALES DASHBOARD SUMMARY

CREATE OR REPLACE VIEW sales_dashboard_summary AS
SELECT
    COUNT(DISTINCT s.sale_id) AS total_sales,
    COALESCE(SUM(si.quantity), 0) AS total_units_sold,
    COALESCE(SUM(si.line_total), 0) AS total_revenue,
    COALESCE(
        SUM(si.line_total) / NULLIF(COUNT(DISTINCT s.sale_id), 0),
        0
    ) AS average_sale_value
FROM sales s
LEFT JOIN sale_items si
    ON si.sale_id = s.sale_id
WHERE s.sale_status = 'COMPLETED';
