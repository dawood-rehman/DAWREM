"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { CheckCircle, Clock, MapPin, Package, Search, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";

interface TimelineEntry {
  status: string;
  message: string;
  timestamp: string;
  updatedBy?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; size: string; color: string; image: string }>;
  shippingAddress: { fullName: string; addressLine1: string; city: string; province: string; phone: string };
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  trackingNumber?: string;
  courier?: string;
  timeline: TimelineEntry[];
  createdAt: string;
}

const statusSteps = ["pending", "confirmed", "packed", "shipped", "delivered"];

const statusMeta: Record<string, { label: string; icon: typeof Package }> = {
  pending: { label: "Pending", icon: Clock },
  confirmed: { label: "Confirmed", icon: CheckCircle },
  packed: { label: "Packed", icon: Package },
  shipped: { label: "Shipped", icon: Truck },
  delivered: { label: "Delivered", icon: MapPin },
};

function money(value: number) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const trackOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Please enter your order number.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter the email used for this order.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
      });
      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();
      if (!response.ok || !data.orders?.length) {
        toast.error("Order not found. Please check the details and try again.");
        setOrder(null);
        return;
      }
      setOrder(data.orders[0]);
    } catch {
      toast.error("Failed to track order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? statusSteps.indexOf(order.orderStatus) : -1;
  const isExceptionalStatus = order ? ["cancelled", "returned"].includes(order.orderStatus) : false;

  return (
    <main className="min-h-screen bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="section-subtitle">Order Tracking</p>
            <h1 className="mt-4 max-w-4xl font-cormorant text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
              Follow every step from confirmation to delivery.
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              Enter your order number and checkout email to view the latest order status, shipping details, timeline updates, and product summary.
            </p>
          </div>

          <form onSubmit={trackOrder} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-premium)] sm:p-6">
            <div className="flex items-center gap-3 text-[var(--color-accent)]">
              <ShieldCheck size={18} />
              <span className="text-[10px] uppercase tracking-[0.28em]">Secure Lookup</span>
            </div>
            <div className="mt-6 space-y-4">
              <input
                type="text"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                placeholder="Order number"
                className="input-luxury"
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email used at checkout"
                className="input-luxury"
              />
              <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
                <Search size={14} />
                {loading ? "Tracking..." : "Track Order"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {order && (
        <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <article className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-premium)] sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-accent)]">Order Number</p>
                    <h2 className="mt-2 font-mono text-lg font-medium">{order.orderNumber}</h2>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-accent)]">Placed On</p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{format(new Date(order.createdAt), "MMMM d, yyyy")}</p>
                  </div>
                </div>

                {isExceptionalStatus ? (
                  <div className="mt-8 border border-[var(--color-border)] bg-[var(--color-page)] p-5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-accent)]">Current Status</p>
                    <p className="mt-2 font-cormorant text-3xl capitalize">{order.orderStatus}</p>
                  </div>
                ) : (
                  <div className="mt-10 overflow-x-auto pb-2">
                    <div className="relative min-w-[620px]">
                      <div className="absolute left-5 right-5 top-5 h-px bg-[var(--color-border)]" />
                      <div
                        className="absolute left-5 top-5 h-px bg-[var(--color-accent)] transition-all duration-700"
                        style={{
                          width: currentStepIndex >= 0 ? `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 10px)` : "0%",
                        }}
                      />
                      <div className="relative flex justify-between">
                        {statusSteps.map((step, index) => {
                          const Icon = statusMeta[step].icon;
                          const complete = index <= currentStepIndex;
                          const current = index === currentStepIndex;
                          return (
                            <div key={step} className="flex w-24 flex-col items-center gap-3 text-center">
                              <div
                                className={`flex h-10 w-10 items-center justify-center border transition-all ${
                                  complete
                                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-brand-contrast)]"
                                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]"
                                } ${current ? "shadow-[var(--shadow-card-premium)]" : ""}`}
                              >
                                <Icon size={16} />
                              </div>
                              <span className={`text-[10px] uppercase tracking-[0.2em] ${complete ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"}`}>
                                {statusMeta[step].label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mt-8 flex flex-col gap-4 border border-[var(--color-border)] bg-[var(--color-page)] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-accent)]">Tracking Number</p>
                      <p className="mt-2 font-mono text-sm font-medium">{order.trackingNumber}</p>
                      {order.courier && <p className="mt-1 text-sm text-[var(--color-muted)]">via {order.courier}</p>}
                    </div>
                    <Truck className="text-[var(--color-accent)]" size={24} />
                  </div>
                )}
              </article>

              <article className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-8">
                <h2 className="font-cormorant text-3xl font-medium">Order History</h2>
                <div className="relative mt-6 space-y-5">
                  <div className="absolute bottom-2 left-4 top-2 w-px bg-[var(--color-border)]" />
                  {(order.timeline || []).slice().reverse().map((entry, index) => (
                    <div key={`${entry.status}-${entry.timestamp}-${index}`} className="relative flex gap-4 pl-1">
                      <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center border ${
                        index === 0
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-brand-contrast)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]"
                      }`}>
                        <CheckCircle size={13} />
                      </span>
                      <div className="pb-3">
                        <p className="text-sm font-medium capitalize">{entry.status.replaceAll("_", " ")}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{entry.message}</p>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">{format(new Date(entry.timestamp), "MMM d, yyyy - h:mm a")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <aside className="space-y-6">
              <article className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
                <h2 className="font-cormorant text-3xl font-medium">Items Ordered</h2>
                <div className="mt-6 space-y-4">
                  {order.items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex gap-4">
                      <div className="h-20 w-16 shrink-0 overflow-hidden bg-[var(--color-surface-muted)]">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          {item.size} / {item.color} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-5 text-sm text-[var(--color-muted)]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{money(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{money(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{order.shippingCost === 0 ? "Free" : money(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-3 font-cormorant text-2xl text-[var(--color-text)]">
                    <span>Total</span>
                    <span>{money(order.total)}</span>
                  </div>
                </div>
              </article>

              <article className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
                <h2 className="font-cormorant text-3xl font-medium">Shipping Address</h2>
                <div className="mt-5 flex items-start gap-3 text-sm leading-7 text-[var(--color-muted)]">
                  <MapPin size={17} className="mt-1 shrink-0 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                </div>
              </article>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
