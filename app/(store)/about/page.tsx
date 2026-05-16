import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  description:
    `Meet ${BRAND_NAME} and founder Dawood Rehman. Learn about our tailoring philosophy, materials, service standards, and modern occasionwear approach.`,
};

const values = [
  {
    title: "Precision Fit",
    text: "Cuts are refined around movement, comfort, and a confident silhouette rather than one-season spectacle.",
    icon: Ruler,
  },
  {
    title: "Considered Materials",
    text: "Fabrics are selected for drape, hand feel, durability, and how gracefully they photograph in real moments.",
    icon: Sparkles,
  },
  {
    title: "Service With Care",
    text: "Product details, order support, and after-sales communication are designed to feel clear and dependable.",
    icon: ShieldCheck,
  },
];

const process = [
  "Mood and market research",
  "Fabric and trim selection",
  "Pattern refinement",
  "Stitching quality checks",
  "Final styling and dispatch",
];

const standards = [
  "Premium fabric choices with a focus on drape and finish.",
  "Measurements and product details written for confident online shopping.",
  "Responsive customer support before and after every order.",
  "A polished unboxing experience for gifting and occasionwear.",
];

export default async function AboutPage() {
  const { about } = await getStorefrontSettings();
  const ownerName = about.ownerName || "Dawood Rehman";
  const ownerRole = about.ownerRole || "Founder & Creative Director";
  const ownerImageUrl = about.ownerImageUrl.trim();

  return (
    <main className="bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <p className="section-subtitle">About {BRAND_NAME}</p>
            <h1 className="mt-4 max-w-4xl font-cormorant text-5xl font-light leading-[0.98] text-[var(--color-text)] sm:text-6xl lg:text-7xl">
              Modern occasionwear shaped by discipline, detail, and quiet presence.
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              {BRAND_NAME} creates refined suits and occasion pieces for women who want elegance
              that lasts beyond a single event. Every collection balances graceful fabric,
              precise tailoring, and an understated point of view.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/shop" className="btn-primary inline-flex items-center justify-center gap-2">
                Shop Collection
                <ArrowRight size={14} />
              </Link>
              <Link href="/feedback" className="btn-outline inline-flex items-center justify-center">
                Contact The Team
              </Link>
            </div>
          </div>

          <aside className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-premium)]">
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-surface-muted)]">
              {ownerImageUrl ? (
                <Image
                  src={ownerImageUrl}
                  alt={`${ownerName} portrait`}
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-24 w-24 items-center justify-center border border-[var(--color-accent)] font-cormorant text-4xl text-[var(--color-accent)]">
                    DR
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Founder Portrait
                  </p>
                </div>
              )}
            </div>
            <div className="pt-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Owner
              </p>
              <h2 className="mt-2 font-cormorant text-3xl font-medium leading-none">
                {ownerName}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{ownerRole}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="section-subtitle">Founder Note</p>
            <h2 className="mt-3 font-cormorant text-4xl font-light leading-tight sm:text-5xl">
              A brand built for women who collect pieces with purpose.
            </h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
            <p>
              Founded by {ownerName}, {BRAND_NAME} is guided by a simple belief: luxury should feel
              composed, wearable, and personal. The brand is made for wardrobes where each piece
              earns its place through fit, fabric, and feeling.
            </p>
            <p>
              Our team studies the rhythm of real occasions: long celebrations, family gatherings,
              work dinners, and formal moments where comfort matters as much as polish.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-subtitle">What Defines Us</p>
              <h2 className="mt-3 font-cormorant text-4xl font-light sm:text-5xl">
                The {BRAND_NAME} standard
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--color-muted)]">
              A quieter kind of fashion: measured, polished, and intentionally made.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {values.map(({ title, text, icon: Icon }) => (
              <article key={title} className="border border-[var(--color-border)] bg-[var(--color-page)] p-6">
                <Icon size={20} className="text-[var(--color-accent)]" />
                <h3 className="mt-5 font-cormorant text-2xl font-medium">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <p className="section-subtitle">How We Work</p>
            <h2 className="mt-3 font-cormorant text-4xl font-light sm:text-5xl">
              From first sketch to final dispatch.
            </h2>
            <div className="mt-8 space-y-4">
              {process.map((item, index) => (
                <div key={item} className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--color-accent)] text-xs text-[var(--color-accent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--color-surface)] p-6 sm:p-8">
            <div className="flex items-center gap-3 text-[var(--color-accent)]">
              <Clock size={18} />
              <span className="text-[10px] uppercase tracking-[0.28em]">Service Promise</span>
            </div>
            <h3 className="mt-5 font-cormorant text-3xl font-light leading-tight sm:text-4xl">
              Built for trust before checkout and confidence after delivery.
            </h3>
            <ul className="mt-7 space-y-4">
              {standards.map((standard) => (
                <li key={standard} className="flex gap-3 text-sm leading-7 text-[var(--color-muted)]">
                  <Check size={16} className="mt-1 shrink-0 text-[var(--color-accent)]" />
                  <span>{standard}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
