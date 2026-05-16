import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { rateLimit, requestSizeLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      namespace: "newsletter-subscribe",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 4 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json().catch(() => null);
    const email = body && typeof body === "object" && "email" in body ? body.email : null;

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Update existing user or note subscriber
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          "emailPreferences.promotions": true,
          "emailPreferences.newArrivals": true,
        },
      }
    );

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
