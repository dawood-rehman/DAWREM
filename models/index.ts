import mongoose, { Document, Schema } from "mongoose";

// ---- REVIEW ----
export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userImage?: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isPinned: boolean;
  isFlagged: boolean;
  adminReply?: string;
  adminReplyAt?: Date;
  helpfulCount: number;
  helpfulBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    userImage: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    body: { type: String, required: true },
    images: [String],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false, index: true },
    isPinned: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    adminReply: { type: String },
    adminReplyAt: { type: Date },
    helpfulCount: { type: Number, default: 0 },
    helpfulBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ---- FEEDBACK ----
export interface IFeedback extends Document {
  type: "feedback" | "complaint" | "suggestion" | "return_exchange";
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  orderNumber?: string;
  attachments: string[];
  ticketNumber: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  adminNotes?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    type: {
      type: String,
      enum: ["feedback", "complaint", "suggestion", "return_exchange"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    orderNumber: { type: String },
    attachments: [String],
    ticketNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    adminNotes: { type: String },
    assignedTo: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// ---- COUPON ----
export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  usedBy: mongoose.Types.ObjectId[];
  expiryDate?: Date;
  isActive: boolean;
  applicableCategories: string[];
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number },
    maxDiscountAmount: { type: Number },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    applicableCategories: [String],
  },
  { timestamps: true }
);

// ---- BANNER ----
export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  position: "hero" | "announcement" | "popup" | "sidebar";
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  backgroundColor?: string;
  textColor?: string;
  createdAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String },
    mobileImage: { type: String },
    ctaText: { type: String },
    ctaLink: { type: String },
    position: {
      type: String,
      enum: ["hero", "announcement", "popup", "sidebar"],
      required: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    backgroundColor: { type: String },
    textColor: { type: String },
  },
  { timestamps: true }
);

// ---- DYNAMIC PAGE ----
export interface IDynamicPage extends Document {
  title: string;
  slug: string;
  sections: mongoose.Types.ObjectId[];
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  showInNav: boolean;
  navLabel?: string;
  navOrder: number;
  pageType: "sale" | "category" | "custom";
  scheduledPublish?: Date;
  scheduledUnpublish?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DynamicPageSchema = new Schema<IDynamicPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sections: [{ type: Schema.Types.ObjectId, ref: "DynamicSection" }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    isPublished: { type: Boolean, default: false },
    showInNav: { type: Boolean, default: false },
    navLabel: { type: String },
    navOrder: { type: Number, default: 0 },
    pageType: { type: String, enum: ["sale", "category", "custom"], default: "custom" },
    scheduledPublish: { type: Date },
    scheduledUnpublish: { type: Date },
  },
  { timestamps: true }
);

// ---- DYNAMIC SECTION ----
export interface IDynamicSection extends Document {
  name: string;
  type:
    | "hero"
    | "product_grid"
    | "product_carousel"
    | "countdown"
    | "announcement"
    | "image_text"
    | "testimonials"
    | "newsletter"
    | "category_cards"
    | "video"
    | "faq"
    | "custom_html"
    | "instagram";
  content: Record<string, unknown>;
  styling: Record<string, unknown>;
  isActive: boolean;
  displayOn: string[];
  order: number;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  mobileVisible: boolean;
  createdAt: Date;
}

const DynamicSectionSchema = new Schema<IDynamicSection>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "hero", "product_grid", "product_carousel", "countdown",
        "announcement", "image_text", "testimonials", "newsletter",
        "category_cards", "video", "faq", "custom_html", "instagram",
      ],
      required: true,
    },
    content: { type: Schema.Types.Mixed, default: {} },
    styling: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    displayOn: [String],
    order: { type: Number, default: 0 },
    scheduledStart: { type: Date },
    scheduledEnd: { type: Date },
    mobileVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ---- AUTOMATION ----
export interface IAutomation extends Document {
  name: string;
  description: string;
  trigger: "event" | "schedule" | "condition";
  triggerConfig: Record<string, unknown>;
  actions: Array<{ type: string; config: Record<string, unknown> }>;
  isActive: boolean;
  lastRun?: Date;
  lastRunStatus?: "success" | "failed" | "skipped";
  runCount: number;
  logs: Array<{
    runAt: Date;
    status: string;
    message: string;
    data?: Record<string, unknown>;
  }>;
  createdAt: Date;
}

const AutomationSchema = new Schema<IAutomation>(
  {
    name: { type: String, required: true },
    description: { type: String },
    trigger: { type: String, enum: ["event", "schedule", "condition"], required: true },
    triggerConfig: { type: Schema.Types.Mixed, default: {} },
    actions: [{ type: { type: String }, config: Schema.Types.Mixed }],
    isActive: { type: Boolean, default: true },
    lastRun: { type: Date },
    lastRunStatus: { type: String, enum: ["success", "failed", "skipped"] },
    runCount: { type: Number, default: 0 },
    logs: [
      {
        runAt: { type: Date, default: Date.now },
        status: String,
        message: String,
        data: Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

// ---- SETTINGS ----
export interface ISettings extends Document {
  key: string;
  value: unknown;
  group: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
    group: { type: String, default: "general" },
  },
  { timestamps: true }
);

export const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
export const Feedback =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
export const Coupon =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
export const Banner =
  mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);
export const DynamicPage =
  mongoose.models.DynamicPage || mongoose.model<IDynamicPage>("DynamicPage", DynamicPageSchema);
export const DynamicSection =
  mongoose.models.DynamicSection || mongoose.model<IDynamicSection>("DynamicSection", DynamicSectionSchema);
export const Automation =
  mongoose.models.Automation || mongoose.model<IAutomation>("Automation", AutomationSchema);
export const Settings =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
