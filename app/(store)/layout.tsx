import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import FirstVisitPromoPopup from "@/components/store/FirstVisitPromoPopup";
import AdminFrontendBridge from "@/components/store/AdminFrontendBridge";
import { getStorefrontSettings } from "@/lib/storefront-settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStorefrontSettings();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton settings={settings.whatsapp} />
      <FirstVisitPromoPopup />
      <AdminFrontendBridge />
    </div>
  );
}
