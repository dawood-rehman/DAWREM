"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingBag, Heart, Share2, Shield, Star, ScanEye, MessageCircle, Minus, Plus, Ruler, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import LoginPromptModal from "@/components/ui/LoginPromptModal";
import BrandPoweredBy from "@/components/ui/BrandPoweredBy";
import OutOfStockWhatsAppModal from "@/components/store/OutOfStockWhatsAppModal";
import ReviewImageUploader from "@/components/store/ReviewImageUploader";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { redirectToWhatsAppOrder } from "@/lib/whatsapp-order";
import { BRAND_NAME } from "@/lib/brand";
import { v4 as uuidv4 } from "uuid";

interface Review {
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

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
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

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ProductDetail({
  product,
  reviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [isImageInspecting, setIsImageInspecting] = useState(false);
  const [imageZoomOrigin, setImageZoomOrigin] = useState({ x: 50, y: 50 });
  const [wishlistPromptOpen, setWishlistPromptOpen] = useState(false);
  const [restockPromptOpen, setRestockPromptOpen] = useState(false);
  const displayReviews = reviews;
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { status } = useSession();

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product._id));
  const wishlistActive = status === "authenticated" && isInWishlist;

  const effectivePrice = product.salePrice ?? product.price;
  const productImages = product.images?.filter(Boolean) ?? [];
  const selectedImageSrc = productImages[selectedImage] ?? productImages[0] ?? "";
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const totalVariantStock = product.variants?.reduce(
    (sum, variant) => sum + Math.max(0, Number(variant.stock) || 0),
    0
  ) ?? 0;
  const totalAvailableStock = hasVariants ? totalVariantStock : Math.max(0, Number(product.stock) || 0);

  const getStock = () => {
    if (!selectedSize || !selectedColor) return null;
    const variant = product.variants?.find((v) => v.size === selectedSize && v.color === selectedColor);
    return variant ? Math.max(0, Number(variant.stock) || 0) : null;
  };

  const stock = getStock();
  const availableStock = stock ?? totalAvailableStock;
  const displayStock = stock ?? totalAvailableStock;
  const stockStatus =
    totalAvailableStock <= 0
      ? { label: "Out of stock", className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300" }
      : displayStock <= 5
      ? { label: `Only ${displayStock} left`, className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300" }
      : { label: "In stock", className: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300" };

  const updateImageZoomOrigin = (element: HTMLElement, clientX: number, clientY: number) => {
    const rect = element.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setImageZoomOrigin({ x, y });
  };

  const openRestockPrompt = () => {
    setRestockPromptOpen(true);
    return false;
  };

  const validateSelection = () => {
    if (totalAvailableStock <= 0) {
      return openRestockPrompt();
    }
    if (product.sizes?.length && !selectedSize) {
      toast.error("Please select a size");
      return false;
    }
    if (product.colors?.length && !selectedColor) {
      toast.error("Please select a color");
      return false;
    }
    if (stock !== null && stock <= 0) {
      return openRestockPrompt();
    }
    if (availableStock <= 0) {
      return openRestockPrompt();
    }
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} available in stock`);
      setQuantity(Math.max(availableStock, 1));
      return false;
    }

    return true;
  };

  const getSelectedOrderItem = () => ({
    name: product.name,
    slug: product.slug,
    quantity,
    size: selectedSize || "One Size",
    color: selectedColor || "Default",
    price: product.price,
    salePrice: product.salePrice,
  });

  const handleAddToCart = () => {
    if (!validateSelection()) return false;

    addToCart({
      id: uuidv4(),
      productId: product._id,
      name: getSelectedOrderItem().name,
      slug: product.slug,
      image: selectedImageSrc,
      price: getSelectedOrderItem().price,
      salePrice: getSelectedOrderItem().salePrice,
      quantity: getSelectedOrderItem().quantity,
      size: getSelectedOrderItem().size,
      color: getSelectedOrderItem().color,
      stock: availableStock,
    });
    toast.success("Added to cart");
    return true;
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    redirectToWhatsAppOrder([getSelectedOrderItem()], {
      total: effectivePrice * quantity,
    });
  };

  const handleWishlist = () => {
    if (status !== "authenticated") {
      setWishlistPromptOpen(true);
      return;
    }

    toggleWishlist({
      id: product._id,
      name: product.name,
      slug: product.slug,
      image: productImages[0] ?? "",
      price: product.price,
      salePrice: product.salePrice,
      category: product.category,
    });
    toast.success(wishlistActive ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not share this product");
    }
  };

  const submitReview = async () => {
    if (status !== "authenticated") {
      setWishlistPromptOpen(true);
      return;
    }

    if (!reviewTitle.trim() || !reviewBody.trim()) {
      toast.error("Please add a review title and message");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          title: reviewTitle.trim(),
          body: reviewBody.trim(),
          images: reviewImages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setReviewRating(5);
      setReviewTitle("");
      setReviewBody("");
      setReviewImages([]);
      toast.success(data.message || "Review submitted");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to submit review"));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-400 font-inter sm:mb-8">
        <Link href="/" className="hover:text-burgundy-900 transition-colors dark:hover:text-gold-300">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-burgundy-900 transition-colors dark:hover:text-gold-300">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-burgundy-900 transition-colors capitalize dark:hover:text-gold-300">{product.category}</Link>
        <span>/</span>
        <span className="max-w-[14rem] truncate text-velour-black dark:text-ivory-50 sm:max-w-none">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-start lg:gap-10 xl:gap-14">
        {/* Image Gallery */}
        <div className="lg:sticky lg:top-28">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            {/* Main image */}
            <div
              className={`group relative aspect-[4/5] min-h-[320px] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] shadow-[var(--shadow-card-premium)] sm:order-2 sm:flex-1 lg:min-h-[620px] ${
                isImageInspecting ? "cursor-crosshair" : "cursor-zoom-in"
              }`}
              onPointerEnter={(event) => {
                updateImageZoomOrigin(event.currentTarget, event.clientX, event.clientY);
                if (event.pointerType === "mouse") setIsImageInspecting(true);
              }}
              onPointerMove={(event) => {
                if (event.pointerType === "mouse" || isImageInspecting) {
                  updateImageZoomOrigin(event.currentTarget, event.clientX, event.clientY);
                }
              }}
              onPointerDown={(event) => {
                updateImageZoomOrigin(event.currentTarget, event.clientX, event.clientY);
                setIsImageInspecting(true);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setIsImageInspecting(false);
                  setImageZoomOrigin({ x: 50, y: 50 });
                }
              }}
            >
              {selectedImageSrc ? (
                <Image
                  src={selectedImageSrc}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform ease-out ${
                    isImageInspecting ? "scale-[2.25] duration-200" : "scale-100 duration-700 group-hover:scale-[1.035]"
                  }`}
                  style={{ transformOrigin: `${imageZoomOrigin.x}% ${imageZoomOrigin.y}%` }}
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-ivory-100 dark:bg-[var(--color-surface-muted)]">
                  <span className="text-xs uppercase tracking-widest text-gray-400">No Image</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent opacity-70" />
              {isImageInspecting && (
                <div
                  className="pointer-events-none absolute z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/10 shadow-[0_0_0_999px_rgba(0,0,0,0.06),0_12px_36px_rgba(0,0,0,0.32)] backdrop-blur-[1px] transition-[left,top] duration-75"
                  style={{ left: `${imageZoomOrigin.x}%`, top: `${imageZoomOrigin.y}%` }}
                />
              )}
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsImageInspecting((current) => !current);
                  setImageZoomOrigin({ x: 50, y: 50 });
                }}
                className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-md border backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  isImageInspecting
                    ? "border-gold-500 bg-gold-500 text-velour-black shadow-gold"
                    : "border-white/25 bg-black/35 text-white hover:bg-black/55"
                }`}
                aria-label={isImageInspecting ? "Turn off fabric mirror" : "Turn on fabric mirror"}
                aria-pressed={isImageInspecting}
                title="Fabric mirror"
              >
                <ScanEye size={17} />
              </button>
              {discount > 0 && (
                <div className="absolute left-3 top-3 rounded-md bg-gold-500 px-3 py-1 text-[10px] uppercase tracking-widest text-velour-black">
                  Save {discount}%
                </div>
              )}
              {productImages.length > 1 && (
                <div className="absolute bottom-3 left-3 rounded-md border border-white/20 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-widest text-white backdrop-blur-md">
                  {selectedImage + 1} / {productImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:w-20 sm:flex-col sm:overflow-visible sm:pb-0">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                    className={`relative h-16 w-16 flex-none overflow-hidden rounded-md border bg-[var(--color-surface)] transition-all sm:h-20 sm:w-20 ${
                    selectedImage === i ? "border-gold-500 ring-2 ring-gold-500/30" : "border-[var(--color-border)] opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`Show ${product.name} image ${i + 1}`}
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-premium)] sm:p-6 lg:sticky lg:top-28 lg:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 text-[10px] uppercase tracking-[0.32em] text-gold-500 font-inter">{product.category}</p>
              <h1 className="font-cormorant text-4xl font-light leading-[0.95] text-velour-black dark:text-ivory-50 sm:text-5xl">
                {product.name}
              </h1>
            </div>
            <span className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-widest font-inter ${stockStatus.className}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {stockStatus.label}
            </span>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-cormorant text-3xl font-medium text-velour-black dark:text-ivory-50 sm:text-4xl">
                  PKR {effectivePrice.toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="font-inter text-sm text-gray-400 line-through sm:text-base">
                    PKR {product.price.toLocaleString()}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="mt-1 text-xs text-gold-600 font-inter">You save PKR {(product.price - effectivePrice).toLocaleString()}</p>
              )}
            </div>
            {product.averageRating > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} fill={s <= product.averageRating ? "#C9A84C" : "none"} stroke="#C9A84C" strokeWidth="1.5" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-inter">{product.averageRating.toFixed(1)} ({product.reviewCount})</span>
              </div>
            )}
          </div>

          <div className="space-y-6 border-y border-[var(--color-border)] py-6">
            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs tracking-widest uppercase font-inter font-medium">Color</span>
                  <span className="text-xs text-gray-500 font-inter">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`h-10 w-10 rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                        selectedColor === color.name ? "border-gold-500 ring-2 ring-gold-500/30" : "border-[var(--color-border)] hover:border-gold-500"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select color ${color.name}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs tracking-widest uppercase font-inter font-medium">Size</span>
                  <button className="inline-flex items-center gap-1.5 text-xs text-gold-600 underline-offset-4 transition-colors hover:text-gold-700 hover:underline font-inter">
                    <Ruler size={13} />
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                  {product.sizes.map((size) => {
                    const variant = product.variants?.find((v) => v.size === size && (!selectedColor || v.color === selectedColor));
                    const outOfStock = variant ? variant.stock <= 0 : totalAvailableStock <= 0;
                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        disabled={outOfStock}
                        className={`min-h-11 rounded-md border px-4 text-sm transition-all font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                          selectedSize === size
                            ? "border-gold-500 bg-gold-500 text-velour-black shadow-gold"
                            : outOfStock
                            ? "border-[var(--color-border)] text-gray-400 cursor-not-allowed line-through opacity-50"
                            : "border-[var(--color-border)] hover:border-gold-500 hover:bg-gold-500/10"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs tracking-widest uppercase font-inter font-medium">Quantity</span>
                {stock !== null && stock > 0 && stock <= 5 && (
                  <p className="mt-1 text-xs text-amber-600 font-inter dark:text-amber-300">
                    Limited stock for this selection
                  </p>
                )}
              </div>
              <div className="inline-flex h-12 w-full max-w-[12rem] items-center justify-between overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] sm:w-44">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-full w-12 items-center justify-center transition-colors hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="text-sm font-medium font-inter">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.max(availableStock, 1), q + 1))}
                  className="flex h-full w-12 items-center justify-center transition-colors hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-400"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3">
              <button onClick={handleAddToCart} className="btn-primary flex min-h-12 items-center justify-center gap-2 rounded-md px-4">
              <ShoppingBag size={15} />
              Add to Cart
            </button>
            <button
              onClick={handleWishlist}
                className={`flex h-12 w-12 items-center justify-center rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                wishlistActive
                  ? "border-burgundy-900 bg-burgundy-50 text-burgundy-900 dark:border-gold-500 dark:bg-gold-500/15 dark:text-gold-300"
                    : "border-[var(--color-border)] hover:border-gold-500 hover:bg-gold-500 hover:text-velour-black"
              }`}
              aria-label={wishlistActive ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wishlistActive}
            >
              <Heart size={17} fill={wishlistActive ? "currentColor" : "none"} />
            </button>
              <button onClick={handleShare} className="flex h-12 w-12 items-center justify-center rounded-md border border-[var(--color-border)] transition-colors hover:border-gold-500 hover:bg-gold-500 hover:text-velour-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400" aria-label="Share product">
              <Share2 size={17} />
            </button>
          </div>

          <button
            onClick={handleBuyNow}
              className="btn-gold flex min-h-12 w-full items-center justify-center gap-2 rounded-md"
          >
            <MessageCircle size={15} />
            Buy Now
          </button>
          </div>

          {/* Delivery info */}
          <div className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-6">
            {[
              { icon: Shield, text: "100% authentic, premium quality guaranteed" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 text-sm text-gray-600 font-inter dark:text-gray-300">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold-500/12 text-gold-600">
                  <Icon size={15} />
                </span>
                <span className="leading-6">{text}</span>
              </div>
            ))}
          </div>

          {/* Product tags */}
          {(product.fabric || product.occasion) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.fabric && <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500"><CheckCircle2 size={12} className="text-gold-500" />{product.fabric}</span>}
              {product.occasion && <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500"><CheckCircle2 size={12} className="text-gold-500" />{product.occasion}</span>}
            </div>
          )}
        </section>
      </div>

      {/* Tabs: Description / Reviews */}
      <div className="mt-20">
        <div className="flex border-b border-gray-200">
          {(["description", "details", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-xs tracking-widest uppercase font-inter transition-colors ${
                activeTab === tab ? "border-b-2 border-burgundy-900 text-burgundy-900" : "text-gray-400 hover:text-velour-black"
              }`}
            >
              {tab === "reviews" ? `Reviews (${displayReviews.length})` : tab}
            </button>
          ))}
        </div>

        <div className="py-10">
          {activeTab === "description" && (
            <div className="max-w-3xl">
              <p className="text-gray-600 text-sm leading-relaxed font-inter whitespace-pre-line">
                {product.description || "Product details will be updated soon."}
              </p>
            </div>
          )}

          {activeTab === "details" && (
            <div className="max-w-2xl">
              <table className="w-full text-sm font-inter">
                <tbody>
                  {[
                    { label: "Category", value: product.category },
                    { label: "Fabric", value: product.fabric },
                    { label: "Occasion", value: product.occasion },
                    { label: "Available Sizes", value: product.sizes?.join(", ") },
                  ].filter((r) => r.value).map((row) => (
                    <tr key={row.label} className="border-b border-gray-100">
                      <td className="py-3 pr-8 text-gray-400 tracking-wider uppercase text-xs w-40">{row.label}</td>
                      <td className="py-3 text-velour-black capitalize">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl space-y-8">
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-card sm:p-6">
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-widest text-gold-500">Share your experience</p>
                  <h3 className="mt-1 font-cormorant text-2xl font-medium text-velour-black dark:text-ivory-50">
                    Add a Review
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-widest text-gray-500">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          className="p-1 text-gold-500 transition-transform hover:scale-110"
                          aria-label={`${rating} star rating`}
                        >
                          <Star
                            size={22}
                            fill={rating <= reviewRating ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    placeholder="Review title"
                    className="input-luxury"
                  />
                  <textarea
                    value={reviewBody}
                    onChange={(event) => setReviewBody(event.target.value)}
                    rows={4}
                    placeholder="Tell other customers about fit, fabric, quality, and your experience..."
                    className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-3 text-sm outline-none transition-colors focus:border-gold-500"
                  />

                  <ReviewImageUploader images={reviewImages} onChange={setReviewImages} />

                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="btn-primary inline-flex w-full items-center justify-center sm:w-auto"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  {status !== "authenticated" && (
                    <p className="text-xs text-gray-400">Login is required before posting a review.</p>
                  )}
                </div>
              </div>

              {displayReviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-cormorant text-xl text-gray-400 mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-400 font-inter">Be the first to share your experience</p>
                </div>
              ) : (
                displayReviews.map((review) => (
                  <div key={review._id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-inter text-sm font-medium text-velour-black">{review.userName}</span>
                          {review.isVerifiedPurchase && (
                            <span className="text-[10px] tracking-wider text-green-600 bg-green-50 px-2 py-0.5">Verified Purchase</span>
                          )}
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} fill={s <= review.rating ? "#C9A84C" : "none"} stroke="#C9A84C" strokeWidth="1.5" />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-inter">
                        {new Date(review.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <h4 className="font-inter text-sm font-medium mb-2">{review.title}</h4>
                    <p className="text-sm text-gray-600 font-inter leading-relaxed">{review.body}</p>
                    {review.images?.length ? (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 overflow-hidden border border-gray-100">
                            <Image src={img} alt="Review photo" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {review.adminReply && (
                      <div className="mt-4 bg-ivory-100 border-l-2 border-gold-400 pl-4 py-3">
                        <p className="text-[10px] tracking-widest uppercase text-gold-600 mb-1 font-inter">{BRAND_NAME} Reply</p>
                        <BrandPoweredBy variant="gold" size="xs" className="mb-2 justify-start" />
                        <p className="text-sm text-gray-600 font-inter">{review.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    <LoginPromptModal
      open={wishlistPromptOpen}
      onOpenChange={setWishlistPromptOpen}
      callbackUrl={`/product/${product.slug}`}
    />
    <OutOfStockWhatsAppModal
      open={restockPromptOpen}
      onOpenChange={setRestockPromptOpen}
      productName={product.name}
      productSlug={product.slug}
      selectedSize={selectedSize}
      selectedColor={selectedColor}
    />
    </>
  );
}
