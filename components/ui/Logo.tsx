import { BRAND_NAME } from "@/lib/brand";
import BrandPoweredBy from "@/components/ui/BrandPoweredBy";

interface LogoProps {
  variant?: "auto" | "dark" | "light" | "gold";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

const markSizes = { sm: 44, md: 60, lg: 88 };
const wordSizes = { sm: "13px", md: "19px", lg: "27px" };
const textColors = {
  auto: "currentColor",
  dark: "#151312",
  light: "#FAF7F2",
  gold: "#C9A84C",
};

const markColors = {
  auto: {
    ink: "currentColor",
    gold: "var(--color-accent)",
    goldDeep: "var(--color-accent-strong)",
    highlight: "#F1DF9B",
  },
  dark: {
    ink: "#151312",
    gold: "#B89132",
    goldDeep: "#6F4815",
    highlight: "#F1DF9B",
  },
  light: {
    ink: "#FAF7F2",
    gold: "#D6B968",
    goldDeep: "#A97D25",
    highlight: "#FFF3B8",
  },
  gold: {
    ink: "#F1DF9B",
    gold: "#F1DF9B",
    goldDeep: "#A97D25",
    highlight: "#FFF3B8",
  },
};

export default function DawremLogo({
  variant = "auto",
  size = "md",
  showText = true,
  showTagline,
  className = "",
}: LogoProps) {
  const dim = markSizes[size];
  const autoClass = variant === "auto" ? "text-velour-black dark:text-ivory-50" : "";
  const c = markColors[variant];
  const foilId = `dawrem-r-foil-${variant}-${size}`;
  const shouldShowTagline = showTagline ?? size !== "sm";

  return (
    <div
      className={`inline-flex shrink-0 flex-col items-center justify-center gap-1 ${autoClass} ${className}`}
      aria-label={`${BRAND_NAME} DR monogram`}
      role="img"
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
        className="block shrink-0"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id={foilId} x1="42" y1="31" x2="89" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={c.goldDeep} />
            <stop offset="0.42" stopColor={c.highlight} />
            <stop offset="1" stopColor={c.goldDeep} />
          </linearGradient>
        </defs>
        <path
          d="M25 13H58C89 13 110 32.2 110 60C110 87.8 89 107 58 107H25V13Z"
          stroke={c.gold}
          strokeWidth="1.25"
          strokeLinejoin="round"
          opacity="0.52"
        />
        <path
          d="M31 21V99H57.5C83.2 99 100.5 83 100.5 60C100.5 37 83.2 21 57.5 21H31Z"
          stroke={c.ink}
          strokeWidth="7.5"
          strokeLinejoin="round"
        />
        <path
          d="M39.5 29.5V90.5H57.5C77.5 90.5 91.5 78 91.5 60C91.5 42 77.5 29.5 57.5 29.5H39.5Z"
          stroke={c.gold}
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.72"
        />
        <g opacity="0.42">
          <path
            d="M50 40V82"
            stroke={c.ink}
            strokeWidth="9.4"
            strokeLinecap="square"
          />
          <path
            d="M50 40H64.5C75.2 40 82.5 46.2 82.5 55.4C82.5 64.8 75.2 70.5 64.5 70.5H50"
            stroke={c.ink}
            strokeWidth="9.4"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
          <path
            d="M63.5 70.5L84.5 88"
            stroke={c.ink}
            strokeWidth="9.4"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M50 40V82"
          stroke={c.gold}
          strokeWidth="7.6"
          strokeLinecap="square"
        />
        <path
          d="M50 40H64.5C75.2 40 82.5 46.2 82.5 55.4C82.5 64.8 75.2 70.5 64.5 70.5H50"
          stroke={c.gold}
          strokeWidth="7.6"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path
          d="M63.5 70.5L84.5 88"
          stroke={c.gold}
          strokeWidth="7.6"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path
          d="M30 13L41 2M83 103L95 91"
          stroke={c.highlight}
          strokeWidth="1.35"
          strokeLinecap="round"
          opacity="0.68"
        />
      </svg>

      {showText && (
        <div className="text-center">
          <span
            style={{
              color: textColors[variant],
              display: "block",
              fontFamily: "var(--font-playfair), var(--font-cormorant), serif",
              fontFeatureSettings: '"liga" 1, "kern" 1',
              fontSize: wordSizes[size],
              fontWeight: 600,
              letterSpacing: 0,
              lineHeight: 0.98,
            }}
          >
            {BRAND_NAME}
          </span>
          {shouldShowTagline && (
            <BrandPoweredBy
              variant={variant}
              size={size === "lg" ? "md" : "xs"}
              className="mt-1 justify-center"
            />
          )}
        </div>
      )}
    </div>
  );
}
