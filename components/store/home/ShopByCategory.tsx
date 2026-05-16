// ShopByCategory.tsx
"use client";
import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "Formal Wear", slug: "formal", image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80", count: "120+ Pieces" },
  { name: "Casual Suits", slug: "casual", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80", count: "85+ Pieces" },
  { name: "Bridal", slug: "bridal", image: "https://images.unsplash.com/photo-1546940901-2fd24c0c6c9e?w=600&q=80", count: "60+ Pieces" },
  { name: "Festive", slug: "festive", image: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&q=80", count: "95+ Pieces" },
  { name: "Lawn Collection", slug: "lawn", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80", count: "150+ Pieces" },
  { name: "Winter Wear", slug: "winter", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80", count: "70+ Pieces" },
];

export function ShopByCategory() {
  return (
    <section className="bg-ivory-50 py-14 transition-colors duration-300 dark:bg-velour-black sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-16">
          <p className="text-gold-400 text-xs tracking-[4px] uppercase mb-3 font-inter">Browse</p>
          <h2 className="mb-4 font-cormorant text-3xl font-light text-velour-black dark:text-ivory-50 sm:text-4xl lg:text-5xl">Shop by Category</h2>
          <div className="w-16 h-px bg-gold-500 mx-auto" />
        </div>
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-5">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-md shadow-[var(--shadow-card-premium)] sm:aspect-[2/3]">
              <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-velour-black via-velour-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-4 sm:p-4">
                <p className="text-ivory-50 font-cormorant text-xl font-medium leading-tight sm:text-base">{cat.name}</p>
                <p className="text-gold-400 text-[10px] tracking-wider mt-0.5">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShopByCategory;
