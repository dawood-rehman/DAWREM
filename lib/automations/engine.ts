import { connectDB } from "@/lib/mongodb";
import { Automation } from "@/models/index";
import {
  sendWelcomeEmail,
  sendOrderStatusEmail,
  sendAbandonedCartEmail,
  sendReviewRequestEmail,
  sendLowStockAlertEmail,
  sendFeedbackAcknowledgementEmail,
} from "@/lib/email";

export type AutomationEvent =
  | "user.registered"
  | "order.placed"
  | "order.status_updated"
  | "order.delivered"
  | "review.approved"
  | "feedback.submitted"
  | "product.low_stock"
  | "product.out_of_stock"
  | "product.restocked"
  | "product.price_dropped"
  | "coupon.expired"
  | "cart.abandoned";

interface EventPayload {
  [key: string]: unknown;
}

class AutomationEngine {
  private static instance: AutomationEngine;

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  async trigger(event: AutomationEvent, payload: EventPayload): Promise<void> {
    await connectDB();

    const automations = await Automation.find({
      isActive: true,
      trigger: "event",
      "triggerConfig.event": event,
    });

    for (const automation of automations) {
      try {
        await this.execute(automation, payload);
        await Automation.findByIdAndUpdate(automation._id, {
          $inc: { runCount: 1 },
          $set: { lastRun: new Date(), lastRunStatus: "success" },
          $push: {
            logs: {
              runAt: new Date(),
              status: "success",
              message: `Triggered by ${event}`,
              data: payload,
            },
          },
        });
      } catch (err) {
        console.error(`Automation ${automation.name} failed:`, err);
        await Automation.findByIdAndUpdate(automation._id, {
          $set: { lastRunStatus: "failed" },
          $push: {
            logs: {
              runAt: new Date(),
              status: "failed",
              message: err instanceof Error ? err.message : "Unknown error",
            },
          },
        });
      }
    }
  }

  private async execute(
    automation: { actions: Array<{ type: string; config: Record<string, unknown> }> },
    payload: EventPayload
  ): Promise<void> {
    for (const action of automation.actions) {
      await this.runAction(action.type, action.config, payload);
    }
  }

  private async runAction(
    type: string,
    config: Record<string, unknown>,
    payload: EventPayload
  ): Promise<void> {
    switch (type) {
      case "send_welcome_email":
        if (payload.email && payload.name && payload.discountCode) {
          await sendWelcomeEmail(
            payload.email as string,
            payload.name as string,
            payload.discountCode as string
          );
        }
        break;

      case "send_order_status_email":
        if (payload.email && payload.name && payload.orderNumber && payload.status) {
          await sendOrderStatusEmail(
            payload.email as string,
            payload.name as string,
            payload.orderNumber as string,
            payload.status as string,
            (payload.message as string) || `Your order status has been updated to ${payload.status}`,
            payload.trackingNumber as string | undefined
          );
        }
        break;

      case "send_review_request":
        if (payload.email && payload.name && payload.orderNumber) {
          await sendReviewRequestEmail(
            payload.email as string,
            payload.name as string,
            payload.orderNumber as string,
            (payload.products as Array<{ id: string; name: string; image: string; slug: string }>) || []
          );
        }
        break;

      case "send_abandoned_cart_email":
        if (payload.email && payload.name && payload.cartItems) {
          await sendAbandonedCartEmail(
            payload.email as string,
            payload.name as string,
            payload.cartItems as Array<{ name: string; image: string; price: number }>,
            (payload.recoveryLink as string) || `${process.env.NEXT_PUBLIC_APP_URL}/cart`
          );
        }
        break;

      case "send_feedback_ack":
        if (payload.email && payload.name && payload.ticketNumber) {
          await sendFeedbackAcknowledgementEmail(
            payload.email as string,
            payload.name as string,
            payload.ticketNumber as string,
            (payload.type as string) || "message"
          );
        }
        break;

      case "send_low_stock_alert":
        if (payload.products) {
          await sendLowStockAlertEmail(
            payload.products as Array<{ name: string; stock: number; slug: string }>
          );
        }
        break;

      case "send_whatsapp":
        // WhatsApp Business API integration
        await this.sendWhatsApp(
          config.template as string,
          payload.phone as string,
          payload
        );
        break;

      default:
        console.warn(`Unknown action type: ${type}`);
    }
  }

  private async sendWhatsApp(
    template: string,
    phone: string,
    payload: EventPayload
  ): Promise<void> {
    if (!process.env.WHATSAPP_ACCESS_TOKEN || !phone) return;

    const messageTemplates: Record<string, object> = {
      order_confirmed: {
        name: "order_confirmed",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: payload.orderNumber as string },
            ],
          },
        ],
      },
      order_shipped: {
        name: "order_shipped",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: payload.orderNumber as string },
              { type: "text", text: (payload.trackingNumber as string) || "N/A" },
            ],
          },
        ],
      },
    };

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone.replace(/\D/g, ""),
            type: "template",
            template: messageTemplates[template] || messageTemplates.order_confirmed,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }
    } catch (err) {
      console.error("WhatsApp send failed:", err);
    }
  }
}

export const automationEngine = AutomationEngine.getInstance();

// Seed default automations
export async function seedDefaultAutomations() {
  await connectDB();

  const defaults = [
    {
      name: "Welcome Email",
      description: "Send a welcome email with 10% discount when a new user registers",
      trigger: "event",
      triggerConfig: { event: "user.registered" },
      actions: [{ type: "send_welcome_email", config: {} }],
      isActive: true,
    },
    {
      name: "Order Confirmation Email",
      description: "Send order details when an order is placed",
      trigger: "event",
      triggerConfig: { event: "order.placed" },
      actions: [{ type: "send_order_status_email", config: {} }],
      isActive: true,
    },
    {
      name: "Order Status Updates",
      description: "Notify customer when order status changes",
      trigger: "event",
      triggerConfig: { event: "order.status_updated" },
      actions: [{ type: "send_order_status_email", config: {} }],
      isActive: true,
    },
    {
      name: "Review Request",
      description: "Ask for review 2 days after delivery",
      trigger: "event",
      triggerConfig: { event: "order.delivered", delayDays: 2 },
      actions: [{ type: "send_review_request", config: {} }],
      isActive: true,
    },
    {
      name: "Abandoned Cart Recovery",
      description: "Email customers who left items in cart",
      trigger: "event",
      triggerConfig: { event: "cart.abandoned", delayHours: 2 },
      actions: [{ type: "send_abandoned_cart_email", config: {} }],
      isActive: true,
    },
    {
      name: "Low Stock Alert",
      description: "Notify admin when product stock is low",
      trigger: "event",
      triggerConfig: { event: "product.low_stock" },
      actions: [{ type: "send_low_stock_alert", config: {} }],
      isActive: true,
    },
    {
      name: "Feedback Acknowledgement",
      description: "Auto-acknowledge feedback/complaints with ticket number",
      trigger: "event",
      triggerConfig: { event: "feedback.submitted" },
      actions: [{ type: "send_feedback_ack", config: {} }],
      isActive: true,
    },
    {
      name: "WhatsApp Order Update",
      description: "Send WhatsApp message on order status change",
      trigger: "event",
      triggerConfig: { event: "order.status_updated" },
      actions: [{ type: "send_whatsapp", config: { template: "order_confirmed" } }],
      isActive: false,
    },
  ];

  for (const automation of defaults) {
    await Automation.findOneAndUpdate(
      { name: automation.name },
      { $setOnInsert: automation },
      { upsert: true }
    );
  }
}
