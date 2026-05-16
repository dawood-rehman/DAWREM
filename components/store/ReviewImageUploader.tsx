"use client";

import { useRef, useState } from "react";
import NextImage from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  UPLOAD_ACCEPT,
  UPLOAD_CONFIG,
  canUpload,
  formatUploadSize,
} from "@/lib/upload-policy";

interface ReviewImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ReviewImageUploader({
  images,
  onChange,
  maxImages = 6,
}: ReviewImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    const availableSlots = Math.max(0, maxImages - images.length);
    const selected = Array.from(files).slice(0, availableSlots);
    if (!selected.length) {
      toast.error(`You can upload up to ${maxImages} review photos`);
      return;
    }

    const config = UPLOAD_CONFIG["review-images"];
    const validFiles = selected.filter((file) => {
      if (!canUpload("review-images", file.type)) {
        toast.error(`${file.name}: only JPG, PNG, WebP, or AVIF images are allowed`);
        return false;
      }

      if (file.size > config.maxBytes) {
        toast.error(`${file.name}: max size is ${formatUploadSize(config.maxBytes)}`);
        return false;
      }

      return true;
    });

    if (!validFiles.length) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of validFiles) {
        const body = new FormData();
        body.append("file", file);

        const res = await fetch("/api/reviews/uploads", {
          method: "POST",
          body,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Image upload failed");
        uploaded.push(data.asset.url);
      }

      onChange([...images, ...uploaded]);
      toast.success(validFiles.length === 1 ? "Review photo uploaded" : "Review photos uploaded");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Image upload failed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_ACCEPT["review-images"]}
        multiple
        className="hidden"
        onChange={(event) => uploadFiles(event.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || images.length >= maxImages}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-ivory-50 px-4 py-3 text-xs uppercase tracking-widest text-gray-500 transition-colors hover:border-gold-400 hover:text-burgundy-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[var(--color-surface)]"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
        {uploading ? "Uploading..." : "Add Review Photos"}
      </button>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div key={image} className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-100 bg-ivory-100">
              <NextImage
                src={image}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                aria-label="Remove review photo"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
