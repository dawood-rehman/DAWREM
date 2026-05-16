import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  isBestseller?: boolean;
  averageRating?: number;
  reviewCount?: number;
}

export default function Bestsellers({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="bg-ivory-100 py-14 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between sm:mb-12">
          <div>
            <p className="section-subtitle">Most Loved</p>
            <h2 className="section-title">Bestsellers</h2>
          </div>
          <Link
            href="/shop?bestseller=true"
            className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-burgundy-900 hover:gap-4 transition-all font-inter"
          >
            See All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Highlight strip */}
        <div className="mt-10 flex flex-col items-start justify-between gap-6 bg-burgundy-900 p-5 sm:mt-16 sm:p-8 lg:flex-row lg:items-center lg:p-12">
          <div>
            <p className="text-gold-400 text-xs tracking-widest uppercase mb-2 font-inter">Limited Time</p>
            <h3 className="font-cormorant text-2xl font-light text-ivory-50 sm:text-3xl lg:text-4xl">
              Summer Sale — Up to 40% Off
            </h3>
            <p className="text-gray-300 text-sm mt-2 font-inter">
              On selected formal and casual collections
            </p>
          </div>
          <Link
            href="/shop?sale=true"
            className="w-full flex-shrink-0 bg-gold-500 px-8 py-4 text-center text-xs font-medium uppercase tracking-widest text-velour-black transition-colors hover:bg-gold-400 sm:w-auto sm:px-10"
          >
            Shop the Sale
          </Link>
        </div>
      </div>
    </section>
  );
}
