"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Grid, List, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import toast from "react-hot-toast";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const CATEGORIES = ["Formal", "Casual", "Bridal", "Festive", "Lawn", "Winter", "Summer"];
const FABRICS = ["Cotton", "Silk", "Lawn", "Chiffon", "Khaddar", "Linen", "Velvet"];
const OCCASIONS = ["Office", "Wedding", "Party", "Casual", "Festival", "Beach"];

interface Product {
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
  sizes?: string[];
  colors?: Array<{ name: string; hex: string }>;
  stock?: number;
}

interface ShopFilters {
  category: string;
  sizes: string[];
  minPrice: string;
  maxPrice: string;
  fabric: string;
  occasion: string;
  sale: boolean;
  newArrival: boolean;
  bestseller: boolean;
  sort: string;
  search: string;
}

export default function ShopClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  // Active filters
  const [filters, setFilters] = useState<ShopFilters>({
    category: searchParams.get("category") || "",
    sizes: [] as string[],
    minPrice: "",
    maxPrice: "",
    fabric: "",
    occasion: "",
    sale: searchParams.get("sale") === "true",
    newArrival: searchParams.get("collection") === "new",
    bestseller: searchParams.get("bestseller") === "true",
    sort: "newest",
    search: searchParams.get("search") || "",
  });

  const fetchProducts = useCallback(async (targetPage = 1, reset = false) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(targetPage),
      limit: "12",
      ...(filters.category && { category: filters.category }),
      ...(filters.sizes.length && { sizes: filters.sizes.join(",") }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.fabric && { fabric: filters.fabric }),
      ...(filters.occasion && { occasion: filters.occasion }),
      ...(filters.sale && { sale: "true" }),
      ...(filters.newArrival && { newArrival: "true" }),
      ...(filters.bestseller && { bestseller: "true" }),
      ...(filters.search && { search: filters.search }),
      sort: filters.sort,
    });

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      const nextProducts = data.products || [];
      if (reset) {
        setProducts(nextProducts);
        setPage(2);
      } else {
        setProducts((prev) => [...prev, ...nextProducts]);
        setPage((p) => p + 1);
      }
      setTotal(data.total || 0);
      setHasMore(nextProducts.length === 12);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchProducts(1, true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", filterOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [filterOpen]);

  const updateFilter = <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSize = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "", sizes: [], minPrice: "", maxPrice: "",
      fabric: "", occasion: "", sale: false, newArrival: false,
      bestseller: false, sort: "newest", search: "",
    });
  };

  const applyFilters = () => {
    fetchProducts(1, true);
    setFilterOpen(false);
  };

  const activeFilterCount = useMemo(
    () =>
      [
        filters.category,
        ...filters.sizes,
        filters.minPrice,
        filters.maxPrice,
        filters.fabric,
        filters.occasion,
        filters.sale,
        filters.newArrival,
        filters.bestseller,
      ].filter(Boolean).length,
    [filters]
  );

  return (
    <div className="min-h-screen bg-ivory-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-cormorant text-4xl text-velour-black font-light">
            {filters.category || filters.newArrival ? (filters.category || "New Arrivals") : filters.sale ? "Sale" : "All Products"}
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-inter">{total} pieces</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 text-xs tracking-widest uppercase border border-gray-300 px-4 py-2.5 hover:border-burgundy-900 transition-colors lg:hidden"
          >
            <SlidersHorizontal size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="text-xs tracking-wider border border-gray-300 px-3 py-2 bg-white outline-none focus:border-gold-500 font-inter"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="bestselling">Best Selling</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* View toggle */}
            <div className="hidden md:flex border border-gray-300">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-burgundy-900 text-ivory-50" : "hover:bg-gray-50"}`}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-burgundy-900 text-ivory-50" : "hover:bg-gray-50"}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        <div
          className={`fixed inset-0 z-[120] lg:hidden ${
            filterOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-hidden={!filterOpen}
        >
          <div
            className={`absolute inset-0 bg-velour-black/55 backdrop-blur-sm transition-opacity duration-300 ${
              filterOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setFilterOpen(false)}
          />
          <section
            className={`absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-card-premium)] transition-transform duration-300 ${
              filterOpen ? "translate-y-0" : "translate-y-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold-500">Shop</p>
                <h2 className="font-cormorant text-2xl text-[var(--color-text)]">Filters</h2>
              </div>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex h-10 w-10 items-center justify-center text-[var(--color-text)]"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[calc(88dvh-150px)] overflow-y-auto px-4 py-2">
              <FiltersPanel
                filters={filters}
                activeFilterCount={activeFilterCount}
                updateFilter={updateFilter}
                toggleSize={toggleSize}
                clearFilters={clearFilters}
                applyFilters={applyFilters}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
              <button onClick={clearFilters} className="btn-outline inline-flex justify-center">
                Clear
              </button>
              <button onClick={applyFilters} className="btn-primary inline-flex justify-center">
                Apply Filters
              </button>
            </div>
          </section>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="bg-white p-6 border border-gray-100 sticky top-24">
              <FiltersPanel
                filters={filters}
                activeFilterCount={activeFilterCount}
                updateFilter={updateFilter}
                toggleSize={toggleSize}
                clearFilters={clearFilters}
                applyFilters={applyFilters}
                showApplyButton
              />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="skeleton aspect-[3/4]" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-cormorant text-2xl text-gray-400 mb-3">No products found</p>
                <p className="text-sm text-gray-400 mb-6 font-inter">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 lg:gap-6 ${viewMode === "grid" ? "grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => fetchProducts(page)}
                      disabled={loading}
                      className="btn-outline"
                    >
                      {loading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs tracking-widest uppercase font-inter font-medium text-velour-black mb-3"
      >
        {title}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function FiltersPanel({
  filters,
  activeFilterCount,
  updateFilter,
  toggleSize,
  clearFilters,
  applyFilters,
  showApplyButton = false,
}: {
  filters: ShopFilters;
  activeFilterCount: number;
  updateFilter: <K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) => void;
  toggleSize: (size: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  showApplyButton?: boolean;
}) {
  const id = useId();

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs tracking-widest uppercase font-inter font-medium text-velour-black">
          Filters
        </h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-burgundy-900 hover:underline flex items-center gap-1">
            <X size={12} /> Clear All
          </button>
        )}
      </div>

      <FilterGroup title="Category">
        {CATEGORIES.map((cat) => {
          const value = cat.toLowerCase();
          return (
            <label key={cat} className="flex items-center gap-2 cursor-pointer py-1.5">
              <input
                type="radio"
                name={`${id}-category`}
                checked={filters.category.toLowerCase() === value}
                onChange={() => updateFilter("category", filters.category.toLowerCase() === value ? "" : value)}
                className="accent-burgundy-900 w-3.5 h-3.5"
              />
              <span className="text-sm text-gray-600 font-inter">{cat}</span>
            </label>
          );
        })}
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`min-h-9 min-w-10 px-2.5 py-1 text-xs border transition-colors ${
                filters.sizes.includes(size) ? "border-burgundy-900 bg-burgundy-900 text-ivory-50" : "border-gray-300 hover:border-burgundy-900"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price (PKR)">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-1/2 border-b border-gray-300 bg-transparent py-2 text-sm outline-none focus:border-gold-500 font-inter"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-1/2 border-b border-gray-300 bg-transparent py-2 text-sm outline-none focus:border-gold-500 font-inter"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Fabric">
        {FABRICS.map((fabric) => (
          <label key={fabric} className="flex items-center gap-2 cursor-pointer py-1.5">
            <input
              type="radio"
              name={`${id}-fabric`}
              checked={filters.fabric === fabric}
              onChange={() => updateFilter("fabric", filters.fabric === fabric ? "" : fabric)}
              className="accent-burgundy-900 w-3.5 h-3.5"
            />
            <span className="text-sm text-gray-600 font-inter">{fabric}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Occasion">
        {OCCASIONS.map((occasion) => (
          <label key={occasion} className="flex items-center gap-2 cursor-pointer py-1.5">
            <input
              type="radio"
              name={`${id}-occasion`}
              checked={filters.occasion === occasion}
              onChange={() => updateFilter("occasion", filters.occasion === occasion ? "" : occasion)}
              className="accent-burgundy-900 w-3.5 h-3.5"
            />
            <span className="text-sm text-gray-600 font-inter">{occasion}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Special">
        {([
          { label: "Sale Items", key: "sale" },
          { label: "New Arrivals", key: "newArrival" },
          { label: "Bestsellers", key: "bestseller" },
        ] as Array<{ label: string; key: "sale" | "newArrival" | "bestseller" }>).map(({ label, key }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer py-1.5">
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={(e) => updateFilter(key, e.target.checked)}
              className="accent-burgundy-900 w-3.5 h-3.5"
            />
            <span className="text-sm text-gray-600 font-inter">{label}</span>
          </label>
        ))}
      </FilterGroup>

      {showApplyButton && (
        <button onClick={applyFilters} className="btn-primary mt-5 w-full justify-center">
          Apply Filters
        </button>
      )}
    </>
  );
}
