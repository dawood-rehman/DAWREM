"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ayesha Malik",
    city: "Lahore",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80",
    rating: 5,
    text: "DAWRÉM has completely transformed my wardrobe. The quality of the fabric is exceptional and the stitching is impeccable. I've received so many compliments at every event I've worn these suits to.",
    product: "Formal Silk Suit",
  },
  {
    id: 2,
    name: "Fatima Zahra",
    city: "Karachi",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&q=80",
    rating: 5,
    text: "I ordered the bridal collection for my wedding and it was everything I dreamed of. The attention to detail in every embroidery and the delivery was right on time. Absolutely in love!",
    product: "Bridal Embroidered Set",
  },
  {
    id: 3,
    name: "Sara Ahmed",
    city: "Islamabad",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    rating: 5,
    text: "As someone who shops for premium brands, DAWRÉM stands out for its consistency. Every piece I've ordered has been true to size, true to color, and always beautifully packaged.",
    product: "Casual Lawn Collection",
  },
  {
    id: 4,
    name: "Nadia Hussain",
    city: "Faisalabad",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    rating: 5,
    text: "The customer service is as luxurious as the clothes. When I had a query about sizing, they responded within minutes and helped me choose the perfect fit. Will definitely order again.",
    product: "Winter Festive Suit",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? "#C9A84C" : "none"} stroke="#C9A84C" strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((a) => (a + 1) % testimonials.length);
  const t = testimonials[active];

  return (
    <section className="relative overflow-hidden bg-ivory-50 px-0 py-14 transition-colors duration-300 dark:bg-velour-black sm:py-20 lg:py-24">
      {/* Decorative background text */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 max-w-full -translate-x-1/2 -translate-y-1/2 select-none overflow-hidden whitespace-nowrap font-cormorant text-[clamp(4rem,16vw,11rem)] font-light text-burgundy-900/[0.03]">
        REVIEWS
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14 lg:mb-16">
          <p className="section-subtitle">What They Say</p>
          <h2 className="section-title mb-4">Client Love</h2>
          <div className="gold-divider" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Quote icon */}
          <div className="absolute -top-4 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center bg-burgundy-900">
            <Quote size={18} className="text-gold-400" />
          </div>

          <div className="bg-white px-5 pb-8 pt-14 text-center shadow-luxury sm:px-8 sm:pb-10 sm:pt-16 lg:p-12 lg:pt-16">
            <Stars count={t.rating} />

            <blockquote className="mx-auto mb-8 mt-6 max-w-3xl break-words font-cormorant text-lg font-light italic leading-8 text-velour-black sm:text-xl sm:leading-9 lg:text-2xl lg:leading-relaxed">
              &quot;{t.text}&quot;
            </blockquote>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-gold-400">
                <Image src={t.image} alt={t.name} fill className="object-cover" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-inter text-sm font-medium text-velour-black">{t.name}</p>
                <p className="text-xs text-gray-400 tracking-wider">{t.city}</p>
                <p className="text-[10px] text-gold-500 tracking-widest uppercase mt-0.5">{t.product}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8 sm:gap-6">
            <button aria-label="Previous testimonial" onClick={prev} className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-gray-300 transition-all hover:border-burgundy-900 hover:bg-burgundy-900 hover:text-ivory-50">
              <ChevronLeft size={16} />
            </button>
            <div className="flex min-w-0 items-center justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={`h-1.5 transition-all duration-300 ${i === active ? "w-8 bg-burgundy-900" : "w-2 bg-gray-300"}`}
                />
              ))}
            </div>
            <button aria-label="Next testimonial" onClick={next} className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-gray-300 transition-all hover:border-burgundy-900 hover:bg-burgundy-900 hover:text-ivory-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
