import { DAWREM_ORDER_WHATSAPP_WA_NUMBER } from "@/lib/brand-links";

export interface WhatsAppOrderItem {
  name: string;
  slug?: string;
  productUrl?: string;
  quantity?: number;
  size?: string;
  color?: string;
  sku?: string;
  price?: number;
  salePrice?: number;
}

interface WhatsAppOrderOptions {
  total?: number;
  note?: string;
  siteUrl?: string;
}

function formatQuantity(quantity: number | undefined) {
  return Number.isFinite(quantity) && Number(quantity) > 0 ? Number(quantity) : 1;
}

function formatPrice(value: number | undefined) {
  return Number.isFinite(value) ? `PKR ${Number(value).toLocaleString()}` : "";
}

function normalizeSiteUrl(siteUrl: string | undefined) {
  return siteUrl?.trim().replace(/\/+$/, "");
}

function getProductUrl(item: WhatsAppOrderItem, siteUrl: string | undefined) {
  if (item.productUrl?.trim()) return item.productUrl.trim();
  if (!item.slug?.trim()) return "";

  const baseUrl = normalizeSiteUrl(siteUrl);
  return baseUrl ? `${baseUrl}/product/${item.slug.trim()}` : "";
}

export function buildWhatsAppOrderMessage(
  items: WhatsAppOrderItem[],
  options: WhatsAppOrderOptions = {}
) {
  const validItems = items.filter((item) => item.name.trim());
  const intro =
    validItems.length > 1
      ? "Assalamualaikum, mujhe ye products order karne hain:"
      : "Assalamualaikum, mujhe ye product order karna hai:";

  const lines = [intro];

  validItems.forEach((item, index) => {
    if (validItems.length > 1) {
      lines.push("", `Product ${index + 1}:`);
    }

    lines.push(`Product Name: ${item.name.trim()}`);
    lines.push(`Quantity: ${formatQuantity(item.quantity)}`);

    if (item.size?.trim()) lines.push(`Size: ${item.size.trim()}`);
    if (item.color?.trim()) lines.push(`Color: ${item.color.trim()}`);
    if (item.sku?.trim()) lines.push(`SKU: ${item.sku.trim()}`);

    const itemPrice = formatPrice(item.salePrice ?? item.price);
    if (itemPrice) lines.push(`Price: ${itemPrice}`);

    const productUrl = getProductUrl(item, options.siteUrl);
    if (productUrl) lines.push(`Product Link: ${productUrl}`);
  });

  if (Number.isFinite(options.total)) {
    lines.push("", `Estimated Total: PKR ${Number(options.total).toLocaleString()}`);
  }

  if (options.note?.trim()) {
    lines.push(`Note: ${options.note.trim()}`);
  }

  return lines.join("\n");
}

export function buildWhatsAppOrderUrl(
  items: WhatsAppOrderItem[],
  options?: WhatsAppOrderOptions
) {
  const message = encodeURIComponent(buildWhatsAppOrderMessage(items, options));
  return `https://wa.me/${DAWREM_ORDER_WHATSAPP_WA_NUMBER}?text=${message}`;
}

export function redirectToWhatsAppOrder(
  items: WhatsAppOrderItem[],
  options?: WhatsAppOrderOptions
) {
  window.location.href = buildWhatsAppOrderUrl(items, {
    ...options,
    siteUrl: options?.siteUrl || window.location.origin,
  });
}
