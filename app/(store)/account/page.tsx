import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { Heart, MapPin, Package, Settings, ShoppingBag, UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your DAWRÉM account, orders, saved addresses, and preferences.",
};

function money(value: number) {
  return `PKR ${value.toLocaleString()}`;
}

interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  phone: string;
  isDefault?: boolean;
}

interface AccountUser {
  name: string;
  email: string;
  image?: string;
  isBlocked?: boolean;
  addresses?: Address[];
  totalOrders?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
  createdAt?: string | Date;
}

interface RecentOrder {
  _id: { toString: () => string };
  orderNumber: string;
  orderStatus: string;
  total: number;
  createdAt: string | Date;
  items?: unknown[];
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  await connectDB();

  const [user, recentOrders] = await Promise.all([
    User.findById(session.user.id)
      .select("name email image role addresses isBlocked totalOrders totalSpent loyaltyPoints emailPreferences createdAt")
      .lean<AccountUser>(),
    Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("orderNumber orderStatus paymentStatus total createdAt items")
      .lean<RecentOrder[]>(),
  ]);

  if (!user || user.isBlocked) {
    redirect("/login?callbackUrl=/account");
  }

  const defaultAddress = user.addresses?.find((address) => address.isDefault) ?? user.addresses?.[0];
  const memberSince = user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently";

  return (
    <div className="min-h-screen bg-ivory-50 px-4 py-12 text-velour-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-subtitle">Customer Dashboard</p>
            <h1 className="section-title">My Account</h1>
            <p className="mt-3 text-sm text-gray-500">
              Welcome back, {user.name}. Member since {memberSince}.
            </p>
          </div>
          <Link href="/orders" className="btn-primary inline-flex items-center justify-center gap-2">
            <Package size={14} />
            My Orders
          </Link>
          <Link href="/account/settings" className="btn-outline inline-flex items-center justify-center gap-2">
            <Settings size={14} />
            Settings
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Orders", value: user.totalOrders ?? 0, icon: ShoppingBag },
            { label: "Total Spent", value: money(user.totalSpent ?? 0), icon: Package },
            { label: "Loyalty Points", value: user.loyaltyPoints ?? 0, icon: Heart },
            { label: "Saved Addresses", value: user.addresses?.length ?? 0, icon: MapPin },
          ].map((stat) => (
            <div key={stat.label} className="border border-gray-100 bg-white p-5 shadow-card">
              <stat.icon size={18} className="text-gold-500" />
              <p className="mt-4 text-[10px] uppercase tracking-widest text-gray-400">{stat.label}</p>
              <p className="mt-1 font-cormorant text-2xl font-medium text-velour-black">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="border border-gray-100 bg-white p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-cormorant text-2xl font-medium text-velour-black">Recent Orders</h2>
                <p className="mt-1 text-sm text-gray-400">Track status and open order details.</p>
              </div>
              <Link href="/orders" className="text-xs uppercase tracking-widest text-burgundy-900 hover:underline">
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="border border-dashed border-gray-200 py-12 text-center">
                <ShoppingBag size={32} className="mx-auto text-gray-300" />
                <p className="mt-4 text-sm text-gray-500">No orders yet.</p>
                <Link href="/shop" className="mt-5 inline-flex btn-outline">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <Link
                    key={order._id.toString()}
                    href={`/orders/${order.orderNumber}`}
                    className="flex flex-col gap-3 py-4 transition-colors hover:bg-ivory-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-mono text-sm font-medium text-burgundy-900">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {format(new Date(order.createdAt), "MMM d, yyyy")} - {order.items?.length ?? 0} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-velour-black">{money(order.total)}</span>
                      <span className="rounded-full bg-burgundy-50 px-3 py-1 text-[10px] uppercase tracking-wider text-burgundy-900">
                        {order.orderStatus}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-8">
            <section className="border border-gray-100 bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-burgundy-900 text-ivory-50">
                    <UserRound size={20} />
                  </div>
                )}
                <div>
                  <h2 className="font-cormorant text-xl font-medium text-velour-black">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </section>

            <section className="border border-gray-100 bg-white p-6 shadow-card">
              <h2 className="font-cormorant text-xl font-medium text-velour-black">Default Address</h2>
              {defaultAddress ? (
                <div className="mt-4 text-sm leading-7 text-gray-600">
                  <p className="font-medium text-velour-black">{defaultAddress.fullName}</p>
                  <p>{defaultAddress.addressLine1}</p>
                  {defaultAddress.addressLine2 && <p>{defaultAddress.addressLine2}</p>}
                  <p>
                    {defaultAddress.city}, {defaultAddress.province}
                  </p>
                  <p>{defaultAddress.phone}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No saved address yet. Your checkout address will appear here after orders are placed.</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
