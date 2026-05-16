import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import { Review } from "@/models/index";
import slugify from "slugify";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, requestSizeLimit } from "@/lib/security";
import mongoose from "mongoose";

const MAX_BULK_DELETE = 100;
type ProductSort = Record<string, 1 | -1>;

function normalizeProductIds(ids: unknown[]) {
  return Array.from(new Set(ids))
    .filter((id): id is string => typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
    .slice(0, MAX_BULK_DELETE)
    .map((id) => new mongoose.Types.ObjectId(id));
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isPublished: true };
    const session = await getServerSession(authOptions);
    const isAdmin = searchParams.get("admin") === "true" && session?.user?.role === "admin";

    if (isAdmin) delete filter.isPublished;

    const category = searchParams.get("category");
    if (category) filter.category = new RegExp(category, "i");

    const sizes = searchParams.get("sizes");
    if (sizes) filter.sizes = { $in: sizes.split(",") };

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = parseFloat(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(maxPrice);
    }

    const fabric = searchParams.get("fabric");
    if (fabric) filter.fabric = new RegExp(fabric, "i");

    const occasion = searchParams.get("occasion");
    if (occasion) filter.occasion = new RegExp(occasion, "i");

    if (searchParams.get("sale") === "true") filter.salePrice = { $exists: true, $gt: 0 };
    if (searchParams.get("newArrival") === "true") filter.isNewArrival = true;
    if (searchParams.get("bestseller") === "true") filter.isBestseller = true;
    if (searchParams.get("featured") === "true") filter.isFeatured = true;

    const search = searchParams.get("search");
    if (search) {
      filter.$text = { $search: search };
    }

    const sortParam = searchParams.get("sort") || "newest";
    const sortMap: Record<string, ProductSort> = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      bestselling: { totalSold: -1 },
      rating: { averageRating: -1 },
    };
    const sort = sortMap[sortParam] || sortMap.newest;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("name slug price salePrice images category sizes colors variants fabric occasion isPublished isNewArrival isBestseller isFeatured averageRating reviewCount stock")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = rateLimit(request, {
      namespace: "admin-product-bulk-delete",
      identifier: session.user.id,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 64 * 1024);
    if (tooLarge) return tooLarge;

    const body = await request.json().catch(() => null);
    const ids = Array.isArray(body?.ids) ? normalizeProductIds(body.ids) : [];

    if (!ids.length) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 });
    }

    await connectDB();
    const result = await Product.deleteMany({ _id: { $in: ids } });

    const [reviewResult, wishlistResult] = await Promise.all([
      Review.deleteMany({ productId: { $in: ids } }),
      User.updateMany(
        { wishlist: { $in: ids } },
        { $pull: { wishlist: { $in: ids } } }
      ),
    ]);

    return NextResponse.json({
      deletedCount: result.deletedCount || 0,
      reviewDeletedCount: reviewResult.deletedCount || 0,
      wishlistUpdatedCount: wishlistResult.modifiedCount || 0,
    });
  } catch (error) {
    console.error("Bulk delete products error:", error);
    return NextResponse.json({ error: "Failed to delete products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = rateLimit(request, {
      namespace: "admin-product-create",
      identifier: session.user.id,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 512 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json();

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });
    const existingSlug = await Product.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const variants = Array.isArray(body.variants) ? body.variants : [];
    const totalStock = variants.length > 0
      ? variants.reduce(
          (sum: number, v: { stock: number }) => sum + Math.max(0, Number(v.stock) || 0),
          0
        )
      : Math.max(0, Number(body.stock) || 0);

    const product = await Product.create({
      ...body,
      slug: finalSlug,
      isPublished: body.isPublished !== false,
      stock: totalStock,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
