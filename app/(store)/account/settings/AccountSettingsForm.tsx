"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

interface InitialUser {
  name: string;
  email: string;
  image?: string;
  provider: "credentials" | "google";
  hasPassword: boolean;
}

interface AccountSettingsFormProps {
  initialUser: InitialUser;
}

interface FormState {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof FormState | "form", string>>;

export default function AccountSettingsForm({ initialUser }: AccountSettingsFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [hasPassword, setHasPassword] = useState(initialUser.hasPassword);
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<FormState>({
    name: initialUser.name ?? "",
    email: initialUser.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordIntent = useMemo(
    () => Boolean(form.currentPassword || form.newPassword || form.confirmPassword),
    [form.currentPassword, form.newPassword, form.confirmPassword]
  );

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    setSuccess("");
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (passwordIntent) {
      if (hasPassword && !form.currentPassword) {
        nextErrors.currentPassword = "Enter your current password";
      }
      if (form.newPassword.length < 8) {
        nextErrors.newPassword = "New password must be at least 8 characters";
      }
      if (form.newPassword !== form.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess("");

    if (!validate()) return;

    setSaving(true);
    setErrors({});

    try {
      const response = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.fieldErrors ?? { form: data.error ?? "Unable to update settings" });
        return;
      }

      setSuccess("Your account settings have been updated.");
      setHasPassword(Boolean(data.user?.hasPassword));
      setForm((current) => ({
        ...current,
        name: data.user?.name ?? current.name,
        email: data.user?.email ?? current.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      await update({ name: data.user?.name, email: data.user?.email });
      router.refresh();
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="border border-gray-100 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <UserRound className="mt-1 text-gold-500" size={20} />
            <div>
              <h2 className="font-cormorant text-2xl font-medium text-velour-black">
                Profile
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Keep your customer profile accurate for orders, invoices, and support.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="account-name" error={errors.name}>
              <input
                id="account-name"
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="input-luxury"
                autoComplete="name"
              />
            </Field>

            <Field label="Email" htmlFor="account-email" error={errors.email}>
              <input
                id="account-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="input-luxury"
                autoComplete="email"
              />
            </Field>
          </div>
        </section>

        <section className="border border-gray-100 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <LockKeyhole className="mt-1 text-gold-500" size={20} />
            <div>
              <h2 className="font-cormorant text-2xl font-medium text-velour-black">
                Password
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {hasPassword
                  ? "Confirm your current password before setting a new one."
                  : "Add a password to enable email and password sign-in for this account."}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {hasPassword && (
              <Field label="Current Password" htmlFor="current-password" error={errors.currentPassword}>
                <input
                  id="current-password"
                  type={showPasswords ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(event) => updateField("currentPassword", event.target.value)}
                  className="input-luxury"
                  autoComplete="current-password"
                />
              </Field>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="New Password" htmlFor="new-password" error={errors.newPassword}>
                <input
                  id="new-password"
                  type={showPasswords ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(event) => updateField("newPassword", event.target.value)}
                  className="input-luxury"
                  autoComplete="new-password"
                />
              </Field>

              <Field label="Confirm Password" htmlFor="confirm-password" error={errors.confirmPassword}>
                <input
                  id="confirm-password"
                  type={showPasswords ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  className="input-luxury"
                  autoComplete="new-password"
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords((visible) => !visible)}
              className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-burgundy-900"
            >
              {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
              {showPasswords ? "Hide passwords" : "Show passwords"}
            </button>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="border border-gray-100 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            {initialUser.image ? (
              <Image
                src={initialUser.image}
                alt=""
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center bg-burgundy-900 text-ivory-50">
                <UserRound size={19} />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-cormorant text-xl font-medium text-velour-black">
                {form.name || "DAWRÉM Customer"}
              </p>
              <p className="truncate text-sm text-gray-500">{form.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-gold-500" />
              Sign-in provider: {initialUser.provider === "google" ? "Google" : "Email"}
            </div>
          </div>
        </section>

        {(errors.form || success) && (
          <div
            role="status"
            className={`flex gap-3 border p-4 text-sm ${
              success
                ? "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
            }`}
          >
            {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{success || errors.form}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </aside>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs uppercase text-gray-500">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
