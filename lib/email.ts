import nodemailer from "nodemailer";
import {
  BRAND_NAME,
  BRAND_POWERED_BY_STYLIZED,
  BRAND_SEO_TITLE,
  BRAND_SIGNATURE,
} from "@/lib/brand";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const brandHeader = `
  <div style="background: linear-gradient(135deg, #6B2737 0%, #1A1A1A 100%); padding: 32px 40px; text-align: center;">
    <h1 style="color: #C9A84C; font-family: Georgia, serif; font-size: 20px; letter-spacing: 1px; line-height: 1.45; margin: 0; font-weight: 300;">
      ${BRAND_SIGNATURE}
    </h1>
    <p style="color: #FAF7F2; font-family: Georgia, serif; font-size: 13px; letter-spacing: 2px; margin: 10px 0 0; opacity: 0.78;">
      ${BRAND_POWERED_BY_STYLIZED}
    </p>
  </div>
`;

const brandFooter = `
  <div style="background: #1A1A1A; padding: 24px 40px; text-align: center; margin-top: 40px;">
    <p style="color: #C9A84C; font-family: Georgia, serif; font-size: 11px; letter-spacing: 2px; margin: 0 0 8px;">
      ${BRAND_SEO_TITLE}
    </p>
    <p style="color: #666; font-family: Arial, sans-serif; font-size: 11px; margin: 0;">
      If you have questions, <a href="mailto:support@dawrem.com" style="color: #C9A84C;">contact us</a> anytime.
    </p>
    <p style="color: #444; font-family: Arial, sans-serif; font-size: 10px; margin: 12px 0 0;">
      You're receiving this email because you have an account at ${BRAND_NAME}.
    </p>
  </div>
`;

function wrapEmail(content: string, preheader = "") {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        ${brandHeader}
        <div style="padding:40px;">
          ${content}
        </div>
        ${brandFooter}
      </div>
    </body>
    </html>
  `;
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  discountCode: string
) {
  const content = `
    <h2 style="color:#6B2737;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">
      Welcome to ${BRAND_NAME}, ${name}!
    </h2>
    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 20px;">
      We're so glad you're here. At ${BRAND_NAME}, we believe every woman deserves to feel extraordinary.
    </p>
    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 28px;">
      As a welcome gift, here's <strong>10% off</strong> your first order:
    </p>
    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;border:2px solid #C9A84C;padding:16px 32px;letter-spacing:4px;font-size:20px;color:#6B2737;font-family:Georgia,serif;font-weight:bold;">
        ${discountCode}
      </div>
    </div>
    <p style="color:#666;font-size:13px;text-align:center;margin:8px 0 28px;">
      Valid for 30 days on your first order
    </p>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop"
        style="background:#6B2737;color:#FAF7F2;padding:14px 36px;text-decoration:none;font-size:13px;letter-spacing:2px;display:inline-block;font-family:Georgia,serif;">
        EXPLORE COLLECTION
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Welcome to ${BRAND_NAME} - Your 10% Gift Inside`,
    html: wrapEmail(content, "Your welcome gift is waiting inside"),
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  order: {
    orderNumber: string;
    items: Array<{ name: string; quantity: number; price: number; size: string; color: string }>;
    subtotal: number;
    shippingCost: number;
    discountAmount: number;
    total: number;
    estimatedDelivery: string;
    shippingAddress: { fullName: string; addressLine1: string; city: string };
  }
) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;color:#333;font-size:14px;">${item.name}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;color:#666;font-size:13px;">${item.size} / ${item.color}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;color:#333;text-align:center;">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;color:#333;text-align:right;">PKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const content = `
    <h2 style="color:#6B2737;font-family:Georgia,serif;font-size:22px;margin:0 0 8px;">
      Order Confirmed!
    </h2>
    <p style="color:#666;font-size:14px;margin:0 0 24px;">
      Order #${order.orderNumber}
    </p>
    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Thank you for your order! We're preparing it with care and will notify you when it ships.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
      <thead>
        <tr style="background:#f8f4f0;">
          <th style="padding:12px;text-align:left;font-size:12px;letter-spacing:1px;color:#6B2737;">ITEM</th>
          <th style="padding:12px;text-align:left;font-size:12px;letter-spacing:1px;color:#6B2737;">VARIANT</th>
          <th style="padding:12px;text-align:center;font-size:12px;letter-spacing:1px;color:#6B2737;">QTY</th>
          <th style="padding:12px;text-align:right;font-size:12px;letter-spacing:1px;color:#6B2737;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="border-top:2px solid #6B2737;padding-top:16px;text-align:right;">
      <p style="color:#666;font-size:14px;margin:4px 0;">Subtotal: PKR ${order.subtotal.toLocaleString()}</p>
      <p style="color:#666;font-size:14px;margin:4px 0;">Shipping: PKR ${order.shippingCost.toLocaleString()}</p>
      ${order.discountAmount > 0 ? `<p style="color:#4CAF50;font-size:14px;margin:4px 0;">Discount: -PKR ${order.discountAmount.toLocaleString()}</p>` : ""}
      <p style="color:#6B2737;font-size:18px;font-weight:bold;font-family:Georgia,serif;margin:12px 0 0;">
        Total: PKR ${order.total.toLocaleString()}
      </p>
    </div>
    <div style="background:#f8f4f0;padding:16px;margin:24px 0;border-left:3px solid #C9A84C;">
      <p style="color:#333;font-size:14px;margin:0 0 4px;"><strong>Shipping to:</strong></p>
      <p style="color:#666;font-size:13px;margin:0;">${order.shippingAddress.fullName}, ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}</p>
      <p style="color:#C9A84C;font-size:13px;margin:8px 0 0;"><strong>Estimated delivery: ${order.estimatedDelivery}</strong></p>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.orderNumber}"
        style="background:#6B2737;color:#FAF7F2;padding:14px 36px;text-decoration:none;font-size:13px;letter-spacing:2px;display:inline-block;font-family:Georgia,serif;">
        TRACK ORDER
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Order Confirmed - #${order.orderNumber} | ${BRAND_NAME}`,
    html: wrapEmail(content),
  });
}

export async function sendOrderStatusEmail(
  to: string,
  name: string,
  orderNumber: string,
  status: string,
  message: string,
  trackingNumber?: string
) {
  const statusColors: Record<string, string> = {
    confirmed: "#4CAF50",
    packed: "#2196F3",
    shipped: "#FF9800",
    delivered: "#4CAF50",
    cancelled: "#F44336",
  };

  const content = `
    <h2 style="color:#6B2737;font-family:Georgia,serif;font-size:22px;margin:0 0 8px;">
      Order Update
    </h2>
    <p style="color:#666;font-size:14px;margin:0 0 24px;">Hi ${name}, here's an update on your order #${orderNumber}</p>
    <div style="text-align:center;padding:24px;background:#f8f4f0;margin:0 0 24px;">
      <span style="display:inline-block;background:${statusColors[status.toLowerCase()] || "#6B2737"};color:#fff;padding:8px 24px;font-size:13px;letter-spacing:2px;border-radius:2px;">
        ${status.toUpperCase()}
      </span>
    </div>
    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 20px;">${message}</p>
    ${trackingNumber ? `
    <div style="background:#f8f4f0;padding:16px;margin:0 0 24px;border-left:3px solid #C9A84C;">
      <p style="color:#333;font-size:14px;margin:0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
    </div>
    ` : ""}
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/track-order?order=${orderNumber}"
        style="background:#6B2737;color:#FAF7F2;padding:14px 36px;text-decoration:none;font-size:13px;letter-spacing:2px;display:inline-block;font-family:Georgia,serif;">
        TRACK YOUR ORDER
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your order is ${status} - #${orderNumber} | ${BRAND_NAME}`,
    html: wrapEmail(content),
  });
}

export async function sendAbandonedCartEmail(
  to: string,
  name: string,
  cartItems: Array<{ name: string; image: string; price: number }>,
  recoveryLink: string
) {
  const itemsHtml = cartItems
    .slice(0, 3)
    .map(
      (item) => `
      <div style="display:inline-block;text-align:center;margin:8px;width:150px;">
        <img src="${item.image}" alt="${item.name}" style="width:150px;height:180px;object-fit:cover;" />
        <p style="color:#333;font-size:12px;margin:8px 0 4px;">${item.name}</p>
        <p style="color:#6B2737;font-size:13px;font-weight:bold;margin:0;">PKR ${item.price.toLocaleString()}</p>
      </div>`
    )
    .join("");

  const content = `
    <h2 style="color:#6B2737;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">
      You left something behind, ${name}
    </h2>
    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Your curated selection is waiting. Complete your order before these pieces are gone.
    </p>
    <div style="text-align:center;margin:0 0 28px;">
      ${itemsHtml}
    </div>
    <div style="text-align:center;">
      <a href="${recoveryLink}"
        style="background:#6B2737;color:#FAF7F2;padding:14px 36px;text-decoration:none;font-size:13px;letter-spacing:2px;display:inline-block;font-family:Georgia,serif;">
        COMPLETE MY ORDER
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your cart is waiting - ${BRAND_NAME}`,
    html: wrapEmail(content),
  });
}

export async function sendReviewRequestEmail(
  to: string,
  name: string,
  orderNumber: string,
  products: Array<{ id: string; name: string; image: string; slug: string }>
) {
  const productsHtml = products
    .map(
      (p) => `
      <div style="text-align:center;margin:8px;display:inline-block;">
        <img src="${p.image}" alt="${p.name}" style="width:120px;height:140px;object-fit:cover;" />
        <p style="color:#333;font-size:12px;margin:8px 0 8px;">${p.name}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/product/${p.slug}#reviews"
          style="background:#C9A84C;color:#fff;padding:8px 16px;font-size:11px;letter-spacing:1px;text-decoration:none;">
          REVIEW
        </a>
      </div>`
    )
    .join("");

  const content = `
    <h2 style="color:#6B2737;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">
      How was your experience?
    </h2>
    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Hi ${name}, we hope you're loving your recent purchase from order #${orderNumber}.
      Your review helps other women make the right choice.
    </p>
    <div style="text-align:center;margin:0 0 28px;">
      ${productsHtml}
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `How was it, ${name}? Share your review - ${BRAND_NAME}`,
    html: wrapEmail(content),
  });
}

export async function sendFeedbackAcknowledgementEmail(
  to: string,
  name: string,
  ticketNumber: string,
  type: string
) {
  const content = `
    <h2 style="color:#6B2737;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">
      We've received your ${type}
    </h2>
    <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Hi ${name}, thank you for reaching out. Our team will get back to you within 24-48 hours.
    </p>
    <div style="background:#f8f4f0;padding:20px;text-align:center;margin:24px 0;border:1px solid #e0d8cf;">
      <p style="color:#666;font-size:13px;margin:0 0 8px;letter-spacing:1px;">YOUR TICKET NUMBER</p>
      <p style="color:#6B2737;font-family:Georgia,serif;font-size:24px;font-weight:bold;letter-spacing:3px;margin:0;">
        ${ticketNumber}
      </p>
    </div>
    <p style="color:#666;font-size:14px;line-height:1.7;">
      You can track the status of your ticket anytime at
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/feedback/track?ticket=${ticketNumber}" style="color:#6B2737;">
        dawrem.com/feedback/track
      </a>
    </p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Ticket #${ticketNumber} received - ${BRAND_NAME}`,
    html: wrapEmail(content),
  });
}

export async function sendLowStockAlertEmail(
  products: Array<{ name: string; stock: number; slug: string }>
) {
  const productsHtml = products
    .map(
      (p) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">${p.name}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;color:#F44336;font-weight:bold;text-align:center;">${p.stock}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/products?slug=${p.slug}" style="color:#6B2737;">Update Stock</a>
        </td>
      </tr>`
    )
    .join("");

  const content = `
    <h2 style="color:#6B2737;font-family:Georgia,serif;font-size:22px;margin:0 0 16px;">
      Low Stock Alert
    </h2>
    <p style="color:#333;font-size:15px;margin:0 0 24px;">
      The following products are running low and need restocking:
    </p>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#f8f4f0;">
          <th style="padding:12px;text-align:left;color:#6B2737;font-size:12px;letter-spacing:1px;">PRODUCT</th>
          <th style="padding:12px;text-align:center;color:#6B2737;font-size:12px;letter-spacing:1px;">STOCK LEFT</th>
          <th style="padding:12px;text-align:right;color:#6B2737;font-size:12px;letter-spacing:1px;">ACTION</th>
        </tr>
      </thead>
      <tbody>${productsHtml}</tbody>
    </table>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL!,
    subject: `Low Stock Alert - ${products.length} products need attention`,
    html: wrapEmail(content),
  });
}
