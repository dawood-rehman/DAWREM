import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NProgressBar from "@/components/ui/NProgressBar";
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_OWNER,
  BRAND_SEO_TITLE,
} from "@/lib/brand";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: BRAND_SEO_TITLE,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  keywords: [
    "women's suits",
    "luxury fashion",
    "Pakistani fashion",
    "designer suits",
    "formal wear",
    BRAND_NAME,
    BRAND_OWNER,
    "premium clothing",
    "women's wear Pakistan",
  ],
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_OWNER,
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: BRAND_NAME,
    title: BRAND_SEO_TITLE,
    description: BRAND_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: BRAND_SEO_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_SEO_TITLE,
    description: BRAND_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NProgressBar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
