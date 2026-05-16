import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  getStorefrontSettings,
  normalizeStorefrontSettings,
  saveStorefrontSettings,
} from "@/lib/storefront-settings";
import { rateLimit, requestSizeLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

const isMediaUrl = (value: string) => {
  if (!value) return true;
  if (/^\/uploads\/[A-Za-z0-9/_./-]+$/.test(value)) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const mediaUrlSchema = (max = 700) =>
  z.string().trim().max(max).refine(isMediaUrl, "Use a valid image URL or uploaded media path");

const storefrontSettingsSchema = z.object({
  whatsapp: z.object({
    enabled: z.boolean(),
    phone: z.string().trim().max(40),
    message: z.string().trim().max(240),
  }),
  hero: z.object({
    slideDurationMs: z.coerce.number().int().min(2500).max(12000),
    transitionDurationMs: z.coerce.number().int().min(300).max(1800),
    slides: z.array(
      z.object({
        id: z.string().trim().min(1).max(80),
        image: mediaUrlSchema(700).refine((value) => value.length > 0, "Image is required"),
        alt: z.string().trim().max(180),
        eyebrow: z.string().trim().min(1).max(60),
        title: z.string().trim().min(1).max(90),
        position: z.string().trim().min(1).max(40),
        enabled: z.boolean(),
      })
    ).min(1).max(8),
  }),
  about: z.object({
    ownerName: z.string().trim().min(1).max(80),
    ownerRole: z.string().trim().min(1).max(120),
    ownerImageUrl: mediaUrlSchema(500).or(z.literal("")),
  }),
  careers: z.object({
    intro: z.string().trim().min(1).max(500),
    jobs: z.array(
      z.object({
        id: z.string().trim().min(1).max(80),
        title: z.string().trim().min(1).max(120),
        department: z.string().trim().min(1).max(80),
        location: z.string().trim().min(1).max(120),
        type: z.string().trim().min(1).max(60),
        summary: z.string().trim().max(300),
        description: z.string().trim().max(900),
        requirements: z.array(z.string().trim().max(180)).max(8),
        applyEmail: z.string().trim().email().max(180).or(z.literal("")),
        enabled: z.boolean(),
      })
    ).max(20),
  }),
  socialLinks: z.array(
    z.object({
      id: z.string().trim().min(1).max(40),
      label: z.string().trim().min(1).max(40),
      url: z.string().trim().url().max(300).or(z.literal("")),
      enabled: z.boolean(),
    })
  ).max(12),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ settings: await getStorefrontSettings() });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(request, {
    namespace: "admin-storefront-settings",
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const tooLarge = requestSizeLimit(request, 256 * 1024);
  if (tooLarge) return tooLarge;

  const body = await request.json().catch(() => null);
  const parsed = storefrontSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid storefront settings", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const settings = normalizeStorefrontSettings(parsed.data);
  await saveStorefrontSettings(settings);

  return NextResponse.json({ settings, message: "Storefront settings updated" });
}
