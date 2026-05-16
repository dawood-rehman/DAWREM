import { createElement, type ComponentType } from "react";
import {
  Facebook,
  Instagram,
  Link as LinkIcon,
  Twitter,
  Youtube,
  type LucideProps,
} from "lucide-react";

type SocialIconProps = LucideProps;
type SocialIconComponent = ComponentType<LucideProps>;

interface SocialIconInput {
  id?: string;
  label?: string;
  url?: string;
}

function normalizePlatform(value = "") {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

function inferPlatformFromUrl(url = "") {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (host === "chat.whatsapp.com") return "whatsappcommunity";
    if (host.includes("whatsapp.com") && path.startsWith("/channel")) return "whatsappchannel";
    if (host.includes("whatsapp.com") || host === "wa.me") return "whatsapp";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("facebook.com") || host === "fb.com") return "facebook";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
    if (host.includes("twitter.com") || host === "x.com") return "x";
    if (host.includes("linkedin.com")) return "linkedin";
    if (host.includes("pinterest.com")) return "pinterest";
    if (host.includes("snapchat.com")) return "snapchat";
    if (host.includes("telegram.org") || host.includes("t.me")) return "telegram";
  } catch {
    return "";
  }

  return "";
}

function WhatsAppIcon({ size = 18, ...props }: SocialIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.42Z" />
    </svg>
  );
}

function WhatsAppCommunityIcon({ size = 18, ...props }: SocialIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.2 19.7 5.3 16A8.2 8.2 0 1 1 8 18.7l-3.8 1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.9 8.5c.45 2.1 2.5 4.1 4.6 4.6l1.2-1.2c.25-.25.62-.32.94-.18l1.45.66c.36.17.56.56.47.95-.22.95-.74 1.55-1.5 1.77-3.96 1.15-8.83-3.72-7.68-7.68.22-.76.82-1.28 1.77-1.5.39-.09.78.11.95.47l.66 1.45c.14.32.07.69-.18.94L8.9 8.5Z"
        fill="currentColor"
      />
      <circle cx="16.8" cy="7.3" r="1.8" fill="currentColor" />
      <path d="M13.8 10.3c.45-1.1 1.5-1.8 3-1.8s2.55.7 3 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppChannelIcon({ size = 18, ...props }: SocialIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.2 19.7 5.3 16A8.2 8.2 0 1 1 8 18.7l-3.8 1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 12h2.7l3.5 2.4V7.6L11.7 10H9v2Z" fill="currentColor" />
      <path d="M16.6 9.4c.65.65.65 2.55 0 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18.5 7.8c1.55 1.55 1.55 4.85 0 6.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function TikTokIcon({ size = 18, ...props }: SocialIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M15.2 3c.36 2.35 1.7 3.76 3.96 3.91v3.05a7.27 7.27 0 0 1-3.87-1.15v5.73c0 2.91-2.03 5.07-4.95 5.07-2.75 0-4.8-1.86-4.8-4.44 0-2.74 2.2-4.73 5.42-4.54v3.19c-1.42-.23-2.37.34-2.37 1.28 0 .82.7 1.38 1.66 1.38 1.1 0 1.78-.66 1.78-1.96V3h3.17Z" />
    </svg>
  );
}

const iconAliases: Array<{ aliases: string[]; icon: SocialIconComponent }> = [
  {
    aliases: [
      "whatsappcommunity",
      "whatsappgroup",
      "whatsappgroups",
    ],
    icon: WhatsAppCommunityIcon,
  },
  {
    aliases: [
      "whatsappchannel",
      "whatsappbroadcast",
      "whatsappupdates",
    ],
    icon: WhatsAppChannelIcon,
  },
  { aliases: ["whatsapp", "wa"], icon: WhatsAppIcon },
  { aliases: ["instagram", "insta", "ig"], icon: Instagram },
  { aliases: ["facebook", "fb"], icon: Facebook },
  { aliases: ["tiktok", "tik_tok"], icon: TikTokIcon },
  { aliases: ["youtube", "yt"], icon: Youtube },
  { aliases: ["twitter", "x"], icon: Twitter },
];

export function resolveSocialIcon({ id, label, url }: SocialIconInput) {
  const candidates = [
    normalizePlatform(id),
    normalizePlatform(label),
    normalizePlatform(inferPlatformFromUrl(url)),
  ].filter(Boolean);

  const match = iconAliases.find(({ aliases }) =>
    candidates.some((candidate) =>
      aliases.some((alias) => candidate === normalizePlatform(alias) || candidate.includes(normalizePlatform(alias)))
    )
  );

  return (match?.icon || LinkIcon) as SocialIconComponent;
}

export default function SocialPlatformIcon({
  id,
  label,
  url,
  size = 18,
  ...props
}: SocialIconInput & SocialIconProps) {
  const Icon = resolveSocialIcon({ id, label, url });
  return createElement(Icon, { size, "aria-hidden": "true", ...props });
}
