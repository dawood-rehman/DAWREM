import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, requestSizeLimit } from "@/lib/security";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const SUCCESS_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function appBaseUrl(request: NextRequest) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  return request.nextUrl.origin;
}

function json(message: string, status = 200) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, {
      namespace: "auth-forgot-password",
      limit: 6,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 8 * 1024);
    if (tooLarge) return tooLarge;

    const body = await request.json().catch(() => null);
    const email =
      body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string"
        ? (body as { email: string }).email.trim().toLowerCase()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email }).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    if (!user || user.isBlocked) {
      return json(SUCCESS_MESSAGE);
    }

    const rawToken = randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(rawToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `${appBaseUrl(request)}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return json(SUCCESS_MESSAGE);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Unable to send a reset link right now. Please try again later." },
      { status: 500 }
    );
  }
}
