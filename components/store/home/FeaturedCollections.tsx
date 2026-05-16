import Link from "next/link";
import Image from "next/image";
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

interface Props {
  products: Product[];
}

const collections = [
  {
    title: "Formal Elegance",
    subtitle: "Office to Evening",
    href: "/shop?category=formal",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=800&q=80",
    color: "from-burgundy-900/80",
  },
  {
    title: "Casual Chic",
    subtitle: "Effortless Style",
    href: "/shop?category=casual",
    image: "https://images.unsplash.com/photo-1562572159-4efd90d578ff?w=800&q=80",
    color: "from-velour-black/80",
  },
  {
    title: "Bridal Dreams",
    subtitle: "Your Special Day",
    href: "/shop?category=bridal",
    image: "https://images.unsplash.com/photo-1546940901-2fd24c0c6c9e?w=800&q=80",
    color: "from-gold-900/70",
  },
];

export default function FeaturedCollections({ products }: Props) {
  return (
    <section className="bg-ivory-50 py-14 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-16">
          <p className="section-subtitle">Curated For You</p>
          <h2 className="section-title mb-4">Featured Collections</h2>
          <div className="gold-divider" />
        </div>

        {/* Collection banners */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:mb-20 md:grid-cols-3">
          {collections.map((col) => (
            <Link
              key={col.title}
              href={col.href}
              className="group relative block h-64 overflow-hidden sm:h-72 lg:h-96"
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${col.color} to-transparent/0`}
              />
              <div className="absolute bottom-0 left-0 p-5 sm:p-8">
                <p className="text-gold-300 text-[10px] tracking-widest uppercase mb-2">
                  {col.subtitle}
                </p>
                <h3 className="text-ivory-50 font-cormorant text-2xl font-medium mb-3">
                  {col.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-ivory-50 text-xs tracking-widest uppercase group-hover:gap-4 transition-all duration-300">
                  Shop Now <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured products */}
        {products.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/shop" className="btn-outline">
                View All Products
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
