"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AlertTriangle, CheckCircle, Clock3, Lightbulb, Mail, MessageSquare, Phone, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { BRAND_NAME } from "@/lib/brand";

type FeedbackType = "feedback" | "complaint" | "suggestion" | "return_exchange";

const types: Array<{
  id: FeedbackType;
  label: string;
  description: string;
  icon: typeof MessageSquare;
}> = [
  { id: "feedback", label: "General Feedback", description: "Share your experience or ask a general question.", icon: MessageSquare },
  { id: "complaint", label: "Complaint", description: "Report a service, order, or product concern.", icon: AlertTriangle },
  { id: "suggestion", label: "Suggestion", description: `Tell us how ${BRAND_NAME} can improve.`, icon: Lightbulb },
  { id: "return_exchange", label: "Return / Exchange", description: "Start a return or exchange support request.", icon: RefreshCw },
];

const contactCards = [
  { title: "Response Window", text: "Most messages receive a reply within 24-48 hours.", icon: Clock3 },
  { title: "Email Support", text: "Use the form for a tracked support ticket and email follow-up.", icon: Mail },
  { title: "Order Help", text: "Include your order number for faster order-specific support.", icon: Phone },
];

function isFeedbackType(value: string | null): value is FeedbackType {
  return Boolean(value && types.some((item) => item.id === value));
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [type, setType] = useState<FeedbackType>("feedback");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    orderNumber: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const param = new URLSearchParams(window.location.search).get("type");
      if (isFeedbackType(param)) setType(param);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        name: current.name || session?.user?.name || "",
        email: current.email || session?.user?.email || "",
      }));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [session?.user?.email, session?.user?.name]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...form }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit message.");

      setTicket(data.feedback.ticketNumber);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to submit message."));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTicket(null);
    setForm({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
      subject: "",
      message: "",
      orderNumber: "",
    });
  };

  if (ticket) {
    return (
      <main className="min-h-screen bg-[var(--color-page)] px-4 py-16 text-[var(--color-text)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-card-premium)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-green-500 text-green-600">
            <CheckCircle size={30} />
          </div>
          <h1 className="mt-6 font-cormorant text-4xl font-light">Message received</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            Thank you for reaching out. A confirmation has been created for the {BRAND_NAME} support team.
          </p>
          <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-page)] px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-accent)]">Ticket Number</p>
            <p className="mt-2 font-mono text-lg font-medium">{ticket}</p>
          </div>
          <button onClick={resetForm} className="btn-outline mt-6 w-full">
            Submit Another Message
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_430px] lg:items-end">
          <div>
            <p className="section-subtitle">Contact Us</p>
            <h1 className="mt-4 max-w-4xl font-cormorant text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
              Thoughtful support for every part of your order.
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              Choose the category that best matches your request. The form is built to stay readable in both light and dark themes, with a tracked ticket for each submission.
            </p>
          </div>
          <div className="grid gap-3">
            {contactCards.map(({ title, text, icon: Icon }) => (
              <div key={title} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <Icon size={18} className="text-[var(--color-accent)]" />
                <h2 className="mt-3 text-sm font-medium">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-28">
            <p className="section-subtitle">Request Type</p>
            <div className="mt-4 grid gap-3">
              {types.map((item) => {
                const Icon = item.icon;
                const selected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      selected
                        ? "border-[var(--color-accent)] bg-[var(--color-page)] shadow-[var(--shadow-card-premium)]"
                        : "border-[var(--color-border)] bg-transparent hover:border-[var(--color-accent)]"
                    }`}
                  >
                    <Icon size={18} className={selected ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"} />
                    <h2 className="mt-3 text-sm font-medium text-[var(--color-text)]">{item.label}</h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-premium)] sm:p-8">
            <div className="mb-8">
              <p className="section-subtitle">Message Details</p>
              <h2 className="font-cormorant text-4xl font-light">Tell us what happened.</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Full Name *</label>
                  <input value={form.name} onChange={(event) => update("name", event.target.value)} required className="input-luxury" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Email *</label>
                  <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required className="input-luxury" placeholder="you@example.com" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Phone</label>
                  <input value={form.phone} onChange={(event) => update("phone", event.target.value)} className="input-luxury" placeholder="+92 300 0000000" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Order Number</label>
                  <input value={form.orderNumber} onChange={(event) => update("orderNumber", event.target.value.toUpperCase())} className="input-luxury" placeholder="Order number if applicable" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Subject *</label>
                <input value={form.subject} onChange={(event) => update("subject", event.target.value)} required className="input-luxury" placeholder="Briefly describe your request" />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  required
                  rows={7}
                  className="w-full resize-none border border-[var(--color-border)] bg-transparent px-3 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--color-accent)]"
                  placeholder="Share the details our team should know."
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center">
                {loading ? "Submitting..." : "Submit Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
