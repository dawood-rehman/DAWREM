import type { Metadata } from "next";
import CareersClient from "./CareersClient";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Careers",
  description: `Career opportunities at ${BRAND_NAME} across fashion operations, customer care, content, and ecommerce.`,
};

export default async function CareersPage() {
  const { careers } = await getStorefrontSettings();

  return <CareersClient intro={careers.intro} jobs={careers.jobs} />;
}
