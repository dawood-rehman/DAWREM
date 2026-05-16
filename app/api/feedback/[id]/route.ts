import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Feedback } from "@/models/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, requestSizeLimit } from "@/lib/security";

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
      namespace: "admin-feedback-update",
      identifier: session.user.id,
      limit: 50,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 32 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid feedback update" }, { status: 400 });
    }
    const update: Record<string, unknown> = {};
    if (body.status) update.status = body.status;
    if (body.priority) update.priority = body.priority;
    if (body.adminNotes) update.adminNotes = body.adminNotes;
    if (body.assignedTo) update.assignedTo = body.assignedTo;
    if (body.status === "resolved") update.resolvedAt = new Date();

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();
    if (!feedback) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
