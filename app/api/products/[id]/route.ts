import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import { Review } from "@/models/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, requestSizeLimit } from "@/lib/security";
import mongoose from "mongoose";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
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
      namespace: "admin-product-update",
      identifier: session.user.id,
      limit: 40,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 512 * 1024);
    if (tooLarge) return tooLarge;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await connectDB();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    const variants = Array.isArray(body.variants) ? body.variants : [];
    if (variants.length > 0) {
      body.stock = variants.reduce(
        (sum: number, v: { stock: number }) => sum + Math.max(0, Number(v.stock) || 0),
        0
      );
    } else if ("stock" in body) {
      body.stock = Math.max(0, Number(body.stock) || 0);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
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
      namespace: "admin-product-delete",
      identifier: session.user.id,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(id)
      .select("_id name")
      .lean<{ _id: mongoose.Types.ObjectId; name: string }>();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productId = new mongoose.Types.ObjectId(id);
    const [reviewResult, wishlistResult] = await Promise.all([
      Review.deleteMany({ productId }),
      User.updateMany({ wishlist: productId }, { $pull: { wishlist: productId } }),
    ]);

    return NextResponse.json({
      success: true,
      productName: product.name,
      reviewDeletedCount: reviewResult.deletedCount || 0,
      wishlistUpdatedCount: wishlistResult.modifiedCount || 0,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
