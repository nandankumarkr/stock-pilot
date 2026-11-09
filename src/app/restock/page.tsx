
"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/sidebar";
import {
  AlertTriangle,
  Package,
  Truck,
  RefreshCw,
} from "lucide-react";

interface Recommendation {
  product_id: number;
  product_name: string;
  sku: string;
  quantity_on_hand: number;
  safety_stock: number;
  reorder_quantity: number;
  daily_burn_rate: number;
  days_until_stockout: number | null;
  lead_time_days: number;
  reorder_point: number;
  restock_status: string;
  recommended_order_quantity: number;
  supplier_name: string;
  supplier_email: string;
}

export default function RestockPage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/restock");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error("Failed to load recommendations");
        }

        setItems(result.recommendations);
      } catch (err) {
        setError("Unable to load restock recommendations.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  const reorderItems = items.filter(
    (item) => item.restock_status === "REORDER REQUIRED"
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800 lg:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8 lg:p-9">
        <div className="mb-8">
          <p className="text-sm text-slate-400 mb-2">
            Overview / Insights / Restock
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Restock Recommendations
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Inventory predictions and automated reorder suggestions.
          </p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Products Requiring Reorder
              </p>
              <AlertTriangle className="text-orange-500" />
            </div>

            <h2 className="text-3xl font-bold mt-5">
              {loading ? "..." : reorderItems.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total Products Monitored
              </p>
              <Package className="text-blue-500" />
            </div>

            <h2 className="text-3xl font-bold mt-5">
              {loading ? "..." : items.length}
            </h2>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">
              Recommended Restocking
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Calculated from stock levels, consumption and supplier lead time.
            </p>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-400">
              Loading recommendations...
            </p>
          ) : error ? (
            <p className="p-8 text-center text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Safety Stock</th>
                    <th className="p-4">Daily Burn</th>
                    <th className="p-4">Stockout Days</th>
                    <th className="p-4">Order Quantity</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.product_id}
                      className="border-t border-slate-100"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.sku}
                        </p>
                      </td>

                      <td className="p-4 font-semibold">
                        {item.quantity_on_hand}
                      </td>

                      <td className="p-4">{item.safety_stock}</td>

                      <td className="p-4">
                        {Number(item.daily_burn_rate).toFixed(2)}
                      </td>

                      <td className="p-4">
                        {item.days_until_stockout === null
                          ? "N/A"
                          : Number(item.days_until_stockout).toFixed(1)}
                      </td>

                      <td className="p-4 font-semibold">
                        {item.recommended_order_quantity}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Truck size={15} className="text-slate-400" />
                          {item.supplier_name}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {item.supplier_email}
                        </p>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.restock_status === "REORDER REQUIRED"
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {item.restock_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="p-8 text-center text-slate-400">
              No products found.
            </p>
          )}
        </section>

        <p className="text-xs text-slate-400 mt-6">
          Recommendations are generated using the database restock prediction model.
        </p>
      </main>
    </div>
  );
}
