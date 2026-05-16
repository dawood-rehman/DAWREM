"use client";

import Link from "next/link";
import BrandPoweredBy from "@/components/ui/BrandPoweredBy";
import { BRAND_NAME } from "@/lib/brand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html>
      <body>
        <div
          className="min-h-screen flex flex-col items-center justify-center text-center px-4"
          style={{ background: "#1A1A1A", fontFamily: "Georgia, serif" }}
        >
          <p style={{ color: "#C9A84C", fontSize: "11px", letterSpacing: "4px", marginBottom: "16px", textTransform: "uppercase" }}>
            {BRAND_NAME}
          </p>
          <BrandPoweredBy variant="light" size="sm" className="mb-4 justify-center" />
          <h1 style={{ color: "#FAF7F2", fontSize: "48px", fontWeight: 300, marginBottom: "12px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#666", fontSize: "14px", maxWidth: "360px", lineHeight: "1.6", marginBottom: "40px", fontFamily: "Inter, sans-serif" }}>
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={reset}
              style={{ background: "#C9A84C", color: "#1A1A1A", padding: "12px 32px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              Try Again
            </button>
            <Link
              href="/"
              style={{ border: "1px solid rgba(250,247,242,0.3)", color: "#FAF7F2", padding: "12px 32px", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", fontFamily: "Inter, sans-serif" }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
