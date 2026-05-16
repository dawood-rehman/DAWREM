import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle, PackageCheck, RefreshCw, Ruler } from "lucide-react";
import FAQAccordion from "./FAQAccordion";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about ${BRAND_NAME} orders, shipping, sizing, returns, accounts, and support.`,
};

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Delivery timelines vary by city, courier availability, product readiness, and order volume. Confirmed orders can be checked from the Track Your Order page.",
  },
  {
    question: "Can I change my order after placing it?",
    answer: "Contact support as soon as possible with your order number. Changes are easiest before an order is packed or shipped.",
  },
  {
    question: "How do I choose the right size?",
    answer: "Use the size guide and compare the measurements with a garment that fits you well. If you are between sizes, contact support before checkout.",
  },
  {
    question: "Do you support returns or exchanges?",
    answer: "Eligible returns and exchanges depend on item condition, product category, and timing. Start by submitting a Return / Exchange request from Contact Us.",
  },
  {
    question: "Where can I see my previous orders?",
    answer: "Sign in and open My Orders from the account menu to see order history, statuses, totals, and order details.",
  },
  {
    question: `How do I contact the ${BRAND_NAME} team?`,
    answer: "Use the Contact Us page for support, complaints, suggestions, returns, exchanges, and general feedback. Every message creates a ticket for follow-up.",
  },
];

const supportLinks = [
  { label: "Track Your Order", href: "/track-order", icon: PackageCheck },
  { label: "Size Guide", href: "/size-guide", icon: Ruler },
  { label: "Returns & Exchanges", href: "/feedback?type=return_exchange", icon: RefreshCw },
];

export default function FAQsPage() {
  return (
    <main className="bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="section-subtitle">Support</p>
            <h1 className="mt-4 max-w-4xl font-cormorant text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
              Answers that make shopping feel effortless.
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              Quick guidance for delivery, sizing, order changes, returns, exchanges, account access, and customer support.
            </p>
          </div>
          <aside className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-premium)]">
            <HelpCircle size={26} className="text-[var(--color-accent)]" />
            <h2 className="mt-5 font-cormorant text-3xl font-light">Need more help?</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Send a support ticket and include your order number if your question is order-specific.
            </p>
            <Link href="/feedback" className="btn-outline mt-6 inline-flex w-full items-center justify-center gap-2">
              Contact Support
              <ArrowRight size={14} />
            </Link>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-28">
            <p className="section-subtitle">Popular Actions</p>
            <div className="mt-4 space-y-3">
              {supportLinks.map(({ label, href, icon: Icon }) => (
                <Link key={label} href={href} className="flex items-center justify-between border border-[var(--color-border)] px-4 py-3 text-sm transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                  <span className="flex items-center gap-3">
                    <Icon size={16} />
                    {label}
                  </span>
                  <span aria-hidden>+</span>
                </Link>
              ))}
            </div>
          </aside>
          <FAQAccordion items={faqs} />
        </div>
      </section>
    </main>
  );
}
