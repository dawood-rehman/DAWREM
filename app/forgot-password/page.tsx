"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import toast from "react-hot-toast";
import DawremLogo from "@/components/ui/Logo";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send reset link");
      }

      setSent(true);
      toast.success("Reset instructions sent");
    } catch (error) {
      toast.error(errorMessage(error, "Unable to send reset link"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ivory-50">
      <div
        className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden lg:flex"
        style={{ background: "linear-gradient(135deg, #6B2737 0%, #1A1A1A 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full border border-gold-400" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full border border-gold-400" />
        </div>
        <div className="relative px-12 text-center">
          <DawremLogo variant="light" size="lg" />
          <p className="mt-8 font-cormorant text-xl font-light italic text-gray-300">
            Secure access for your private client account.
          </p>
          <div className="mx-auto mt-6 h-px w-12 bg-gold-500" />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <DawremLogo size="md" />
          </div>

          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 transition-colors hover:text-burgundy-900"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>

          <div className="mb-6 flex h-12 w-12 items-center justify-center bg-burgundy-900 text-ivory-50">
            <Mail size={20} />
          </div>

          <h1 className="mb-2 font-cormorant text-3xl font-light text-velour-black">
            Reset Password
          </h1>
          <p className="mb-8 text-sm leading-6 text-gray-500">
            Enter your account email and we will send a secure reset link if the account exists.
          </p>

          {sent ? (
            <div className="border border-gold-200 bg-white p-6 shadow-card">
              <h2 className="font-cormorant text-2xl font-light text-velour-black">
                Check your email
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                If an account exists for this email, reset instructions are on the way. The link will expire shortly.
              </p>
              <Link href="/login" className="btn-primary mt-6 inline-flex justify-center">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block font-inter text-xs uppercase tracking-wider text-gray-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="input-luxury"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
