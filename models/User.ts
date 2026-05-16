import mongoose, { Document, Schema } from "mongoose";

export interface ISavedAddress {
  _id?: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "admin" | "customer";
  provider?: "credentials" | "google";
  addresses: ISavedAddress[];
  wishlist: mongoose.Types.ObjectId[];
  isBlocked: boolean;
  isEmailVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  birthday?: Date;
  phone?: string;
  loyaltyPoints: number;
  tags: string[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailPreferences: {
    orderUpdates: boolean;
    promotions: boolean;
    newArrivals: boolean;
    priceDrops: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<ISavedAddress>({
  label: { type: String, default: "Home" },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String },
  country: { type: String, default: "Pakistan" },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    image: { type: String },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    addresses: [AddressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isBlocked: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    birthday: { type: Date },
    phone: { type: String },
    loyaltyPoints: { type: Number, default: 0 },
    tags: [{ type: String }],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    emailPreferences: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: false },
      priceDrops: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
