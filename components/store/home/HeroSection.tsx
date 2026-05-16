"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HeroSlide, StorefrontSettings } from "@/lib/storefront-settings";
import { BRAND_NAME } from "@/lib/brand";
import BrandPoweredBy from "@/components/ui/BrandPoweredBy";

const fallbackSlides: HeroSlide[] = [
  {
    id: "signature-edit",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2400&q=85",
    alt: "Editorial luxury fashion campaign in warm sunlight",
    eyebrow: "Signature Edit",
    title: "Future Heirloom Fashion",
    position: "center 40%",
    enabled: true,
  },
  {
    id: "precision-tailoring",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?auto=format&fit=crop&w=2400&q=85",
    alt: "Tailored luxury suit detail for premium fashion",
    eyebrow: "Precision Tailoring",
    title: "Tailored for Presence",
    position: "center center",
    enabled: true,
  },
  {
    id: "new-season",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2400&q=85",
    alt: "Modern fashion silhouette in a refined studio mood",
    eyebrow: "New Season",
    title: "Modern Luxury in Motion",
    position: "center 34%",
    enabled: true,
  },
  {
    id: "evening-atelier",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=2400&q=85",
    alt: "Premium contemporary occasionwear with elegant movement",
    eyebrow: "Evening Atelier",
    title: "Quiet Power, Precisely Cut",
    position: "center 45%",
    enabled: true,
  },
];

export default function HeroSection({
  hero,
}: {
  hero?: StorefrontSettings["hero"];
}) {
  const slides = useMemo(() => {
    const activeSlides = hero?.slides?.filter((slide) => slide.enabled && slide.image.trim());
    return activeSlides?.length ? activeSlides : fallbackSlides;
  }, [hero?.slides]);
  const slideDurationMs = hero?.slideDurationMs ?? 4200;
  const transitionDurationMs = hero?.transitionDurationMs ?? 700;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || slides.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length);
    }, slideDurationMs);

    return () => window.clearInterval(interval);
  }, [slideDurationMs, slides.length]);

  const safeActiveSlide = activeSlide < slides.length ? activeSlide : 0;
  const activeSlideData = slides[safeActiveSlide] ?? slides[0];

  return (
    <section className="relative isolate min-h-[640px] overflow-hidden bg-velour-black text-ivory-50 sm:min-h-[700px] lg:min-h-[calc(100svh-7rem)]">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity ease-out ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: `${transitionDurationMs}ms` }}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.position || "center center" }}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,13,14,0.92)_0%,rgba(13,13,14,0.76)_38%,rgba(13,13,14,0.34)_78%,rgba(13,13,14,0.18)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,13,14,0.28)_0%,transparent_38%,rgba(13,13,14,0.72)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="w-full max-w-[42rem] pt-2 sm:pt-0">
          <div className="mb-5 inline-flex max-w-full items-center gap-3 border border-ivory-50/20 bg-velour-black/25 px-4 py-2 backdrop-blur-md">
            <span className="h-px w-7 bg-gold-400" />
            <span className="truncate text-[10px] font-medium uppercase tracking-[0.28em] text-gold-300 sm:text-xs">
              {activeSlideData.eyebrow}
            </span>
          </div>

          <h1 className="font-cormorant font-light tracking-normal text-ivory-50 drop-shadow-[0_18px_44px_rgba(0,0,0,0.36)]">
            <span className="block text-[clamp(2.9rem,8vw,6.2rem)] leading-[0.88]">
              {BRAND_NAME}
            </span>
            <BrandPoweredBy
              mode="hero"
              variant="light"
              size="lg"
              className="mt-5 justify-start text-gold-200"
            />
            <span className="mt-4 block max-w-[14ch] text-[clamp(2.9rem,7vw,5.4rem)] leading-[0.92] text-gold-300 sm:max-w-[15ch] lg:max-w-[16ch]">
              {activeSlideData.title}
            </span>
          </h1>

          <p className="mt-6 max-w-[38rem] text-sm font-light leading-7 text-ivory-100/84 sm:mt-8 sm:text-base sm:leading-8">
            Sculpted suits and occasion pieces for women who collect presence:
            luminous fabrics, precise tailoring, and a refined future-facing mood.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href="/shop"
              className="group inline-flex min-h-14 items-center justify-center gap-3 bg-gold-500 px-7 py-4 text-center text-xs font-semibold uppercase tracking-widest text-velour-black transition-all duration-300 hover:bg-gold-300 sm:px-9"
            >
              Explore Collection
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop?collection=new"
              className="inline-flex min-h-14 items-center justify-center border border-ivory-50/45 px-7 py-4 text-center text-xs font-medium uppercase tracking-widest text-ivory-50 transition-all duration-300 hover:border-gold-300 hover:text-gold-300 sm:px-9"
            >
              New Arrivals
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 right-4 z-20 flex items-center gap-2 sm:bottom-8 sm:right-6 lg:right-8">
          {slides.map((slide, index) => (
            <button
              key={slide.eyebrow}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Show ${slide.eyebrow} slide`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === safeActiveSlide ? "w-10 bg-gold-400" : "w-2 bg-ivory-50/35 hover:bg-ivory-50/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
