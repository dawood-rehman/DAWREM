"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";
import DawremLogo from "@/components/ui/Logo";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to reset password");
      }

      toast.success("Password updated. Please sign in.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Unable to reset password"));
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
            Choose a new password for your account.
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
            <LockKeyhole size={20} />
          </div>

          <h1 className="mb-2 font-cormorant text-3xl font-light text-velour-black">
            Create New Password
          </h1>
          <p className="mb-8 text-sm leading-6 text-gray-500">
            Your new password should be at least 8 characters and different from anything easy to guess.
          </p>

          {!token ? (
            <div className="border border-red-100 bg-white p-6 shadow-card">
              <h2 className="font-cormorant text-2xl font-light text-velour-black">
                Reset link missing
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Please request a fresh reset link to continue.
              </p>
              <Link href="/forgot-password" className="btn-primary mt-6 inline-flex justify-center">
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block font-inter text-xs uppercase tracking-wider text-gray-500">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    className="input-luxury pr-10"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-inter text-xs uppercase tracking-wider text-gray-500">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  className="input-luxury"
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ivory-50">
          <div className="skeleton h-10 w-44" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
