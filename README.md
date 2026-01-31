# 🚛 Driver Leads — The Premium Driver Marketplace

**Driver Leads** is a high-performance, production-ready SaaS marketplace designed to connect verified CDL drivers with carriers. The platform features a **privacy-first "Contact Vault" architecture**, where sensitive driver data is secured and only accessible via Stripe-gated monetization.

---

## 🚀 Technical Stack

* **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
* **Language:** TypeScript
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + GoTrue)
* **Payments:** [Stripe API](https://stripe.com/) (Checkout Sessions + Webhooks)
* **Styling:** Tailwind CSS v4 (Alpha/v4 configuration with CSS Variables)
* **Animations:** Framer Motion
* **Fonts:** Geist Sans & Geist Mono

---

## 🛠️ Key Architectural Features

### 1. Multi-Layered Security & Privacy
The application utilizes a **Dual-Table Architecture** to protect user data:
* **`drivers` (Public):** Non-sensitive data (Experience, Endorsements, Work City) visible to all.
* **`driver_private` (Vaulted):** Sensitive data (Phone, Email, CDL Number). Access is gated behind a verified purchase recorded in an `unlocks` table.
* **Secure Downloads:** Private CDL documents are retrieved via server-side logic that generates **short-lived (60s) signed URLs**, preventing unauthorized hotlinking.

### 2. Advanced Marketplace Logic
* **Hybrid Rendering:** Leverages Server Components for SEO and Client Components for real-time interaction.
* **Dynamic Filtering Engine:** A high-performance filtering system allowing recruiters to search by city, state, endorsements, age, and experience simultaneously.
* **Optimistic UI:** Driver status toggles update instantly in the UI while syncing with the database in the background for a lag-free experience.

### 3. Resilient Payment Workflow
* **Metadata-Driven Fulfillment:** Stripe Checkout sessions carry `driverId` and `userId` in metadata, allowing the **Stripe Webhook** to asynchronously grant access even if the user's browser is closed.
* **Webhook Idempotency:** The backend uses `upsert` patterns to handle duplicate Stripe events gracefully.

### 4. Premium UX/UI
* **Tailwind v4 Integration:** Seamless Light/Dark mode switching using CSS variable tokens.
* **Navigation Progress:** A custom global progress bar built with Framer Motion for route transitions.
* **Adaptive Skeletons:** Custom shimmer states for marketplace cards and profile sections to prevent layout shift.

---

## 📦 Project Structure

```text
src/
├── app/                  # Next.js 15 App Router (API, Admin, Marketplace)
├── components/           # UI Components (Admin, Drivers, Theme, Navigation)
├── lib/                  # Library configs (Stripe)
├── utils/                # Supabase SSR (Server, Client, Middleware)
└── globals.css           # Tailwind v4 configuration & Theme tokens

🚦 Getting Started
1. Environment Variables
Create a .env.local file in the root directory:
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID=your_stripe_price_id

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

2. Install & Run

# Install dependencies
npm install

# Run development server
npm run dev

# Listen for Stripe Webhooks (Local Dev)
stripe listen --forward-to localhost:3000/api/stripe-webhook

Open http://localhost:3000 to view the marketplace.

📝 License

Copyright © 2026 Driver Leads. All rights reserved.


