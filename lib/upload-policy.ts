export type UploadKind =
  | "product-images"
  | "banner-images"
  | "gallery-images"
  | "category-images"
  | "review-images"
  | "promotional-media"
  | "assets";

export type UploadGroup = "image" | "video" | "document" | "unknown";

export const IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const DOCUMENT_MIMES = ["application/pdf"] as const;

export const UPLOAD_CONFIG: Record<
  UploadKind,
  {
    folder: string;
    maxBytes: number;
    allow: "image" | "media" | "asset";
  }
> = {
  "product-images": { folder: "products", maxBytes: 10 * 1024 * 1024, allow: "image" },
  "banner-images": { folder: "banners", maxBytes: 12 * 1024 * 1024, allow: "image" },
  "gallery-images": { folder: "gallery", maxBytes: 10 * 1024 * 1024, allow: "image" },
  "category-images": { folder: "categories", maxBytes: 10 * 1024 * 1024, allow: "image" },
  "review-images": { folder: "reviews", maxBytes: 8 * 1024 * 1024, allow: "image" },
  "promotional-media": { folder: "promotional", maxBytes: 30 * 1024 * 1024, allow: "media" },
  assets: { folder: "assets", maxBytes: 16 * 1024 * 1024, allow: "asset" },
};

export const UPLOAD_ACCEPT: Record<UploadKind, string> = {
  "product-images": IMAGE_MIMES.join(","),
  "banner-images": IMAGE_MIMES.join(","),
  "gallery-images": IMAGE_MIMES.join(","),
  "category-images": IMAGE_MIMES.join(","),
  "review-images": IMAGE_MIMES.join(","),
  "promotional-media": [...IMAGE_MIMES, ...VIDEO_MIMES].join(","),
  assets: [...IMAGE_MIMES, ...VIDEO_MIMES, ...DOCUMENT_MIMES].join(","),
};

export function isUploadKind(value: string): value is UploadKind {
  return Object.prototype.hasOwnProperty.call(UPLOAD_CONFIG, value);
}

export function classifyMime(mimeType: string): UploadGroup {
  if ((IMAGE_MIMES as readonly string[]).includes(mimeType)) return "image";
  if ((VIDEO_MIMES as readonly string[]).includes(mimeType)) return "video";
  if ((DOCUMENT_MIMES as readonly string[]).includes(mimeType)) return "document";
  return "unknown";
}

export function canUpload(kind: UploadKind, mimeType: string) {
  const config = UPLOAD_CONFIG[kind];
  const group = classifyMime(mimeType);

  if (config.allow === "image") return group === "image";
  if (config.allow === "media") return group === "image" || group === "video";
  return group === "image" || group === "video" || group === "document";
}

export function formatUploadSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}
