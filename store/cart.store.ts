import { create } from "zustand";
import { api } from "@/lib/api";
import type { Cart, CartItem } from "@/types/api";
import { toast } from "@/store/toast.store";
import { errorMessage, isMockMode, isUnreachableError, markApiUnavailable } from "@/lib/mock/mode";
import {
  mockAddItem,
  mockClearCart,
  mockGetCart,
  mockRemoveItem,
  mockSetItemQty,
} from "@/lib/mock/cart";

export type { CartItem, Cart };

interface AddItemOptions {
  id?: string;
  product?: string;
  productId?: string;
  qty?: number;
  quantity?: number;
  size?: string;
  name?: string;
  price?: number;
  image?: string;
}

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  /** True once the store is serving the local mock cart (see `lib/mock/mode.ts`). */
  isMock: boolean;

  fetch: () => Promise<Cart | null>;
  addItem: (
    itemOrId: string | AddItemOptions,
    qty?: number,
    size?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  setQty: (
    id: string,
    qty: number,
    size?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  decrementItem: (id: string) => Promise<{ ok: boolean; error?: string }>;
  removeItem: (id: string) => Promise<{ ok: boolean; error?: string }>;
  clearCart: () => Promise<void>;

  count: () => number;
  subTotal: () => number;
}

const emptyCart = (): Cart => ({ id: "", items: [], subtotal: 0 });

/**
 * Run the live request; if the backend is unreachable (not running, preview box,
 * offline) latch into mock mode and serve the same operation from the local
 * mock catalog instead of failing the UI. Real API errors (4xx/5xx with a body)
 * still bubble up so the caller can toast them.
 */
async function withMockFallback(remote: () => Promise<Cart>, local: () => Cart): Promise<Cart> {
  if (isMockMode()) return local();
  try {
    return await remote();
  } catch (err: unknown) {
    if (isUnreachableError(err)) {
      markApiUnavailable(errorMessage(err, "no response"));
      return local();
    }
    throw err;
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  items: [],
  isLoading: false,
  error: null,
  isMock: false,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await withMockFallback(
        async () => {
          const res = await api<{ data: Cart }>("/cart");
          return res?.data ?? emptyCart();
        },
        () => mockGetCart(),
      );
      set({ cart, items: cart.items || [], isLoading: false, isMock: isMockMode() });
      return cart;
    } catch (err: unknown) {
      const message = errorMessage(err, "Failed to load cart");
      set({ error: message, isLoading: false });
      return null;
    }
  },

  addItem: async (itemOrId, qty = 1, size) => {
    let productId = "";
    let itemQty = qty;
    let itemSize = size;
    let fallback: { name?: string; price?: number; image?: string } | undefined;

    if (typeof itemOrId === "string") {
      productId = itemOrId;
    } else if (itemOrId && typeof itemOrId === "object") {
      productId = itemOrId.product || itemOrId.productId || itemOrId.id || "";
      itemQty = itemOrId.qty ?? itemOrId.quantity ?? qty ?? 1;
      itemSize = itemOrId.size ?? size;
      fallback = { name: itemOrId.name, price: itemOrId.price, image: itemOrId.image };
    }

    if (!productId) {
      return { ok: false, error: "Invalid product id" };
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await withMockFallback(
        async () => {
          const res = await api<{ data: Cart }>("/cart/items", {
            method: "POST",
            json: {
              product: productId,
              qty: itemQty,
              ...(itemSize ? { size: itemSize } : {}),
            },
          });
          return res?.data ?? emptyCart();
        },
        () =>
          mockAddItem({
            product: productId,
            qty: itemQty,
            size: itemSize,
            fallback: fallback?.name ? fallback : undefined,
          }),
      );
      set({ cart, items: cart.items || [], isLoading: false, isMock: isMockMode() });
      return { ok: true };
    } catch (err: unknown) {
      const message = errorMessage(err, "Failed to add item to cart");
      toast.error(message);
      // refetch cart to keep server truth
      await get().fetch();
      set({ error: message, isLoading: false });
      return { ok: false, error: message };
    }
  },

  setQty: async (id, qty, size) => {
    if (qty <= 0) {
      return get().removeItem(id);
    }
    set({ isLoading: true, error: null });
    try {
      const cart = await withMockFallback(
        async () => {
          const res = await api<{ data: Cart }>(`/cart/items/${id}`, {
            method: "PUT",
            json: {
              qty,
              ...(size ? { size } : {}),
            },
          });
          return res?.data ?? emptyCart();
        },
        () => mockSetItemQty(id, qty, size),
      );
      set({ cart, items: cart.items || [], isLoading: false, isMock: isMockMode() });
      return { ok: true };
    } catch (err: unknown) {
      const message = errorMessage(err, "Failed to update quantity");
      toast.error(message);
      await get().fetch();
      set({ error: message, isLoading: false });
      return { ok: false, error: message };
    }
  },

  decrementItem: async (id) => {
    const current = get().items.find((i) => i.id === id || i.product === id);
    if (!current) return { ok: false, error: "Item not found in cart" };
    if (current.qty <= 1) {
      return get().removeItem(id);
    }
    return get().setQty(id, current.qty - 1, current.size);
  },

  removeItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await withMockFallback(
        async () => {
          const res = await api<{ data: Cart }>(`/cart/items/${id}`, {
            method: "DELETE",
          });
          return res?.data ?? emptyCart();
        },
        () => mockRemoveItem(id),
      );
      set({ cart, items: cart.items || [], isLoading: false, isMock: isMockMode() });
      return { ok: true };
    } catch (err: unknown) {
      const message = errorMessage(err, "Failed to remove item");
      toast.error(message);
      await get().fetch();
      set({ error: message, isLoading: false });
      return { ok: false, error: message };
    }
  },

  clearCart: async () => {
    try {
      const cart = await withMockFallback(
        async () => {
          const res = await api<{ data: Cart }>("/cart", {
            method: "DELETE",
          });
          return res?.data ?? emptyCart();
        },
        () => mockClearCart(),
      );
      set({ cart, items: cart.items || [], isLoading: false, error: null, isMock: isMockMode() });
    } catch {
      set({
        cart: { id: "", items: [], subtotal: 0 },
        items: [],
        isLoading: false,
      });
    }
  },

  count: () => {
    const cart = get().cart;
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.qty, 0);
  },

  subTotal: () => {
    const cart = get().cart;
    return cart?.subtotal ?? 0;
  },
}));
