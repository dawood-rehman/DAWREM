import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { ChevronRight, Package, ShoppingBag, Truck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your DAWRÉM order history, tracking status, and order details.",
};

function money(value: number) {
  return `PKR ${value.toLocaleString()}`;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  packed: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-gray-50 text-gray-700 border-gray-200",
};

interface OrderSummary {
  _id: { toString: () => string };
  orderNumber: string;
  orderStatus: string;
  total: number;
  trackingNumber?: string;
  courier?: string;
  createdAt: string | Date;
  items?: unknown[];
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  await connectDB();

  const orders = await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("orderNumber orderStatus paymentStatus total shippingCost trackingNumber courier createdAt items")
    .lean<OrderSummary[]>();

  return (
    <div className="min-h-screen bg-ivory-50 px-4 py-12 text-velour-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-subtitle">Order History</p>
            <h1 className="section-title">My Orders</h1>
            <p className="mt-3 text-sm text-gray-500">
              View order details, delivery progress, and tracking information.
            </p>
          </div>
          <Link href="/account" className="btn-outline inline-flex items-center justify-center">
            Account Dashboard
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-card">
            <ShoppingBag size={40} className="mx-auto text-gray-300" />
            <h2 className="mt-5 font-cormorant text-2xl font-medium text-velour-black">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-gray-500">
              Once you place an order, it will appear here with status updates and tracking details.
            </p>
            <Link href="/shop" className="mt-6 inline-flex btn-primary">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id.toString()}
                href={`/orders/${order.orderNumber}`}
                className="block border border-gray-100 bg-white p-5 shadow-card transition-colors hover:border-gold-300"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-ivory-100 text-burgundy-900">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium text-burgundy-900">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Placed {format(new Date(order.createdAt), "MMMM d, yyyy")} - {order.items?.length ?? 0} item(s)
                      </p>
                      {order.trackingNumber && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <Truck size={12} />
                          {order.courier ? `${order.courier}: ` : ""}
                          {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <span className={`border px-3 py-1 text-[10px] uppercase tracking-wider ${statusStyles[order.orderStatus] ?? statusStyles.pending}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-sm font-medium text-velour-black">{money(order.total)}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
