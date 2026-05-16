import { getStorefrontSettings } from "@/lib/storefront-settings";
import StorefrontSettingsForm from "./StorefrontSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStorefrontSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-cormorant font-medium text-velour-black">Storefront Settings</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Manage customer-facing contact channels and footer social links without code changes.
        </p>
      </div>

      <StorefrontSettingsForm initialSettings={settings} />
    </div>
  );
}
