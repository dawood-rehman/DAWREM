import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import {
  UPLOAD_CONFIG,
  canUpload,
  classifyMime,
  formatUploadSize,
  type UploadKind,
} from "@/lib/upload-policy";

type UploadBuffer = Buffer<ArrayBufferLike>;
type ResourceType = "image" | "video" | "raw";
type StorageProvider = "cloudinary" | "local";

export interface StoredAsset {
  url: string;
  kind: UploadKind;
  storage: StorageProvider;
  publicId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

const EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "application/pdf": "pdf",
};

export function cloudinaryReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function requiresPermanentStorage() {
  return process.env.NODE_ENV === "production";
}

async function optimizeImage(buffer: UploadBuffer, maxSide = 2400) {
  const image = sharp(buffer, { failOn: "warning" }).rotate();
  const optimized = await image
    .resize({
      width: maxSide,
      height: maxSide,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: optimized.data,
    extension: "webp",
    mimeType: "image/webp",
    width: optimized.info.width,
    height: optimized.info.height,
  };
}

function uploadToCloudinary(
  buffer: UploadBuffer,
  options: {
    folder: string;
    publicId: string;
    resourceType: ResourceType;
  }
) {
  return new Promise<{
    secure_url: string;
    bytes: number;
    width?: number;
    height?: number;
    public_id: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `dawrem/${options.folder}`,
        public_id: options.publicId,
        resource_type: options.resourceType,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function saveLocally(buffer: UploadBuffer, folder: string, fileName: string) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const directory = path.join(process.cwd(), "public", "uploads", folder, year, month);

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), buffer);

  return `/uploads/${folder}/${year}/${month}/${fileName}`;
}

export async function storeUploadedFile(
  file: File,
  kind: UploadKind,
  options: { imageMaxSide?: number } = {}
): Promise<StoredAsset> {
  const config = UPLOAD_CONFIG[kind];

  if (file.size > config.maxBytes) {
    throw Object.assign(
      new Error(`File is too large. Max size is ${formatUploadSize(config.maxBytes)}.`),
      { status: 413 }
    );
  }

  if (!canUpload(kind, file.type)) {
    throw Object.assign(
      new Error("This file type is not allowed for the selected upload area."),
      { status: 415 }
    );
  }

  const originalBuffer: UploadBuffer = Buffer.from(await file.arrayBuffer());
  const group = classifyMime(file.type);
  const baseName = `${Date.now()}-${randomUUID()}`;

  let uploadBuffer: UploadBuffer = originalBuffer;
  let extension = EXTENSIONS[file.type] || "bin";
  let mimeType = file.type;
  let width: number | undefined;
  let height: number | undefined;
  let resourceType: ResourceType = group === "video" ? "video" : "raw";

  if (group === "image") {
    try {
      const optimized = await optimizeImage(originalBuffer, options.imageMaxSide);
      uploadBuffer = optimized.buffer;
      extension = optimized.extension;
      mimeType = optimized.mimeType;
      width = optimized.width;
      height = optimized.height;
      resourceType = "image";
    } catch {
      throw Object.assign(new Error("Image could not be processed. Please try another file."), {
        status: 422,
      });
    }
  }

  const fileName = `${baseName}.${extension}`;

  if (!cloudinaryReady()) {
    if (requiresPermanentStorage()) {
      throw Object.assign(
        new Error("Cloudinary is not configured. Add Cloudinary environment variables before uploading in production."),
        { status: 503 }
      );
    }

    const url = await saveLocally(uploadBuffer, config.folder, fileName);
    return {
      url,
      kind,
      storage: "local",
      originalName: file.name,
      mimeType,
      size: uploadBuffer.length,
      width,
      height,
    };
  }

  configureCloudinary();

  try {
    const uploaded = await uploadToCloudinary(uploadBuffer, {
      folder: config.folder,
      publicId: baseName,
      resourceType,
    });

    return {
      url: uploaded.secure_url,
      kind,
      storage: "cloudinary",
      publicId: uploaded.public_id,
      originalName: file.name,
      mimeType,
      size: uploaded.bytes || uploadBuffer.length,
      width: uploaded.width || width,
      height: uploaded.height || height,
    };
  } catch {
    if (requiresPermanentStorage()) {
      throw Object.assign(new Error("Cloudinary upload failed. Please try again."), {
        status: 502,
      });
    }

    const url = await saveLocally(uploadBuffer, config.folder, fileName);
    return {
      url,
      kind,
      storage: "local",
      originalName: file.name,
      mimeType,
      size: uploadBuffer.length,
      width,
      height,
    };
  }
}
