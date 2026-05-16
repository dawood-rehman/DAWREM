import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import EditProductClient from "./EditProductClient";

interface Props { params: Promise<{ id: string }> }
interface ProductForEdit {
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  salePrice?: number;
  stock?: number;
  category?: string;
  subCategory?: string;
  fabric?: string;
  occasion?: string;
  season?: string;
  tags?: string[];
  images?: string[];
  sizes?: string[];
  colors?: Array<{ name: string; hex: string }>;
  variants?: Array<{ size: string; color: string; colorHex: string; stock: number; sku: string }>;
  isPublished?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  lowStockThreshold?: number;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id).lean<ProductForEdit>();
  if (!product) notFound();

  const initial = {
    name: product.name || "",
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    price: String(product.price || ""),
    salePrice: String(product.salePrice || ""),
    stock: String(product.stock ?? 0),
    category: product.category || "",
    subCategory: product.subCategory || "",
    fabric: product.fabric || "",
    occasion: product.occasion || "",
    season: product.season || "",
    tags: (product.tags || []).join(", "),
    images: product.images || [],
    sizes: product.sizes || [],
    colors: product.colors || [],
    variants: product.variants || [],
    isPublished: product.isPublished ?? true,
    isFeatured: product.isFeatured ?? false,
    isNewArrival: product.isNewArrival ?? false,
    isBestseller: product.isBestseller ?? false,
    seoTitle: product.seoTitle || "",
    seoDescription: product.seoDescription || "",
    lowStockThreshold: String(product.lowStockThreshold || "5"),
  };

  return (
    <EditProductClient
      productId={id}
      initialData={JSON.parse(JSON.stringify(initial))}
    />
  );
}
