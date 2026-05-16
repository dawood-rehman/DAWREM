"use client";

import { Bell, Search, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import DawremLogo from "@/components/ui/Logo";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null; role: string };
}

export default function AdminHeader({ user }: Props) {
  const { theme, mounted, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--header-border)] bg-[var(--header-bg)] shadow-[var(--shadow-navbar)] backdrop-blur-xl lg:z-20 lg:bg-white lg:shadow-none dark:lg:bg-[var(--color-surface)]">
      <div className="flex h-16 items-center justify-between px-4 pr-16 sm:px-6 lg:h-[73px] lg:gap-4 lg:pr-6">
        <Link
          href="/admin/dashboard"
          className="flex h-12 items-center lg:hidden"
          aria-label="Admin dashboard"
        >
          <DawremLogo size="md" showText={false} />
        </Link>

        <div className="hidden max-w-md flex-1 lg:relative lg:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 font-inter text-sm outline-none transition-colors focus:border-gold-400"
          />
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {/* Notifications */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-velour-black dark:hover:bg-white/5"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-burgundy-900 rounded-full" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-velour-black dark:hover:bg-white/5"
            aria-label="Toggle dark mode"
            title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {!mounted ? (
              <Moon size={17} className="opacity-0" />
            ) : theme === "dark" ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </button>

          {/* User */}
          <div className="flex items-center gap-3 border-l border-gray-100 pl-4 dark:border-[var(--color-border)]">
            <div className="text-right">
              <p className="font-inter text-xs font-medium text-velour-black">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Admin</p>
            </div>
            {user.image ? (
              <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-gold-300">
                <Image src={user.image} alt="Admin" fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-900 font-cormorant text-xs font-medium text-ivory-50">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-400 transition-colors hover:text-red-500"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
