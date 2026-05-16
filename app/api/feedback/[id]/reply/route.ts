import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Feedback } from "@/models/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";
import { rateLimit, requestSizeLimit } from "@/lib/security";
import { BRAND_NAME, BRAND_POWERED_BY_STYLIZED, BRAND_SIGNATURE } from "@/lib/brand";

interface FeedbackReplyTarget {
  email: string;
  subject: string;
  ticketNumber: string;
  name: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(
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
      namespace: "admin-feedback-reply",
      identifier: session.user.id,
      limit: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const tooLarge = requestSizeLimit(request, 32 * 1024);
    if (tooLarge) return tooLarge;

    await connectDB();
    const body = await request.json().catch(() => null);
    const reply = body && typeof body === "object" && "reply" in body ? body.reply : null;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "Reply text required" }, { status: 400 });
    }
    const safeReply = escapeHtml(reply.trim().slice(0, 4000));

    const feedback = await Feedback.findById(id).lean<FeedbackReplyTarget>();
    if (!feedback) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const safeName = escapeHtml(feedback.name);
    const safeTicket = escapeHtml(feedback.ticketNumber);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: feedback.email,
      subject: `Re: ${feedback.subject} [Ticket: ${feedback.ticketNumber}]`,
      html: `
        <div style="max-width:600px;margin:20px auto;font-family:Arial,sans-serif;">
          <div style="background:linear-gradient(135deg,#6B2737,#1A1A1A);padding:28px 40px;text-align:center;">
            <h1 style="color:#C9A84C;font-family:Georgia,serif;font-size:20px;letter-spacing:1px;line-height:1.45;margin:0;font-weight:300;">${BRAND_SIGNATURE}</h1>
            <p style="color:#FAF7F2;font-family:Georgia,serif;font-size:13px;line-height:1.5;margin:8px 0 0;opacity:.78;">${BRAND_POWERED_BY_STYLIZED}</p>
          </div>
          <div style="background:#fff;padding:40px;border:1px solid #eee;">
            <p style="color:#333;font-size:14px;margin:0 0 8px;">Hi ${safeName},</p>
            <p style="color:#666;font-size:13px;margin:0 0 24px;">Regarding your ticket <strong style="color:#6B2737;">${safeTicket}</strong>:</p>
            <div style="background:#f8f4f0;padding:20px;border-left:3px solid #C9A84C;margin:0 0 24px;">
              <p style="color:#333;font-size:14px;line-height:1.7;margin:0;white-space:pre-line;">${safeReply}</p>
            </div>
            <p style="color:#666;font-size:13px;">If you need further assistance, please reply to this email or visit <a href="${process.env.NEXT_PUBLIC_APP_URL}/feedback" style="color:#6B2737;">our support page</a>.</p>
            <p style="color:#999;font-size:12px;margin-top:24px;">${BRAND_NAME} Customer Support Team</p>
          </div>
        </div>
      `,
    });

    await Feedback.findByIdAndUpdate(id, { $set: { status: "in_progress" } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reply email error:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
