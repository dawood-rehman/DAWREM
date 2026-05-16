import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { rateLimit, requestSizeLimit } from "@/lib/security";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      namespace: "auth-reset-password",
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 8 * 1024);
    if (tooLarge) return tooLarge;

    const body = await request.json().catch(() => null);
    const payload =
      body && typeof body === "object"
        ? (body as { token?: unknown; password?: unknown })
        : {};

    const token = typeof payload.token === "string" ? payload.token.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!token) {
      return NextResponse.json({ error: "Reset link is missing or invalid" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!user || user.isBlocked) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(password, 12);
    user.provider = user.provider || "credentials";
    user.isEmailVerified = true;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Unable to reset password right now. Please try again later." },
      { status: 500 }
    );
  }
}
