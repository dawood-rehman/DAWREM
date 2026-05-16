import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Automation } from "@/models/index";
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
      namespace: "admin-automation-update",
      identifier: session.user.id,
      limit: 40,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 64 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid automation update" }, { status: 400 });
    }
    const automation = await Automation.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).lean();

    if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ automation });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
