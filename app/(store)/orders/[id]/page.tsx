import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import mongoose from "mongoose";
import { CheckCircle, MapPin, Package, Truck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View DAWRÉM order details and tracking progress.",
};

const statusSteps = ["pending", "confirmed", "packed", "shipped", "delivered"];

interface OrderItem {
  slug?: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  image?: string;
  price: number;
  salePrice?: number;
}

interface TimelineEntry {
  status: string;
  message: string;
  timestamp: string;
}

interface OrderRecord {
  userId?: { toString: () => string };
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  trackingNumber?: string;
  courier?: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    phone: string;
  };
  timeline?: TimelineEntry[];
  createdAt: string;
}

function money(value: number) {
  return `PKR ${value.toLocaleString()}`;
}

function orderLookup(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }

  return { orderNumber: id.toUpperCase() };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/orders/${encodeURIComponent(id)}`);
  }

  await connectDB();

  const order = await Order.findOne(orderLookup(id)).lean<OrderRecord>();

  if (!order) {
    notFound();
  }

  if (session.user.role !== "admin" && order.userId?.toString() !== session.user.id) {
    notFound();
  }

  const currentStepIndex = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-ivory-50 px-4 py-12 text-velour-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-subtitle">Order Details</p>
            <h1 className="font-cormorant text-3xl font-light text-velour-black md:text-5xl">
              {order.orderNumber}
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Placed {format(new Date(order.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
          <Link href="/orders" className="btn-outline inline-flex items-center justify-center">
            Back To Orders
          </Link>
        </div>

        <section className="border border-gray-100 bg-white p-6 shadow-card">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Current Status</p>
              <p className="mt-1 font-cormorant text-2xl font-medium capitalize text-burgundy-900">
                {order.orderStatus.replace("_", " ")}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Payment</p>
              <p className="mt-1 text-sm capitalize text-gray-600">
                {order.paymentMethod.replace("_", " ")} - {order.paymentStatus}
              </p>
            </div>
          </div>

          {!["cancelled", "returned"].includes(order.orderStatus) && (
            <div className="relative mb-8">
              <div className="absolute left-0 right-0 top-5 h-px bg-gray-200" />
              <div
                className="absolute left-0 top-5 h-px bg-burgundy-900 transition-all duration-700"
                style={{
                  width: `${currentStepIndex >= 0 ? (currentStepIndex / (statusSteps.length - 1)) * 100 : 0}%`,
                }}
              />
              <div className="relative flex justify-between gap-2">
                {statusSteps.map((step, index) => {
                  const done = index <= currentStepIndex;
                  return (
                    <div key={step} className="flex max-w-[96px] flex-col items-center gap-2 text-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${done ? "border-burgundy-900 bg-burgundy-900 text-ivory-50" : "border-gray-200 bg-white text-gray-400"}`}>
                        {step === "shipped" ? <Truck size={15} /> : <CheckCircle size={15} />}
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider ${done ? "text-burgundy-900" : "text-gray-400"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.trackingNumber && (
            <div className="flex items-center justify-between gap-4 border border-gold-200 bg-ivory-50 p-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Tracking Number</p>
                <p className="mt-1 font-mono text-sm font-medium text-velour-black">{order.trackingNumber}</p>
                {order.courier && <p className="mt-1 text-xs text-gray-500">via {order.courier}</p>}
              </div>
              <Truck size={20} className="text-gold-500" />
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="border border-gray-100 bg-white p-6 shadow-card">
            <h2 className="font-cormorant text-2xl font-medium text-velour-black">Items</h2>
            <div className="mt-6 divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={`${item.slug}-${index}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden bg-ivory-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        width={64}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-velour-black">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.size} / {item.color} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-velour-black">
                    {money((item.salePrice || item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-8">
            <section className="border border-gray-100 bg-white p-6 shadow-card">
              <h2 className="font-cormorant text-xl font-medium text-velour-black">Summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{money(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{money(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? "Free" : money(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 font-cormorant text-xl text-velour-black">
                  <span>Total</span>
                  <span>{money(order.total)}</span>
                </div>
              </div>
            </section>

            <section className="border border-gray-100 bg-white p-6 shadow-card">
              <h2 className="font-cormorant text-xl font-medium text-velour-black">Shipping Address</h2>
              <div className="mt-4 flex items-start gap-3 text-sm leading-7 text-gray-600">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-gold-500" />
                <div>
                  <p className="font-medium text-velour-black">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>
            </section>

            <section className="border border-gray-100 bg-white p-6 shadow-card">
              <h2 className="font-cormorant text-xl font-medium text-velour-black">Timeline</h2>
              <div className="mt-5 space-y-4">
                {order.timeline?.slice().reverse().map((entry, index) => (
                  <div key={`${entry.status}-${index}`} className="flex gap-3">
                    <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-burgundy-900 text-ivory-50">
                      <Package size={12} />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize text-velour-black">{entry.status}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">{entry.message}</p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
