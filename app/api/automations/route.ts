import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Automation } from "@/models/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { seedDefaultAutomations } from "@/lib/automations/engine";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Seed defaults if none exist
    const count = await Automation.countDocuments();
    if (count === 0) await seedDefaultAutomations();

    const automations = await Automation.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ automations });
  } catch {
    return NextResponse.json({ error: "Failed to fetch automations" }, { status: 500 });
  }
}
