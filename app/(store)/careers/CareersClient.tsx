"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle, Clock3, Mail, MapPin, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import type { CareerJob } from "@/lib/storefront-settings";
import { BRAND_NAME } from "@/lib/brand";

interface CareersClientProps {
  intro: string;
  jobs: CareerJob[];
}

const hiringPillars = [
  "Customer-first communication",
  "Polished execution",
  "Detail-led product thinking",
];

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function CareersClient({ intro, jobs }: CareersClientProps) {
  const publishedJobs = useMemo(() => jobs.filter((job) => job.enabled), [jobs]);
  const [activeJobId, setActiveJobId] = useState(publishedJobs[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    portfolio: "",
    message: "",
  });

  const activeJob = publishedJobs.find((job) => job.id === activeJobId) || publishedJobs[0];

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeJob) {
      toast.error("Please select a role first.");
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in name, email, and application note.");
      return;
    }

    setLoading(true);
    try {
      const applicationMessage = [
        `Role: ${activeJob.title}`,
        `Department: ${activeJob.department}`,
        `Location: ${activeJob.location}`,
        form.portfolio ? `Portfolio / LinkedIn: ${form.portfolio}` : "",
        "",
        form.message,
      ]
        .filter(Boolean)
        .join("\n");

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feedback",
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Career Application: ${activeJob.title}`,
          message: applicationMessage,
          orderNumber: "",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit application.");

      setTicket(data.feedback.ticketNumber);
      setForm({ name: "", email: "", phone: "", portfolio: "", message: "" });
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to submit application."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[var(--color-page)] text-[var(--color-text)]">
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="section-subtitle">Careers</p>
            <h1 className="mt-4 max-w-4xl font-cormorant text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
              Build a premium fashion experience with {BRAND_NAME}.
            </h1>
          </div>
          <div className="space-y-6">
            <p className="text-sm leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              {intro}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {hiringPillars.map((pillar) => (
                <div key={pillar} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs leading-5 text-[var(--color-muted)]">
                  <Sparkles size={15} className="mb-3 text-[var(--color-accent)]" />
                  {pillar}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
          <div className="space-y-4">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-subtitle">Open Roles</p>
                <h2 className="font-cormorant text-4xl font-light sm:text-5xl">Current opportunities</h2>
              </div>
              <p className="text-sm text-[var(--color-muted)]">{publishedJobs.length} active listing{publishedJobs.length === 1 ? "" : "s"}</p>
            </div>

            {publishedJobs.length === 0 ? (
              <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
                <BriefcaseBusiness className="mx-auto text-[var(--color-accent)]" size={28} />
                <h3 className="mt-5 font-cormorant text-3xl font-light">No roles are open right now.</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
                  You can still introduce yourself through the contact form. The team keeps thoughtful profiles on file for future openings.
                </p>
              </div>
            ) : (
              publishedJobs.map((job) => {
                const selected = activeJob?.id === job.id;
                return (
                  <article
                    key={job.id}
                    className={`border bg-[var(--color-surface)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-premium)] ${
                      selected ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"
                    }`}
                  >
                    <button type="button" onClick={() => setActiveJobId(job.id)} className="w-full text-left">
                      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
                            <span>{job.department}</span>
                            <span>/</span>
                            <span>{job.type}</span>
                          </div>
                          <h3 className="mt-3 font-cormorant text-3xl font-medium leading-tight">{job.title}</h3>
                          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">{job.summary}</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--color-text)]">
                          View Role
                          <ArrowRight size={14} className="text-[var(--color-accent)]" />
                        </span>
                      </div>
                    </button>

                    {selected && (
                      <div className="mt-6 grid gap-5 border-t border-[var(--color-border)] pt-5 md:grid-cols-[0.8fr_1.2fr]">
                        <div className="space-y-3 text-sm text-[var(--color-muted)]">
                          <p className="flex items-center gap-2">
                            <MapPin size={16} className="text-[var(--color-accent)]" />
                            {job.location}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock3 size={16} className="text-[var(--color-accent)]" />
                            {job.type}
                          </p>
                          {job.applyEmail && (
                            <p className="flex items-center gap-2">
                              <Mail size={16} className="text-[var(--color-accent)]" />
                              {job.applyEmail}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm leading-7 text-[var(--color-muted)]">{job.description}</p>
                          {job.requirements.length > 0 && (
                            <ul className="mt-4 space-y-2">
                              {job.requirements.map((requirement) => (
                                <li key={requirement} className="flex gap-3 text-sm leading-6 text-[var(--color-muted)]">
                                  <CheckCircle size={15} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                                  {requirement}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-premium)] lg:sticky lg:top-28 sm:p-6">
            <p className="section-subtitle">Apply Directly</p>
            <h2 className="font-cormorant text-3xl font-light leading-tight">
              {activeJob ? activeJob.title : "Share your profile"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Applications arrive as support tickets so the admin team can manage replies from the dashboard.
            </p>

            {ticket ? (
              <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-page)] p-5">
                <CheckCircle size={24} className="text-green-600" />
                <h3 className="mt-4 font-cormorant text-2xl font-medium">Application received</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  Your ticket number is <span className="font-medium text-[var(--color-text)]">{ticket}</span>. The {BRAND_NAME} team will review your profile.
                </p>
                <button type="button" onClick={() => setTicket(null)} className="btn-outline mt-5 w-full">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={submitApplication} className="mt-6 space-y-4">
                <input value={form.name} onChange={(event) => update("name", event.target.value)} className="input-luxury" placeholder="Full name *" />
                <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="input-luxury" placeholder="Email address *" />
                <input value={form.phone} onChange={(event) => update("phone", event.target.value)} className="input-luxury" placeholder="Phone number" />
                <input value={form.portfolio} onChange={(event) => update("portfolio", event.target.value)} className="input-luxury" placeholder="Portfolio or LinkedIn URL" />
                <textarea
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  rows={5}
                  className="w-full resize-none border border-[var(--color-border)] bg-transparent px-3 py-3 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)]"
                  placeholder="Tell us why this role fits you *"
                />
                <button type="submit" disabled={loading || !activeJob} className="btn-primary w-full">
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
