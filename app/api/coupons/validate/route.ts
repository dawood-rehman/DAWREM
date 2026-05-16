import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateDiscountedSubtotal } from "@/lib/commerce";
import { rateLimit, requestSizeLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      namespace: "coupon-validate",
      limit: 30,
      windowMs: 5 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 8 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json().catch(() => null);
    const { code, subtotal } =
      body && typeof body === "object" ? body as { code?: unknown; subtotal?: unknown } : {};
    const session = await getServerSession(authOptions);

    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    }
    const numericSubtotal = Number(subtotal);
    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
      return NextResponse.json({ error: "Valid subtotal required" }, { status: 400 });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
    }

    // Expiry check
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // Per-user check
    if (
      session?.user.id &&
      coupon.usedBy?.some((usedUserId: { toString: () => string }) => (
        usedUserId.toString() === session.user.id
      ))
    ) {
      return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
    }

    // Minimum order check
    if (coupon.minOrderAmount && numericSubtotal < coupon.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order of PKR ${coupon.minOrderAmount.toLocaleString()} required for this coupon`,
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = coupon.type === "percentage"
      ? (numericSubtotal * coupon.value) / 100
      : coupon.value;

    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
    discountAmount = Math.min(Math.round(discountAmount), numericSubtotal);

    return NextResponse.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      discountedSubtotal: calculateDiscountedSubtotal(numericSubtotal, discountAmount),
    });
  } catch {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
