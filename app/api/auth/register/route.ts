import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { automationEngine } from "@/lib/automations/engine";
import { nanoid } from "nanoid";
import { rateLimit, requestSizeLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      namespace: "auth-register",
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 16 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json().catch(() => null);
    const { name, email, password } =
      body && typeof body === "object"
        ? body as { name?: unknown; email?: unknown; password?: unknown }
        : {};

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      name: name.trim().slice(0, 120),
      email: normalizedEmail,
      password: hashed,
      provider: "credentials",
      isEmailVerified: false,
    });

    // Trigger welcome email automation
    const discountCode = `WELCOME${nanoid(4).toUpperCase()}`;
    await automationEngine.trigger("user.registered", {
      email: normalizedEmail,
      name: name.trim(),
      discountCode,
    });

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
