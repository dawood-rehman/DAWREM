import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error("Missing MongoDB connection string.");
  console.error("Add MONGODB_URI to .env.local, .env, or your shell environment.");
  console.error("❌  MONGODB_URI not set in .env.local");
  process.exit(1);
}
const mongoUri = MONGODB_URI as string;

// ── Inline schemas (avoids importing models that need full Next.js context) ──
const ProductSchema = new mongoose.Schema({ name: String, slug: String, description: String, shortDescription: String, price: Number, salePrice: Number, category: String, tags: [String], images: [String], variants: [{ size: String, color: String, colorHex: String, stock: Number, sku: String }], stock: Number, sizes: [String], colors: [{ name: String, hex: String }], fabric: String, occasion: String, season: String, isFeatured: Boolean, isPublished: Boolean, isNewArrival: Boolean, isBestseller: Boolean, seoTitle: String, seoDescription: String, averageRating: { type: Number, default: 0 }, reviewCount: { type: Number, default: 0 }, totalSold: { type: Number, default: 0 }, lowStockThreshold: { type: Number, default: 5 } }, { timestamps: true });
const UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: "customer" }, provider: { type: String, default: "credentials" }, addresses: [], wishlist: [], isBlocked: { type: Boolean, default: false }, totalOrders: { type: Number, default: 0 }, totalSpent: { type: Number, default: 0 }, loyaltyPoints: { type: Number, default: 0 }, emailPreferences: { orderUpdates: { type: Boolean, default: true }, promotions: { type: Boolean, default: true }, newArrivals: { type: Boolean, default: false }, priceDrops: { type: Boolean, default: true } } }, { timestamps: true });
const CouponSchema = new mongoose.Schema({ code: { type: String, unique: true }, type: String, value: Number, minOrderAmount: Number, usageLimit: Number, usedCount: { type: Number, default: 0 }, expiryDate: Date, isActive: { type: Boolean, default: true } }, { timestamps: true });
const BannerSchema = new mongoose.Schema({ title: String, subtitle: String, image: String, ctaText: String, ctaLink: String, position: String, order: { type: Number, default: 0 }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const AutomationSchema = new mongoose.Schema({ name: String, description: String, trigger: String, triggerConfig: mongoose.Schema.Types.Mixed, actions: [{ type: { type: String }, config: mongoose.Schema.Types.Mixed }], isActive: { type: Boolean, default: true }, runCount: { type: Number, default: 0 }, logs: [] }, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
const Banner = mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
const Automation = mongoose.models.Automation || mongoose.model("Automation", AutomationSchema);

// ── Sample product data ──
const IMAGES = {
  formal: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=800&q=80", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
  casual: ["https://images.unsplash.com/photo-1562572159-4efd90d578ff?w=800&q=80", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"],
  bridal: ["https://images.unsplash.com/photo-1546940901-2fd24c0c6c9e?w=800&q=80", "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=800&q=80"],
  festive: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"],
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Ivory White", hex: "#FAF7F2" },
  { name: "Deep Burgundy", hex: "#6B2737" },
  { name: "Midnight Black", hex: "#1A1A1A" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Navy Blue", hex: "#003153" },
  { name: "Forest Green", hex: "#228B22" },
];

function makeVariants(sizes: string[], colors: typeof COLORS, baseStock = 15) {
  return sizes.flatMap((size) =>
    colors.slice(0, 3).map((color) => ({
      size, color: color.name, colorHex: color.hex,
      stock: Math.floor(Math.random() * baseStock) + 3,
      sku: `VEL-${size}-${color.name.replace(/\s/g, "").toUpperCase().slice(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    }))
  );
}

const products = [
  { name: "Shaheen Classic Silk Formal", slug: "shaheen-classic-silk-formal", category: "formal", price: 8500, salePrice: 6800, fabric: "Pure Silk", occasion: "Office", season: "All Season", isFeatured: true, isPublished: true, isNewArrival: false, isBestseller: true, images: IMAGES.formal, tags: ["silk", "formal", "office", "luxury"], description: "The Shaheen Classic Silk Formal is a masterpiece of contemporary design. Crafted from the finest pure silk, this three-piece ensemble features intricate hand-embroidered details on the neckline and cuffs. Perfect for board meetings or formal dinners — this suit commands attention with quiet elegance." },
  { name: "Noor Embroidered Lawn Set", slug: "noor-embroidered-lawn-set", category: "lawn", price: 4200, fabric: "Lawn", occasion: "Casual", season: "Summer", isFeatured: false, isPublished: true, isNewArrival: true, isBestseller: false, images: IMAGES.casual, tags: ["lawn", "casual", "summer", "embroidered"], description: "Light as a breeze and elegant as ever, the Noor Embroidered Lawn Set is your summer companion. The breathable lawn fabric is adorned with delicate floral embroidery, making it ideal for daytime gatherings and casual outings." },
  { name: "Raani Bridal Masterpiece", slug: "raani-bridal-masterpiece", category: "bridal", price: 45000, salePrice: 38000, fabric: "Velvet + Silk", occasion: "Wedding", season: "All Season", isFeatured: true, isPublished: true, isNewArrival: false, isBestseller: true, images: IMAGES.bridal, tags: ["bridal", "wedding", "velvet", "luxury", "embellished"], description: "The Raani Bridal Masterpiece is the crown jewel of VELOURÉ's bridal collection. Featuring rich velvet with gold zardozi embroidery and silk organza dupatta, this ensemble will make your most important day unforgettable. Includes custom fitting consultation." },
  { name: "Meher Festive Chiffon", slug: "meher-festive-chiffon", category: "festive", price: 6500, salePrice: 5200, fabric: "Chiffon", occasion: "Festival", season: "All Season", isFeatured: true, isPublished: true, isNewArrival: true, isBestseller: false, images: IMAGES.festive, tags: ["chiffon", "festive", "eid", "party", "evening"], description: "Celebrate every occasion in the Meher Festive Chiffon. This flowing chiffon three-piece features sequin embellishments on the neckline and hemline, with a matching embroidered dupatta. Available in 6 stunning shades." },
  { name: "Zarish Winter Khaddar", slug: "zarish-winter-khaddar", category: "winter", price: 5800, fabric: "Khaddar", occasion: "Casual", season: "Winter", isFeatured: false, isPublished: true, isNewArrival: true, isBestseller: false, images: IMAGES.casual, tags: ["khaddar", "winter", "casual", "warm"], description: "Embrace winter in warmth and style with the Zarish Winter Khaddar. Made from premium quality khaddar fabric with intricate block printing, this suit is both comfortable and fashion-forward. The two-piece set pairs beautifully with our exclusive wool shawls." },
  { name: "Gulbahar Casual Linen", slug: "gulbahar-casual-linen", category: "casual", price: 3500, fabric: "Linen", occasion: "Casual", season: "Summer", isFeatured: false, isPublished: true, isNewArrival: false, isBestseller: true, images: IMAGES.casual, tags: ["linen", "casual", "everyday", "comfortable"], description: "Effortless style for every day — the Gulbahar Casual Linen suit is crafted from premium European linen. Its minimalist design features subtle thread work and a relaxed silhouette that flatters every body type." },
  { name: "Tabassum Embellished Formal", slug: "tabassum-embellished-formal", category: "formal", price: 12000, salePrice: 9500, fabric: "Banarsi", occasion: "Office", season: "All Season", isFeatured: true, isPublished: true, isNewArrival: false, isBestseller: true, images: IMAGES.formal, tags: ["banarsi", "formal", "embellished", "luxury", "office"], description: "The Tabassum Embellished Formal combines the richness of Banarsi weave with a modern cut. Gold thread embroidery across the shirt creates a striking visual that transitions seamlessly from the boardroom to an evening event." },
  { name: "Sana Eid Special Collection", slug: "sana-eid-special", category: "festive", price: 8800, fabric: "Organza", occasion: "Festival", season: "Spring", isFeatured: true, isPublished: true, isNewArrival: true, isBestseller: false, images: IMAGES.festive, tags: ["eid", "organza", "festive", "special", "new"], description: "Specially designed for the festive season, the Sana Eid Special Collection features airy organza fabric with mirror-work embroidery inspired by traditional motifs. The jacket-style shirt paired with palazzo pants offers a fresh, contemporary take on festive dressing." },
  { name: "Fareeha Casual Cotton", slug: "fareeha-casual-cotton", category: "casual", price: 2800, fabric: "Cotton", occasion: "Casual", season: "Summer", isFeatured: false, isPublished: true, isNewArrival: false, isBestseller: true, images: IMAGES.casual, tags: ["cotton", "casual", "everyday", "summer", "comfortable"], description: "The Fareeha Casual Cotton suit is the everyday essential that every wardrobe needs. 100% pure cotton with digital print patterns — cool, breathable, and effortlessly stylish." },
  { name: "Layla Bridal Pearl Set", slug: "layla-bridal-pearl-set", category: "bridal", price: 55000, fabric: "Raw Silk + Net", occasion: "Wedding", season: "All Season", isFeatured: false, isPublished: true, isNewArrival: true, isBestseller: false, images: IMAGES.bridal, tags: ["bridal", "pearl", "wedding", "luxury", "net"], description: "The Layla Bridal Pearl Set is a vision of understated luxury. Hand-applied pearl clusters and crystal sequins adorn the deep-neck shirt, while the raw silk cigarette pants add a modern silhouette. Comes with a hand-embroidered net dupatta." },
  { name: "Roshni Printed Lawn Suit", slug: "roshni-printed-lawn-suit", category: "lawn", price: 3200, fabric: "Lawn", occasion: "Casual", season: "Summer", isFeatured: false, isPublished: true, isNewArrival: true, isBestseller: false, images: IMAGES.casual, tags: ["lawn", "printed", "casual", "summer"], description: "Vibrant, cheerful, and comfortable — the Roshni Printed Lawn Suit features an exclusive digital floral print on premium lawn fabric. Three-piece set includes stitched shirt, trouser, and printed dupatta." },
  { name: "Malika Royal Velvet Set", slug: "malika-royal-velvet-set", category: "festive", price: 15000, salePrice: 11500, fabric: "Velvet", occasion: "Party", season: "Winter", isFeatured: true, isPublished: true, isNewArrival: false, isBestseller: true, images: IMAGES.festive, tags: ["velvet", "royal", "party", "winter", "luxury"], description: "Make a regal statement with the Malika Royal Velvet Set. Deep jewel-toned velvet with cut-work embroidery and a dramatic flared silhouette — this is the suit for moments that deserve to be remembered." },
];

const coupons = [
  { code: "WELCOME10", type: "percentage", value: 10, minOrderAmount: 2000, usageLimit: 1000, isActive: true },
  { code: "SAVE500", type: "fixed", value: 500, minOrderAmount: 5000, usageLimit: 200, isActive: true },
  { code: "SUMMER25", type: "percentage", value: 25, minOrderAmount: 8000, usageLimit: 100, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
  { code: "FREESHIP", type: "fixed", value: 200, minOrderAmount: 1500, usageLimit: 500, isActive: true },
  { code: "VIP40", type: "percentage", value: 40, minOrderAmount: 15000, usageLimit: 50, isActive: true },
];

const banners = [
  { title: "New Summer Collection", subtitle: "Discover 100+ new styles crafted for the season", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80", ctaText: "Shop Now", ctaLink: "/shop?collection=new", position: "hero", order: 1, isActive: true },
  { title: "Eid Special Sale — Up to 40% Off", subtitle: "Limited time offer on selected collections", image: "https://images.unsplash.com/photo-1546940901-2fd24c0c6c9e?w=1920&q=80", ctaText: "Shop Sale", ctaLink: "/shop?sale=true", position: "hero", order: 2, isActive: true },
  { title: "Free Shipping on Orders Above PKR 5,000", subtitle: null, image: null, ctaText: "Shop Now", ctaLink: "/shop", position: "announcement", order: 1, isActive: true },
];

const automations = [
  { name: "Welcome Email", description: "Send a welcome email with 10% discount when a new user registers", trigger: "event", triggerConfig: { event: "user.registered" }, actions: [{ type: "send_welcome_email", config: {} }], isActive: true },
  { name: "Order Confirmation Email", description: "Send order details when an order is placed", trigger: "event", triggerConfig: { event: "order.placed" }, actions: [{ type: "send_order_status_email", config: {} }], isActive: true },
  { name: "Order Status Updates", description: "Notify customer when order status changes", trigger: "event", triggerConfig: { event: "order.status_updated" }, actions: [{ type: "send_order_status_email", config: {} }], isActive: true },
  { name: "Review Request", description: "Ask for review 2 days after delivery", trigger: "event", triggerConfig: { event: "order.delivered", delayDays: 2 }, actions: [{ type: "send_review_request", config: {} }], isActive: true },
  { name: "Abandoned Cart Recovery", description: "Email customers who left items in cart for over 2 hours", trigger: "event", triggerConfig: { event: "cart.abandoned", delayHours: 2 }, actions: [{ type: "send_abandoned_cart_email", config: {} }], isActive: true },
  { name: "Low Stock Alert", description: "Notify admin when product stock drops below threshold", trigger: "event", triggerConfig: { event: "product.low_stock" }, actions: [{ type: "send_low_stock_alert", config: {} }], isActive: true },
  { name: "Feedback Acknowledgement", description: "Auto-acknowledge feedback submissions with ticket number", trigger: "event", triggerConfig: { event: "feedback.submitted" }, actions: [{ type: "send_feedback_ack", config: {} }], isActive: true },
  { name: "WhatsApp Order Update", description: "Send WhatsApp message on order status change", trigger: "event", triggerConfig: { event: "order.status_updated" }, actions: [{ type: "send_whatsapp", config: { template: "order_confirmed" } }], isActive: false },
  { name: "Win-Back Campaign", description: "Email inactive customers after 30 days with comeback discount", trigger: "schedule", triggerConfig: { cron: "0 9 * * *", inactiveDays: 30 }, actions: [{ type: "send_abandoned_cart_email", config: {} }], isActive: false },
  { name: "Birthday Discount", description: "Send birthday email with special discount code", trigger: "schedule", triggerConfig: { cron: "0 8 * * *", event: "user.birthday" }, actions: [{ type: "send_welcome_email", config: {} }], isActive: false },
];

async function seed() {
  console.log("🌱  Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅  Connected\n");

  // Clear existing data
  console.log("🗑️   Clearing existing data...");
  await Promise.all([
    Product.deleteMany({}),
    User.deleteMany({}),
    Coupon.deleteMany({}),
    Banner.deleteMany({}),
    Automation.deleteMany({}),
  ]);
  console.log("✅  Cleared\n");

  // Seed users
  console.log("👤  Seeding users...");
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const customerPassword = await bcrypt.hash("Customer@1234", 12);

  await User.insertMany([
    {
      name: "Admin User",
      email: "admin@dawrem.com",
      password: adminPassword,
      role: "admin",
      provider: "credentials",
      isBlocked: false,
    },
    {
      name: "Ayesha Malik",
      email: "ayesha@example.com",
      password: customerPassword,
      role: "customer",
      provider: "credentials",
      isBlocked: false,
      totalOrders: 3,
      totalSpent: 24500,
    },
    {
      name: "Fatima Zahra",
      email: "fatima@example.com",
      password: customerPassword,
      role: "customer",
      provider: "credentials",
      isBlocked: false,
      totalOrders: 1,
      totalSpent: 8800,
    },
    {
      name: "Sara Ahmed",
      email: "sara@example.com",
      password: customerPassword,
      role: "customer",
      provider: "credentials",
      isBlocked: false,
      totalOrders: 7,
      totalSpent: 87000,
      tags: ["VIP"],
    },
  ]);
  console.log("   ✅  4 users created");
  console.log("   📧  Admin: admin@dawrem.com / Admin@1234");
  console.log("   📧  Customer: ayesha@example.com / Customer@1234\n");

  // Seed products
  console.log("👗  Seeding products...");
  const productDocs = products.map((p) => ({
    ...p,
    sizes: SIZES,
    colors: COLORS.slice(0, 4),
    variants: makeVariants(SIZES, COLORS),
    stock: SIZES.length * 3 * 12,
    averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 80) + 5,
    totalSold: Math.floor(Math.random() * 300) + 20,
  }));
  await Product.insertMany(productDocs);
  console.log(`   ✅  ${productDocs.length} products created\n`);

  // Seed coupons
  console.log("🏷️   Seeding coupons...");
  await Coupon.insertMany(coupons);
  console.log(`   ✅  ${coupons.length} coupons created\n`);

  // Seed banners
  console.log("🖼️   Seeding banners...");
  await Banner.insertMany(banners);
  console.log(`   ✅  ${banners.length} banners created\n`);

  // Seed automations
  console.log("⚡  Seeding automations...");
  await Automation.insertMany(automations);
  console.log(`   ✅  ${automations.length} automations created\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉  Database seeded successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊  Summary:");
  console.log(`    Products  : ${productDocs.length}`);
  console.log(`    Users     : 4`);
  console.log(`    Coupons   : ${coupons.length}`);
  console.log(`    Banners   : ${banners.length}`);
  console.log(`    Automations: ${automations.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  await mongoose.disconnect().catch(() => undefined);
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
