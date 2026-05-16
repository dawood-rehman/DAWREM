import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Feedback } from "@/models/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { automationEngine } from "@/lib/automations/engine";
import { nanoid } from "nanoid";
import { rateLimit, requestSizeLimit } from "@/lib/security";

function generateTicketNumber(): string {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${nanoid(5).toUpperCase()}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = request.nextUrl;

    const filter: Record<string, unknown> = {};
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Feedback.countDocuments(filter),
    ]);

    return NextResponse.json({ feedbacks, total });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      namespace: "feedback-submit",
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 32 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => null);

    const { type, name, email, phone, subject, message, orderNumber } =
      body && typeof body === "object"
        ? body as Record<string, unknown>
        : {};

    if (
      typeof type !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const ticketNumber = generateTicketNumber();

    const feedback = await Feedback.create({
      type,
      userId: session?.user.id || undefined,
      name: name.trim().slice(0, 120),
      email: email.trim().toLowerCase(),
      phone: typeof phone === "string" ? phone.trim().slice(0, 40) : undefined,
      subject: subject.trim().slice(0, 160),
      message: message.trim().slice(0, 4000),
      orderNumber: typeof orderNumber === "string" ? orderNumber.trim().slice(0, 80) : undefined,
      ticketNumber,
      status: "new",
      priority: type === "complaint" ? "high" : "medium",
    });

    // Fire automation sends acknowledgement email.
    await automationEngine.trigger("feedback.submitted", {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      ticketNumber,
      type: type.replace("_", " "),
    });

    return NextResponse.json({
      feedback: { _id: feedback._id, ticketNumber },
      message: "Your message has been received. Ticket: " + ticketNumber,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
