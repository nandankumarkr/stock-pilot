import { requireAuth } from "@/lib/auth/authorization";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAuth();
    const result = await pool.query(`
      SELECT
        product_id,
        product_name,
        sku,
        quantity_on_hand,
        safety_stock,
        reorder_quantity,
        units_consumed,
        observed_days,
        daily_burn_rate,
        days_until_stockout,
        lead_time_days,
        reorder_point,
        restock_status,
        recommended_order_quantity,
        supplier_name,
        supplier_email
      FROM restock_predictions
      ORDER BY
        CASE
          WHEN restock_status = 'REORDER REQUIRED' THEN 0
          ELSE 1
        END,
        days_until_stockout ASC NULLS LAST
    `);

    return NextResponse.json({
      success: true,
      recommendations: result.rows,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Restock API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch restock recommendations",
      },
      { status: 500 }
    );
  }
}
