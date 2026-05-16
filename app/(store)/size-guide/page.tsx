import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info, Ruler, Shirt } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Size Guide",
  description: `${BRAND_NAME} size guide for women's suits, occasionwear, measurements, and fit support.`,
};

const sizeRows = [
  { size: "XS", bust: "32-33", waist: "26-27", hip: "36-37", shoulder: "13.5-14" },
  { size: "S", bust: "34-35", waist: "28-29", hip: "38-39", shoulder: "14-14.5" },
  { size: "M", bust: "36-37", waist: "30-31", hip: "40-41", shoulder: "14.5-15" },
  { size: "L", bust: "38-40", waist: "32-34", hip: "42-44", shoulder: "15-15.75" },
  { size: "XL", bust: "41-43", waist: "35-37", hip: "45-47", shoulder: "15.75-16.25" },
  { size: "XXL", bust: "44-46", waist: "38-40", hip: "48-50", shoulder: "16.25-17" },
];

const fitNotes = [
  {
    title: "Measure over light clothing",
    text: "Use a soft measuring tape and keep it level without pulling tightly.",
  },
  {
    title: "Compare with a loved garment",
    text: "Flat-measure a suit that fits you well and compare it with the product details.",
  },
  {
    title: "Allow room for movement",
    text: "For relaxed fits, keep one to two inches of ease around bust and hips.",
  },
];

export default function SizeGuidePage() {
  return (
    <main className="bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="section-subtitle">Fit Notes</p>
            <h1 className="mt-4 max-w-4xl font-cormorant text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
              Find the size that feels tailored to you.
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              Measurements are in inches and intended as a practical guide. For fitted occasionwear, contact support before checkout if you are between sizes.
            </p>
          </div>
          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-premium)]">
            <Ruler size={26} className="text-[var(--color-accent)]" />
            <h2 className="mt-5 font-cormorant text-3xl font-light">Need fit help?</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Share your bust, waist, hip, height, and preferred fit. The support team can guide you before ordering.
            </p>
            <Link href="/feedback" className="btn-outline mt-6 inline-flex w-full items-center justify-center gap-2">
              Ask For Sizing Help
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-subtitle">Measurements</p>
              <h2 className="font-cormorant text-4xl font-light sm:text-5xl">Standard size chart</h2>
            </div>
            <p className="text-sm text-[var(--color-muted)]">All measurements are in inches.</p>
          </div>

          <div className="hidden overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {["Size", "Bust", "Waist", "Hip", "Shoulder"].map((header) => (
                    <th key={header} className="px-5 py-5 text-[10px] uppercase tracking-[0.25em] text-[var(--color-accent)]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {sizeRows.map((row) => (
                  <tr key={row.size} className="transition-colors hover:bg-[var(--color-page)]">
                    <td className="px-5 py-5 font-cormorant text-3xl font-medium text-[var(--color-accent)]">{row.size}</td>
                    <td className="px-5 py-5 text-sm text-[var(--color-muted)]">{row.bust}</td>
                    <td className="px-5 py-5 text-sm text-[var(--color-muted)]">{row.waist}</td>
                    <td className="px-5 py-5 text-sm text-[var(--color-muted)]">{row.hip}</td>
                    <td className="px-5 py-5 text-sm text-[var(--color-muted)]">{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {sizeRows.map((row) => (
              <article key={row.size} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h3 className="font-cormorant text-3xl font-medium text-[var(--color-accent)]">{row.size}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[var(--color-muted)]">
                  <span>Bust: {row.bust}</span>
                  <span>Waist: {row.waist}</span>
                  <span>Hip: {row.hip}</span>
                  <span>Shoulder: {row.shoulder}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {fitNotes.map((note) => (
            <article key={note.title} className="bg-[var(--color-page)] p-6">
              <Shirt size={21} className="text-[var(--color-accent)]" />
              <h2 className="mt-5 font-cormorant text-2xl font-medium">{note.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{note.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-start gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm leading-7 text-[var(--color-muted)]">
          <Info size={18} className="mt-1 shrink-0 text-[var(--color-accent)]" />
          Size can vary slightly by fabric, cut, and product style. Always review the product description when a product has specific fit notes.
        </div>
      </section>
    </main>
  );
}
