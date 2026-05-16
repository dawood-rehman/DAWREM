import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
  size: string;
  color: string;
  sku?: string;
}

export interface IAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

export interface IOrderTimeline {
  status: string;
  message: string;
  timestamp: Date;
  updatedBy?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  guestEmail?: string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  paymentMethod: "stripe" | "jazzcash" | "easypaisa" | "bank_transfer" | "cod" | "paypal";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  paymentIntentId?: string;
  orderStatus: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "returned";
  trackingNumber?: string;
  courier?: string;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  giftMessage?: string;
  timeline: IOrderTimeline[];
  isReviewRequested: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: true, default: "Pakistan" },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String, required: true },
    color: { type: String, required: true },
    sku: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestEmail: { type: String },
    items: [OrderItemSchema],
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: AddressSchema,
    paymentMethod: {
      type: String,
      enum: ["stripe", "jazzcash", "easypaisa", "bank_transfer", "cod", "paypal"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    paymentIntentId: { type: String },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true,
    },
    trackingNumber: { type: String },
    courier: { type: String },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: { type: String },
    giftMessage: { type: String },
    timeline: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: String,
      },
    ],
    isReviewRequested: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
