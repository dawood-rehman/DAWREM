"use client";

import { useMemo } from "react";
import { MessageCircle, PackageSearch, X } from "lucide-react";
import { DAWREM_ORDER_WHATSAPP_WA_NUMBER } from "@/lib/brand-links";

interface OutOfStockWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productSlug?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export default function OutOfStockWhatsAppModal({
  open,
  onOpenChange,
  productName,
  productSlug,
  selectedSize,
  selectedColor,
}: OutOfStockWhatsAppModalProps) {
  const whatsappUrl = useMemo(() => {
    const productLink =
      productSlug && typeof window !== "undefined"
        ? `${window.location.origin}/product/${productSlug}`
        : "";
    const message = [
      "Assalamualaikum, mujhe is product ke restock ke baray me poochna hai:",
      `Product Name: ${productName}`,
      selectedSize ? `Size: ${selectedSize}` : "",
      selectedColor ? `Color: ${selectedColor}` : "",
      productLink ? `Product Link: ${productLink}` : productSlug ? `Product Slug: ${productSlug}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${DAWREM_ORDER_WHATSAPP_WA_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [productName, productSlug, selectedColor, selectedSize]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-velour-black/55 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-6" role="dialog" aria-modal="true" aria-labelledby="restock-modal-title">
      <button
        type="button"
        aria-label="Close restock support"
        className="absolute inset-0 cursor-default"
        onClick={() => onOpenChange(false)}
      />
      <section className="relative w-full max-w-md overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-gray-500 transition-colors hover:border-gold-500 hover:text-velour-black dark:hover:text-ivory-50"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="p-5 sm:p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
            <PackageSearch size={22} />
          </div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.26em] text-gold-600">Restock Support</p>
          <h2 id="restock-modal-title" className="font-cormorant text-2xl font-semibold leading-tight text-velour-black dark:text-ivory-50">
            Check availability on WhatsApp
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            This product is currently unavailable. Our team can confirm restock timing or suggest a close alternative.
          </p>

          <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Selected Product</p>
            <p className="mt-1 font-inter text-sm font-medium text-velour-black dark:text-ivory-50">{productName}</p>
            {(selectedSize || selectedColor) && (
              <p className="mt-1 text-xs text-gray-500">
                {[selectedSize, selectedColor].filter(Boolean).join(" / ")}
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-gold inline-flex min-h-11 items-center justify-center gap-2 text-center"
              onClick={() => onOpenChange(false)}
            >
              <MessageCircle size={16} />
              Ask Restock
            </a>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn-outline min-h-11 px-5 text-sm"
            >
              Leave Product
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
