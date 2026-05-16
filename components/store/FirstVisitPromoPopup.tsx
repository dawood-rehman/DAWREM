"use client";

import Image from "next/image";
import { X, Sparkles, MessageCircle } from "lucide-react";
import SocialPlatformIcon from "@/components/store/SocialPlatformIcon";
import {
  DAWREM_PROMO_SOCIAL_LINKS,
  DAWREM_WHATSAPP_COMMUNITY_URL,
  DAWREM_WHATSAPP_CHANNEL_URL,
} from "@/lib/brand-links";
import { BRAND_NAME, BRAND_SIGNATURE } from "@/lib/brand";
import BrandPoweredBy from "@/components/ui/BrandPoweredBy";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_CLOSE_DELAY_MS = 2000;
const INTERACTION_CLOSE_DELAY_MS = 3500;
const FADE_OUT_MS = 1100;

export default function FirstVisitPromoPopup() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const autoCloseTimer = useRef<number | null>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  const clearTimers = useCallback(() => {
    if (autoCloseTimer.current) window.clearTimeout(autoCloseTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  const startClosing = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      closingRef.current = false;
    }, FADE_OUT_MS);
  }, []);

  const scheduleClose = useCallback(
    (delay = AUTO_CLOSE_DELAY_MS) => {
      if (autoCloseTimer.current) window.clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = window.setTimeout(startClosing, delay);
    },
    [startClosing]
  );

  const activateModal = useCallback(() => {
    clearTimers();
    closingRef.current = false;
    setClosing(false);
    scheduleClose(INTERACTION_CLOSE_DELAY_MS);
  }, [clearTimers, scheduleClose]);

  const close = useCallback(() => {
    clearTimers();
    startClosing();
  }, [clearTimers, startClosing]);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    scheduleClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimers();
    };
  }, [clearTimers, close, scheduleClose, visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        onClick={close}
        className={`absolute inset-0 bg-velour-black/65 backdrop-blur-sm transition-opacity duration-1000 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        aria-label="Close promotional popup"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dawrem-social-popup-title"
        onPointerDown={activateModal}
        onMouseEnter={activateModal}
        onMouseLeave={() => scheduleClose()}
        className={`relative max-h-[82vh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text)] shadow-2xl transition-all duration-1000 ease-out motion-reduce:transition-none sm:max-h-[calc(100vh-1.5rem)] sm:max-w-4xl sm:rounded-lg ${
          closing ? "translate-y-6 scale-[0.98] opacity-0 sm:translate-y-3" : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur transition-colors hover:bg-black/35 md:right-4 md:top-4 md:border-[var(--color-border)] md:bg-[var(--color-surface)] md:text-[var(--color-text)] md:hover:bg-[var(--color-surface-muted)]"
          aria-label="Close"
        >
          <X size={17} />
        </button>

        <div className="grid md:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[112px] overflow-hidden bg-velour-black p-4 text-ivory-50 sm:min-h-[210px] sm:p-8 md:min-h-[440px]">
            <Image
              src="/brand/dawrem-dr-mark-light.svg"
              alt=""
              width={96}
              height={96}
              className="mb-3 h-10 w-10 opacity-95 sm:mb-7 sm:h-20 sm:w-20"
            />
            <div className="relative z-[1]">
              <div className="mb-3 hidden items-center gap-2 text-[10px] uppercase tracking-widest text-gold-300 sm:flex">
                <Sparkles size={13} />
                Private drops and style updates
              </div>
              <h2
                id="dawrem-social-popup-title"
                className="max-w-sm font-cormorant text-2xl font-light leading-none text-ivory-50 sm:text-5xl"
              >
                Join the {BRAND_NAME} Circle
              </h2>
              <p className="mt-2 max-w-[18rem] break-words font-cormorant text-sm leading-5 text-gold-300 sm:mt-4 sm:text-lg sm:leading-6">
                {BRAND_SIGNATURE}
              </p>
              <BrandPoweredBy variant="light" size="sm" className="mt-1 justify-start" />
              <p className="mt-4 hidden max-w-xs text-sm leading-6 text-ivory-50/75 sm:block">
                Follow our official socials for new arrivals, collection previews, and community-only updates.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-400/40" />
          </div>

          <div className="p-4 sm:p-8 md:p-10">
            <p className="hidden text-[10px] uppercase tracking-widest text-gold-500 sm:block">Official {BRAND_NAME} links</p>
            <h3 className="font-cormorant text-xl font-light text-velour-black dark:text-ivory-50 sm:mt-2 sm:text-3xl">
              Follow {BRAND_SIGNATURE}
            </h3>
            <BrandPoweredBy size="xs" className="mt-1 justify-start" />
            <p className="mt-3 hidden text-sm leading-6 text-gray-500 sm:block">
              Collection previews, launch notes, and community announcements in one polished place.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
              {DAWREM_PROMO_SOCIAL_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={activateModal}
                  className="group flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-2 text-center text-[11px] font-medium leading-tight text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:border-gold-500 hover:text-gold-600 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 sm:min-h-14 sm:flex-row sm:justify-start sm:gap-3 sm:px-4 sm:py-3 sm:text-left sm:text-sm"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ivory-100 text-burgundy-900 transition-colors group-hover:bg-gold-500 group-hover:text-velour-black dark:bg-white/10 dark:text-gold-300 sm:h-9 sm:w-9">
                    <SocialPlatformIcon id={link.id} label={link.label} url={link.url} size={17} />
                  </span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            <div className="mt-7 hidden flex-col gap-3 sm:flex sm:flex-row">
              <a
                href={DAWREM_WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={activateModal}
                className="btn-primary inline-flex flex-1 items-center justify-center gap-2 px-5"
              >
                <MessageCircle size={14} />
                Join Community
              </a>
              <a
                href={DAWREM_WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={activateModal}
                className="btn-outline inline-flex flex-1 items-center justify-center gap-2 px-5"
              >
                <SocialPlatformIcon id="whatsapp-channel" label="WhatsApp Channel" size={14} />
                Open Channel
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
