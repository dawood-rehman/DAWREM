"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  ChevronUp,
  Home,
  Image,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";

const adminLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Media", href: "/admin/banners", icon: Image },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

const storeLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: ShoppingBag },
  { label: "Sale", href: "/shop?sale=true", icon: ChevronUp },
];

export default function AdminFrontendBridge() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status !== "authenticated" || session?.user?.role !== "admin") return null;

  return (
    <div className="fixed bottom-24 left-4 z-50 sm:bottom-6">
      {open && (
        <div className="mb-3 w-[min(92vw,320px)] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold-500">Admin Mode</p>
              <p className="font-cormorant text-xl text-[var(--color-text)]">Quick Switch</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
              aria-label="Close admin controls"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {adminLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text)] transition-colors hover:border-gold-500 hover:text-gold-600"
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-gray-400">Customer View</p>
            <div className="grid grid-cols-3 gap-2">
              {storeLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex min-h-10 flex-col items-center justify-center gap-1 rounded-md bg-[var(--color-surface)] text-[11px] text-[var(--color-text)] transition-colors hover:text-gold-600"
                >
                  <Icon size={13} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 items-center gap-2 rounded-full bg-burgundy-900 px-4 text-xs uppercase tracking-widest text-ivory-50 shadow-xl transition-transform hover:-translate-y-0.5 dark:bg-gold-500 dark:text-velour-black"
      >
        <LayoutDashboard size={15} />
        Admin
      </button>
    </div>
  );
}
