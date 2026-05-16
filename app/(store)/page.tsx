import type { Metadata } from "next";
import HeroSection from "@/components/store/home/HeroSection";
import FeaturedCollections from "@/components/store/home/FeaturedCollections";
import NewArrivals from "@/components/store/home/NewArrivals";
import ShopByCategory from "@/components/store/home/ShopByCategory";
import Bestsellers from "@/components/store/home/Bestsellers";
import TestimonialsSection from "@/components/store/home/TestimonialsSection";
import InstagramGrid from "@/components/store/home/InstagramGrid";
import BrandValues from "@/components/store/home/BrandValues";
import { connectDB } from "@/lib/mongodb";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import Product from "@/models/Product";

export const metadata: Metadata = {
  title: "DAWRÉM - Future Heirloom Fashion",
  description:
    "Discover DAWRÉM - luxury women's suits and occasionwear with modern tailoring, luminous fabrics, and refined presence.",
};

interface HomeProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  averageRating?: number;
  reviewCount?: number;
}

interface HomeProductDocument {
  _id: { toString: () => string };
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images?: string[];
  category: string;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  averageRating?: number;
  reviewCount?: number;
}

function serializeProduct(product: HomeProductDocument): HomeProduct {
  return {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    price: product.price,
    salePrice: product.salePrice,
    images: product.images || [],
    category: product.category,
    isNewArrival: product.isNewArrival,
    isBestseller: product.isBestseller,
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
  };
}

async function getHomeData(): Promise<{
  featured: HomeProduct[];
  newArrivals: HomeProduct[];
  bestsellers: HomeProduct[];
}> {
  try {
    await connectDB();
    const [featured, newArrivals, bestsellers] = await Promise.all([
      Product.find({ isFeatured: true, isPublished: true })
        .limit(6)
        .select("name slug price salePrice images category isNewArrival")
        .lean<HomeProductDocument[]>(),
      Product.find({ isNewArrival: true, isPublished: true })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("name slug price salePrice images category")
        .lean<HomeProductDocument[]>(),
      Product.find({ isBestseller: true, isPublished: true })
        .sort({ totalSold: -1 })
        .limit(8)
        .select("name slug price salePrice images category totalSold averageRating reviewCount")
        .lean<HomeProductDocument[]>(),
    ]);
    return {
      featured: featured.map(serializeProduct),
      newArrivals: newArrivals.map(serializeProduct),
      bestsellers: bestsellers.map(serializeProduct),
    };
  } catch {
    return { featured: [], newArrivals: [], bestsellers: [] };
  }
}

function getSocialUrl(
  links: Awaited<ReturnType<typeof getStorefrontSettings>>["socialLinks"],
  platform: string,
  fallback: string
) {
  const match = links.find(
    (link) =>
      link.enabled &&
      link.url &&
      [link.id.toLowerCase(), link.label.toLowerCase()].includes(platform)
  );

  return match?.url || fallback;
}

export default async function HomePage() {
  const [{ featured, newArrivals, bestsellers }, settings] = await Promise.all([
    getHomeData(),
    getStorefrontSettings(),
  ]);
  const instagramUrl = getSocialUrl(settings.socialLinks, "instagram", "https://instagram.com");

  return (
    <div className="overflow-x-hidden">
      <HeroSection hero={settings.hero} />
      <BrandValues />
      <FeaturedCollections products={featured} />
      <ShopByCategory />
      <NewArrivals products={newArrivals} />
      <Bestsellers products={bestsellers} />
      <TestimonialsSection />
      <InstagramGrid instagramUrl={instagramUrl} />
    </div>
  );
}
