import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { storeUploadedFile } from "@/lib/server-upload";
import { UPLOAD_CONFIG, isUploadKind } from "@/lib/upload-policy";
import { rateLimit, requestSizeLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_UPLOAD_REQUEST_BYTES = Math.max(
  ...Object.values(UPLOAD_CONFIG).map((config) => config.maxBytes)
) + 1024 * 1024;

function errorStatus(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : 500;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Upload failed";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(request, {
    namespace: "admin-upload",
    identifier: session.user.id,
    limit: 40,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  const tooLarge = requestSizeLimit(request, MAX_UPLOAD_REQUEST_BYTES);
  if (tooLarge) return tooLarge;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const rawKind = String(formData?.get("kind") || "assets");
  const kind = isUploadKind(rawKind) ? rawKind : "assets";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please choose a file to upload" }, { status: 400 });
  }

  try {
    const asset = await storeUploadedFile(file, kind);
    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: errorStatus(error) }
    );
  }
}
