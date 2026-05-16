"use client";
import ProductForm, { type ProductFormData } from "@/components/admin/ProductForm";

export default function EditProductClient({
  productId,
  initialData,
}: {
  productId: string;
  initialData: Partial<ProductFormData>;
}) {
  return <ProductForm productId={productId} initialData={initialData} />;
}
