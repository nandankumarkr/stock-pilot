
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth/authorization";

export async function GET() {
  try {
    const session = await requireAuth();
    // 1. Dashboard statistics
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*)
         FROM products
         WHERE is_active = TRUE) AS total_products,

        (SELECT COUNT(*)
         FROM inventory i
         JOIN products p ON p.product_id = i.product_id
         WHERE p.is_active = TRUE
           AND i.quantity_on_hand <= p.safety_stock
        ) AS low_stock_items,

        (SELECT COUNT(*)
         FROM purchase_orders
         WHERE status IN ('DRAFT', 'PENDING', 'APPROVED', 'ORDERED')
        ) AS pending_orders,

        (SELECT COALESCE(
            SUM(i.quantity_on_hand * p.unit_cost), 0
         )
         FROM inventory i
         JOIN products p ON p.product_id = i.product_id
         WHERE p.is_active = TRUE
        ) AS inventory_value
    `);

    // 2. Low-stock products
    const lowStockResult = await pool.query(`
      SELECT
        p.product_id,
        p.product_name,
        p.sku,
        i.quantity_on_hand,
        p.safety_stock,
        CASE
          WHEN i.quantity_on_hand <= p.safety_stock / 2.0
          THEN 'Critical'
          ELSE 'Low Stock'
        END AS status
      FROM products p
      JOIN inventory i ON i.product_id = p.product_id
      WHERE p.is_active = TRUE
        AND i.quantity_on_hand <= p.safety_stock
      ORDER BY i.quantity_on_hand ASC
      LIMIT 10
    `);

    // 3. Restock prediction summary
    const restockResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE restock_status = 'REORDER REQUIRED'
        ) AS reorder_required,

        COUNT(*) FILTER (
          WHERE restock_status = 'REORDER REQUIRED'
          AND days_until_stockout IS NOT NULL
          AND days_until_stockout <= lead_time_days
        ) AS critical_stock

      FROM restock_predictions
    `);

    // 4. Daily inventory movement data (last 7 days)
    const movementResult = await pool.query(`
      SELECT
        DATE(created_at) AS movement_date,
        movement_type,
        COUNT(*) AS total_movements,
        SUM(ABS(quantity_change)) AS total_quantity
      FROM stock_movements
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at), movement_type
      ORDER BY movement_date, movement_type
    `);
    // 5. Recent inventory activity
const activityResult = await pool.query(`
  SELECT
    sm.movement_id,
    p.product_name,
    sm.movement_type,
    sm.quantity_change,
    sm.reason,
    sm.created_at
  FROM stock_movements sm
  JOIN products p
    ON p.product_id = sm.product_id
  ORDER BY sm.created_at DESC
  LIMIT 5
`);

    return NextResponse.json({
  success: true,
  stats: statsResult.rows[0],
  lowStockProducts: lowStockResult.rows,
  restockSummary: restockResult.rows[0],
  movementData: movementResult.rows,
  recentActivity: activityResult.rows,
});

  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
