import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { automationEngine } from "@/lib/automations/engine";
import { rateLimit, requestSizeLimit } from "@/lib/security";
import mongoose from "mongoose";

interface OrderItemRecord {
  productId: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  slug?: string;
}

interface OrderRecord {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  orderNumber: string;
  orderStatus: string;
  items: OrderItemRecord[];
}

interface OrderAutomationUser {
  email: string;
  name: string;
}

function orderLookup(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }

  return { orderNumber: id.toUpperCase() };
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const order = await Order.findOne(orderLookup(id)).lean<OrderRecord>();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Non-admins can only see their own orders
    if (session.user.role !== "admin" && order.userId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
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
      namespace: "admin-order-update",
      identifier: session.user.id,
      limit: 40,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 32 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid order update" }, { status: 400 });
    }
    const { orderStatus, paymentStatus, trackingNumber, courier, note } = body;

    const order = await Order.findOne(orderLookup(id)).lean<OrderRecord>();
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const update: Record<string, unknown> = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (trackingNumber) update.trackingNumber = trackingNumber;
    if (courier) update.courier = courier;

    const timelineEntry = {
      status: orderStatus || order.orderStatus,
      message: note || `Order ${orderStatus || "updated"} by admin`,
      timestamp: new Date(),
      updatedBy: session.user.email,
    };

    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        $set: update,
        $push: { timeline: timelineEntry },
      },
      { new: true }
    ).lean<OrderRecord>();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Trigger automation for status update
    if (orderStatus && updated.userId) {
      const user = await User.findById(updated.userId).lean<OrderAutomationUser>();
      if (user) {
        const statusMessages: Record<string, string> = {
          confirmed: "Great news! Your order has been confirmed and is being prepared.",
          packed: "Your order has been carefully packed and is ready for dispatch.",
          shipped: `Your order is on its way! ${trackingNumber ? `Tracking: ${trackingNumber}` : ""}`,
          delivered: "Your order has been delivered. We hope you love it!",
          cancelled: "Your order has been cancelled. A refund will be processed shortly if applicable.",
        };

        await automationEngine.trigger("order.status_updated", {
          email: user.email,
          name: user.name,
          orderNumber: updated.orderNumber,
          status: orderStatus,
          message: statusMessages[orderStatus] || `Your order status is now: ${orderStatus}`,
          trackingNumber,
        });

        // Trigger review request after delivery (with delay handled by scheduled job)
        if (orderStatus === "delivered") {
          await Order.findByIdAndUpdate(order._id, { $set: { isReviewRequested: false } });
          await automationEngine.trigger("order.delivered", {
            email: user.email,
            name: user.name,
            orderNumber: updated.orderNumber,
            products: updated.items.map((item) => ({
              id: item.productId,
              name: item.name,
              image: item.image,
              slug: item.slug,
            })),
          });
        }
      }
    }

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
