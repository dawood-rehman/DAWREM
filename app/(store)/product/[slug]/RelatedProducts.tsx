import ProductCard from "@/components/store/ProductCard";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  averageRating?: number;
  reviewCount?: number;
}

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="py-16 bg-ivory-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="section-subtitle">You May Also Like</p>
          <h2 className="font-cormorant text-3xl text-velour-black font-light">Related Products</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
