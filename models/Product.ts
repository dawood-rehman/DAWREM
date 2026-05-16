import mongoose, { Document, Schema } from "mongoose";

export interface IProductVariant {
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
  images?: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  category: string;
  subCategory?: string;
  tags: string[];
  images: string[];
  variants: IProductVariant[];
  stock: number;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  fabric?: string;
  occasion?: string;
  season?: string;
  isFeatured: boolean;
  isPublished: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  seoTitle?: string;
  seoDescription?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  totalSold: number;
  averageRating: number;
  reviewCount: number;
  lowStockThreshold: number;
  notifyWhenInStock: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IProductVariant>({
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, default: "#000000" },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String },
  images: [String],
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    subCategory: { type: String, index: true },
    tags: [{ type: String, lowercase: true }],
    images: [{ type: String }],
    variants: [VariantSchema],
    stock: { type: Number, default: 0, min: 0 },
    sizes: [{ type: String }],
    colors: [{ name: String, hex: String }],
    fabric: { type: String },
    occasion: { type: String },
    season: { type: String },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestseller: { type: Boolean, default: false },
    seoTitle: { type: String },
    seoDescription: { type: String },
    weight: { type: Number },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    totalSold: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    notifyWhenInStock: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes for performance
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ totalSold: -1 });
ProductSchema.index({ isPublished: 1, isFeatured: 1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
