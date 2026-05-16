"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import {
  buildWhatsAppOrderMessage,
  redirectToWhatsAppOrder,
} from "@/lib/whatsapp-order";
import { calculateShipping } from "@/lib/commerce";

export default function CheckoutPage() {
  const { items, subtotal, couponCode, couponDiscount, total } = useCartStore();

  const sub = subtotal();
  const finalTotal = total();
  const shipping = calculateShipping(sub, couponDiscount);
  const orderNote = couponCode ? `Coupon: ${couponCode}` : undefined;

  const handlePlaceOrder = () => {
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    redirectToWhatsAppOrder(items, {
      total: finalTotal,
      note: orderNote,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-ivory-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-gray-300" />
          </div>
          <h1 className="font-cormorant text-3xl text-velour-black mb-3">Your Cart is Empty</h1>
          <p className="text-gray-400 font-inter text-sm mb-8">
            Add a product first, then your order details will open directly in WhatsApp.
          </p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            Continue Shopping
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const messagePreview = buildWhatsAppOrderMessage(items, {
    total: finalTotal,
    note: orderNote,
  });

  return (
    <div className="min-h-screen bg-ivory-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="section-subtitle text-gold-500">WhatsApp Checkout</p>
          <h1 className="font-cormorant text-4xl font-light text-velour-black">
            Confirm Your Order
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Your selected products are ready. Tap Place Order and WhatsApp will open with the product names and quantities already filled in.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-card">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-ivory-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-cormorant text-xl leading-tight text-velour-black transition-colors hover:text-burgundy-900"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-2 text-xs text-gray-500 font-inter">
                    Size: <span className="text-velour-black">{item.size}</span>
                    <span className="mx-2">/</span>
                    Color: <span className="text-velour-black">{item.color}</span>
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-widest text-gray-400">
                      Quantity {item.quantity}
                    </span>
                    <span className="font-inter text-sm font-medium text-velour-black">
                      PKR {((item.salePrice ?? item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-400">WhatsApp message preview</p>
              <pre className="whitespace-pre-wrap font-inter text-xs leading-6 text-gray-600">
                {messagePreview}
              </pre>
            </div>
          </div>

          <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="font-cormorant text-2xl font-medium text-velour-black">Order Summary</h2>
            <div className="my-6 space-y-3 border-b border-[var(--color-border)] pb-6 font-inter text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>PKR {sub.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{couponCode}</span>
                  <span>-PKR {couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{shipping === 0 ? "Free" : `PKR ${shipping}`}</span>
              </div>
            </div>
            <div className="mb-6 flex justify-between font-cormorant text-2xl text-velour-black">
              <span>Total</span>
              <span>PKR {finalTotal.toLocaleString()}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              <MessageCircle size={15} />
              Place Order
            </button>
            <Link
              href="/cart"
              className="mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-burgundy-900 transition-colors hover:text-gold-600"
            >
              Edit Cart
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
