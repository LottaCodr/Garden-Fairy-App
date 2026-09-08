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

## Testing without the backend

The storefront talks to an Express API (`NEXT_PUBLIC_API_URL`, default `http://localhost:5000`).
When that API isn't running, the shop renders the local mock catalog (`lib/data/products.ts`)
**and the cart falls back to a matching local mock cart** (`lib/mock/cart.ts`), so
**Add to cart, quantity steppers, remove, clear, the header badge and the cart page all work
with mock data** — no server needed.

| `NEXT_PUBLIC_USE_MOCK_CART` | Behaviour                                                                    |
| --------------------------- | ---------------------------------------------------------------------------- |
| _unset_ (default)           | Call the API; if it's unreachable, latch into mock mode for the rest of the session |
| `1` / `true`                | Always use the mock cart (network is never touched)                          |
| `0` / `false`               | Always use the live API, never fall back                                     |

Mock cart details:

- Product name / price / image / stock are resolved from the mock catalog by `_id`, id **or** slug.
- Same product + same size share a line; different sizes get separate lines.
- Stock is enforced (`Only 9 × … left in stock`), and quantity 0 removes the line.
- State is persisted in `localStorage` under `garden-fairy:mock-cart`, so it survives reloads.
  Clear it from devtools, or call `mockResetCart()` from `lib/mock/cart`.
- The header cart dropdown shows a small "Demo cart — running on mock data" note when active.
- Real API errors (4xx/5xx with a body, e.g. a stock conflict) are **not** swallowed by the
  fallback — they still surface as toasts.

To re-run the cart behaviour checks (no browser, no backend required):

```bash
npm run verify:mock-cart   # 13 assertions over store/cart.store.ts + lib/mock/cart.ts
```

## Demo accounts

The sign-in screen includes a **"Try as Admin" / "Try as User"** button for one-click login. Credentials:

| Role  | Email                       | Password   |
| ----- | --------------------------- | ---------- |
| Admin | `admin@gardenfairy.com`     | `admin123` |
| User  | `user@gardenfairy.com`      | `user123`  |

## Features

### Public storefront
- **Home** — Hero with working search + CTAs, bestsellers, features, testimonials
- **Global search** — press `⌘K` / `Ctrl+K` (or the header search icon) for a live product search dialog; the hero search jumps straight into `/shop?q=…`
- **Shop** (`/shop`) — product catalog with search, category filter, sort, result counts, quick view
- **Product detail** (`/product/[id]`) — image gallery, size selector, quantity stepper, delivery estimator, add-to-cart, recommendations (works for admin-created products too)
- **Cart** (`/cart`) — quantity controls, line totals, order summary, free-shipping progress bar
- **Checkout** (`/checkout`) — 3-step shipping → payment → confirmation (with card formatting, validation, and live stock decrement)
- **Wishlist** (`/wishlist`) — persisted heart toggles on every product card, add-all-to-cart
- **About** / **Contact** — brand story, values, stats, contact form
- **Profile** (`/profile`) — order history, stats, account info
- **Toasts** — every action (add to cart, wishlist, orders, newsletter, admin CRUD) gives instant feedback

### Admin module (`/admin`)
Protected by auth + role check. Sidebar nav, breadcrumb, notification bell, search.

- **Dashboard** — KPIs, recent orders, sales by category, top products, revenue trend
- **Products** — full CRUD: create / edit / delete with slide-over form, search (also via the top-bar search), category filter, low-stock highlighting, image fallbacks
- **Orders** — status pills, search, status update, slide-over detail drawer, delete with confirm
- **Customers** — derived from orders, spend breakdown, VIP tagging
- **Analytics** — 6-month bar chart, status distribution, best sellers
- **Settings** — store info, payments/delivery, notification preferences
- **Notifications bell** — live dropdown of pending orders and low-stock alerts

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
  wishlist.store.ts  wishlist + persistence
  toast.store.ts     toast notifications
  ui.store.ts        global search dialog state
  useProductUI.ts  quick-view dialog state
```

## Design system

Botanical theme defined in `app/globals.css`:

- **Primary** — mature leaf green (`#5fa36a`)
- **Accent** — sunlight yellow (`#f5e37a`)
- **Card / background** — warm off-whites
- Full dark mode with matching palette
- All UI is fully responsive (mobile sheet menu, admin collapses to drawer)
