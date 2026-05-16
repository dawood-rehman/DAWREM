import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { storeUploadedFile } from "@/lib/server-upload";
import { UPLOAD_CONFIG } from "@/lib/upload-policy";
import { rateLimit, requestSizeLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const REVIEW_UPLOAD_REQUEST_BYTES = UPLOAD_CONFIG["review-images"].maxBytes + 1024 * 1024;

function errorStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : 500;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Image upload failed";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please login to upload review photos" }, { status: 401 });
  }

  const limited = rateLimit(request, {
    namespace: "review-upload",
    identifier: session.user.id,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const tooLarge = requestSizeLimit(request, REVIEW_UPLOAD_REQUEST_BYTES);
  if (tooLarge) return tooLarge;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose an image" }, { status: 400 });
  }

  try {
    const asset = await storeUploadedFile(file, "review-images", { imageMaxSide: 1800 });
    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: errorStatus(error) }
    );
  }
}
