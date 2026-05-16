"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Eye, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Order {
  _id: string;
  orderNumber: string;
  shippingAddress: { fullName: string; city: string; phone: string };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  total: number;
  items: Array<{ name: string; quantity: number }>;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-purple-100 text-purple-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: "15",
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
    });
    try {
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchOrders]);

  const updateStatus = async (id: string, orderStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      if (!res.ok) throw new Error();
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, orderStatus } : o));
      toast.success(`Order marked as ${orderStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const ORDER_STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cormorant text-velour-black font-medium">Orders</h1>
          <p className="text-sm text-gray-400 font-inter mt-1">{total} total orders</p>
        </div>
        <button className="border border-gray-300 px-4 py-2 text-xs tracking-wider uppercase font-inter hover:border-burgundy-900 transition-colors">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, name, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gold-400 font-inter"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-400 font-inter bg-white"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>

      {/* Status tabs quick filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ label: "All", value: "" }, ...ORDER_STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))].map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-inter rounded-full whitespace-nowrap transition-colors ${
              statusFilter === tab.value ? "bg-burgundy-900 text-ivory-50" : "bg-white border border-gray-200 hover:border-burgundy-900 text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-gray-500 font-inter font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 font-inter text-sm">No orders found</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-medium text-burgundy-900">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium font-inter text-velour-black">{order.shippingAddress?.fullName}</p>
                    <p className="text-xs text-gray-400 font-inter">{order.shippingAddress?.city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-inter">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-gray-400 font-inter truncate max-w-[140px]">
                      {order.items?.map((i) => i.name).join(", ")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium font-inter">
                    PKR {order.total?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] tracking-wider px-2 py-0.5 rounded-full uppercase font-inter ${PAYMENT_COLORS[order.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                      {order.paymentStatus}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-inter capitalize">{order.paymentMethod?.replace("_", " ")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative group">
                      <div className={`flex items-center gap-1 text-[10px] tracking-wider px-2.5 py-1 rounded-full uppercase font-inter cursor-pointer w-fit ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-600"}`}>
                        {order.orderStatus}
                        <ChevronDown size={10} />
                      </div>
                      <div className="absolute left-0 top-full mt-1 bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-10 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        {ORDER_STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order._id, s)}
                            disabled={updatingId === order._id}
                            className={`block w-full text-left px-4 py-2 text-xs font-inter capitalize hover:bg-gray-50 transition-colors ${order.orderStatus === s ? "font-medium text-burgundy-900" : "text-gray-600"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-inter whitespace-nowrap">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order._id}`} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-velour-black rounded hover:bg-gray-100 transition-colors">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 15 && (
          <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-inter">Showing {(page - 1) * 15 + 1}-{Math.min(page * 15, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-200 rounded hover:border-burgundy-900 disabled:opacity-40 font-inter">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * 15 >= total} className="px-3 py-1.5 text-xs border border-gray-200 rounded hover:border-burgundy-900 disabled:opacity-40 font-inter">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
