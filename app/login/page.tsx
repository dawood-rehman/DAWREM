"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import DawremLogo from "@/components/ui/Logo";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/";
  const callbackUrl =
    rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/";
  const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success("Account created! Signing you in...");
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-50 flex">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col items-center justify-center w-1/2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6B2737 0%, #1A1A1A 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-gold-400 rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-gold-400 rounded-full" />
        </div>
        <div className="relative text-center px-12">
          <DawremLogo variant="light" size="lg" />
          <p className="text-gray-300 font-cormorant text-xl font-light mt-8 italic">
            &quot;Future heirlooms for the woman already becoming iconic.&quot;
          </p>
          <div className="w-12 h-px bg-gold-500 mx-auto mt-6" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <DawremLogo size="md" />
          </div>

          <h2 className="font-cormorant text-3xl text-velour-black font-light mb-2">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400 font-inter text-sm mb-8">
            {isRegister ? "Join DAWRÉM and enjoy private client benefits." : "Sign in to your DAWRÉM account."}
          </p>

          {/* Google sign-in */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 text-sm font-inter hover:border-gray-400 transition-colors mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-inter">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  className="input-luxury"
                  placeholder="Your full name"
                />
              </div>
            )}

            <div>
              <label className="text-xs tracking-wider uppercase text-gray-500 font-inter block mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="input-luxury"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs tracking-wider uppercase text-gray-500 font-inter">Password</label>
                {!isRegister && (
                  <Link href="/forgot-password" className="text-xs text-burgundy-900 hover:underline font-inter">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={isRegister ? 8 : undefined}
                  className="input-luxury pr-10"
                  placeholder={isRegister ? "At least 8 characters" : "Your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 font-inter mt-6">
            {isRegister ? "Already have an account? " : <>Don&apos;t have an account? </>}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-burgundy-900 hover:underline font-medium"
            >
              {isRegister ? "Sign In" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
          <div className="skeleton h-10 w-40" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
