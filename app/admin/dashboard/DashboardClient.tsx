"use client";

import Link from "next/link";
import Image from "next/image";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { ShoppingCart, Users, TrendingUp, Package, AlertTriangle, MessageSquare } from "lucide-react";

interface DashboardData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    pendingOrders: number;
    openFeedback: number;
  };
  revenueByDay: Array<{ _id: string; revenue: number; orders: number }>;
  topProducts: Array<{ _id: string; name: string; image: string; totalRevenue: number; totalSold: number }>;
  ordersByStatus: Array<{ _id: string; count: number }>;
  lowStockProducts: Array<{ _id: string; name: string; stock: number; images: string[] }>;
  recentOrders: Array<{ _id: string; orderNumber: string; shippingAddress?: { fullName?: string }; "shippingAddress.fullName"?: string; total: number; orderStatus: string; paymentStatus: string; createdAt: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  packed: "#8B5CF6",
  shipped: "#F97316",
  delivered: "#10B981",
  cancelled: "#EF4444",
  returned: "#6B7280",
};

const PIE_COLORS = ["#6B2737", "#C9A84C", "#3B82F6", "#10B981", "#F97316", "#EF4444"];

function customerName(order: DashboardData["recentOrders"][number]) {
  return order.shippingAddress?.fullName || order["shippingAddress.fullName"] || "Customer";
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { summary, revenueByDay, topProducts, ordersByStatus, lowStockProducts, recentOrders } = data;

  const statCards = [
    { label: "Revenue (30d)", value: `PKR ${summary.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Orders (30d)", value: summary.totalOrders, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Customers", value: summary.totalCustomers, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Orders", value: summary.pendingOrders, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-cormorant text-velour-black font-medium">Dashboard</h1>
        <p className="text-sm text-gray-400 font-inter mt-1">Overview of the last 30 days</p>
      </div>

      {/* Alerts */}
      {(summary.pendingOrders > 0 || lowStockProducts.length > 0 || summary.openFeedback > 0) && (
        <div className="flex flex-wrap gap-3">
          {summary.pendingOrders > 0 && (
            <Link href="/admin/orders?status=pending" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-sm hover:bg-amber-100 transition-colors font-inter">
              <AlertTriangle size={15} />
              {summary.pendingOrders} pending orders
            </Link>
          )}
          {lowStockProducts.length > 0 && (
            <Link href="/admin/inventory" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm hover:bg-red-100 transition-colors font-inter">
              <Package size={15} />
              {lowStockProducts.length} low stock items
            </Link>
          )}
          {summary.openFeedback > 0 && (
            <Link href="/admin/feedback" className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-lg text-sm hover:bg-blue-100 transition-colors font-inter">
              <MessageSquare size={15} />
              {summary.openFeedback} open feedback
            </Link>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="admin-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 tracking-wider uppercase font-inter mb-2">{card.label}</p>
                <p className="text-2xl font-cormorant font-medium text-velour-black">{card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="admin-card lg:col-span-2">
          <h3 className="text-sm font-medium text-velour-black font-inter mb-6">Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B2737" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6B2737" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fontFamily: "Inter" }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => [`PKR ${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{ fontFamily: "Inter", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6B2737" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status pie */}
        <div className="admin-card">
          <h3 className="text-sm font-medium text-velour-black font-inter mb-4">Order Status</h3>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {ordersByStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry._id] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm font-inter">No data yet</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-medium text-velour-black font-inter">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-burgundy-900 hover:underline font-inter">View All</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 font-inter">No orders yet</p>
            ) : recentOrders.map((order) => (
              <Link
                key={order._id}
                href={`/admin/orders/${order._id}`}
                className="flex items-center justify-between py-2.5 border-b border-gray-50 hover:bg-gray-50 px-2 rounded transition-colors group"
              >
                <div>
                  <p className="text-xs font-medium text-velour-black font-inter group-hover:text-burgundy-900">{order.orderNumber}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-inter">{customerName(order)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium font-inter">PKR {order.total?.toLocaleString()}</p>
                  <span
                    className="text-[10px] tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: `${STATUS_COLORS[order.orderStatus]}20`, color: STATUS_COLORS[order.orderStatus] }}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-medium text-velour-black font-inter">Top Products</h3>
            <Link href="/admin/products" className="text-xs text-burgundy-900 hover:underline font-inter">View All</Link>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 font-inter">No sales data yet</p>
            ) : topProducts.map((product, i) => (
              <div key={product._id} className="flex items-center gap-3 py-1">
                <span className="text-xs text-gray-400 font-inter w-4">{i + 1}</span>
                <div className="relative w-9 h-9 overflow-hidden bg-gray-100 flex-shrink-0">
                  {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="36px" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-velour-black font-inter truncate">{product.name}</p>
                  <p className="text-[11px] text-gray-400">{product.totalSold} sold</p>
                </div>
                <p className="text-xs font-medium font-inter text-velour-black">
                  PKR {product.totalRevenue?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="admin-card border-l-4 border-l-red-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-velour-black font-inter flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              Low Stock Alert
            </h3>
            <Link href="/admin/inventory" className="text-xs text-burgundy-900 hover:underline font-inter">Manage Inventory</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center gap-2 bg-red-50 rounded-lg p-2">
                <div className="relative w-8 h-8 flex-shrink-0 bg-gray-100 overflow-hidden rounded">
                  {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="32px" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-velour-black truncate font-inter">{p.name}</p>
                  <p className="text-[10px] text-red-600 font-inter">{p.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
