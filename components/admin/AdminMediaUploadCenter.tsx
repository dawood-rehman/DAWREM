"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Check, Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import AdminUploadDropzone, { type UploadedAsset } from "@/components/admin/AdminUploadDropzone";
import { BRAND_NAME } from "@/lib/brand";

const uploadAreas = [
  {
    kind: "product-images",
    title: "Product Images",
    description: "Photos for product pages, product cards, and WhatsApp order previews.",
  },
  {
    kind: "banner-images",
    title: "Banner Images",
    description: "Hero slides, sale banners, campaign visuals, and homepage promotional surfaces.",
  },
  {
    kind: "gallery-images",
    title: "Gallery Images",
    description: "Lookbook, Instagram-style grids, testimonials, about page, and editorial sections.",
  },
  {
    kind: "category-images",
    title: "Category Images",
    description: "Formal, casual, bridal, festive, lawn, and seasonal category artwork.",
  },
  {
    kind: "review-images",
    title: "Review Images",
    description: "Customer review photos and admin-added testimonial images.",
  },
  {
    kind: "promotional-media",
    title: "Promotional Media",
    description: "Campaign images or short videos for launches, offers, and social-style promotions.",
  },
  {
    kind: "assets",
    title: "Other Assets",
    description: "Reusable images, PDF files, and other safe brand/store assets.",
  },
] as const;

function copyUrl(url: string) {
  navigator.clipboard
    .writeText(url)
    .then(() => toast.success("URL copied"))
    .catch(() => toast.error("Could not copy URL"));
}

export default function AdminMediaUploadCenter() {
  const [assets, setAssets] = useState<UploadedAsset[]>([]);

  const addAssets = (nextAssets: UploadedAsset[]) => {
    setAssets((current) => [...nextAssets, ...current].slice(0, 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-cormorant font-medium text-velour-black">Media Uploads</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Upload {BRAND_NAME} product, banner, category, gallery, promotional, and general media from phone or desktop.
          </p>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        {uploadAreas.map((area) => (
          <div key={area.kind} className="admin-card space-y-4">
            <div>
              <h2 className="font-cormorant text-xl font-medium text-velour-black">{area.title}</h2>
              <p className="mt-1 text-xs leading-5 text-gray-500">{area.description}</p>
            </div>
            <AdminUploadDropzone
              kind={area.kind}
              label={`Upload ${area.title.toLowerCase()}`}
              description="Preview appears instantly. Files are validated, renamed securely, and optimized before storage."
              multiple
              maxFiles={8}
              onUploaded={addAssets}
            />
          </div>
        ))}
      </section>

      {assets.length > 0 && (
        <section className="admin-card space-y-4">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-600" />
            <h2 className="font-cormorant text-xl font-medium text-velour-black">Recently Uploaded</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <div key={`${asset.url}-${asset.originalName}`} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white">
                    {asset.mimeType.startsWith("image/") ? (
                      <NextImage
                        src={asset.url}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">
                        File
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-velour-black">{asset.originalName}</p>
                    <p className="mt-1 text-xs text-gray-400">{asset.storage}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => copyUrl(asset.url)}
                        className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-2 text-xs text-gray-600 hover:border-gold-400"
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-2 text-xs text-gray-600 hover:border-gold-400"
                      >
                        <ExternalLink size={12} />
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
