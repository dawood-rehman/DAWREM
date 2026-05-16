"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { StorefrontSettings } from "@/lib/storefront-settings";
import SocialPlatformIcon from "@/components/store/SocialPlatformIcon";
import AdminUploadDropzone from "@/components/admin/AdminUploadDropzone";
import { BRAND_NAME } from "@/lib/brand";

interface StorefrontSettingsFormProps {
  initialSettings: StorefrontSettings;
}

function emptySocialLink() {
  return {
    id: `custom-${Date.now()}`,
    label: "",
    url: "",
    enabled: true,
  };
}

function emptyHeroSlide() {
  return {
    id: `hero-${Date.now()}`,
    image: "",
    alt: `${BRAND_NAME} fashion campaign`,
    eyebrow: "New Season",
    title: "Future Heirloom Fashion",
    position: "center center",
    enabled: true,
  };
}

function emptyCareerJob() {
  return {
    id: `job-${Date.now()}`,
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    summary: "",
    description: "",
    requirements: ["", "", ""],
    applyEmail: "careers@dawrem.com",
    enabled: true,
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function StorefrontSettingsForm({ initialSettings }: StorefrontSettingsFormProps) {
  const [settings, setSettings] = useState<StorefrontSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const updateWhatsapp = (key: keyof StorefrontSettings["whatsapp"], value: string | boolean) => {
    setSettings((current) => ({
      ...current,
      whatsapp: { ...current.whatsapp, [key]: value },
    }));
  };

  const updateAbout = (key: keyof StorefrontSettings["about"], value: string) => {
    setSettings((current) => ({
      ...current,
      about: { ...current.about, [key]: value },
    }));
  };

  const updateHero = (
    key: "slideDurationMs" | "transitionDurationMs",
    value: number
  ) => {
    setSettings((current) => ({
      ...current,
      hero: { ...current.hero, [key]: value },
    }));
  };

  const updateHeroSlide = (
    index: number,
    key: keyof StorefrontSettings["hero"]["slides"][number],
    value: string | boolean
  ) => {
    setSettings((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: current.hero.slides.map((slide, i) =>
          i === index ? { ...slide, [key]: value } : slide
        ),
      },
    }));
  };

  const addHeroSlide = () => {
    setSettings((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: [...current.hero.slides, emptyHeroSlide()].slice(0, 8),
      },
    }));
  };

  const removeHeroSlide = (index: number) => {
    setSettings((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: current.hero.slides.filter((_, i) => i !== index),
      },
    }));
  };

  const updateCareersIntro = (value: string) => {
    setSettings((current) => ({
      ...current,
      careers: { ...current.careers, intro: value },
    }));
  };

  const updateCareerJob = (
    index: number,
    key: keyof StorefrontSettings["careers"]["jobs"][number],
    value: string | boolean | string[]
  ) => {
    setSettings((current) => ({
      ...current,
      careers: {
        ...current.careers,
        jobs: current.careers.jobs.map((job, i) =>
          i === index ? { ...job, [key]: value } : job
        ),
      },
    }));
  };

  const updateCareerRequirement = (jobIndex: number, requirementIndex: number, value: string) => {
    setSettings((current) => ({
      ...current,
      careers: {
        ...current.careers,
        jobs: current.careers.jobs.map((job, i) =>
          i === jobIndex
            ? {
                ...job,
                requirements: job.requirements.map((requirement, r) =>
                  r === requirementIndex ? value : requirement
                ),
              }
            : job
        ),
      },
    }));
  };

  const addCareerRequirement = (jobIndex: number) => {
    setSettings((current) => ({
      ...current,
      careers: {
        ...current.careers,
        jobs: current.careers.jobs.map((job, i) =>
          i === jobIndex ? { ...job, requirements: [...job.requirements, ""].slice(0, 8) } : job
        ),
      },
    }));
  };

  const removeCareerRequirement = (jobIndex: number, requirementIndex: number) => {
    setSettings((current) => ({
      ...current,
      careers: {
        ...current.careers,
        jobs: current.careers.jobs.map((job, i) =>
          i === jobIndex
            ? { ...job, requirements: job.requirements.filter((_, r) => r !== requirementIndex) }
            : job
        ),
      },
    }));
  };

  const addCareerJob = () => {
    setSettings((current) => ({
      ...current,
      careers: {
        ...current.careers,
        jobs: [...current.careers.jobs, emptyCareerJob()].slice(0, 20),
      },
    }));
  };

  const removeCareerJob = (index: number) => {
    setSettings((current) => ({
      ...current,
      careers: {
        ...current.careers,
        jobs: current.careers.jobs.filter((_, i) => i !== index),
      },
    }));
  };

  const updateSocialLink = (
    index: number,
    key: keyof StorefrontSettings["socialLinks"][number],
    value: string | boolean
  ) => {
    setSettings((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link, i) =>
        i === index ? { ...link, [key]: value } : link
      ),
    }));
  };

  const addSocialLink = () => {
    setSettings((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, emptySocialLink()],
    }));
  };

  const removeSocialLink = (index: number) => {
    setSettings((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/storefront", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setSettings(data.settings);
      toast.success("Storefront settings saved");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <div className="space-y-6">
        <section className="admin-card space-y-5">
        <div>
          <h2 className="font-cormorant text-xl font-medium text-velour-black">WhatsApp Support</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            This number controls the floating WhatsApp chat button on the store.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-velour-black">
          <input
            type="checkbox"
            checked={settings.whatsapp.enabled}
            onChange={(e) => updateWhatsapp("enabled", e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          Enable WhatsApp button
        </label>

        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
            Phone Number
          </label>
          <input
            value={settings.whatsapp.phone}
            onChange={(e) => updateWhatsapp("phone", e.target.value)}
            placeholder="+923001234567"
            className="input-luxury"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
            Default Message
          </label>
          <textarea
            value={settings.whatsapp.message}
            onChange={(e) => updateWhatsapp("message", e.target.value)}
            rows={4}
            className="w-full resize-none border border-gray-200 bg-transparent px-3 py-3 text-sm outline-none transition-colors focus:border-gold-500"
          />
        </div>
        </section>

        <section className="admin-card space-y-5">
          <div>
            <h2 className="font-cormorant text-xl font-medium text-velour-black">About Page</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Controls the founder details and portrait area on the public About page.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
              Owner Name
            </label>
            <input
              value={settings.about.ownerName}
              onChange={(e) => updateAbout("ownerName", e.target.value)}
              placeholder="Dawood Rehman"
              className="input-luxury"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
              Owner Role
            </label>
            <input
              value={settings.about.ownerRole}
              onChange={(e) => updateAbout("ownerRole", e.target.value)}
              placeholder="Founder & Creative Director"
              className="input-luxury"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
              Portrait Image URL
            </label>
            <input
              value={settings.about.ownerImageUrl}
              onChange={(e) => updateAbout("ownerImageUrl", e.target.value)}
              placeholder="https://res.cloudinary.com/.../portrait.jpg"
              className="input-luxury"
            />
            <p className="mt-2 text-xs leading-5 text-gray-400">
              Upload a portrait from your phone or computer, or paste an existing media URL.
            </p>
            <div className="mt-3">
              <AdminUploadDropzone
                kind="gallery-images"
                label="Upload portrait"
                description="Optimized automatically for storefront use."
                multiple={false}
                compact
                onUploaded={(assets) => {
                  const asset = assets[0];
                  if (asset?.url) updateAbout("ownerImageUrl", asset.url);
                }}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
      <section className="admin-card space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-cormorant text-xl font-medium text-velour-black">Hero Slider</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Controls homepage slider images, copy, image focus, and slide speed.
            </p>
          </div>
          <button onClick={addHeroSlide} className="btn-outline inline-flex items-center justify-center gap-2">
            <Plus size={14} />
            Add Slide
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
              Slide Time
            </label>
            <input
              type="number"
              min={2500}
              max={12000}
              step={100}
              value={settings.hero.slideDurationMs}
              onChange={(e) => updateHero("slideDurationMs", Number(e.target.value))}
              className="input-luxury"
            />
            <p className="mt-2 text-xs text-gray-400">Recommended: 4000-4500 ms.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
              Transition Speed
            </label>
            <input
              type="number"
              min={300}
              max={1800}
              step={50}
              value={settings.hero.transitionDurationMs}
              onChange={(e) => updateHero("transitionDurationMs", Number(e.target.value))}
              className="input-luxury"
            />
            <p className="mt-2 text-xs text-gray-400">Recommended: 650-800 ms.</p>
          </div>
        </div>

        <div className="space-y-4">
          {settings.hero.slides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className="border border-gray-100 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-velour-black">
                  <input
                    type="checkbox"
                    checked={slide.enabled}
                    onChange={(e) => updateHeroSlide(index, "enabled", e.target.checked)}
                    className="h-4 w-4 accent-gold-500"
                  />
                  Slide {index + 1}
                </label>
                <button
                  onClick={() => removeHeroSlide(index)}
                  className="flex h-9 items-center justify-center gap-2 border border-red-200 px-3 text-xs text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Image URL
                  </label>
                  <input
                    value={slide.image}
                    onChange={(e) => updateHeroSlide(index, "image", e.target.value)}
                    placeholder="https://res.cloudinary.com/.../hero.jpg"
                    className="input-luxury"
                  />
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Upload a hero image from your device, or paste an existing media URL.
                  </p>
                  <div className="mt-3">
                    <AdminUploadDropzone
                      kind="banner-images"
                      label={`Upload slide ${index + 1} image`}
                      description="Large hero images are resized and optimized automatically."
                      multiple={false}
                      compact
                      onUploaded={(assets) => {
                        const asset = assets[0];
                        if (asset?.url) updateHeroSlide(index, "image", asset.url);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Eyebrow
                  </label>
                  <input
                    value={slide.eyebrow}
                    onChange={(e) => updateHeroSlide(index, "eyebrow", e.target.value)}
                    placeholder="New Season"
                    className="input-luxury"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Image Focus
                  </label>
                  <input
                    value={slide.position}
                    onChange={(e) => updateHeroSlide(index, "position", e.target.value)}
                    placeholder="center center"
                    className="input-luxury"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Title
                  </label>
                  <input
                    value={slide.title}
                    onChange={(e) => updateHeroSlide(index, "title", e.target.value)}
                    placeholder="Future Heirloom Fashion"
                    className="input-luxury"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Alt Text
                  </label>
                  <input
                    value={slide.alt}
                    onChange={(e) => updateHeroSlide(index, "alt", e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="input-luxury"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-cormorant text-xl font-medium text-velour-black">Careers</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Publish, edit, disable, or remove job openings shown on the Careers page.
            </p>
          </div>
          <button onClick={addCareerJob} className="btn-outline inline-flex items-center justify-center gap-2">
            <Plus size={14} />
            Add Job
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
            Careers Intro
          </label>
          <textarea
            value={settings.careers.intro}
            onChange={(e) => updateCareersIntro(e.target.value)}
            rows={3}
            className="w-full resize-none border border-gray-200 bg-transparent px-3 py-3 text-sm outline-none transition-colors focus:border-gold-500"
          />
        </div>

        <div className="space-y-4">
          {settings.careers.jobs.map((job, index) => (
            <div key={`${job.id}-${index}`} className="border border-gray-100 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-velour-black">
                  <input
                    type="checkbox"
                    checked={job.enabled}
                    onChange={(e) => updateCareerJob(index, "enabled", e.target.checked)}
                    className="h-4 w-4 accent-gold-500"
                  />
                  Job {index + 1}
                </label>
                <button
                  onClick={() => removeCareerJob(index)}
                  className="flex h-9 items-center justify-center gap-2 border border-red-200 px-3 text-xs text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Job Title
                  </label>
                  <input
                    value={job.title}
                    onChange={(e) => updateCareerJob(index, "title", e.target.value)}
                    placeholder="Fashion Operations Coordinator"
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Department
                  </label>
                  <input
                    value={job.department}
                    onChange={(e) => updateCareerJob(index, "department", e.target.value)}
                    placeholder="Operations"
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Location
                  </label>
                  <input
                    value={job.location}
                    onChange={(e) => updateCareerJob(index, "location", e.target.value)}
                    placeholder="Hybrid / Pakistan"
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Type
                  </label>
                  <input
                    value={job.type}
                    onChange={(e) => updateCareerJob(index, "type", e.target.value)}
                    placeholder="Full-time"
                    className="input-luxury"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Summary
                  </label>
                  <input
                    value={job.summary}
                    onChange={(e) => updateCareerJob(index, "summary", e.target.value)}
                    placeholder="Short one-line role summary"
                    className="input-luxury"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Description
                  </label>
                  <textarea
                    value={job.description}
                    onChange={(e) => updateCareerJob(index, "description", e.target.value)}
                    rows={3}
                    placeholder="Describe the role and impact."
                    className="w-full resize-none border border-gray-200 bg-transparent px-3 py-3 text-sm outline-none transition-colors focus:border-gold-500"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                    Apply Email
                  </label>
                  <input
                    type="email"
                    value={job.applyEmail}
                    onChange={(e) => updateCareerJob(index, "applyEmail", e.target.value)}
                    placeholder="careers@dawrem.com"
                    className="input-luxury"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500">
                      Requirements
                    </label>
                    <button
                      onClick={() => addCareerRequirement(index)}
                      className="text-xs text-burgundy-900 hover:underline"
                    >
                      Add Requirement
                    </button>
                  </div>
                  <div className="space-y-2">
                    {job.requirements.map((requirement, requirementIndex) => (
                      <div key={`${job.id}-req-${requirementIndex}`} className="flex gap-2">
                        <input
                          value={requirement}
                          onChange={(e) => updateCareerRequirement(index, requirementIndex, e.target.value)}
                          placeholder="Requirement"
                          className="input-luxury"
                        />
                        <button
                          onClick={() => removeCareerRequirement(index, requirementIndex)}
                          className="h-10 border border-red-200 px-3 text-red-600"
                          aria-label="Remove requirement"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-cormorant text-xl font-medium text-velour-black">Social Links</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Add, update, disable, or delete footer social links. Icons are auto-detected from the label or URL.
            </p>
          </div>
          <button onClick={addSocialLink} className="btn-outline inline-flex items-center justify-center gap-2">
            <Plus size={14} />
            Add Link
          </button>
        </div>

        <div className="space-y-3">
          {settings.socialLinks.map((link, index) => (
            <div key={`${link.id}-${index}`} className="grid gap-3 border border-gray-100 p-4 lg:grid-cols-[44px_160px_1fr_auto_auto] lg:items-end">
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                  Icon
                </label>
                <div className="flex h-10 w-10 items-center justify-center border border-gray-200 text-velour-black">
                  <SocialPlatformIcon id={link.id} label={link.label} url={link.url} size={16} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                  Label
                </label>
                <input
                  value={link.label}
                  onChange={(e) => updateSocialLink(index, "label", e.target.value)}
                  placeholder="WhatsApp Community"
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-gray-500">
                  URL
                </label>
                <input
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                  placeholder="https://..."
                  className="input-luxury"
                />
              </div>

              <label className="flex h-10 items-center gap-2 text-sm text-velour-black">
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(e) => updateSocialLink(index, "enabled", e.target.checked)}
                  className="h-4 w-4 accent-gold-500"
                />
                Active
              </label>

              <button
                onClick={() => removeSocialLink(index)}
                className="flex h-10 items-center justify-center gap-2 border border-red-200 px-4 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </section>
      </div>
    </div>
  );
}
