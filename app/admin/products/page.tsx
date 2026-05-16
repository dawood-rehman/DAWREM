"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  category: string;
  stock: number;
  images: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ admin: "true", page: String(page), limit: "15", ...(search && { search }), ...(category && { category }) });
    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products");
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setSelectedIds([]);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchProducts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchProducts]);

  const toggleField = async (id: string, field: string, value: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, [field]: value } : p));
      toast.success("Updated");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to update"));
    }
  };

  const deleteProduct = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setTotal((current) => Math.max(0, current - 1));
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
      setDeleteId(null);
      toast.success(
        data.reviewDeletedCount
          ? `Product deleted. ${data.reviewDeletedCount} reviews cleaned.`
          : "Product deleted"
      );
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to delete"));
    } finally {
      setDeleting(false);
    }
  };

  const bulkDeleteProducts = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p._id)));
      setTotal((current) => Math.max(0, current - (data.deletedCount || 0)));
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      toast.success(
        data.reviewDeletedCount
          ? `${data.deletedCount || 0} products deleted. ${data.reviewDeletedCount} reviews cleaned.`
          : `${data.deletedCount || 0} products deleted`
      );
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to delete products"));
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  };

  const allVisibleSelected = products.length > 0 && products.every((product) => selectedIds.includes(product._id));
  const deleteProductTarget = products.find((product) => product._id === deleteId);
  const selectedProducts = products.filter((product) => selectedIds.includes(product._id));

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !products.some((product) => product._id === id));
      }
      return Array.from(new Set([...current, ...products.map((product) => product._id)]));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-cormorant text-velour-black font-medium">Products</h1>
          <p className="text-sm text-gray-400 font-inter mt-1">{total} total products</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setBulkDeleteOpen(true)}
              disabled={deleting}
              className="flex items-center justify-center gap-2 rounded border border-red-200 px-4 py-2 text-xs uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-xs tracking-wider uppercase font-inter hover:border-burgundy-900 transition-colors">
            <Upload size={14} />
            Bulk Import
          </button>
          <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
            <Plus size={14} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gold-400 font-inter"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold-400 font-inter bg-white"
          >
            <option value="">All Categories</option>
            {["Formal", "Casual", "Bridal", "Festive", "Lawn", "Winter"].map((c) => (
              <option key={c} value={c.toLowerCase()}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Select", "Product", "Category", "Price", "Stock", "Published", "Featured", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-gray-500 font-inter font-medium">
                    {h === "Select" ? (
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        className="h-4 w-4 accent-gold-500"
                        aria-label="Select all visible products"
                      />
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 font-inter text-sm">No products found</td></tr>
              ) : products.map((product) => (
                <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product._id)}
                      onChange={() => toggleSelected(product._id)}
                      className="h-4 w-4 accent-gold-500"
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="40px" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-velour-black font-inter">{product.name}</p>
                        <p className="text-xs text-gray-400 font-inter">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-inter capitalize">{product.category}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium font-inter">PKR {(product.salePrice ?? product.price).toLocaleString()}</p>
                      {product.salePrice && <p className="text-xs text-gray-400 line-through font-inter">PKR {product.price.toLocaleString()}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-inter font-medium px-2 py-0.5 rounded-full ${product.stock <= 0 ? "bg-red-100 text-red-700" : product.stock <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                      {product.stock <= 0 ? "Out of stock" : `${product.stock} units`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleField(product._id, "isPublished", !product.isPublished)}>
                      {product.isPublished
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} className="text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleField(product._id, "isFeatured", !product.isFeatured)}>
                      {product.isFeatured
                        ? <ToggleRight size={22} className="text-gold-500" />
                        : <ToggleLeft size={22} className="text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/product/${product.slug}`} target="_blank" className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                        <Eye size={14} />
                      </Link>
                      <Link href={`/admin/products/${product._id}/edit`} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-velour-black rounded hover:bg-gray-100 transition-colors">
                        <Edit size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(product._id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-inter">
              Showing {(page - 1) * 15 + 1}-{Math.min(page * 15, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-200 rounded hover:border-burgundy-900 disabled:opacity-40 font-inter transition-colors">
                Prev
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page * 15 >= total} className="px-3 py-1.5 text-xs border border-gray-200 rounded hover:border-burgundy-900 disabled:opacity-40 font-inter transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-lg p-6 max-w-sm w-full shadow-xl z-10">
            <h3 className="font-cormorant text-xl text-velour-black mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 font-inter mb-6">This action cannot be undone. All associated data will be removed.</p>
            {deleteProductTarget && (
              <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                <p className="text-sm font-medium text-red-800">{deleteProductTarget.name}</p>
                <p className="text-xs text-red-500">{deleteProductTarget.slug}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button disabled={deleting} onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 py-2 text-sm font-inter hover:border-gray-400 transition-colors rounded disabled:opacity-50">Cancel</button>
              <button disabled={deleting} onClick={() => deleteProduct(deleteId)} className="flex-1 bg-red-600 text-white py-2 text-sm font-inter hover:bg-red-700 transition-colors rounded disabled:opacity-60 inline-flex items-center justify-center gap-2">
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBulkDeleteOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="font-cormorant text-xl text-velour-black mb-2">Delete Selected Products?</h3>
            <p className="text-sm text-gray-500 font-inter mb-6">
              {selectedIds.length} products will be deleted. This action cannot be undone.
            </p>
            {selectedProducts.length > 0 && (
              <div className="mb-5 max-h-40 overflow-y-auto rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                {selectedProducts.slice(0, 8).map((product) => (
                  <p key={product._id} className="truncate text-xs text-red-700">
                    {product.name}
                  </p>
                ))}
                {selectedIds.length > selectedProducts.length && (
                  <p className="mt-1 text-xs text-red-500">
                    Plus products selected from another page
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button disabled={deleting} onClick={() => setBulkDeleteOpen(false)} className="flex-1 border border-gray-300 py-2 text-sm font-inter hover:border-gray-400 transition-colors rounded disabled:opacity-50">Cancel</button>
              <button disabled={deleting} onClick={bulkDeleteProducts} className="flex-1 bg-red-600 text-white py-2 text-sm font-inter hover:bg-red-700 transition-colors rounded disabled:opacity-60 inline-flex items-center justify-center gap-2">
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
