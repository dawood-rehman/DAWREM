"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight, Tag, ShoppingBag, MessageCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { redirectToWhatsAppOrder } from "@/lib/whatsapp-order";
import { FREE_SHIPPING_THRESHOLD, calculateShipping } from "@/lib/commerce";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, couponCode, couponDiscount, applyCoupon, removeCoupon, subtotal, total } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const sub = subtotal();
  const shipping = calculateShipping(sub, couponDiscount);
  const finalTotal = total();

  const handleWhatsAppCheckout = () => {
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    redirectToWhatsAppOrder(items, {
      total: finalTotal,
      note: couponCode ? `Coupon: ${couponCode}` : undefined,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), subtotal: sub }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      applyCoupon(data.code, data.discountAmount);
      toast.success(`Coupon applied - PKR ${data.discountAmount.toLocaleString()} off!`);
      setCouponInput("");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Invalid coupon code"));
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="w-24 h-24 bg-ivory-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-gray-300" />
          </div>
          <h2 className="font-cormorant text-3xl text-velour-black mb-3">Your Cart is Empty</h2>
          <p className="text-gray-400 font-inter text-sm mb-8">
            Discover our collection of premium women&apos;s suits and find something you love.
          </p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={14} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-cormorant text-4xl text-velour-black font-light mb-10">
          Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-5 flex gap-4 shadow-card">
                <div className="relative w-20 h-24 flex-shrink-0 bg-ivory-100 overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/product/${item.slug}`} className="font-cormorant text-lg text-velour-black hover:text-burgundy-900 transition-colors leading-tight">
                      {item.name}
                    </Link>
                    <button
                      onClick={() => { removeItem(item.id); toast.success("Removed from cart"); }}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400 font-inter mb-3">
                    <span>Size: <strong className="text-velour-black">{item.size}</strong></span>
                    <span>/</span>
                    <span>Color: <strong className="text-velour-black">{item.color}</strong></span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-velour-black"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-inter">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-velour-black"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-inter text-base font-medium text-velour-black">
                        PKR {((item.salePrice ?? item.price) * item.quantity).toLocaleString()}
                      </p>
                      {item.salePrice && (
                        <p className="text-xs text-gray-400 line-through font-inter">
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link href="/shop" className="flex items-center gap-2 text-xs tracking-widest uppercase text-burgundy-900 hover:gap-4 transition-all font-inter pt-2">
              <ArrowRight size={13} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white shadow-card p-6 sticky top-24">
              <h3 className="font-cormorant text-xl text-velour-black font-medium mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-inter">
                  <span className="text-gray-500">Subtotal</span>
                  <span>PKR {sub.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm font-inter text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={12} />
                      {couponCode}
                    </span>
                    <span>-PKR {couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-inter">
                  <span className="text-gray-500">Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `PKR ${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 font-inter">
                    Add PKR {(FREE_SHIPPING_THRESHOLD - Math.max(sub - couponDiscount, 0)).toLocaleString()} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-cormorant text-xl">
                  <span>Total</span>
                  <span className="font-medium">PKR {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon input */}
              {!couponCode ? (
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1 border border-gray-200 px-3 py-2.5 text-sm font-inter outline-none focus:border-gold-400"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon}
                      className="btn-outline text-xs px-4"
                    >
                      {applyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-inter">
                    <Tag size={13} />
                    <span className="font-medium">{couponCode}</span>
                    <span className="text-xs">applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-green-600 hover:text-red-500 transition-colors text-xs font-inter underline">Remove</button>
                </div>
              )}

              <button
                onClick={handleWhatsAppCheckout}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle size={14} />
                Checkout on WhatsApp
              </button>

              {/* Payment icons */}
              <div className="mt-4 flex items-center justify-center gap-3 text-gray-300 text-[10px] tracking-wider font-inter">
                {["JazzCash", "EasyPaisa", "Visa", "COD"].map((m) => (
                  <span key={m} className="border border-gray-200 px-2 py-0.5 rounded text-gray-400">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
