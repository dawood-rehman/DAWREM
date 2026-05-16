import type { Metadata } from "next";
import Link from "next/link";
import { FileText, PackageCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms Of Service",
  description: `${BRAND_NAME} terms covering orders, payments, returns, accounts, support, and website use.`,
};

const terms = [
  {
    title: "Orders And Availability",
    text: "Orders are confirmed once the required customer, delivery, and payment information is received. Product availability, pricing, promotions, and delivery timelines may change before checkout is completed.",
  },
  {
    title: "Payments",
    text: "Customers are responsible for providing accurate payment and billing information. If a payment cannot be completed, the order may remain pending, be cancelled, or require support follow-up.",
  },
  {
    title: "Delivery",
    text: "Delivery timelines depend on destination, courier availability, product readiness, and order volume. Tracking details are shared where available and can be viewed through the order tracking page.",
  },
  {
    title: "Returns And Exchanges",
    text: "Return and exchange eligibility depends on product condition, category, timing, and the information provided by the customer. Please contact support before sending any product back.",
  },
  {
    title: "Accounts",
    text: `Customers are responsible for keeping account credentials secure. ${BRAND_NAME} may restrict access connected to fraud, abuse, policy violations, or repeated failed transactions.`,
  },
  {
    title: "Website Use",
    text: "You may not misuse the website, interfere with store operations, copy protected content for commercial use, or attempt unauthorized access to systems, accounts, or data.",
  },
];

const quickLinks = [
  { label: "Track Order", href: "/track-order", icon: PackageCheck },
  { label: "Start Support Request", href: "/feedback?type=return_exchange", icon: RefreshCw },
  { label: "Privacy Policy", href: "/privacy-policy", icon: ShieldCheck },
];

export default function TermsPage() {
  return (
    <main className="bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="section-subtitle">Terms</p>
          <h1 className="mt-4 max-w-4xl font-cormorant text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
            Simple, clear terms for shopping with confidence.
          </h1>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
            These terms govern purchases, account access, customer support, returns, exchanges, and use of the {BRAND_NAME} website.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            {terms.map((term, index) => (
              <article key={term.title} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-premium)] sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--color-accent)] font-cormorant text-xl text-[var(--color-accent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-cormorant text-3xl font-medium leading-tight">{term.title}</h2>
                    <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">{term.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-premium)] lg:sticky lg:top-28">
            <FileText size={26} className="text-[var(--color-accent)]" />
            <h2 className="mt-5 font-cormorant text-3xl font-light">Helpful next steps</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Need a practical action after reading the terms? These pages handle the most common customer needs.
            </p>
            <div className="mt-6 space-y-3">
              {quickLinks.map(({ label, href, icon: Icon }) => (
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
        </div>
      </section>
    </main>
  );
}
