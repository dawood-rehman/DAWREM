"use client";

import { useState } from "react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import AdminUploadDropzone, { type UploadedAsset } from "@/components/admin/AdminUploadDropzone";

interface Variant { size: string; color: string; colorHex: string; stock: number; sku: string; }

export interface ProductFormData {
  name: string; description: string; shortDescription: string;
  price: string; salePrice: string; stock: string; category: string; subCategory: string;
  fabric: string; occasion: string; season: string;
  tags: string; images: string[];
  sizes: string[]; colors: Array<{ name: string; hex: string }>;
  variants: Variant[];
  isPublished: boolean; isFeatured: boolean; isNewArrival: boolean; isBestseller: boolean;
  seoTitle: string; seoDescription: string;
  lowStockThreshold: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const CATEGORIES = ["Formal", "Casual", "Bridal", "Festive", "Lawn", "Winter", "Summer"];

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ProductForm({
  initialData,
  productId,
}: {
  initialData?: Partial<ProductFormData>;
  productId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "variants" | "seo" | "media">("basic");

  const [form, setForm] = useState<ProductFormData>({
    name: "", description: "", shortDescription: "", price: "", salePrice: "", stock: "0",
    category: "", subCategory: "", fabric: "", occasion: "", season: "",
    tags: "", images: [], sizes: [], colors: [],
    variants: [],
    isPublished: true, isFeatured: false, isNewArrival: false, isBestseller: false,
    seoTitle: "", seoDescription: "", lowStockThreshold: "5",
    ...initialData,
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const addImage = () => {
    if (newImageUrl.trim()) {
      update("images", [...form.images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const addUploadedImages = (assets: UploadedAsset[]) => {
    setForm((current) => ({
      ...current,
      images: [...current.images, ...assets.map((asset) => asset.url)],
    }));
  };

  const toggleSize = (size: string) => {
    update("sizes", form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size]);
  };

  const addColor = () => {
    if (newColor.name.trim()) {
      update("colors", [...form.colors, { ...newColor }]);
      setNewColor({ name: "", hex: "#000000" });
    }
  };

  const generateVariants = () => {
    const variants: Variant[] = [];
    for (const size of form.sizes) {
      for (const color of form.colors) {
        const existing = form.variants.find((v) => v.size === size && v.color === color.name);
        variants.push(existing || { size, color: color.name, colorHex: color.hex, stock: 0, sku: "" });
      }
    }
    update("variants", variants);
    toast.success("Variants generated");
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const updated = [...form.variants];
    updated[index] = { ...updated[index], [field]: value };
    update("variants", updated);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price, and category are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        stock: Math.max(0, parseInt(form.stock) || 0),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
      };

      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(productId ? "Product updated" : "Product created");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "basic", label: "Basic Info" },
    { key: "media", label: "Images" },
    { key: "variants", label: "Variants" },
    { key: "seo", label: "SEO" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-cormorant text-velour-black font-medium">
          {productId ? "Edit Product" : "New Product"}
        </h1>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="border border-gray-300 px-4 py-2 text-sm font-inter hover:border-gray-400 transition-colors rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? "Saving..." : productId ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white rounded-t-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-xs tracking-widest uppercase font-inter transition-colors ${
                  activeTab === tab.key ? "border-b-2 border-burgundy-900 text-burgundy-900" : "text-gray-400 hover:text-velour-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="admin-card">
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Product Name *</label>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="e.g. Classic Silk Formal Suit" />
                </div>

                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Short Description</label>
                  <input value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="One-line product summary" />
                </div>

                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Full Description *</label>
                  <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400 resize-none" placeholder="Detailed product description..." />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Price (PKR) *</label>
                    <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="2500" />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Sale Price (PKR)</label>
                    <input type="number" value={form.salePrice} onChange={(e) => update("salePrice", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="Leave blank if no sale" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Category *</label>
                    <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400 bg-white">
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Fabric</label>
                    <input value={form.fabric} onChange={(e) => update("fabric", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="e.g. Pure Silk" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Occasion</label>
                    <input value={form.occasion} onChange={(e) => update("occasion", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="e.g. Wedding" />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Available Stock (pieces) *</label>
                    <input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="20" />
                  </div>
                </div>

                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Low Stock Alert Threshold</label>
                  <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" />
                  <p className="mt-1 text-[11px] text-gray-400 font-inter">
                    Actual pieces customers can buy are entered in Available Stock. This field only controls admin low-stock warnings.
                  </p>
                </div>

                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => update("tags", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="silk, formal, wedding, luxury" />
                </div>
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-4">
                <AdminUploadDropzone
                  kind="product-images"
                  label="Upload product images"
                  description="Choose photos from your phone or computer. Images are optimized automatically and the first image becomes the main product photo."
                  multiple
                  maxFiles={8}
                  onUploaded={addUploadedImages}
                />

                <div className="flex gap-2">
                  <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="Cloudinary or image URL" onKeyDown={(e) => e.key === "Enter" && addImage()} />
                  <button onClick={addImage} className="btn-primary px-4">Add</button>
                </div>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative aspect-[3/4] bg-gray-100 group">
                        <NextImage
                          src={img}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 180px, 50vw"
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          onClick={() => update("images", form.images.filter((_, j) => j !== i))}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        {i === 0 && <span className="absolute bottom-2 left-2 bg-burgundy-900 text-ivory-50 text-[10px] px-2 py-0.5">Main</span>}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 font-inter">First image is the main product photo. Drag to reorder (coming soon).</p>
              </div>
            )}

            {activeTab === "variants" && (
              <div className="space-y-6">
                {/* Sizes */}
                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-3">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 text-xs border rounded transition-colors font-inter ${
                          form.sizes.includes(size) ? "border-burgundy-900 bg-burgundy-900 text-ivory-50" : "border-gray-300 hover:border-burgundy-900"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-3">Colors</label>
                  <div className="flex gap-2 mb-3">
                    <input value={newColor.name} onChange={(e) => setNewColor((c) => ({ ...c, name: e.target.value }))} placeholder="Color name (e.g. Royal Blue)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-inter outline-none focus:border-gold-400" />
                    <input type="color" value={newColor.hex} onChange={(e) => setNewColor((c) => ({ ...c, hex: e.target.value }))} className="w-12 h-10 border border-gray-200 rounded cursor-pointer" />
                    <button onClick={addColor} className="btn-primary px-4 py-2 text-xs">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color.hex }} />
                        <span className="text-xs font-inter">{color.name}</span>
                        <button onClick={() => update("colors", form.colors.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 ml-1"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate variants */}
                {form.sizes.length > 0 && form.colors.length > 0 && (
                  <button onClick={generateVariants} className="btn-outline text-sm">
                    Generate {form.sizes.length * form.colors.length} Variant Combinations
                  </button>
                )}

                {/* Variant table */}
                {form.variants.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-inter">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {["Size", "Color", "Stock", "SKU"].map((h) => (
                            <th key={h} className="py-2 px-3 text-left text-[10px] tracking-wider uppercase text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants.map((v, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2 px-3">{v.size}</td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: v.colorHex }} />
                                {v.color}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                                className="w-20 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-gold-400"
                                min="0"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => updateVariant(i, "sku", e.target.value)}
                                className="w-32 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-gold-400"
                                placeholder="SKU-001"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">SEO Title</label>
                  <input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400" placeholder="Leave blank to use product name" />
                  <p className="text-[11px] text-gray-400 mt-1 font-inter">{form.seoTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Meta Description</label>
                  <textarea value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400 resize-none" placeholder="Brief description for search engines (160 chars max)" />
                  <p className="text-[11px] text-gray-400 mt-1 font-inter">{form.seoDescription.length}/160 characters</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <div className="admin-card">
            <h3 className="text-xs tracking-widest uppercase text-gray-500 font-inter font-medium mb-4">Status</h3>
            <div className="space-y-3">
              {[
                { key: "isPublished", label: "Published", desc: "Visible in the store" },
                { key: "isFeatured", label: "Featured", desc: "Show on homepage" },
                { key: "isNewArrival", label: "New Arrival", desc: "Show in new arrivals" },
                { key: "isBestseller", label: "Bestseller", desc: "Show in bestsellers" },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-inter font-medium text-velour-black">{label}</p>
                    <p className="text-[11px] text-gray-400 font-inter">{desc}</p>
                  </div>
                  <div
                    onClick={() => update(key, !form[key as keyof ProductFormData])}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                      form[key as keyof ProductFormData] ? "bg-burgundy-900" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[key as keyof ProductFormData] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
