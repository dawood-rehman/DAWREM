import Link from "next/link";
import DawremLogo from "@/components/ui/Logo";
import type { StorefrontSettings } from "@/lib/storefront-settings";
import SocialPlatformIcon from "@/components/store/SocialPlatformIcon";
import { BRAND_NAME } from "@/lib/brand";

const footerLinks = {
  shop: [
    { label: "New Arrivals", href: "/shop?collection=new" },
    { label: "Formal Suits", href: "/shop?category=formal" },
    { label: "Casual Wear", href: "/shop?category=casual" },
    { label: "Bridal Collection", href: "/shop?category=bridal" },
    { label: "Sale Items", href: "/shop?sale=true" },
  ],
  support: [
    { label: "Track Your Order", href: "/track-order" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Returns & Exchanges", href: "/feedback?type=return_exchange" },
    { label: "Contact Us", href: "/feedback" },
    { label: "FAQs", href: "/faqs" },
  ],
  company: [
    { label: `About ${BRAND_NAME}`, href: "/about" },
    { label: "Our Story", href: "/our-story" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer({ settings }: { settings: StorefrontSettings }) {
  const activeSocialLinks = settings.socialLinks.filter((link) => link.enabled && link.url.trim());

  return (
    <footer className="border-t border-[var(--color-border)] bg-ivory-50 text-velour-black transition-colors duration-300 dark:bg-velour-black dark:text-ivory-50">
      <div className="border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-xl mx-auto">
            <p className="section-subtitle text-gold-400">Stay in the loop</p>
            <h3 className="font-cormorant text-3xl text-velour-black font-light mb-3 dark:text-ivory-50">
              Join the {BRAND_NAME} Circle
            </h3>
            <p className="text-gray-600 text-sm mb-8 dark:text-gray-400">
              Be the first to know about new collections, exclusive offers, and private sales.
              Get 10% off your first order.
            </p>
            <form className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row sm:gap-0">
              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent border-b border-[var(--color-border)] focus:border-gold-500 outline-none py-3 text-sm text-[var(--color-text)] placeholder-gray-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-gold-500 text-velour-black px-6 py-3 text-xs tracking-widest uppercase font-medium hover:bg-gold-400 transition-colors whitespace-nowrap sm:ml-4"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <DawremLogo variant="auto" size="md" className="footer-brand-logo" />
            <p className="text-gray-600 text-sm leading-relaxed mt-7 max-w-sm dark:text-gray-400">
              Sculpted for modern women who collect pieces with presence:
              precise tailoring, luminous fabrics, and quiet future-facing luxury.
            </p>

            {activeSocialLinks.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-6">
                {activeSocialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 border border-velour-black/15 flex items-center justify-center text-velour-black transition-colors hover:border-gold-500 hover:text-gold-500 dark:border-white/20 dark:text-ivory-50"
                    aria-label={link.label}
                  >
                    <SocialPlatformIcon id={link.id} label={link.label} url={link.url} size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-gold-400 mb-6 font-inter">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 text-sm transition-colors hover:text-burgundy-900 dark:text-gray-400 dark:hover:text-ivory-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-gold-400 mb-6 font-inter">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 text-sm transition-colors hover:text-burgundy-900 dark:text-gray-400 dark:hover:text-ivory-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-gold-400 mb-6 font-inter">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 text-sm transition-colors hover:text-burgundy-900 dark:text-gray-400 dark:hover:text-ivory-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="max-w-full break-words text-xs leading-5 tracking-wider text-gray-500">
              &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </p>
            <p className="text-xs leading-5 text-gray-500">
              Powered by Mirha Textile.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
