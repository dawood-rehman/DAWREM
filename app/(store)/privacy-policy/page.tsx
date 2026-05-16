import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BRAND_NAME} handles customer privacy, account data, order details, support requests, and communication preferences.`,
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "Account details such as name, email address, sign-in provider, and saved preferences.",
      "Order information including products purchased, delivery details, payment status, and support history.",
      "Messages submitted through contact, returns, exchanges, reviews, and career application forms.",
      "Operational data such as cart activity, wishlist activity, device information, and basic website analytics.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use customer information to process orders, confirm payments, deliver products, prevent fraud, provide support, improve product guidance, and send service updates.",
      "Promotional communication is only used for brand updates, collection launches, offers, and customer education where permitted by your preferences.",
    ],
  },
  {
    title: "Sharing And Service Providers",
    body: [
      "We do not sell customer personal information. Trusted providers may receive only the data needed for payment, delivery, email, analytics, hosting, automation, or support operations.",
      `Where a provider supports ${BRAND_NAME} operations, they are expected to handle information securely and only for the assigned service.`,
    ],
  },
  {
    title: "Data Protection",
    body: [
      "We use reasonable technical and organizational safeguards to protect customer information. No online system is completely risk-free, but we actively limit access and keep operational data controlled.",
      "Admin access is intended only for authorized team members who need the information to fulfil orders, support customers, or manage the store.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may update account details, unsubscribe from promotional emails, or contact support for privacy-related questions.",
      "Some order and transaction records may be retained when required for legal, accounting, fraud prevention, or customer service purposes.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="section-subtitle">Privacy</p>
            <h1 className="mt-4 max-w-4xl font-cormorant text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
              Clear protection for the information behind every order.
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              This policy explains what {BRAND_NAME} collects, why it is used, and how customer information is handled across shopping, support, account, and communication experiences.
            </p>
          </div>
          <aside className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-premium)]">
            <LockKeyhole size={26} className="text-[var(--color-accent)]" />
            <h2 className="mt-5 font-cormorant text-3xl font-light">Privacy at a glance</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--color-muted)]">
              <li>We use data to run the store and support customers.</li>
              <li>We do not sell personal information.</li>
              <li>You can contact support for account or data questions.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-28">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-accent)]">Policy Sections</p>
            <nav className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
              {sections.map((section) => (
                <a key={section.title} href={`#${section.title.toLowerCase().replaceAll(" ", "-")}`} className="block border-l border-[var(--color-border)] py-2 pl-3 transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text)]">
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-5">
            {sections.map((section) => (
              <article key={section.title} id={section.title.toLowerCase().replaceAll(" ", "-")} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
                <h2 className="font-cormorant text-3xl font-medium">{section.title}</h2>
                <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 bg-[var(--color-surface)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 text-[var(--color-accent)]" size={22} />
            <div>
              <h2 className="font-cormorant text-2xl font-medium">Need privacy support?</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">Send a message and our team will help with account or data questions.</p>
            </div>
          </div>
          <Link href="/feedback" className="btn-outline inline-flex items-center justify-center gap-2">
            <Mail size={14} />
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
}
