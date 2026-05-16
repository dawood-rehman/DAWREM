import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { Feedback } from "@/models/index";
import { subDays } from "date-fns";
import DashboardClient from "./DashboardClient";

async function getDashboardData() {
  try {
    await connectDB();
    const thirtyDaysAgo = subDays(new Date(), 30);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      pendingOrders,
      revenueByDay,
      topProducts,
      ordersByStatus,
      lowStockProducts,
      recentOrders,
      openFeedback,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: "customer" }),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", name: { $first: "$items.name" }, image: { $first: "$items.image" }, totalRevenue: { $sum: { $multiply: [{ $ifNull: ["$items.salePrice", "$items.price"] }, "$items.quantity"] } }, totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),
      Product.find({ isPublished: true })
        .where("stock").lte(5)
        .select("name slug stock images")
        .limit(8)
        .lean(),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select("orderNumber shippingAddress.fullName total orderStatus paymentStatus createdAt")
        .lean(),
      Feedback.countDocuments({ status: { $in: ["new", "in_progress"] } }),
    ]);

    return {
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        totalCustomers,
        pendingOrders,
        openFeedback,
      },
      revenueByDay,
      topProducts,
      ordersByStatus,
      lowStockProducts,
      recentOrders,
    };
  } catch {
    return {
      summary: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, pendingOrders: 0, openFeedback: 0 },
      revenueByDay: [],
      topProducts: [],
      ordersByStatus: [],
      lowStockProducts: [],
      recentOrders: [],
    };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();
  return <DashboardClient data={JSON.parse(JSON.stringify(data))} />;
}
