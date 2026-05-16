"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useWishlistStore.persist.rehydrate();
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--color-surface-elevated)",
              color: "var(--color-text)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              letterSpacing: "0.5px",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-card-premium)",
            },
            success: {
              iconTheme: { primary: "#C9A84C", secondary: "#1A1A1A" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#fff" },
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
