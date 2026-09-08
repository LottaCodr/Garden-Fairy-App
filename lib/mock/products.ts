import { mockApiProducts } from "@/lib/data/products";
import type { Product } from "@/types/api";

type MockCatalogProduct = (typeof mockApiProducts)[number];

const FALLBACK_IMAGE = "/images/plants/1.jpg";

/** Raw catalog entry (id / slug / _id all accepted) — used by the mock cart. */
export function findMockCatalogProduct(idOrSlug?: string | null): MockCatalogProduct | null {
  if (!idOrSlug) return null;
  const needle = decodeURIComponent(idOrSlug).toLowerCase();
  return (
    mockApiProducts.find(
      (p) =>
        p._id === idOrSlug ||
        p.id === idOrSlug ||
        p.slug === idOrSlug ||
        p.slug.toLowerCase() === needle,
    ) ?? null
  );
}

/** Same lookup, normalised to the API `Product` shape for pages/components. */
export function findMockProduct(idOrSlug?: string | null): Product | null {
  const hit = findMockCatalogProduct(idOrSlug);
  if (!hit) return null;
  return {
    _id: hit._id,
    name: hit.name,
    slug: hit.slug,
    description: hit.description,
    price: hit.price,
    compareAtPrice: hit.compareAtPrice,
    category: hit.category,
    imageUrl: hit.imageUrl,
    images: hit.images,
    care: hit.care,
    stock: hit.stock,
    sold: hit.sold,
    rating: hit.rating,
    ratingCount: hit.ratingCount,
    isPremium: hit.isPremium,
    tags: hit.tags,
    status: hit.status,
    createdAt: hit.createdAt,
  };
}

/** Image to show on cart lines for a catalog product. */
export function mockProductImage(product: MockCatalogProduct | null): string {
  return product?.images?.[0] ?? product?.imageUrl?.[0]?.url ?? FALLBACK_IMAGE;
}

/** A slice of the catalog, handy for offline "you might also like" blocks. */
export function mockProducts(limit = 8, excludeId?: string): Product[] {
  return mockApiProducts
    .filter((p) => p._id !== excludeId)
    .slice(0, limit)
    .map((p) => findMockProduct(p._id)!)
    .filter(Boolean);
}
