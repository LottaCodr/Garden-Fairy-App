# The Garden Fairy 🌿

A modern Next.js 16 storefront and admin panel for **The Garden Fairy** — a curated marketplace for indoor plants, home/office optimization planners, and gardening tools.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** with shadcn/ui design tokens
- **Framer Motion** for animations
- **Zustand** (with `persist`) for cart, auth, and admin data
- **Radix UI** primitives (Dialog, Sheet, Tabs, Dropdown, Separator)
- **lucide-react** icons

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint (clean)
```

## Demo accounts

The sign-in screen includes a **"Try as Admin" / "Try as User"** button for one-click login. Credentials:

| Role  | Email                       | Password   |
| ----- | --------------------------- | ---------- |
| Admin | `admin@gardenfairy.com`     | `admin123` |
| User  | `user@gardenfairy.com`      | `user123`  |

## Features

### Public storefront
- **Home** — Hero, bestsellers, features, testimonials
- **Shop** (`/shop`) — product catalog with search, category filter, sort
- **Product detail** (`/product/[id]`) — image gallery, size selector, quantity, add-to-cart, recommendations
- **Cart** (`/cart`) — quantity controls, line totals, order summary, free-shipping nudges
- **Checkout** (`/checkout`) — 3-step shipping → payment → confirmation (with card formatting and validation)
- **About** / **Contact** — brand story, values, stats, contact form
- **Profile** (`/profile`) — order history, stats, account info

### Admin module (`/admin`)
Protected by auth + role check. Sidebar nav, breadcrumb, notification bell, search.

- **Dashboard** — KPIs, recent orders, sales by category, top products, revenue trend
- **Products** — full CRUD: create / edit / delete with slide-over form, search, category filter, low-stock highlighting
- **Orders** — status pills, search, status update, slide-over detail drawer
- **Customers** — derived from orders, spend breakdown, VIP tagging
- **Analytics** — 6-month bar chart, status distribution, best sellers
- **Settings** — store info, payments/delivery, notification preferences

### Auth
- Persisted Zustand store with two demo users plus signup
- Role-gated routes (admin nav link, admin layout, redirect on unauthenticated visit)
- `useHydrated` hook (via `useSyncExternalStore`) prevents SSR/CSR mismatch with the persisted store

## Project structure

```
app/
  (auth)/        signin, signup + shared layout
  (routes)/      public storefront (shop, cart, checkout, profile, …)
  admin/         admin module (layout + 6 pages)
  layout.tsx     root layout (Header + Footer)
  page.tsx       home page
components/
  custom/        bespoke UI: AuthCard, ProductCard, CartDropdown, …
  layout/        Header, Footer
  sections/      home sections + product detail parts
  ui/            shadcn primitives (badge, button, card, dialog, …)
lib/
  data/          seed data (products, categories, features, testimonials)
  hooks/         useScrollHeader, useHydrated
store/
  auth.store.ts    auth + persistence
  cart.store.ts    cart + persistence
  admin.store.ts   products, orders, customers + persistence
  useProductUI.ts  quick-view dialog state
```

## Design system

Botanical theme defined in `app/globals.css`:

- **Primary** — mature leaf green (`#5fa36a`)
- **Accent** — sunlight yellow (`#f5e37a`)
- **Card / background** — warm off-whites
- Full dark mode with matching palette
- All UI is fully responsive (mobile sheet menu, admin collapses to drawer)
