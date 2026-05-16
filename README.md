# VELOURÉ — Premium Women's Suits eCommerce Platform

> **"Wear the Luxury"** — A complete, production-grade Next.js 14 eCommerce platform built for VELOURÉ, a premium women's fashion brand.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth.js (Google OAuth + Credentials) |
| State | Zustand (with localStorage persistence) |
| Payments | Stripe + JazzCash + EasyPaisa + COD |
| Email | Nodemailer + custom branded templates |
| Images | Next/Image + Cloudinary |
| Animations | Framer Motion |
| Charts | Recharts |
| Deployment | Vercel |

---

## Features

### Customer Store
- Full-screen hero with typewriter animation
- Advanced shop with sidebar filters (category, size, color, price, fabric)
- Product detail pages with image gallery, variant selector, size guide
- Slide-over cart with coupon support
- Multi-step checkout (Address → Shipping → Payment → Review)
- Pakistani payment methods: JazzCash, EasyPaisa, COD, Bank Transfer
- International: Stripe (Visa, Mastercard, Amex, Apple/Google Pay)
- Order tracking with real-time timeline
- Customer reviews with photo upload, verified purchase badges
- Feedback and complaint portal with ticket system
- User account, wishlist, order history
- WhatsApp floating chat button
- PWA — installable on mobile

### Admin Panel (`/admin/dashboard`)
- Revenue charts and analytics dashboard
- Full product CRUD with variant management
- Order management with inline status updates
- Customer management and VIP tagging
- Inventory monitoring with low-stock alerts
- Discount and coupon creation
- Review moderation (approve, reject, pin, reply)
- Feedback/complaint management with email reply
- Automation control center (20 automations, all togglable)

### Automation Engine (20 automations)
All automations are togglable from the admin panel:
- Welcome email with discount code
- Order confirmation and status updates
- Abandoned cart recovery (2h + 24h)
- Review request after delivery
- Low stock admin alerts
- Feedback auto-acknowledgement with ticket number
- Win-back campaign (30-day inactive)
- Birthday discounts
- WhatsApp order updates
- And 11 more

### Dynamic Page Builder
- Admin creates new pages without code
- Drag-and-drop section types: Hero, Product Grid, Countdown, Carousel, Testimonials, FAQ, Newsletter, Custom HTML
- Each section can be scheduled, shown/hidden, mobile toggled

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- A Gmail account (for Nodemailer, or any SMTP)
- Google OAuth credentials (for Google login)

### 1. Clone and Install

```bash
git clone https://github.com/your-org/veloure.git
cd veloure
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your values. The minimum required:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_char_secret_here
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=VELOURÉ <noreply@veloure.com>
ADMIN_EMAIL=admin@veloure.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- 12 sample products across all categories
- 4 users (1 admin, 3 customers)
- 5 coupon codes
- 3 homepage banners
- 10 default automations

**Admin credentials:**
```
Email:    admin@veloure.com
Password: Admin@1234
```

**Sample customer:**
```
Email:    ayesha@example.com
Password: Customer@1234
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the store.
Open [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) for the admin panel.

---

## Folder Structure

```
veloure/
├── app/
│   ├── (store)/          # Customer-facing pages
│   │   ├── page.tsx      # Homepage
│   │   ├── shop/         # Shop with filters
│   │   ├── product/[slug]/  # Product detail
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Multi-step checkout
│   │   ├── orders/       # Order history
│   │   ├── wishlist/     # Saved items
│   │   ├── track-order/  # Order tracking
│   │   └── feedback/     # Feedback/complaints
│   ├── (admin)/          # Admin panel (role-protected)
│   │   ├── dashboard/    # Analytics dashboard
│   │   ├── products/     # Product management
│   │   ├── orders/       # Order management
│   │   ├── customers/    # Customer management
│   │   ├── automations/  # Automation center
│   │   ├── feedback/     # Feedback management
│   │   └── reviews/      # Review moderation
│   └── api/              # API routes
├── components/
│   ├── ui/               # Shared UI (Logo, NProgress)
│   ├── store/            # Store components (Navbar, Footer, ProductCard)
│   └── admin/            # Admin components (Sidebar, Header, ProductForm)
├── models/               # Mongoose schemas
├── lib/
│   ├── mongodb.ts        # DB connection
│   ├── auth.ts           # NextAuth config
│   ├── email.ts          # Email templates
│   └── automations/      # Automation engine
├── store/                # Zustand stores (cart, wishlist)
├── scripts/
│   └── seed.ts           # Database seeder
├── public/               # Static assets
├── .env.example          # Environment template
└── vercel.json           # Vercel deployment config
```

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/your-org/veloure.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Framework: **Next.js** (auto-detected)
3. Add all environment variables from `.env.example`
4. Deploy

### 3. Set Up MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://cloud.mongodb.com)
2. Create a database user and whitelist `0.0.0.0/0` for Vercel
3. Copy the connection string into `MONGODB_URI`

### 4. Set Up Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `https://yourdomain.com/api/auth/callback/google` as authorized redirect URI

---

## Payment Integration

### JazzCash
Set `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, and `JAZZCASH_INTEGRITY_SALT` in `.env.local`. Toggle sandbox mode with `JAZZCASH_SANDBOX=true`.

### EasyPaisa
Set `EASYPAISA_STORE_ID` and `EASYPAISA_API_PASSWORD`. Toggle with `EASYPAISA_SANDBOX=true`.

### Stripe
1. Create an account at [stripe.com](https://stripe.com)
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Set up webhooks pointing to `/api/webhooks/stripe` and add `STRIPE_WEBHOOK_SECRET`

---

## Available Coupon Codes (after seeding)

| Code | Type | Value | Min Order |
|---|---|---|---|
| WELCOME10 | Percentage | 10% off | PKR 2,000 |
| SAVE500 | Fixed | PKR 500 off | PKR 5,000 |
| SUMMER25 | Percentage | 25% off | PKR 8,000 |
| FREESHIP | Fixed | PKR 200 off | PKR 1,500 |
| VIP40 | Percentage | 40% off | PKR 15,000 |

---

## MongoDB Indexes

The following indexes are created automatically by Mongoose:

- `products`: text index on name/description/tags, indexed on category, isPublished, isFeatured, createdAt
- `orders`: indexed on userId, orderStatus, orderNumber, createdAt
- `users`: indexed on email, role
- `reviews`: indexed on productId, isApproved

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | Yes | Full URL of your deployment |
| `NEXTAUTH_SECRET` | Yes | 32+ character random secret |
| `GOOGLE_CLIENT_ID` | For Google login | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For Google login | Google OAuth secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | For image upload | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For image upload | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For image upload | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | For card payments | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For card payments | Stripe publishable key |
| `EMAIL_SERVER_HOST` | For emails | SMTP host (e.g. smtp.gmail.com) |
| `EMAIL_SERVER_USER` | For emails | SMTP username |
| `EMAIL_SERVER_PASSWORD` | For emails | SMTP password / app password |
| `EMAIL_FROM` | For emails | From address |
| `ADMIN_EMAIL` | For alerts | Admin notification email |
| `WHATSAPP_ACCESS_TOKEN` | For WhatsApp | WhatsApp Business API token |

---

## License

MIT — built for VELOURÉ by Dawood Rana.
