import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import AccountSettingsForm from "./AccountSettingsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Update your DAWRÉM profile, email address, and password.",
};

interface SettingsUser {
  name: string;
  email: string;
  provider?: "credentials" | "google";
  image?: string;
  password?: string;
  isBlocked?: boolean;
}

export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/settings");
  }

  await connectDB();

  const user = await User.findById(session.user.id)
    .select("+password name email provider image isBlocked")
    .lean<SettingsUser>();

  if (!user || user.isBlocked) {
    redirect("/login?callbackUrl=/account/settings");
  }

  return (
    <div className="min-h-screen bg-ivory-50 px-4 py-12 text-velour-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="section-subtitle">My Account</p>
          <h1 className="section-title">Settings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Manage your personal details and secure access to your DAWRÉM account.
          </p>
        </div>

        <AccountSettingsForm
          initialUser={{
            name: user.name,
            email: user.email,
            image: user.image,
            provider: user.provider ?? "credentials",
            hasPassword: Boolean(user.password),
          }}
        />
      </div>
    </div>
  );
}
