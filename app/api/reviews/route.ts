import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/index";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";
import { rateLimit, requestSizeLimit } from "@/lib/security";
import { BRAND_NAME } from "@/lib/brand";

type ReviewSort = Record<string, 1 | -1>;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;

    const productId = searchParams.get("productId");
    const isAdmin = searchParams.get("admin") === "true";

    const session = await getServerSession(authOptions);
    if (isAdmin && (!session || session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filter: Record<string, unknown> = {};
    if (productId) filter.productId = productId;
    if (!isAdmin) filter.isApproved = true;

    const sort = searchParams.get("sort") || "newest";
    const sortMap: Record<string, ReviewSort> = {
      newest: { isPinned: -1, createdAt: -1 },
      helpful: { helpfulCount: -1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
    };

    const reviews = await Review.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .limit(80)
      .lean();

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tooLarge = requestSizeLimit(request, 64 * 1024);
    if (tooLarge) return tooLarge;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Please login to submit a review" }, { status: 401 });
    }

    const limited = rateLimit(request, {
      namespace: "review-submit",
      identifier: session.user.id,
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    await connectDB();
    const body = await request.json().catch(() => null);
    const {
      productId,
      rating,
      title,
      body: reviewBody,
      images,
      userName,
      reviewDate,
      adminManual,
      isApproved,
    } = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const isAdmin = session.user.role === "admin";
    const adminManualReview = adminManual === true;

    if (
      typeof productId !== "string" ||
      !rating ||
      typeof title !== "string" ||
      typeof reviewBody !== "string"
    ) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const product = await Product.findById(productId).select("_id").lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (adminManualReview && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = !adminManualReview
      ? await Review.findOne({ productId, userId: session.user.id })
      : null;
    if (existing) {
      return NextResponse.json({ error: "You've already reviewed this product" }, { status: 409 });
    }

    const verifiedOrder = !adminManualReview
      ? await Order.findOne({
          userId: session.user.id,
          "items.productId": productId,
          orderStatus: "delivered",
        })
      : null;
    const reviewImages = Array.isArray(images)
      ? images.filter((image): image is string => typeof image === "string" && image.trim().length > 0).slice(0, 6)
      : [];
    const manualReviewDate =
      adminManualReview && typeof reviewDate === "string" && reviewDate
        ? new Date(reviewDate)
        : null;
    const safeReviewDate =
      manualReviewDate && !Number.isNaN(manualReviewDate.getTime())
        ? manualReviewDate
        : null;

    const review = await Review.create({
      productId,
      userId: adminManualReview ? undefined : session.user.id,
      userName: adminManualReview && typeof userName === "string"
        ? userName.trim().slice(0, 120) || `${BRAND_NAME} Customer`
        : session.user.name || "Customer",
      userImage: adminManualReview ? undefined : session.user.image,
      rating: numericRating,
      title: title.trim().slice(0, 140),
      body: reviewBody.trim().slice(0, 3000),
      images: reviewImages,
      isVerifiedPurchase: adminManualReview ? true : !!verifiedOrder,
      isApproved: adminManualReview ? isApproved !== false : false,
      ...(safeReviewDate ? { createdAt: safeReviewDate } : {}),
    });

    if (review.isApproved) await recalculateProductRating(productId);

    return NextResponse.json(
      {
        review,
        message: adminManualReview ? "Review published" : "Review submitted and awaiting approval",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

async function recalculateProductRating(productId: string) {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avgRating = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: count,
  });
}
