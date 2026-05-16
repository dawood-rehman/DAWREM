import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { Review } from "@/models/index";
import ProductDetail from "./ProductDetail";
import RelatedProducts from "./RelatedProducts";

interface Props {
  params: Promise<{ slug: string }>;
}

interface ProductPageProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  price: number;
  salePrice?: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  variants: Array<{ size: string; color: string; stock: number }>;
  stock?: number;
  fabric?: string;
  occasion?: string;
  averageRating: number;
  reviewCount: number;
  isFeatured?: boolean;
}

interface ProductReview {
  _id: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  images?: string[];
  isVerifiedPurchase?: boolean;
  adminReply?: string;
  createdAt: string;
}

interface RelatedProduct {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, isPublished: true }).lean<ProductPageProduct>();
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export async function generateStaticParams() {
  await connectDB();
  const products = await Product.find({ isPublished: true }).select("slug").lean<Array<Pick<ProductPageProduct, "slug">>>();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne({ slug, isPublished: true }).lean<ProductPageProduct>();
  if (!product) notFound();

  const reviews = await Review.find({
    productId: product._id,
    isApproved: true,
  })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(20)
    .lean<ProductReview[]>();

  const related = await Product.find({
    category: product.category,
    isPublished: true,
    _id: { $ne: product._id },
  })
    .limit(4)
    .select("name slug price salePrice images category averageRating reviewCount")
    .lean<RelatedProduct[]>();

  return (
    <div className="bg-ivory-50">
      <ProductDetail
        product={JSON.parse(JSON.stringify(product))}
        reviews={JSON.parse(JSON.stringify(reviews))}
      />
      <RelatedProducts products={JSON.parse(JSON.stringify(related))} />
    </div>
  );
}
