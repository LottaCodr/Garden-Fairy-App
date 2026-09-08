// Central mock shop dataset for local development & fallback when API is offline
// Combines products, categories and generated mock images.
// Shop pages can import from here for offline previews and Storybook.

import { products, mockApiProducts } from "./products";
import { categories } from "./categories";

export { products, mockApiProducts, categories };

// Pagination helper that mimics the API's Paged<T> response
export function pagedMock<T>(list: T[], page = 1, limit = 12, sort?: string, query?: string, category?: string) {
    let filtered = [...list] as unknown as typeof products;

    if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q)),
        );
    }

    if (category && category !== "all") {
        filtered = filtered.filter((p) => p.categoryId === category);
    }

    if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "rating" || sort === "popular")
        filtered.sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0));
    else if (sort === "name_asc") filtered.sort((a, b) => a.name.localeCompare(b.name));

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total, page, pages };
}

// Hero images — use generated hero if available, fallback to products
export const heroImages = [
    "/images/hero.jpg",
    "/images/products/monstera-deliciosa.jpg",
    "/images/products/fiddle-leaf-fig.jpg",
];

// Shop banner assets (all under public/images — generated mocks)
export const mockImageManifest = {
    products: products.map((p) => ({ id: p.id, name: p.name, image: p.image })),
    categories: categories.map((c) => ({ id: c.id, name: c.name, image: c.image })),
    hero: heroImages[0],
};

// Stock helpers
export const lowStockProducts = products.filter((p) => p.stock < 10);
export const premiumProducts = products.filter((p) => p.isPremium);
export const gardenProducts = products.filter((p) => p.categoryId === "garden");
