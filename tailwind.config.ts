import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: "#fdf2f4",
          100: "#fce7ea",
          200: "#f9d0d7",
          300: "#f4aab6",
          400: "#ec7789",
          500: "#e04d63",
          600: "#b72b45",
          700: "#8f2138",
          800: "#64192c",
          900: "#3f1726",
          950: "#1f0a12",
        },
        gold: {
          50: "#fdfbf0",
          100: "#fbf5d7",
          200: "#f6e8a9",
          300: "#f0d572",
          400: "#e8bb3c",
          500: "#C9A84C",
          600: "#b8891f",
          700: "#986a18",
          800: "#7d5319",
          900: "#6a451a",
          950: "#3c250b",
        },
        ivory: {
          50: "#FAF7F2",
          100: "#f5f0e7",
          200: "#ebe0ce",
          300: "#dccbad",
          400: "#cdb08a",
          500: "#c09870",
          600: "#b28360",
          700: "#956b50",
          800: "#7a5745",
          900: "#64483a",
        },
        velour: {
          black: "#151312",
          white: "#FAF7F2",
        },
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "serif"],
        playfair: ["var(--font-playfair)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "luxury-gradient":
          "linear-gradient(135deg, #6B2737 0%, #1A1A1A 50%, #C9A84C 100%)",
        "gold-shimmer":
          "linear-gradient(90deg, #C9A84C 0%, #e8bb3c 50%, #C9A84C 100%)",
        "dark-texture":
          "radial-gradient(ellipse at top, #2a1520 0%, #1A1A1A 70%)",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        typewriter: "typewriter 3s steps(40) infinite",
        float: "float 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        luxury:
          "0 4px 24px rgba(107, 39, 55, 0.15), 0 1px 4px rgba(0,0,0,0.1)",
        gold: "0 0 20px rgba(201, 168, 76, 0.3)",
        "gold-lg": "0 0 40px rgba(201, 168, 76, 0.4)",
        card: "0 2px 16px rgba(26, 26, 26, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
