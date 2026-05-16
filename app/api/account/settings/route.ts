import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { rateLimit, requestSizeLimit } from "@/lib/security";

const settingsSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().trim().email("Enter a valid email address").max(160),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword && value.newPassword.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "New password must be at least 8 characters",
      });
    }
  });

function jsonError(message: string, status: number, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ error: message, fieldErrors }, { status });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("You must be signed in to update account settings", 401);
  }

  const limited = rateLimit(request, {
    namespace: "account-settings-update",
    identifier: session.user.id,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const tooLarge = requestSizeLimit(request, 16 * 1024);
  if (tooLarge) return tooLarge;

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = String(issue.path[0] ?? "form");
      acc[key] = issue.message;
      return acc;
    }, {});

    return jsonError("Please check the highlighted fields", 400, fieldErrors);
  }

  await connectDB();

  const user = await User.findById(session.user.id).select("+password");

  if (!user || user.isBlocked) {
    return jsonError("Account not found or unavailable", 404);
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const emailChanged = email !== user.email;

  if (emailChanged) {
    const existing = await User.findOne({ email, _id: { $ne: user._id } }).select("_id").lean();
    if (existing) {
      return jsonError("An account with this email already exists", 409, {
        email: "An account with this email already exists",
      });
    }
  }

  if (parsed.data.newPassword) {
    if (user.password) {
      if (!parsed.data.currentPassword) {
        return jsonError("Current password is required", 400, {
          currentPassword: "Enter your current password",
        });
      }

      const passwordMatches = await bcrypt.compare(parsed.data.currentPassword, user.password);
      if (!passwordMatches) {
        return jsonError("Current password is incorrect", 400, {
          currentPassword: "Current password is incorrect",
        });
      }
    }

    user.password = await bcrypt.hash(parsed.data.newPassword, 12);
    if (!user.provider) user.provider = "credentials";
  }

  user.name = name;
  user.email = email;
  await user.save();

  return NextResponse.json({
    message: "Account settings updated",
    user: {
      name: user.name,
      email: user.email,
      hasPassword: Boolean(user.password),
    },
  });
}
