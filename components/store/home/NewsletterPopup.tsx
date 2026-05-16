"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { BRAND_NAME, BRAND_SIGNATURE } from "@/lib/brand";
import BrandPoweredBy from "@/components/ui/BrandPoweredBy";

const DISMISSED_KEY = "dawrem_newsletter_dismissed";
const SUBSCRIBED_KEY = "dawrem_newsletter_subscribed";
const LEGACY_DISMISSED_KEY = ["velo", "ure_newsletter_dismissed"].join("");
const LEGACY_SUBSCRIBED_KEY = ["velo", "ure_newsletter_subscribed"].join("");

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed =
      localStorage.getItem(DISMISSED_KEY) ||
      localStorage.getItem(LEGACY_DISMISSED_KEY);
    const subscribed =
      localStorage.getItem(SUBSCRIBED_KEY) ||
      localStorage.getItem(LEGACY_SUBSCRIBED_KEY);
    if (!dismissed && !subscribed) {
      const timer = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
    localStorage.removeItem(LEGACY_DISMISSED_KEY);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        localStorage.setItem(SUBSCRIBED_KEY, "1");
        localStorage.removeItem(LEGACY_SUBSCRIBED_KEY);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-velour-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-ivory-50 max-w-2xl w-full shadow-2xl flex overflow-hidden animate-in">
        {/* Image side */}
        <div className="relative hidden md:block w-1/2 flex-shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
            alt={`${BRAND_NAME} Collection`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-burgundy-900/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-end p-8">
            <p className="font-cormorant text-ivory-50 text-2xl font-light text-center leading-tight">
              Your Luxury Awaits
            </p>
          </div>
        </div>

        {/* Content side */}
        <div className="flex-1 p-8 lg:p-10 relative">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-velour-black transition-colors"
          >
            <X size={18} />
          </button>

          {!submitted ? (
            <>
              <div className="mb-6">
                <p className="text-gold-500 text-xs tracking-widest uppercase mb-2 font-inter">
                  Exclusive Offer
                </p>
                <p className="mb-1 break-words font-cormorant text-sm leading-5 text-burgundy-900">
                  {BRAND_SIGNATURE}
                </p>
                <BrandPoweredBy variant="dark" size="xs" className="mb-3 justify-start" />
                <h3 className="font-cormorant text-3xl text-velour-black font-light leading-tight">
                  Get 10% Off Your First Order
                </h3>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed font-inter">
                  Join the {BRAND_NAME} circle and be the first to discover new collections, private sales, and style inspiration.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="input-luxury"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? "Subscribing..." : "Claim My 10% Off"}
                </button>
              </form>

              <button
                onClick={dismiss}
                className="mt-4 text-center w-full text-xs text-gray-400 hover:text-gray-600 transition-colors font-inter"
              >
                No thanks, I&apos;ll pay full price
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
              <h4 className="font-cormorant text-2xl text-velour-black mb-2">Welcome to {BRAND_NAME}!</h4>
              <p className="text-gray-500 text-sm mb-4 font-inter">
                Your discount code has been sent to your email.
              </p>
              <div className="border border-gold-300 py-3 px-6 inline-block">
                <span className="font-cormorant text-xl text-burgundy-900 tracking-widest font-medium">
                  WELCOME10
                </span>
              </div>
              <button onClick={dismiss} className="btn-primary mt-6 mx-auto">
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
