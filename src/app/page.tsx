
"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/sidebar";

import {
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertTriangle,
  ShoppingCart,
  IndianRupee,
  ArrowRight,
  MoreHorizontal,
  Clock,
  CheckCircle2,
} from "lucide-react";

// Types
interface DashboardStats {
  total_products: number;
  low_stock_items: number;
  pending_orders: number;
  inventory_value: number;
}

interface LowStockProduct {
  product_id: number;
  product_name: string;
  sku: string;
  quantity_on_hand: number;
  safety_stock: number;
  status: string;
}

interface RestockSummary {
  reorder_required: number;
  critical_stock: number;
}

interface SearchResult {
  product_id: number;
  product_name: string;
  sku: string;
  description: string;
  similarity: number;
}

interface MovementData {
  movement_date: string;
  movement_type: "IN" | "OUT";
  total_movements: number;
  total_quantity: number;
}
interface RecentActivity {
  movement_id: number;
  product_name: string;
  movement_type: "IN" | "OUT";
  quantity_change: number;
  reason: string;
  created_at: string;
}



export default function Home() {
  // Dashboard state
  const [dashboardData, setDashboardData] =
    useState<DashboardStats>({
      total_products: 0,
      low_stock_items: 0,
      pending_orders: 0,
      inventory_value: 0,
    });

  const [products, setProducts] =
    useState<LowStockProduct[]>([]);

  const [movementData, setMovementData] =
    useState<MovementData[]>([]);

  const [restockSummary, setRestockSummary] =
    useState<RestockSummary>({
      reorder_required: 0,
      critical_stock: 0,
    });

  const [dashboardLoading, setDashboardLoading] =
    useState(true);

  // Semantic search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] =
    useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [recentActivity, setRecentActivity] =
  useState<RecentActivity[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard");
        }

        const result = await response.json();

        if (result.success) {
          setDashboardData(result.stats);
          setProducts(result.lowStockProducts);
          setRestockSummary(result.restockSummary);
          setMovementData(result.movementData ?? []);
          setRecentActivity(result.recentActivity);
        }
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      } finally {
        setDashboardLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // Semantic product search
  async function handleSemanticSearch() {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const response = await fetch("/api/semantic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Semantic search failed"
        );
      }

      setSearchResults(result.results);
    } catch (error) {
      console.error("Semantic search error:", error);
      setSearchError(
        "Unable to search products. Please try again."
      );
    } finally {
      setSearchLoading(false);
    }
  }

  // Dashboard statistics
  const stats = [
    {
      title: "Total Products",
      value: dashboardData.total_products,
      change: "",
      detail: "Active products",
      icon: Package,
      positive: true,
      color: "blue",
    },
    {
      title: "Low Stock Items",
      value: dashboardData.low_stock_items,
      change: "",
      detail: "Need restocking",
      icon: AlertTriangle,
      positive: false,
      color: "orange",
    },
    {
      title: "Pending Orders",
      value: dashboardData.pending_orders,
      change: "",
      detail: "Open purchase orders",
      icon: ShoppingCart,
      positive: true,
      color: "purple",
    },
    {
      title: "Inventory Value",
      value: `₹${Number(
        dashboardData.inventory_value
      ).toLocaleString("en-IN")}`,
      change: "",
      detail: "Current stock value at cost",
      icon: IndianRupee,
      positive: true,
      color: "green",
    },
  ];

  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800 lg:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-5 md:p-8 lg:p-9">

        {/* Header */}
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-9">
          <div>
            <p className="text-sm text-slate-400 mb-2">
              Overview / Dashboard
            </p>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Welcome back! Here's what's happening with your inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search
                size={17}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                placeholder="Search products by meaning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSemanticSearch();
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <button
              onClick={handleSemanticSearch}
              disabled={searchLoading}
              className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
            >
              {searchLoading ? "..." : "Search"}
            </button>

            <button className="relative bg-white border border-slate-200 rounded-xl p-3 text-slate-500">
              <Bell size={19} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
              A
            </div>
          </div>
        </header>

        {/* Semantic Search Results */}
        {(searchLoading ||
          searchError ||
          searchResults.length > 0) && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-7">
            <h2 className="font-bold text-slate-900 mb-4">
              Semantic Product Search
            </h2>

            {searchLoading && (
              <p className="text-sm text-slate-500">
                Searching products by meaning...
              </p>
            )}

            {searchError && (
              <p className="text-sm text-red-600">
                {searchError}
              </p>
            )}

            {!searchLoading &&
              searchResults.map((product) => (
                <div
                  key={product.product_id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-t border-slate-100 py-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {product.product_name}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      SKU: {product.sku}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <span className="text-sm text-blue-600 font-semibold">
                    Similarity: {product.similarity.toFixed(4)}
                  </span>
                </div>
              ))}

            {!searchLoading &&
              !searchError &&
              searchResults.length === 0 && (
                <p className="text-sm text-slate-500">
                  No matching products found.
                </p>
              )}
          </section>
        )}

        {/* Dashboard Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <div className={`p-2.5 rounded-xl ${colors[stat.color]}`}>
                    <Icon size={19} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mt-5">
                  {dashboardLoading ? "..." : stat.value}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`text-xs font-semibold ${
                    stat.positive
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}>
                    {stat.change}
                  </span>

                  <span className="text-xs text-slate-400">
                    {stat.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Chart and Restock Prediction */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-7">

          {/* Inventory Movement Chart */}
          <div className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-bold text-slate-900">
                  Inventory Movement
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Weekly stock movement overview
                </p>
              </div>

              <select className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 bg-white">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>

            <div className="h-48 flex items-end justify-around gap-6 border-b border-slate-100 pb-2">
              {movementData.length > 0 ? (
                [...new Set(
                  movementData.map((item) => item.movement_date)
                )].map((date) => {
                  const inbound = movementData.find(
                    (item) =>
                      item.movement_date === date &&
                      item.movement_type === "IN"
                  );

                  const outbound = movementData.find(
                    (item) =>
                      item.movement_date === date &&
                      item.movement_type === "OUT"
                  );

                  const maxQuantity = Math.max(
                    1,
                    ...movementData.map((item) =>
                      Number(item.total_quantity)
                    )
                  );

                  return (
                    <div
                      key={date}
                      className="flex-1 flex flex-col items-center justify-end gap-3 h-full"
                    >
                      <div className="flex items-end justify-center gap-2 h-full w-full">
                        <div
                          title={`Stock IN: ${inbound?.total_quantity ?? 0} units`}
                          className="w-8 max-w-12 bg-blue-500 rounded-t-lg"
                          style={{
                            height: `${inbound
                              ? (Number(inbound.total_quantity) / maxQuantity) * 100
                              : 0}%`,
                          }}
                        />

                        <div
                          title={`Stock OUT: ${outbound?.total_quantity ?? 0} units`}
                          className="w-8 max-w-12 bg-orange-400 rounded-t-lg"
                          style={{
                            height: `${outbound
                              ? (Number(outbound.total_quantity) / maxQuantity) * 100
                              : 0}%`,
                          }}
                        />
                      </div>

                      <span className="text-xs text-slate-400">
                        {new Date(date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 m-auto">
                  No inventory movements recorded yet.
                </p>
              )}
            </div>

            <div className="flex gap-5 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-blue-500" />
                Stock IN
              </span>

              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-orange-400" />
                Stock OUT
              </span>
            </div>
          </div>

          {/* Restock Predictor */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">
                Restock Predictor
              </h2>

              <AlertTriangle
                size={20}
                className="text-orange-400"
              />
            </div>

            <p className="text-sm text-slate-400 mt-3">
              Products requiring attention
            </p>

            <div className="mt-7">
              <p className="text-4xl font-bold">
                {dashboardLoading
                  ? "..."
                  : restockSummary.reorder_required}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Products requiring reorder
              </p>
            </div>

            <div className="mt-7 border-t border-slate-700 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  Critical stock
                </span>

                <span className="text-red-400 font-semibold">
                  {restockSummary.critical_stock} items
                </span>
              </div>

              <div className="flex justify-between text-sm mt-4">
                <span className="text-slate-400">
                  Needs restocking
                </span>

                <span className="text-orange-400 font-semibold">
                  {Math.max(
                    0,
                    restockSummary.reorder_required -
                    restockSummary.critical_stock
                  )} items
                </span>
              </div>
            </div>

            <button className="w-full mt-7 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-semibold flex justify-center items-center gap-2">
              View recommendations
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Tables */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-7">

          {/* Low Stock Products */}
          <div
            id="products"
            className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Low Stock Products
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Products that need immediate attention
                </p>
              </div>

              <button className="text-blue-600 text-sm font-semibold">
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-400 text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">SKU</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium">Threshold</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.product_id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {product.product_name}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {product.sku}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {product.quantity_on_hand}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {product.safety_stock}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.status === "Critical"
                              ? "bg-red-50 text-red-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!dashboardLoading && products.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        No low-stock products.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
<div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
  <div className="flex items-center justify-between mb-6">
    <h2 className="font-bold text-slate-900">
      Recent Activity
    </h2>

    <MoreHorizontal
      size={20}
      className="text-slate-400"
    />
  </div>

  <div className="space-y-6">
    {recentActivity.map((activity) => (
      <div key={activity.movement_id} className="flex gap-3">
        <div
          className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
            activity.movement_type === "IN"
              ? "bg-green-50 text-green-600"
              : "bg-orange-50 text-orange-600"
          }`}
        >
          {activity.movement_type === "IN" ? (
            <ArrowDownRight size={17} />
          ) : (
            <ArrowUpRight size={17} />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700">
            {activity.product_name}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {activity.reason}
          </p>

          <p className="text-xs font-semibold text-slate-600 mt-1">
            {activity.quantity_change > 0 ? "+" : ""}
            {activity.quantity_change} units
          </p>

          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Clock size={11} />
            {new Date(activity.created_at).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    ))}

    {!dashboardLoading && recentActivity.length === 0 && (
      <p className="text-sm text-slate-400">
        No recent activity found.
      </p>
    )}
  </div>

  <div className="w-full border-t border-slate-100 mt-6 pt-5 text-sm text-slate-400">
    Showing latest 5 stock movements
  </div>
</div>
        </section>

        <footer className="text-center text-xs text-slate-400 mt-10 pb-5">
          Smart Inventory & Automated Restock Predictor
        </footer>
      </main>
    </div>
  );
}
