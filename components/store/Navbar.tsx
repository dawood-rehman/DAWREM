"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Sun,
  Moon,
  MapPin,
} from "lucide-react";
import DawremLogo from "@/components/ui/Logo";
import LoginPromptModal from "@/components/ui/LoginPromptModal";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useTheme } from "@/components/theme/ThemeProvider";

const navLinks = [
  { label: "Shop", href: "/shop" },
  {
    label: "Collections",
    href: "#",
    children: [
      { label: "New Arrivals", href: "/shop?collection=new" },
      { label: "Formal Wear", href: "/shop?category=formal" },
      { label: "Casual Suits", href: "/shop?category=casual" },
      { label: "Bridal", href: "/shop?category=bridal" },
      { label: "Festive", href: "/shop?category=festive" },
    ],
  },
  { label: "Sale", href: "/shop?sale=true" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [wishlistPromptOpen, setWishlistPromptOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { theme, mounted, toggleTheme } = useTheme();
  const cartCount = useCartStore((s) => s.totalItems());
  const storedWishlistCount = useWishlistStore((s) => s.items.length);
  const hydratedCartCount = mounted ? cartCount : 0;
  const wishlistCount = mounted && status === "authenticated" ? storedWishlistCount : 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMobileOpen(false);
      setSearchOpen(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", mobileOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [mobileOpen]);

  const handleWishlistNavigation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (status !== "authenticated") {
      event.preventDefault();
      setWishlistPromptOpen(true);
    }
  };

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50">
        {/* Announcement Bar */}
        <div className="announcement-bar text-center py-2 text-xs tracking-widest">
          DAWRÉM NEW SEASON EDIT &nbsp;|&nbsp; PREMIUM SUITS CURATED FOR MODERN ELEGANCE
        </div>

        <header
          className={`relative z-50 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ${
            isScrolled
              ? "border-[var(--header-border)] shadow-[var(--shadow-navbar)]"
              : "border-transparent"
          }`}
          style={{
            backgroundColor: isScrolled
              ? "var(--header-bg-scrolled)"
              : "var(--header-bg)",
          }}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="lg:hidden" aria-label="Home">
              <DawremLogo size="md" showText={false} />
            </Link>

            {/* Desktop nav - left */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="flex items-center gap-1 py-2 text-xs uppercase text-[var(--color-text)] transition-colors hover:text-[var(--color-brand)]">
                      {link.label}
                      <ChevronDown size={12} className={`transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === link.label && (
                      <div className="absolute top-full left-0 z-50 mt-0 min-w-[200px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-2 shadow-[var(--shadow-card-premium)] backdrop-blur-xl">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-5 py-3 text-xs text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-brand)]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`border-b text-xs uppercase transition-colors hover:text-[var(--color-brand)] ${
                      pathname === link.href ? "border-gold-500 text-[var(--color-brand)]" : "border-transparent text-[var(--color-text)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Center logo */}
            <Link href="/" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
              <DawremLogo size="md" showText={false} />
            </Link>

            {/* Right actions */}
            <div className="hidden items-center gap-4 lg:flex">
              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-[var(--color-text)] transition-colors hover:text-[var(--color-brand)]"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="hidden h-9 w-9 items-center justify-center border border-transparent text-[var(--color-text)] transition-colors hover:border-[var(--color-border)] hover:text-[var(--color-brand)] lg:flex"
                aria-label="Toggle dark mode"
                aria-pressed={mounted ? theme === "dark" : undefined}
                title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {!mounted ? (
                  <Moon size={18} className="opacity-0" />
                ) : theme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )}
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={handleWishlistNavigation}
                className="relative text-[var(--color-text)] transition-colors hover:text-[var(--color-brand)]"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-burgundy-900 text-ivory-50 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-[var(--color-text)] transition-colors hover:text-[var(--color-brand)]"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {hydratedCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-burgundy-900 text-ivory-50 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {hydratedCartCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              {session ? (
                <div className="relative group">
                  <button type="button" className="flex items-center gap-1.5 text-[var(--color-text)] transition-colors hover:text-[var(--color-brand)]">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="avatar"
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                    <span className="hidden lg:block text-xs tracking-wider">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 mt-2 min-w-[190px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-2 opacity-0 shadow-[var(--shadow-card-premium)] backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    {session.user?.role === "admin" && (
                      <Link href="/admin/dashboard" className="block px-5 py-3 text-xs font-medium text-[var(--color-brand)] hover:bg-[var(--color-surface-muted)]">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/account" className="block px-5 py-3 text-xs hover:bg-[var(--color-surface-muted)]">
                      My Account
                    </Link>
                    <Link href="/account/settings" className="block px-5 py-3 text-xs hover:bg-[var(--color-surface-muted)]">
                      Settings
                    </Link>
                    <Link href="/orders" className="block px-5 py-3 text-xs hover:bg-[var(--color-surface-muted)]">
                      My Orders
                    </Link>
                    <Link href="/wishlist" className="block px-5 py-3 text-xs hover:bg-[var(--color-surface-muted)]">
                      Wishlist
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="mt-1 block w-full border-t border-[var(--color-border)] px-5 py-3 text-left text-xs text-red-600 hover:bg-[var(--color-surface-muted)]"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-[var(--color-text)] transition-colors hover:text-[var(--color-brand)]"
                  aria-label="Login"
                >
                  <User size={20} />
                </Link>
              )}
            </div>

            <button
              type="button"
              className="lg:hidden flex h-10 w-10 items-center justify-center text-[var(--color-text)] transition-colors hover:text-[var(--color-brand)]"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            searchOpen ? "max-h-20 border-t border-gray-100" : "max-h-0"
          }`}
        >
          <div className="max-w-2xl mx-auto px-4 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="flex items-center gap-3 border-b border-gray-300 pb-2"
            >
              <Search size={16} className="text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for suits, fabrics, occasions..."
                className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-[var(--color-text)]"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>
        </div>
        </header>
      </div>
      <div aria-hidden="true" className="h-24 lg:h-28" />

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-velour-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-dvh w-[min(20rem,100vw)] max-w-full overflow-y-auto overflow-x-hidden border-r border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-[var(--shadow-card-premium)] backdrop-blur-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <DawremLogo size="md" showText={false} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center text-[var(--color-text)]"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="mb-6 flex items-center gap-3 border-b border-[var(--color-border)] pb-3"
            >
              <Search size={18} className="text-[var(--color-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
              />
            </form>
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    className="block border-b border-[var(--color-border)] py-3 text-sm uppercase text-[var(--color-text)]"
                  >
                    {link.label}
                  </Link>
                  {link.children?.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block py-2 pl-4 text-xs tracking-wider text-gray-500 hover:text-burgundy-900"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
              <Link href="/cart" className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                <ShoppingBag size={16} />
                Cart {hydratedCartCount > 0 ? `(${hydratedCartCount})` : ""}
              </Link>
              <Link
                href="/wishlist"
                onClick={handleWishlistNavigation}
                className="flex items-center gap-3 text-sm text-[var(--color-text)]"
              >
                <Heart size={16} />
                Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-3 text-sm text-[var(--color-text)]"
              >
                {!mounted ? (
                  <Moon size={16} className="opacity-0" />
                ) : theme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
                )}
                {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              {session ? (
                <>
                  <Link href="/account" className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                    <User size={16} />
                    My Account
                  </Link>
                  <Link href="/account/settings" className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                    <User size={16} />
                    Settings
                  </Link>
                  <Link href="/orders" className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                    <MapPin size={16} />
                    Track Order
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-sm text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary block text-center"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <LoginPromptModal
        open={wishlistPromptOpen}
        onOpenChange={setWishlistPromptOpen}
        callbackUrl="/wishlist"
      />
    </>
  );
}
