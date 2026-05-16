"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Warehouse, Tag, Image, FileText, Layers, Zap, MessageSquare,
  Star, Settings, ChevronDown, Menu, X, Home, Sparkles, BadgePercent, Info
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import DawremLogo from "@/components/ui/Logo";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Store",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
      { label: "Discounts", href: "/admin/discounts", icon: Tag },
      { label: "Content", href: "/admin/pages", icon: FileText },
    ],
  },
  {
    label: "Page Builder",
    items: [
      { label: "Section Manager", href: "/admin/sections", icon: Layers },
      { label: "Media Uploads", href: "/admin/banners", icon: Image },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Automations", href: "/admin/automations", icon: Zap },
      { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    label: "UI",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Collection", href: "/shop", icon: Sparkles },
      { label: "Sale", href: "/shop?sale=true", icon: BadgePercent },
      { label: "About", href: "/about", icon: Info },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface SidebarContentProps {
  pathname: string;
  openGroups: Record<string, boolean>;
  onToggleGroup: (label: string) => void;
  onNavigate: () => void;
}

function SidebarContent({
  pathname,
  openGroups,
  onToggleGroup,
  onNavigate,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] px-6 py-5">
        <DawremLogo size="sm" />
        <p className="ml-0.5 mt-1 font-inter text-[9px] uppercase tracking-widest text-gray-400">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <button
              type="button"
              onClick={() => onToggleGroup(group.label)}
              className="mb-1.5 flex w-full items-center justify-between rounded px-3 py-1 font-inter text-[9px] font-medium uppercase tracking-[2px] text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5"
              aria-expanded={Boolean(openGroups[group.label])}
            >
              <span>{group.label}</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${openGroups[group.label] ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ${
                openGroups[group.label] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                {group.items.map((item) => {
                  const itemPath = item.href.split("?")[0];
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(itemPath);
                  const externalStoreLink = !item.href.startsWith("/admin");

                  return (
                    <Link
                      key={`${group.label}-${item.href}`}
                      href={item.href}
                      target={externalStoreLink ? "_blank" : undefined}
                      onClick={onNavigate}
                      className={`admin-sidebar-link mb-0.5 ${active ? "active" : ""}`}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] px-4 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 font-inter text-xs text-gray-400 transition-colors hover:text-burgundy-900 dark:hover:text-gold-300"
        >
          <Home size={13} />
          View Store
        </Link>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((group) => [group.label, true]))
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }));
  };

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", mobileOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] lg:block">
        <SidebarContent
          pathname={pathname}
          openGroups={openGroups}
          onToggleGroup={toggleGroup}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed right-4 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-[var(--shadow-card-premium)] transition-colors hover:text-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 lg:hidden"
        aria-label="Open admin menu"
        aria-expanded={mobileOpen}
      >
        <Menu size={24} />
      </button>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-velour-black/55 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 z-10 h-dvh w-72 max-w-[86vw] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-[var(--shadow-card-premium)] backdrop-blur-xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-gray-400 transition-colors hover:text-[var(--color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="Close admin menu"
          >
            <X size={20} />
          </button>
          <SidebarContent
            pathname={pathname}
            openGroups={openGroups}
            onToggleGroup={toggleGroup}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>
      </div>
    </>
  );
}
