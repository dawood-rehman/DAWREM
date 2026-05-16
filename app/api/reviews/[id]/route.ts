import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/index";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { automationEngine } from "@/lib/automations/engine";
import { rateLimit, requestSizeLimit } from "@/lib/security";

interface ReviewRecord {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  title: string;
  isPinned?: boolean;
  isFlagged?: boolean;
}

interface ReviewUser {
  email: string;
  name: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = rateLimit(request, {
      namespace: "admin-review-update",
      identifier: session.user.id,
      limit: 50,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 64 * 1024);
    if (tooLarge) return tooLarge;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    await connectDB();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid review update" }, { status: 400 });
    }
    const { action, adminReply, isApproved, isPinned, isFlagged } = body;

    const review = await Review.findById(id).lean<ReviewRecord>();
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const update: Record<string, unknown> = {};

    if (action === "approve") {
      update.isApproved = true;

      // Notify customer
      if (review.userId) {
        const user = await User.findById(review.userId).lean<ReviewUser>();
        if (user) {
          await automationEngine.trigger("review.approved", {
            email: user.email,
            name: user.name,
            productName: review.title,
          });
        }
      }
    } else if (action === "reject") {
      update.isApproved = false;
      update.isFlagged = true;
    } else if (action === "reply") {
      if (typeof adminReply !== "string" || !adminReply.trim()) {
        return NextResponse.json({ error: "Reply text required" }, { status: 400 });
      }
      update.adminReply = adminReply.trim().slice(0, 2000);
      update.adminReplyAt = new Date();
    } else if (action === "pin") {
      update.isPinned = !review.isPinned;
    } else if (action === "flag") {
      update.isFlagged = !review.isFlagged;
    } else {
      if (typeof isApproved === "boolean") update.isApproved = isApproved;
      if (typeof isPinned === "boolean") update.isPinned = isPinned;
      if (typeof isFlagged === "boolean") update.isFlagged = isFlagged;
    }

    const updated = await Review.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (action === "approve" || action === "reject" || typeof isApproved === "boolean") {
      await recalculateProductRating(review.productId.toString());
    }
    return NextResponse.json({ review: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = rateLimit(request, {
      namespace: "admin-review-delete",
      identifier: session.user.id,
      limit: 40,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
    }

    await connectDB();
    const review = await Review.findByIdAndDelete(id).lean<ReviewRecord>();
    if (review) await recalculateProductRating(review.productId.toString());
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
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
