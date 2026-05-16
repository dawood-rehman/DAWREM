import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { Coupon } from "@/models/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { automationEngine } from "@/lib/automations/engine";
import {
  MAX_CART_ITEM_QUANTITY,
  calculateOrderTotal,
  calculateShipping,
} from "@/lib/commerce";
import { rateLimit, requestSizeLimit } from "@/lib/security";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

function generateOrderNumber(): string {
  return `VEL-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;
}

interface ValidatedOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
  size: string;
  color: string;
  sku?: string;
  hasVariant: boolean;
}

interface ProductVariant {
  size: string;
  color: string;
  stock: number;
  sku?: string;
}

interface OrderAutomationUser {
  email: string;
  name: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = request.nextUrl;
    const orderNumber = searchParams.get("orderNumber")?.trim().toUpperCase();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!session && (!orderNumber || !email)) {
      return NextResponse.json(
        { error: "Order number and email are required for guest tracking" },
        { status: 401 }
      );
    }

    if (!session) {
      const limited = rateLimit(request, {
        namespace: "guest-order-track",
        limit: 20,
        windowMs: 10 * 60 * 1000,
      });
      if (limited) return limited;
    }

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (!session) {
      filter.orderNumber = orderNumber;
      filter.guestEmail = email;
    } else if (session.user.role !== "admin") {
      filter.userId = session.user.id;
    } else {
      // Admin filters
      const status = searchParams.get("status");
      if (status) filter.orderStatus = status;

      const payment = searchParams.get("payment");
      if (payment) filter.paymentStatus = payment;

      const search = searchParams.get("search");
      if (search) {
        filter.$or = [
          { orderNumber: new RegExp(search, "i") },
          { "shippingAddress.fullName": new RegExp(search, "i") },
          { "shippingAddress.phone": new RegExp(search, "i") },
        ];
      }
    }

    if (orderNumber) filter.orderNumber = orderNumber;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const limited = rateLimit(request, {
      namespace: "order-create",
      identifier: session?.user.id,
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 128 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid order request" }, { status: 400 });
    }

    const {
      items, shippingAddress, billingAddress,
      paymentMethod, couponCode, notes, giftMessage, guestEmail,
    } = body;

    if (
      !Array.isArray(items) ||
      !items.length ||
      !shippingAddress ||
      typeof shippingAddress !== "object" ||
      typeof paymentMethod !== "string"
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const safeGuestEmail = typeof guestEmail === "string" ? guestEmail.trim().toLowerCase() : undefined;
    const safeShippingName =
      typeof shippingAddress.fullName === "string" && shippingAddress.fullName.trim()
        ? shippingAddress.fullName.trim()
        : "Customer";

    // Validate stock and get current prices
    let subtotal = 0;
    const validatedItems: ValidatedOrderItem[] = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return NextResponse.json({ error: "Invalid product selected" }, { status: 400 });
      }

      const quantity = Number(item.quantity);
      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_CART_ITEM_QUANTITY
      ) {
        return NextResponse.json({
          error: `Invalid quantity for ${item.name || "selected product"}`,
        }, { status: 400 });
      }

      const product = await Product.findById(item.productId);
      if (!product || !product.isPublished) {
        return NextResponse.json({ error: `Product not available: ${item.name}` }, { status: 400 });
      }

      const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
      const size = String(item.size || "").trim() || "One Size";
      const color = String(item.color || "").trim() || "Default";
      const variants = product.variants as ProductVariant[] | undefined;
      const variant = hasVariants
        ? variants?.find((v) => v.size === size && v.color === color)
        : null;

      if (hasVariants && !variant) {
        return NextResponse.json({
          error: `Selected variant is not available for ${product.name}`,
        }, { status: 400 });
      }

      const availableStock = hasVariants ? Number(variant?.stock || 0) : Number(product.stock || 0);
      if (availableStock < quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${product.name} (${size}/${color})`,
        }, { status: 400 });
      }

      const price = product.price;
      const salePrice = product.salePrice;
      subtotal += (salePrice || price) * quantity;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || "/brand/dawrem-social.svg",
        price,
        salePrice,
        quantity,
        size,
        color,
        sku: variant?.sku,
        hasVariant: Boolean(hasVariants),
      });
    }

    // Validate and apply coupon
    let discountAmount = 0;
    let appliedCoupon = null;
    const normalizedCouponCode = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
    if (normalizedCouponCode) {
      const coupon = await Coupon.findOne({
        code: normalizedCouponCode,
        isActive: true,
        $or: [{ expiryDate: { $gte: new Date() } }, { expiryDate: { $exists: false } }],
      });

      if (coupon) {
        const alreadyUsedByUser =
          session?.user.id &&
          coupon.usedBy?.some((usedUserId: mongoose.Types.ObjectId) => (
            usedUserId.toString() === session.user.id
          ));

        if (alreadyUsedByUser) {
          return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
        }

        const applicableCategories = coupon.applicableCategories || [];
        const orderCategories = new Set(
          await Product.find({ _id: { $in: validatedItems.map((item) => item.productId) } })
            .distinct("category")
        );
        const appliesToOrder =
          applicableCategories.length === 0 ||
          applicableCategories.some((category: string) => orderCategories.has(category));

        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if ((!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) && appliesToOrder) {
            discountAmount = coupon.type === "percentage"
              ? Math.min(subtotal * (coupon.value / 100), coupon.maxDiscountAmount || Infinity)
              : coupon.value;
            discountAmount = Math.min(Math.round(discountAmount), subtotal);
            appliedCoupon = coupon;
          }
        }
      }
    }

    const shippingCost = calculateShipping(subtotal, discountAmount);
    const total = calculateOrderTotal(subtotal, discountAmount);
    const orderItems = validatedItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      salePrice: item.salePrice,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      sku: item.sku,
    }));

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: session?.user.id || undefined,
      guestEmail: safeGuestEmail,
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "pending",
      subtotal,
      discountAmount,
      couponCode: appliedCoupon ? normalizedCouponCode : undefined,
      shippingCost,
      total,
      notes,
      giftMessage,
      timeline: [{ status: "pending", message: "Order placed successfully", timestamp: new Date() }],
    });

    // Update stock for each item
    for (const item of validatedItems) {
      const stockUpdate = item.hasVariant
        ? await Product.updateOne(
          {
            _id: item.productId,
            "variants.size": item.size,
            "variants.color": item.color,
            "variants.stock": { $gte: item.quantity },
          },
          {
            $inc: {
              "variants.$.stock": -item.quantity,
              stock: -item.quantity,
              totalSold: item.quantity,
            },
          }
        )
        : await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity, totalSold: item.quantity } }
        );

      if (stockUpdate.modifiedCount === 0) {
        console.error("Stock update failed after order creation", {
          orderNumber: order.orderNumber,
          productId: item.productId.toString(),
        });
      }
    }

    // Mark coupon used
    if (appliedCoupon && session?.user.id) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: session.user.id },
      });
    }

    // Update user totals
    if (session?.user.id) {
      await User.findByIdAndUpdate(session.user.id, {
        $inc: { totalOrders: 1, totalSpent: total },
      });
    }

    // Fire automation
    const user = session?.user.id ? await User.findById(session.user.id).lean<OrderAutomationUser>() : null;
    await automationEngine.trigger("order.placed", {
      email: user?.email || safeGuestEmail,
      name: user?.name || safeShippingName,
      orderNumber: order.orderNumber,
      status: "confirmed",
      message: "Your order has been received and is being processed.",
    });

    return NextResponse.json({ order: { _id: order._id, orderNumber: order.orderNumber } }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
