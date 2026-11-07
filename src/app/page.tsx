
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
  Plus,
  ArrowRight,
  MoreHorizontal,
  Clock,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Total Products",
    value: "1,248",
    change: "+12.5%",
    detail: "Compared to last month",
    icon: Package,
    positive: true,
    color: "blue",
  },
  {
    title: "Low Stock Items",
    value: "24",
    change: "+4 items",
    detail: "Need restocking",
    icon: AlertTriangle,
    positive: false,
    color: "orange",
  },
  {
    title: "Pending Orders",
    value: "18",
    change: "6 arriving soon",
    detail: "Purchase orders",
    icon: ShoppingCart,
    positive: true,
    color: "purple",
  },
  {
    title: "Inventory Value",
    value: "₹8.42L",
    change: "+8.2%",
    detail: "Current stock value",
    icon: IndianRupee,
    positive: true,
    color: "green",
  },
];

const products = [
  { name: "Wireless Mouse", sku: "PRD-001", stock: 8, threshold: 20, status: "Critical", color: "red" },
  { name: "USB-C Hub", sku: "PRD-014", stock: 12, threshold: 25, status: "Low Stock", color: "orange" },
  { name: "Mechanical Keyboard", sku: "PRD-028", stock: 18, threshold: 30, status: "Low Stock", color: "orange" },
  { name: "Laptop Stand", sku: "PRD-036", stock: 5, threshold: 15, status: "Critical", color: "red" },
];

const activities = [
  { title: "Stock received", description: "50 units of USB-C Cable", time: "10 minutes ago", type: "in" },
  { title: "New purchase order", description: "PO #ORD-1024 created", time: "35 minutes ago", type: "order" },
  { title: "Stock issued", description: "12 units of Wireless Mouse", time: "1 hour ago", type: "out" },
  { title: "Supplier updated", description: "Tech Supplies Ltd.", time: "2 hours ago", type: "done" },
];

const chartData = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 65 },
  { day: "Wed", value: 52 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 90 },
  { day: "Sun", value: 72 },
];

export default function Home() {
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
              <Search size={17} className="absolute left-3 top-3 text-slate-400" />
              <input
                placeholder="Search anything..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <button className="relative bg-white border border-slate-200 rounded-xl p-3 text-slate-500">
              <Bell size={19} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
              A
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            const colors: Record<string, string> = {
              blue: "bg-blue-50 text-blue-600",
              orange: "bg-orange-50 text-orange-600",
              purple: "bg-purple-50 text-purple-600",
              green: "bg-green-50 text-green-600",
            };

            return (
              <div key={stat.title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <div className={`p-2.5 rounded-xl ${colors[stat.color]}`}>
                    <Icon size={19} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mt-5">
                  {stat.value}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`text-xs font-semibold ${stat.positive ? "text-green-600" : "text-orange-600"}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-400">{stat.detail}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Chart and Restock prediction */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-7">

          <div className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-bold text-slate-900">Inventory Movement</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Weekly stock movement overview
                </p>
              </div>
              <select className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 bg-white">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>

            <div className="h-48 flex items-end justify-around gap-3 border-b border-slate-100 pb-2">
              {chartData.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  <div
                    className="w-full max-w-12 bg-blue-500 hover:bg-blue-600 rounded-t-lg transition"
                    style={{ height: `${item.value}%` }}
                  />
                  <span className="text-xs text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Sample visualization — live inventory data will be connected later.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Restock Predictor</h2>
              <AlertTriangle size={20} className="text-orange-400" />
            </div>

            <p className="text-sm text-slate-400 mt-3">
              Products requiring attention
            </p>

            <div className="mt-7">
              <p className="text-4xl font-bold">24</p>
              <p className="text-xs text-slate-400 mt-2">Products below safety threshold</p>
            </div>

            <div className="mt-7 border-t border-slate-700 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Critical stock</span>
                <span className="text-red-400 font-semibold">8 items</span>
              </div>
              <div className="flex justify-between text-sm mt-4">
                <span className="text-slate-400">Needs restocking</span>
                <span className="text-orange-400 font-semibold">16 items</span>
              </div>
            </div>

            <button className="w-full mt-7 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-semibold flex justify-center items-center gap-2">
              View recommendations <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Tables */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-7">

          <div id="products" className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Low Stock Products</h2>
                <p className="text-xs text-slate-400 mt-1">Products that need immediate attention</p>
              </div>
              <button className="text-blue-600 text-sm font-semibold">View all</button>
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
                    <tr key={product.sku} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-medium text-slate-700">{product.name}</td>
                      <td className="px-6 py-4 text-slate-400">{product.sku}</td>
                      <td className="px-6 py-4 font-semibold">{product.stock}</td>
                      <td className="px-6 py-4 text-slate-500">{product.threshold}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.color === "red" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900">Recent Activity</h2>
              <MoreHorizontal size={20} className="text-slate-400" />
            </div>

            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                    activity.type === "in" ? "bg-green-50 text-green-600" :
                    activity.type === "out" ? "bg-orange-50 text-orange-600" :
                    activity.type === "order" ? "bg-blue-50 text-blue-600" :
                    "bg-purple-50 text-purple-600"
                  }`}>
                    {activity.type === "in" ? <ArrowDownRight size={17} /> :
                     activity.type === "out" ? <ArrowUpRight size={17} /> :
                     activity.type === "order" ? <ShoppingCart size={17} /> :
                     <CheckCircle2 size={17} />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{activity.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.description}</p>
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <Clock size={11} /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full border-t border-slate-100 mt-6 pt-5 text-sm text-blue-600 font-semibold">
              View activity history
            </button>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400 mt-10 pb-5">
          Smart Inventory & Automated Restock Predictor
        </footer>
      </main>
    </div>
  );
}

