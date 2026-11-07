
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ShoppingCart,
  ChartNoAxesCombined,
  Settings,
  CircleHelp,
  Boxes,
} from "lucide-react";

const sections = [
  {
    label: "OVERVIEW",
    links: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "INVENTORY",
    links: [
      { name: "Products", href: "#products", icon: Package },
      { name: "Stock Management", href: "#inventory", icon: Warehouse },
      { name: "Suppliers", href: "#suppliers", icon: Truck },
      { name: "Purchase Orders", href: "#orders", icon: ShoppingCart },
    ],
  },
  {
    label: "INSIGHTS",
    links: [
      { name: "Analytics", href: "#analytics", icon: ChartNoAxesCombined },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 min-h-screen bg-white border-r border-slate-200 flex-col p-5">
      <div className="flex items-center gap-3 px-2 py-3 mb-9">
        <div className="bg-blue-600 p-2.5 rounded-xl text-white">
          <Boxes size={23} />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-900">
            StockPilot
          </h1>
          <p className="text-xs text-slate-400">
            INVENTORY SYSTEM
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-8">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 px-3 mb-3">
              {section.label}
            </p>

            <div className="space-y-1">
              {section.links.map((item) => {
                const Icon = item.icon;
                const active = item.name === "Dashboard";

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={19} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-100 pt-5">
        <Link href="#help" className="flex items-center gap-3 px-3 py-3 text-sm text-slate-500 hover:text-slate-900">
          <CircleHelp size={19} />
          Help & Support
        </Link>

        <Link href="#settings" className="flex items-center gap-3 px-3 py-3 text-sm text-slate-500 hover:text-slate-900">
          <Settings size={19} />
          Settings
        </Link>
      </div>

      <div className="mt-5 p-4 bg-slate-50 rounded-xl">
        <p className="text-xs font-semibold text-slate-700">
          Smart Inventory
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Automated restock prediction
        </p>
      </div>
    </aside>
  );
}
