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
  isNewArrival?: boolean;
}

export default function NewArrivals({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="overflow-hidden bg-ivory-50 py-14 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between sm:mb-12">
          <div>
            <p className="section-subtitle">Just In</p>
            <h2 className="section-title">New Arrivals</h2>
          </div>
          <Link
            href="/shop?collection=new"
            className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-burgundy-900 hover:gap-4 transition-all duration-300 font-inter"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <div key={product._id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href="/shop?collection=new" className="btn-outline text-sm">
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
