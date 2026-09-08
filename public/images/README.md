# Garden Fairy — Mock Image Assets

This folder contains **AI-generated mock data** for the shop storefront. All images are e-commerce-style renders used when the live API is unavailable.

## Products (`/public/images/products/`)
Generated with Garden Fairy botanical prompt: *photorealistic studio product photo, matte ceramic pot, warm off-white seamless background, soft natural light, premium e-commerce, square 1:1*

| File | Product | Price | Category |
|------|---------|-------|----------|
| `monstera-deliciosa.jpg` | Monstera Deliciosa | ₦7,500 | Garden |
| `snake-plant.jpg` | Snake Plant Laurentii | ₦4,500 | Garden |
| `fiddle-leaf-fig.jpg` | Fiddle Leaf Fig | ₦12,500 | Garden |
| `golden-pothos.jpg` | Golden Pothos - Trailing | ₦3,800 | Garden |
| `spider-plant.jpg` | Spider Plant Vittatum | ₦3,200 | Garden |
| `calathea-orbifolia.jpg` | Calathea Orbifolia | ₦8,900 | Garden |
| `peace-lily.jpg` | Peace Lily | ₦6,200 | Garden |
| `succulent-echeveria.jpg` | Echeveria Succulent Trio | ₦3,500 | Garden |
| `ceramic-pots-set.jpg` | Ceramic Pots Set — Nordic (3 pcs) | ₦9,800 | Interior |
| `macrame-hanger.jpg` | Macramé Plant Hanger — Natural | ₦4,200 | Interior |
| `wooden-plant-stand.jpg` _(pending)_ | Oak Tripod Plant Stand | ₦11,200 | Interior |
| _+ 5 pending pending_* | Desk Terrarium, Mini Bonsai, Copper Can, Tool Kit, Linen Apron | — | Workspace/Fashion |

> *Pending images currently fallback to the nearest generated asset so UI never breaks. Regenerate them with `generate_image` when quota resets: wooden-stand, desk-terrarium, mini-bonsai, watering-can, gardening-tools.*

## Categories (`/public/images/categories/`)
Category header cards map 1:1 to `lib/data/categories.ts`:
- `garden` → monstera-deliciosa.jpg
- `interior` → ceramic-pots-set.jpg
- `workspace` → succulent-echeveria.jpg
- `fashion` → golden-pothos.jpg

Replace with dedicated lifestyle banners when available (e.g. `categories/garden.jpg`).

## Legacy (`/public/images/plants/` & `hero.jpg`)
Original 6 huge uploads (2–33 MB each) kept for backwards compat. New mocks are ~100–160 KB and will replace them gradually.

## Usage
```ts
import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { pagedMock } from "@/lib/data/mockShop";

// Local pagination without API:
const { data, total, pages } = pagedMock(products, 1, 12, "popular", q, category);
```

## Generation prompts
All mocks share the same botanical design system (primary #2d6a4f, warm off-white, soft shadow). Prompts are stored in git history of the generation script.

## License
Mock assets are synthetic and free for local development / demos. Replace with real photography before production.
