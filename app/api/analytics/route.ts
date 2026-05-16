import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { Feedback } from "@/models/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = request.nextUrl;
    const range = searchParams.get("range") || "30"; // days

    const daysBack = parseInt(range);
    const startDate = subDays(new Date(), daysBack);

    // Parallel aggregate queries
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      pendingOrders,
      revenueByDay,
      topProducts,
      ordersByStatus,
      lowStockProducts,
      recentFeedback,
      newCustomers,
    ] = await Promise.all([
      // Total revenue
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Total orders
      Order.countDocuments({ createdAt: { $gte: startDate } }),

      // Total customers
      User.countDocuments({ role: "customer" }),

      // Pending orders count
      Order.countDocuments({ orderStatus: "pending" }),

      // Revenue by day (last N days)
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top products by revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            totalRevenue: { $sum: { $multiply: [{ $ifNull: ["$items.salePrice", "$items.price"] }, "$items.quantity"] } },
            totalSold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
      ]),

      // Orders by status
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),

      // Low stock products
      Product.find({ isPublished: true, $expr: { $lte: ["$stock", "$lowStockThreshold"] } })
        .select("name slug stock lowStockThreshold images")
        .limit(10)
        .lean(),

      // Recent feedback
      Feedback.find({ status: { $in: ["new", "in_progress"] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // New customers this period
      User.countDocuments({ role: "customer", createdAt: { $gte: startDate } }),
    ]);

    return NextResponse.json({
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        totalCustomers,
        pendingOrders,
        newCustomers,
      },
      revenueByDay,
      topProducts,
      ordersByStatus,
      lowStockProducts,
      recentFeedback,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
