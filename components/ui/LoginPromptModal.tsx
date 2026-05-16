"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Heart, LockKeyhole, X } from "lucide-react";
import BrandPoweredBy from "@/components/ui/BrandPoweredBy";
import { BRAND_NAME } from "@/lib/brand";

interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl?: string;
  title?: string;
  description?: string;
}

function safeCallback(callbackUrl?: string) {
  if (!callbackUrl) {
    if (typeof window === "undefined") return "/";
    return `${window.location.pathname}${window.location.search}`;
  }

  return callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
    ? callbackUrl
    : "/";
}

export default function LoginPromptModal({
  open,
  onOpenChange,
  callbackUrl,
  title = "Sign in to save this piece",
  description = `Wishlist is reserved for ${BRAND_NAME} account holders so your saved edits stay private and available on every device.`,
}: LoginPromptModalProps) {
  const next = safeCallback(callbackUrl);
  const encodedNext = encodeURIComponent(next);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-velour-black/60 backdrop-blur-sm data-[state=open]:animate-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-[var(--color-text)] shadow-[var(--shadow-card-premium)] backdrop-blur-xl focus:outline-none sm:p-8">
          <Dialog.Close className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-[var(--color-border)] text-[var(--color-muted)] transition-colors hover:border-gold-500 hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">
            <X size={16} />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <div className="mb-5 flex h-12 w-12 items-center justify-center border border-gold-500/40 bg-gold-500/10 text-gold-600 dark:text-gold-300">
            <Heart size={20} />
          </div>

          <Dialog.Title className="font-cormorant text-3xl font-medium leading-tight">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            {description}
          </Dialog.Description>
          <BrandPoweredBy size="xs" className="mt-2 justify-start" />

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/login?callbackUrl=${encodedNext}`}
              className="btn-primary inline-flex items-center justify-center gap-2 px-5"
              onClick={() => onOpenChange(false)}
            >
              <LockKeyhole size={14} />
              Sign In
            </Link>
            <Link
              href={`/login?mode=register&callbackUrl=${encodedNext}`}
              className="btn-outline inline-flex items-center justify-center px-5"
              onClick={() => onOpenChange(false)}
            >
              Create Account
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
