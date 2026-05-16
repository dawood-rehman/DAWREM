# DAWREM

Premium women's suits and occasionwear commerce platform powered by Mirha Textile.

DAWREM is a production-focused ecommerce application built with the Next.js App Router. It combines a refined customer storefront, role-protected operations dashboard, catalog management, order workflows, automation controls, and branded communication tools for a modern fashion retail experience.

---

## Overview

DAWREM supports the full journey from product discovery to order management:

- Customer storefront for premium suits, occasionwear, and curated collections
- Product browsing with category, size, fabric, occasion, and price filtering
- Product detail pages with gallery, variants, sizing, reviews, and wishlist actions
- Cart and checkout flows with coupon support and order summaries
- Customer accounts with order history, saved profile details, and tracking
- Feedback, complaints, support requests, and career application workflows
- Admin dashboard for products, orders, customers, reviews, media, content, and settings
- Automation engine for customer lifecycle, order updates, stock alerts, and follow-ups
- Responsive design with dark mode, branded assets, SEO metadata, and PWA support

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 with App Router |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, Lucide React |
| Data | MongoDB, Mongoose |
| Authentication | NextAuth.js |
| State | Zustand |
| Validation | Zod |
| Email | Nodemailer |
| Images | Next Image, Cloudinary integration |
| Charts | Recharts |
| Deployment | Vercel-ready configuration |

---

## Core Modules

### Storefront

- Homepage sections for hero content, featured collections, new arrivals, bestsellers, testimonials, categories, and brand values
- Shop page with filterable product discovery
- Product detail experience with image gallery, size and color selection, reviews, and related products
- Wishlist, cart, coupon validation, checkout, and order tracking
- Informational pages including About, Our Story, FAQs, Size Guide, Privacy Policy, Terms, Careers, and Feedback

### Admin

- Analytics dashboard with revenue, order, and customer insights
- Product management with variants, inventory, media, SEO fields, and publishing controls
- Order management with fulfillment status, payment status, courier, tracking, and customer notes
- Customer, review, feedback, discount, banner, media, section, and settings management
- Automation panel for enabling, testing, and monitoring lifecycle automations

### Platform Services

- MongoDB-backed models for users, products, orders, reviews, coupons, banners, sections, and automations
- Centralized auth, security, upload, commerce, email, and storefront settings utilities
- Branded email templates and WhatsApp order handoff helpers
- Runtime-ready configuration for database, authentication, email, image uploads, and payment providers

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB database
- Required service access configured in your local or hosting runtime

### Installation

```bash
npm install
```

### Seed Sample Data

```bash
npm run seed
```

The seed command prepares demo catalog and operational records for local development. Access details should be managed through your own secure user provisioning process.

### Run Locally

```bash
npm run dev
```

Storefront:

```text
http://localhost:3000
```

Admin dashboard:

```text
http://localhost:3000/admin/dashboard
```

---

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint checks |
| `npm run seed` | Seed development data |

---

## Project Structure

```text
.
|-- app/
|   |-- (store)/             Customer-facing routes
|   |-- admin/               Admin dashboard routes
|   |-- api/                 API routes
|   |-- layout.tsx           Root layout and metadata
|   `-- globals.css          Global styles and design tokens
|-- components/
|   |-- admin/               Admin interface components
|   |-- store/               Storefront components
|   `-- ui/                  Shared UI components
|-- lib/                     Auth, database, commerce, email, upload, and brand utilities
|-- models/                  Mongoose schemas
|-- public/                  Static assets, icons, brand media, and manifest
|-- scripts/                 Data seeding scripts
|-- store/                   Zustand stores
|-- types/                   Shared TypeScript types
|-- package.json             Scripts and dependencies
`-- vercel.json              Deployment configuration
```

---

## Quality And Security Notes

- Keep secrets and service keys outside source control.
- Do not publish demo access details in documentation, commits, screenshots, or issues.
- Use strong authentication and proper role assignment for operational users.
- Review seeded data before using it outside local development.
- Run lint and build checks before deployment.

---

## Deployment

The project is ready for Vercel or any Node-compatible hosting platform.

1. Push the repository to your Git provider.
2. Import the project in Vercel.
3. Configure required runtime secrets in the hosting dashboard.
4. Connect MongoDB and any optional providers used by your deployment.
5. Run a production build and deploy.

---

## License

Private project for DAWREM by Mirha Textile.
