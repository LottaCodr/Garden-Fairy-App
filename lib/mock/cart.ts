/**
 * Mock cart service — the local stand-in for the Express cart API.
 *
 * It mirrors the real endpoints one-for-one so `store/cart.store.ts` can swap
 * between them without changing shape:
 *
 *   GET    /api/cart            -> mockGetCart()
 *   POST   /api/cart/items      -> mockAddItem()
 *   PUT    /api/cart/items/:id  -> mockSetItemQty()
 *   DELETE /api/cart/items/:id  -> mockRemoveItem()
 *   DELETE /api/cart            -> mockClearCart()
 *
 * Product name / price / image / stock are resolved from the local mock catalog
 * (`lib/data/products.ts`), the same catalog the shop renders when the API is
 * offline — so anything you can click "Add to cart" on resolves here too.
 *
 * State is kept in `localStorage` (in-memory on the server) so the cart survives
 * reloads during testing. Clear it with `mockResetCart()`.
 */

import type { Cart, CartItem } from "@/types/api";
import { findMockCatalogProduct, mockProductImage } from "@/lib/mock/products";

export const MOCK_CART_ID = "mock-cart";
export const MOCK_CART_STORAGE_KEY = "garden-fairy:mock-cart";

/** Extra product info supplied by the caller for items outside the mock catalog. */
export interface MockProductFallback {
  name?: string;
  price?: number;
  image?: string;
  stock?: number;
}

export interface MockAddItemInput {
  product: string;
  qty?: number;
  size?: string;
  fallback?: MockProductFallback;
}

export class MockCartError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "MockCartError";
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// storage
// ---------------------------------------------------------------------------

let memoryCart: Cart = { id: MOCK_CART_ID, items: [], subtotal: 0 };

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sum(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.qty, 0);
}

function isLine(value: unknown): value is CartItem {
  const line = value as Partial<CartItem> | null;
  return (
    !!line &&
    typeof line === "object" &&
    typeof line.product === "string" &&
    typeof line.price === "number" &&
    typeof line.qty === "number"
  );
}

function normalise(cart: { id?: string; items: CartItem[] }): Cart {
  const items = cart.items.map((item) => ({
    ...item,
    lineTotal: item.price * item.qty,
  }));
  return { id: cart.id || MOCK_CART_ID, items, subtotal: sum(items) };
}

export function mockGetCart(): Cart {
  if (!hasLocalStorage()) return memoryCart;
  try {
    const raw = window.localStorage.getItem(MOCK_CART_STORAGE_KEY);
    if (!raw) return memoryCart;
    const parsed = JSON.parse(raw) as { items?: unknown };
    const items = Array.isArray(parsed?.items) ? parsed.items.filter(isLine) : [];
    return normalise({ id: MOCK_CART_ID, items });
  } catch {
    return memoryCart;
  }
}

function writeCart(cart: Cart): Cart {
  const next = normalise(cart);
  memoryCart = next;
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(MOCK_CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode / quota — the in-memory copy still works for this session.
    }
  }
  return next;
}

/** Test helper — empties the mock cart. */
export function mockResetCart(): Cart {
  return writeCart({ id: MOCK_CART_ID, items: [], subtotal: 0 });
}

// ---------------------------------------------------------------------------
// lines
// ---------------------------------------------------------------------------

/** Same product + same size share a line, exactly like the server. */
function lineId(productId: string, size?: string): string {
  return size ? `${productId}:${size}` : productId;
}

/** Exact match on the line id — used when adding, so sizes never merge together. */
function findExactLine(items: CartItem[], id: string): number {
  return items.findIndex((item) => item.id === id || lineId(item.product, item.size) === id);
}

/**
 * Loose match — the cart UI addresses lines by `item.id || item.product`, so an
 * update/remove may arrive with just the product id.
 */
function findLineIndex(items: CartItem[], id: string): number {
  const exact = findExactLine(items, id);
  if (exact >= 0) return exact;
  // Callers may pass a bare product id or slug instead of the line id
  const canonical = findMockCatalogProduct(id)?._id;
  return items.findIndex((item) => item.product === id || (canonical && item.product === canonical));
}

function buildLine(
  productId: string,
  qty: number,
  size?: string,
  fallback?: MockProductFallback,
): { line: CartItem; stock: number } {
  const product = findMockCatalogProduct(productId);

  if (!product) {
    // Admin-created / unknown product: use whatever the caller knows about it.
    if (!fallback?.name) {
      throw new MockCartError(404, "Product not found");
    }
    const price = fallback.price ?? 0;
    const stock = fallback.stock ?? 99;
    return {
      stock,
      line: {
        id: lineId(productId, size),
        product: productId,
        name: fallback.name,
        price,
        stock,
        image: fallback.image ?? "/images/plants/1.jpg",
        qty,
        ...(size ? { size } : {}),
        lineTotal: price * qty,
      },
    };
  }

  return {
    stock: product.stock,
    line: {
      id: lineId(product._id, size),
      product: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: mockProductImage(product),
      qty,
      ...(size ? { size } : {}),
      lineTotal: product.price * qty,
    },
  };
}

function assertStock(stock: number, requested: number, name: string): void {
  if (stock <= 0) {
    throw new MockCartError(409, `${name} is out of stock`);
  }
  if (requested > stock) {
    throw new MockCartError(409, `Only ${stock} × ${name} left in stock`);
  }
}

// ---------------------------------------------------------------------------
// operations
// ---------------------------------------------------------------------------

export function mockAddItem(input: MockAddItemInput): Cart {
  const qty = input.qty ?? 1;
  if (!input.product) throw new MockCartError(400, "Invalid product id");
  if (!Number.isFinite(qty) || qty < 1) {
    throw new MockCartError(400, "Quantity must be at least 1");
  }

  // Accept id, _id or slug, then work with the canonical catalog id
  const catalog = findMockCatalogProduct(input.product);
  const productId = catalog?._id ?? input.product;

  const cart = mockGetCart();
  const index = findExactLine(cart.items, lineId(productId, input.size));
  const existing = index >= 0 ? cart.items[index] : undefined;
  const nextQty = (existing?.qty ?? 0) + qty;

  const { line, stock } = buildLine(productId, nextQty, input.size, input.fallback);
  assertStock(stock, nextQty, line.name);

  const items = [...cart.items];
  if (existing) items[index] = line;
  else items.push(line);

  return writeCart({ ...cart, items });
}

export function mockSetItemQty(id: string, qty: number, size?: string): Cart {
  if (!id) throw new MockCartError(400, "Invalid cart item id");

  const cart = mockGetCart();
  const index = findLineIndex(cart.items, id);
  const current = cart.items[index];
  if (!current) throw new MockCartError(404, "Item not found in cart");

  if (!Number.isFinite(qty) || qty < 1) {
    // Mirrors the server: quantity 0 removes the line.
    const items = cart.items.filter((_, i) => i !== index);
    return writeCart({ ...cart, items });
  }

  const nextSize = size ?? current.size;
  const { line, stock } = buildLine(current.product, qty, nextSize, {
    name: current.name,
    price: current.price,
    image: current.image,
    stock: current.stock,
  });
  assertStock(stock, qty, line.name);

  let items = [...cart.items];
  items[index] = line;

  // Changing the size can collide with an existing line — merge instead of duplicating.
  const collision = items.findIndex(
    (item, i) => i !== index && item.product === line.product && item.size === line.size,
  );
  if (collision >= 0) {
    const mergedQty = items[collision].qty + line.qty;
    assertStock(stock, mergedQty, line.name);
    items[collision] = { ...line, qty: mergedQty, lineTotal: line.price * mergedQty };
    items = items.filter((_, i) => i !== index);
  }

  return writeCart({ ...cart, items });
}

export function mockRemoveItem(id: string): Cart {
  const cart = mockGetCart();
  const index = findLineIndex(cart.items, id);
  if (index < 0) throw new MockCartError(404, "Item not found in cart");
  const items = cart.items.filter((_, i) => i !== index);
  return writeCart({ ...cart, items });
}

export function mockClearCart(): Cart {
  return writeCart({ id: MOCK_CART_ID, items: [], subtotal: 0 });
}
