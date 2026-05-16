import { connectDB } from "@/lib/mongodb";
import { Settings } from "@/models/index";
import {
  DAWREM_FACEBOOK_URL,
  DAWREM_INSTAGRAM_URL,
  DAWREM_ORDER_WHATSAPP_WA_NUMBER,
  DAWREM_WHATSAPP_CHANNEL_URL,
  DAWREM_WHATSAPP_COMMUNITY_URL,
} from "@/lib/brand-links";
import { BRAND_NAME } from "@/lib/brand";

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  position: string;
  enabled: boolean;
}

export interface CareerJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  description: string;
  requirements: string[];
  applyEmail: string;
  enabled: boolean;
}

export interface StorefrontSettings {
  whatsapp: {
    enabled: boolean;
    phone: string;
    message: string;
  };
  hero: {
    slideDurationMs: number;
    transitionDurationMs: number;
    slides: HeroSlide[];
  };
  about: {
    ownerName: string;
    ownerRole: string;
    ownerImageUrl: string;
  };
  careers: {
    intro: string;
    jobs: CareerJob[];
  };
  socialLinks: SocialLink[];
}

export const defaultStorefrontSettings: StorefrontSettings = {
  whatsapp: {
    enabled: true,
    phone: `+${DAWREM_ORDER_WHATSAPP_WA_NUMBER}`,
    message: `Assalamualaikum, mujhe ${BRAND_NAME} se order/support chahiye.`,
  },
  hero: {
    slideDurationMs: 4200,
    transitionDurationMs: 700,
    slides: [
      {
        id: "signature-edit",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2400&q=85",
        alt: "Editorial luxury fashion campaign in warm sunlight",
        eyebrow: "Signature Edit",
        title: "Future Heirloom Fashion",
        position: "center 40%",
        enabled: true,
      },
      {
        id: "precision-tailoring",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?auto=format&fit=crop&w=2400&q=85",
        alt: "Tailored luxury suit detail for premium fashion",
        eyebrow: "Precision Tailoring",
        title: "Tailored for Presence",
        position: "center center",
        enabled: true,
      },
      {
        id: "new-season",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2400&q=85",
        alt: "Modern fashion silhouette in a refined studio mood",
        eyebrow: "New Season",
        title: "Modern Luxury in Motion",
        position: "center 34%",
        enabled: true,
      },
      {
        id: "evening-atelier",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=2400&q=85",
        alt: "Premium contemporary occasionwear with elegant movement",
        eyebrow: "Evening Atelier",
        title: "Quiet Power, Precisely Cut",
        position: "center 45%",
        enabled: true,
      },
    ],
  },
  about: {
    ownerName: "Dawood Rehman",
    ownerRole: "Founder & Creative Director",
    ownerImageUrl: "",
  },
  careers: {
    intro:
      "We are building a thoughtful fashion commerce team across product, operations, customer care, content, and technology.",
    jobs: [
      {
        id: "fashion-operations-coordinator",
        title: "Fashion Operations Coordinator",
        department: "Operations",
        location: "Hybrid / Pakistan",
        type: "Full-time",
        summary:
          `Coordinate product launches, inventory handoffs, order flow, and daily operations across the ${BRAND_NAME} storefront.`,
        description:
          "You will work with merchandising, customer care, and fulfillment teams to make sure collections move smoothly from planning to delivery.",
        requirements: [
          "Strong organizational and communication skills.",
          "Experience in ecommerce, retail, fashion operations, or customer service.",
          "Comfort working with order dashboards, spreadsheets, and daily follow-up.",
        ],
        applyEmail: "careers@dawrem.com",
        enabled: true,
      },
      {
        id: "content-styling-associate",
        title: "Content & Styling Associate",
        department: "Creative",
        location: "Remote / Hybrid",
        type: "Contract",
        summary:
          "Support product shoots, styling notes, campaign content, and collection storytelling for a premium fashion audience.",
        description:
          "This role helps translate fabric, fit, and styling details into elegant customer-facing content across product pages and campaigns.",
        requirements: [
          "A strong eye for fashion presentation and visual consistency.",
          "Writing, styling, photography, or social content experience.",
          "Portfolio or sample work preferred.",
        ],
        applyEmail: "careers@dawrem.com",
        enabled: true,
      },
    ],
  },
  socialLinks: [
    { id: "instagram", label: "Instagram", url: DAWREM_INSTAGRAM_URL, enabled: true },
    { id: "facebook", label: "Facebook", url: DAWREM_FACEBOOK_URL, enabled: true },
    { id: "whatsapp-community", label: "WhatsApp Community", url: DAWREM_WHATSAPP_COMMUNITY_URL, enabled: true },
    { id: "whatsapp-channel", label: "WhatsApp Channel", url: DAWREM_WHATSAPP_CHANNEL_URL, enabled: true },
  ],
};

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function normalizeLegacySocialLink(link: SocialLink): SocialLink {
  const id = link.id.toLowerCase();
  const label = link.label.toLowerCase();
  const url = link.url.toLowerCase().replace(/\/$/, "");

  if ((id === "twitter" || id === "x" || label === "twitter" || label === "x") && url === "https://twitter.com") {
    return {
      ...link,
      id: "whatsapp-community",
      label: "WhatsApp Community",
      url: DAWREM_WHATSAPP_COMMUNITY_URL,
    };
  }

  if ((id === "youtube" || label === "youtube") && url === "https://youtube.com") {
    return {
      ...link,
      id: "whatsapp-channel",
      label: "WhatsApp Channel",
      url: DAWREM_WHATSAPP_CHANNEL_URL,
    };
  }

  return link;
}

export function normalizeStorefrontSettings(value: unknown): StorefrontSettings {
  const source = asRecord(value);
  const whatsapp = asRecord(source.whatsapp);
  const hero = asRecord(source.hero);
  const about = asRecord(source.about);
  const careers = asRecord(source.careers);
  const socialLinks = Array.isArray(source.socialLinks) ? source.socialLinks : defaultStorefrontSettings.socialLinks;
  const heroSlides = Array.isArray(hero.slides) ? hero.slides : defaultStorefrontSettings.hero.slides;
  const careerJobs = Array.isArray(careers.jobs) ? careers.jobs : defaultStorefrontSettings.careers.jobs;

  return {
    whatsapp: {
      enabled: asBoolean(whatsapp.enabled, defaultStorefrontSettings.whatsapp.enabled),
      phone: asString(whatsapp.phone, defaultStorefrontSettings.whatsapp.phone),
      message: asString(whatsapp.message, defaultStorefrontSettings.whatsapp.message),
    },
    hero: {
      slideDurationMs: asNumber(hero.slideDurationMs, defaultStorefrontSettings.hero.slideDurationMs, 2500, 12000),
      transitionDurationMs: asNumber(hero.transitionDurationMs, defaultStorefrontSettings.hero.transitionDurationMs, 300, 1800),
      slides: heroSlides
        .map((slide, index) => {
          const item = asRecord(slide);
          return {
            id: asString(item.id, `hero-${index}`),
            image: asString(item.image),
            alt: asString(item.alt, `${BRAND_NAME} fashion campaign`),
            eyebrow: asString(item.eyebrow, BRAND_NAME),
            title: asString(item.title, "Future Heirloom Fashion"),
            position: asString(item.position, "center center"),
            enabled: asBoolean(item.enabled, true),
          };
        })
        .filter((slide: HeroSlide) => slide.id && slide.image && slide.title)
        .slice(0, 8),
    },
    about: {
      ownerName: asString(about.ownerName, defaultStorefrontSettings.about.ownerName),
      ownerRole: asString(about.ownerRole, defaultStorefrontSettings.about.ownerRole),
      ownerImageUrl: asString(about.ownerImageUrl, defaultStorefrontSettings.about.ownerImageUrl),
    },
    careers: {
      intro: asString(careers.intro, defaultStorefrontSettings.careers.intro),
      jobs: careerJobs
        .map((job, index) => {
          const item = asRecord(job);
          return {
            id: asString(item.id, `career-${index}`),
            title: asString(item.title, "Open Role"),
            department: asString(item.department, "General"),
            location: asString(item.location, "Remote"),
            type: asString(item.type, "Full-time"),
            summary: asString(item.summary),
            description: asString(item.description),
            requirements: Array.isArray(item.requirements)
              ? item.requirements.map((requirement) => asString(requirement)).filter(Boolean).slice(0, 8)
              : [],
            applyEmail: asString(item.applyEmail, "careers@dawrem.com"),
            enabled: asBoolean(item.enabled, true),
          };
        })
        .filter((job: CareerJob) => job.id && job.title)
        .slice(0, 20),
    },
    socialLinks: socialLinks
      .map((link, index) => {
        const item = asRecord(link);
        return {
          id: asString(item.id, `social-${index}`),
          label: asString(item.label, "Social"),
          url: asString(item.url),
          enabled: asBoolean(item.enabled, true),
        };
      })
      .map(normalizeLegacySocialLink)
      .filter((link: SocialLink) => link.id && link.label),
  };
}

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  try {
    await connectDB();
    const doc = await Settings.findOne({ key: "storefront" }).select("value").lean<{ value?: unknown }>();
    return normalizeStorefrontSettings(doc?.value);
  } catch {
    return defaultStorefrontSettings;
  }
}

export async function saveStorefrontSettings(settings: StorefrontSettings) {
  await connectDB();
  await Settings.findOneAndUpdate(
    { key: "storefront" },
    {
      $set: {
        key: "storefront",
        group: "storefront",
        value: settings,
      },
    },
    { upsert: true, new: true }
  );
}
