"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import LoginPromptModal from "@/components/ui/LoginPromptModal";
import OutOfStockWhatsAppModal from "@/components/store/OutOfStockWhatsAppModal";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { v4 as uuidv4 } from "uuid";

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

interface Props {
  product: Product;
  showQuickView?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? "#C9A84C" : "none"}
          stroke={star <= Math.round(rating) ? "#C9A84C" : "#d1d5db"}
          strokeWidth="2"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({ product, showQuickView = true }: Props) {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [wishlistPromptOpen, setWishlistPromptOpen] = useState(false);
  const [restockPromptOpen, setRestockPromptOpen] = useState(false);
  const { status } = useSession();
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product._id));
  const addToCart = useCartStore((s) => s.addItem);
  const wishlistActive = status === "authenticated" && isInWishlist;
  const productImages = product.images?.filter(Boolean) ?? [];
  const activeImage = productImages[imgIndex] ?? productImages[0] ?? "";

  const effectivePrice = product.salePrice ?? product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.sizes?.length && !product.colors?.length) {
      if ((product.stock ?? 0) <= 0) {
        setRestockPromptOpen(true);
        return;
      }

      addToCart({
        id: uuidv4(),
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: productImages[0] ?? "",
        price: product.price,
        salePrice: product.salePrice,
        quantity: 1,
        size: "One Size",
        color: "Default",
        stock: product.stock ?? 10,
      });
      toast.success("Added to cart");
    } else {
      window.location.href = `/product/${product.slug}`;
    }
  };

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-premium)] transition-transform duration-300 hover:-translate-y-0.5"
        onMouseEnter={() => {
          setHovered(true);
          if (productImages.length > 1) setImgIndex(1);
        }}
        onMouseLeave={() => {
          setHovered(false);
          setImgIndex(0);
        }}
      >
        {/* Image container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-100 sm:aspect-[3/4]">
          <Link href={`/product/${product.slug}`} className="absolute inset-0 block" aria-label={product.name}>
          {activeImage ? (
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-ivory-200">
              <span className="text-gray-400 text-xs tracking-wider">No Image</span>
            </div>
          )}
          </Link>

        {/* Badges */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5 pointer-events-none sm:left-3 sm:top-3">
          {product.isNewArrival && (
            <span className="badge-new">New</span>
          )}
          {discount > 0 && (
            <span className="badge-sale">-{discount}%</span>
          )}
          {product.isBestseller && !product.isNewArrival && (
            <span className="bg-velour-black text-gold-400 text-[10px] tracking-widest uppercase px-2 py-0.5">
              Best
            </span>
          )}
        </div>

        {/* Actions overlay */}
        <div
          className={`absolute right-2 top-2 z-20 flex flex-col gap-2 transition-all duration-300 sm:right-3 sm:top-3 ${
            hovered ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100 sm:translate-x-4 sm:opacity-0"
          }`}
        >
          <button
            onClick={handleWishlist}
            className={`flex h-8 w-8 items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-[var(--shadow-card-premium)] backdrop-blur-md transition-all hover:border-gold-500 hover:bg-burgundy-900 hover:text-ivory-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 dark:hover:bg-gold-400 dark:hover:text-velour-black sm:h-9 sm:w-9 ${
              wishlistActive ? "text-burgundy-900 dark:text-gold-300" : ""
            }`}
            aria-label={wishlistActive ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlistActive}
          >
            <Heart
              size={15}
              fill={wishlistActive ? "currentColor" : "none"}
              className="shrink-0"
            />
          </button>
          {showQuickView && (
            <Link
              href={`/product/${product.slug}`}
              className="flex h-8 w-8 items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-[var(--shadow-card-premium)] backdrop-blur-md transition-all hover:border-gold-500 hover:bg-burgundy-900 hover:text-ivory-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 dark:hover:bg-gold-400 dark:hover:text-velour-black sm:h-9 sm:w-9"
              aria-label="Quick view"
            >
              <Eye size={15} />
            </Link>
          )}
        </div>

        {/* Add to cart bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100 sm:translate-y-full sm:opacity-0"
          }`}
        >
          <button
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 bg-velour-black py-2.5 text-[10px] uppercase text-ivory-50 backdrop-blur-sm transition-colors hover:bg-burgundy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 dark:bg-ivory-50 dark:text-velour-black dark:hover:bg-gold-400 sm:py-3"
          >
            <ShoppingBag size={12} />
            {product.sizes?.length ? "Select Options" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="px-3 pb-3 pt-3">
        <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1 font-inter">
          {product.category}
        </p>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.35rem] font-cormorant text-[15px] text-velour-black transition-colors leading-tight hover:text-burgundy-900 sm:text-base"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {(product.averageRating ?? 0) > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={product.averageRating!} />
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-inter text-sm font-medium text-velour-black">
            PKR {effectivePrice.toLocaleString()}
          </span>
          {product.salePrice && (
            <span className="font-inter text-xs text-gray-400 line-through">
              PKR {product.price.toLocaleString()}
            </span>
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
      />
    </>
  );
}
