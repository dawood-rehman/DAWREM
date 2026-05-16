import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const proxy = withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);

    // Admin routes require admin role
    if (isAdminPath && token?.role !== "admin") {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Public routes
        if (
          pathname.startsWith("/shop") ||
          pathname.startsWith("/product") ||
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/cart" ||
          pathname === "/checkout" ||
          pathname === "/feedback" ||
          pathname === "/track-order" ||
          pathname === "/terms" ||
          pathname === "/terms-of-service" ||
          pathname === "/terms-of-services" ||
          pathname === "/privacy-policy" ||
          pathname === "/about" ||
          pathname === "/our-story" ||
          pathname === "/careers" ||
          pathname === "/career" ||
          pathname === "/faqs" ||
          pathname === "/size-guide" ||
          pathname.startsWith("/api/products") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/feedback") ||
          pathname.startsWith("/api/newsletter") ||
          pathname.startsWith("/api/coupons/validate") ||
          pathname.startsWith("/api/reviews")
        ) {
          return true;
        }
        // Protected routes need any auth
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/orders/:path*",
    "/wishlist",
  ],
};
