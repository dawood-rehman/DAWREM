import type { CSSProperties } from "react";
import { BRAND_POWERED_BY, BRAND_POWERED_BY_STYLIZED } from "@/lib/brand";

interface BrandPoweredByProps {
  className?: string;
  mode?: "compact" | "hero";
  variant?: "auto" | "light" | "dark" | "gold";
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
  xs: "text-[9px] leading-4",
  sm: "text-[10px] leading-4",
  md: "text-xs leading-5",
  lg: "text-[0.72rem] leading-5 sm:text-[clamp(0.95rem,1.45vw,1.18rem)] sm:leading-6",
};

const variantClasses = {
  auto: "text-gold-600 dark:text-gold-300",
  light: "text-gold-300",
  dark: "text-burgundy-900",
  gold: "text-gold-500",
};

export default function BrandPoweredBy({
  className = "",
  mode = "compact",
  variant = "auto",
  size = "sm",
}: BrandPoweredByProps) {
  const text = mode === "hero" ? BRAND_POWERED_BY : BRAND_POWERED_BY_STYLIZED;
  const letters = Array.from(text);

  return (
    <span
      className={`brand-powered-by ${mode === "hero" ? "brand-powered-by--hero" : ""} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-label={BRAND_POWERED_BY}
    >
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          aria-hidden="true"
          className={`brand-powered-letter ${mode === "hero" ? "brand-powered-letter--hero" : ""}`}
          style={{ "--brand-letter-index": index } as CSSProperties}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </span>
  );
}
