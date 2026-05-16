"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crop, RotateCcw, SlidersHorizontal, X } from "lucide-react";

interface AdminImageEditorModalProps {
  file: File;
  open: boolean;
  onCancel: () => void;
  onApply: (file: File) => void;
}

const aspectOptions = [
  { label: "Original", value: "original" },
  { label: "Product 4:5", value: "4:5" },
  { label: "Square", value: "1:1" },
  { label: "Hero 16:9", value: "16:9" },
  { label: "Portrait 3:4", value: "3:4" },
] as const;

function fileBaseName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "") || "edited-image";
}

export default function AdminImageEditorModal({
  file,
  open,
  onCancel,
  onApply,
}: AdminImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState<(typeof aspectOptions)[number]["value"]>("original");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open) return;

    const url = URL.createObjectURL(file);
    const nextImage = new Image();
    nextImage.onload = () => {
      setImage(nextImage);
      setAspect("original");
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    };
    nextImage.src = url;

    return () => {
      URL.revokeObjectURL(url);
      setImage(null);
    };
  }, [file, open]);

  const outputSize = useMemo(() => {
    if (!image) return { width: 1200, height: 1500 };

    const naturalRatio = image.naturalWidth / image.naturalHeight || 1;
    const ratio =
      aspect === "original"
        ? naturalRatio
        : aspect.split(":").map(Number).reduce((w, h) => w / h);

    const maxSide = 1800;
    if (ratio >= 1) {
      return { width: maxSide, height: Math.round(maxSide / ratio) };
    }

    return { width: Math.round(maxSide * ratio), height: maxSide };
  }, [aspect, image]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    canvas.width = outputSize.width;
    canvas.height = outputSize.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#faf7f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(
      canvas.width / 2 + (offsetX / 100) * canvas.width * 0.38,
      canvas.height / 2 + (offsetY / 100) * canvas.height * 0.38
    );
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    const scale =
      Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight) * zoom;

    ctx.drawImage(
      image,
      (-image.naturalWidth * scale) / 2,
      (-image.naturalHeight * scale) / 2,
      image.naturalWidth * scale,
      image.naturalHeight * scale
    );
    ctx.restore();
  }, [brightness, contrast, image, offsetX, offsetY, outputSize, rotation, saturation, zoom]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const reset = () => {
    setAspect("original");
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const apply = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setApplying(true);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setApplying(false);
          return;
        }

        const editedFile = new File([blob], `${fileBaseName(file.name)}-edited.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        });
        setApplying(false);
        onApply(editedFile);
      },
      "image/webp",
      0.9
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-velour-black/70 p-3 backdrop-blur-sm sm:p-6">
      <section className="grid max-h-[calc(100vh-1.5rem)] w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex min-h-[320px] items-center justify-center bg-velour-black p-4 sm:p-6">
          <canvas
            ref={canvasRef}
            className="max-h-[70vh] w-full max-w-full rounded-md object-contain shadow-2xl lg:max-h-[78vh]"
          />
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold-500">
                <SlidersHorizontal size={13} />
                Image Customization
              </p>
              <h2 className="mt-2 font-cormorant text-2xl font-medium text-velour-black dark:text-ivory-50">
                Crop & Adjust
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
              aria-label="Close editor"
            >
              <X size={17} />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500">
                <Crop size={13} />
                Crop Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAspect(option.value)}
                    className={`rounded-md border px-3 py-2 text-xs transition-colors ${
                      aspect === option.value
                        ? "border-burgundy-900 bg-burgundy-900 text-ivory-50 dark:border-gold-500 dark:bg-gold-500 dark:text-velour-black"
                        : "border-[var(--color-border)] text-[var(--color-text)] hover:border-gold-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: "Zoom", value: zoom, min: 1, max: 3, step: 0.01, set: setZoom },
              { label: "Move Left / Right", value: offsetX, min: -100, max: 100, step: 1, set: setOffsetX },
              { label: "Move Up / Down", value: offsetY, min: -100, max: 100, step: 1, set: setOffsetY },
              { label: "Rotation", value: rotation, min: -25, max: 25, step: 1, set: setRotation },
              { label: "Brightness", value: brightness, min: 60, max: 150, step: 1, set: setBrightness },
              { label: "Contrast", value: contrast, min: 70, max: 150, step: 1, set: setContrast },
              { label: "Saturation", value: saturation, min: 60, max: 170, step: 1, set: setSaturation },
            ].map((control) => (
              <div key={control.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-medium text-[var(--color-text)]">{control.label}</label>
                  <span className="text-xs text-gray-400">{Number(control.value).toFixed(control.step < 1 ? 2 : 0)}</span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={control.value}
                  onChange={(event) => control.set(Number(event.target.value))}
                  className="w-full accent-gold-500"
                />
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="btn-outline inline-flex flex-1 items-center justify-center gap-2 px-4"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={applying}
              className="btn-primary flex-1 px-4"
            >
              {applying ? "Applying..." : "Apply & Upload"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
