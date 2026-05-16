import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gem, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Our Story",
  description: `The story behind ${BRAND_NAME} and its approach to refined women's suits, premium fabrics, and modern occasionwear.`,
};

const chapters = [
  {
    year: "01",
    title: "The Starting Point",
    text: `${BRAND_NAME} began with the belief that occasionwear should feel elevated without becoming difficult to wear, style, or maintain.`,
  },
  {
    year: "02",
    title: "The Fit Standard",
    text: "Each collection is developed around movement, proportion, fabric behavior, and the confidence a customer should feel the moment she puts it on.",
  },
  {
    year: "03",
    title: "The Digital Atelier",
    text: "We are building an ecommerce experience where sizing, support, order tracking, and product presentation feel as considered as the clothing itself.",
  },
];

const values = [
  {
    title: "Quiet Luxury",
    text: "A polished point of view built through material, finishing, and restraint.",
    icon: Gem,
  },
  {
    title: "Precise Tailoring",
    text: "Cuts and measurements are reviewed so every product page supports confident buying.",
    icon: Scissors,
  },
  {
    title: "Customer Trust",
    text: "Clear communication before checkout, after dispatch, and throughout support.",
    icon: ShieldCheck,
  },
];

export default function OurStoryPage() {
  return (
    <main className="bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="section-subtitle">Our Story</p>
            <h1 className="mt-4 font-cormorant text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
              Every piece begins with a standard, not a trend.
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              {BRAND_NAME} is shaped for women who collect clothing with presence: garments that travel from family gatherings to formal evenings with ease, polish, and personal meaning.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {values.map(({ title, text, icon: Icon }) => (
              <article key={title} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-premium)]">
                <Icon size={22} className="text-[var(--color-accent)]" />
                <h2 className="mt-5 font-cormorant text-2xl font-medium">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="section-subtitle">Mission</p>
            <h2 className="font-cormorant text-4xl font-light leading-tight sm:text-5xl">
              To make refined fashion feel clear, wearable, and deeply considered.
            </h2>
            <p className="mt-6 text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              We design the whole experience around the customer: the garment, the fit guidance, the delivery update, the support reply, and the confidence that follows.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Fabric with graceful movement", "Sizing that feels practical", "Support that answers clearly", "Collections made to last"].map((item) => (
              <div key={item} className="border-l border-[var(--color-accent)] bg-[var(--color-surface)] px-5 py-4 text-sm text-[var(--color-muted)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="section-subtitle">Journey</p>
            <h2 className="font-cormorant text-4xl font-light sm:text-5xl">A modern atelier mindset.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <article key={chapter.title} className="bg-[var(--color-page)] p-6">
                <span className="font-cormorant text-5xl font-light text-[var(--color-accent)]">{chapter.year}</span>
                <h3 className="mt-6 font-cormorant text-3xl font-medium">{chapter.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{chapter.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[var(--color-accent)]">
              <Sparkles size={18} />
              <span className="text-[10px] uppercase tracking-[0.28em]">Vision</span>
            </div>
            <h2 className="mt-4 font-cormorant text-4xl font-light leading-tight">
              A global fashion experience with a personal, composed standard.
            </h2>
          </div>
          <Link href="/shop" className="btn-primary inline-flex items-center justify-center gap-2">
            Explore Collection
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
