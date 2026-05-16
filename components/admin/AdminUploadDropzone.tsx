"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import { Check, FileText, Image as ImageIcon, Loader2, Pencil, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import AdminImageEditorModal from "@/components/admin/AdminImageEditorModal";
import {
  UPLOAD_ACCEPT,
  UPLOAD_CONFIG,
  canUpload,
  formatUploadSize,
  type UploadKind,
} from "@/lib/upload-policy";

export interface UploadedAsset {
  url: string;
  kind: string;
  storage: "cloudinary" | "local";
  publicId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

interface UploadItem {
  id: string;
  file: File;
  previewUrl?: string;
  status: "preview" | "uploading" | "done" | "error";
  error?: string;
  asset?: UploadedAsset;
}

interface AdminUploadDropzoneProps {
  kind: UploadKind;
  label: string;
  description?: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  compact?: boolean;
  onUploaded?: (assets: UploadedAsset[]) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function clientId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AdminUploadDropzone({
  kind,
  label,
  description,
  multiple = true,
  maxFiles = multiple ? 8 : 1,
  accept,
  compact = false,
  onUploaded,
}: AdminUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const effectiveAccept = accept || UPLOAD_ACCEPT[kind];
  const uploadConfig = UPLOAD_CONFIG[kind];

  const isUploading = items.some((item) => item.status === "uploading");

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const uploadFile = useCallback(
    async (item: UploadItem) => {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status: "uploading", error: undefined } : entry
        )
      );

      try {
        const body = new FormData();
        body.append("file", item.file);
        body.append("kind", kind);

        const res = await fetch("/api/admin/uploads", {
          method: "POST",
          body,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Upload failed");

        const asset = data.asset as UploadedAsset;
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: "done", asset } : entry
          )
        );
        onUploaded?.([asset]);
        toast.success(`${item.file.name} uploaded`);
      } catch (error: unknown) {
        const message = errorMessage(error, "Upload failed");
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: "error", error: message } : entry
          )
        );
        toast.error(message);
      }
    },
    [kind, onUploaded]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const remainingSlots = multiple ? Math.max(maxFiles - items.length, 0) : maxFiles;
      const selected = Array.from(files).slice(0, remainingSlots);
      if (!selected.length) return;

      const validFiles = selected.filter((file) => {
        if (!canUpload(kind, file.type)) {
          toast.error(`${file.name}: file type is not allowed here`);
          return false;
        }

        if (file.size > uploadConfig.maxBytes) {
          toast.error(`${file.name}: max size is ${formatUploadSize(uploadConfig.maxBytes)}`);
          return false;
        }

        return true;
      });

      if (!validFiles.length) return;

      const nextItems: UploadItem[] = validFiles.map((file) => {
        const previewUrl = isImage(file) ? URL.createObjectURL(file) : undefined;
        if (previewUrl) previewUrlsRef.current.push(previewUrl);

        return {
          id: `${file.name}-${file.lastModified}-${clientId()}`,
          file,
          previewUrl,
          status: "preview",
        };
      });

      const imageItems = nextItems.filter((item) => isImage(item.file));
      const otherItems = nextItems.filter((item) => !isImage(item.file));

      setItems((current) => (multiple ? [...nextItems, ...current].slice(0, maxFiles) : nextItems));
      otherItems.forEach(uploadFile);

      if (imageItems[0]) {
        setEditingItemId(imageItems[0].id);
      }
    },
    [items.length, kind, maxFiles, multiple, uploadConfig.maxBytes, uploadFile]
  );

  const uploadById = (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (item) uploadFile(item);
  };

  const editingItem = items.find((item) => item.id === editingItemId);

  const applyEditedImage = (editedFile: File) => {
    if (!editingItem) return;

    if (editingItem.previewUrl) {
      URL.revokeObjectURL(editingItem.previewUrl);
      previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== editingItem.previewUrl);
    }

    const previewUrl = URL.createObjectURL(editedFile);
    previewUrlsRef.current.push(previewUrl);

    const updatedItem: UploadItem = {
      ...editingItem,
      file: editedFile,
      previewUrl,
      status: "preview",
      error: undefined,
    };

    setItems((current) =>
      current.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry))
    );
    setEditingItemId(null);
    uploadFile(updatedItem);
  };

  const dropzoneClasses = useMemo(
    () =>
      [
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center transition-all",
        compact ? "min-h-32 p-4" : "min-h-44 p-6 sm:p-8",
        dragging
          ? "border-gold-500 bg-gold-50/70 dark:bg-gold-500/10"
          : "border-gray-200 bg-white hover:border-gold-400 hover:bg-ivory-50 dark:bg-[var(--color-surface)]",
      ].join(" "),
    [compact, dragging]
  );

  const removeItem = (id: string) => {
    setItems((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
        previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== item.previewUrl);
      }
      return current.filter((entry) => entry.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      <div
        className={dropzoneClasses}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={effectiveAccept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-burgundy-900 text-ivory-50 shadow-card transition-transform group-hover:-translate-y-0.5 dark:bg-gold-500 dark:text-velour-black">
          {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
        </div>
        <p className="font-cormorant text-xl font-medium text-velour-black dark:text-ivory-50">
          {label}
        </p>
        {description && (
          <p className="mt-2 max-w-md text-xs leading-5 text-gray-500">{description}</p>
        )}
        <p className="mt-3 text-[10px] uppercase tracking-widest text-gold-600">
          Tap to choose files or drag and drop
        </p>
        <p className="mt-2 text-[11px] text-gray-400">
          Max {formatUploadSize(uploadConfig.maxBytes)}
        </p>
      </div>

      {items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm dark:bg-[var(--color-surface)]"
            >
              <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-ivory-100">
                {item.previewUrl ? (
                  <NextImage
                    src={item.previewUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                ) : item.file.type.startsWith("video/") ? (
                  <ImageIcon size={22} className="text-gray-400" />
                ) : (
                  <FileText size={22} className="text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-velour-black dark:text-ivory-50">
                      {item.file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{formatBytes(item.file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove upload"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs">
                {item.status === "preview" && (
                  <span className="text-gold-600">Ready to edit or upload</span>
                )}
                {item.status === "uploading" && (
                    <span className="inline-flex items-center gap-1 text-gold-600">
                      <Loader2 size={12} className="animate-spin" />
                      Uploading
                    </span>
                  )}
                  {item.status === "done" && (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <Check size={12} />
                      Uploaded to {item.asset?.storage === "cloudinary" ? "Cloudinary" : "local dev storage"}
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="text-red-600">{item.error || "Upload failed"}</span>
                  )}
                </div>

                {item.asset?.url && (
                  <input
                    readOnly
                    value={item.asset.url}
                    className="mt-2 w-full rounded border border-gray-100 bg-gray-50 px-2 py-1 text-[11px] text-gray-500 outline-none"
                    onFocus={(event) => event.target.select()}
                  />
                )}

                {item.status === "preview" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {isImage(item.file) && (
                      <button
                        type="button"
                        onClick={() => setEditingItemId(item.id)}
                        className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-2 text-xs text-gray-600 transition-colors hover:border-gold-400"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => uploadById(item.id)}
                      className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-2 text-xs text-gray-600 transition-colors hover:border-gold-400"
                    >
                      <Upload size={12} />
                      Upload
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingItem && (
        <AdminImageEditorModal
          file={editingItem.file}
          open={Boolean(editingItem)}
          onCancel={() => setEditingItemId(null)}
          onApply={applyEditedImage}
        />
      )}
    </div>
  );
}
