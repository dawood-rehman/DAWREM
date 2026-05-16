"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/wishlist";
import ProductCard from "@/components/store/ProductCard";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { status } = useSession();
  const { items, clearWishlist } = useWishlistStore();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory-50">
        <div className="skeleton h-10 w-44" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory-50 px-4">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-gold-500/30 bg-gold-500/10 text-gold-600">
            <Heart size={30} />
          </div>
          <h1 className="mb-3 font-cormorant text-3xl font-medium text-velour-black">
            Sign in to view your wishlist
          </h1>
          <p className="mb-8 text-sm leading-6 text-gray-500">
            Saved pieces are tied to your DAWRÉM account so they stay private and available across devices.
          </p>
          <Link href="/login?callbackUrl=/wishlist" className="btn-primary inline-flex">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="w-24 h-24 bg-ivory-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={36} className="text-gray-300" />
          </div>
          <h2 className="font-cormorant text-3xl text-velour-black mb-3">Your Wishlist is Empty</h2>
          <p className="text-gray-400 font-inter text-sm mb-8">
            Save pieces you love and come back to them anytime.
          </p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-cormorant text-4xl text-velour-black font-light">My Wishlist</h1>
            <p className="text-gray-400 font-inter text-sm mt-1">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
          </div>
          {items.length > 1 && (
            <button
              onClick={() => { clearWishlist(); toast.success("Wishlist cleared"); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors font-inter flex items-center gap-1"
            >
              <Trash2 size={13} />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-6">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                _id: item.id,
                name: item.name,
                slug: item.slug,
                price: item.price,
                salePrice: item.salePrice,
                images: [item.image],
                category: item.category,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
