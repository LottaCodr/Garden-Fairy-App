import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import type { Cart, CartItem } from "@/types/api";
import { toast } from "@/store/toast.store";

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

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  items: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api<{ data: Cart }>("/cart");
      const cart = res?.data ?? { id: "", items: [], subtotal: 0 };
      set({ cart, items: cart.items || [], isLoading: false });
      return cart;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load cart";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  addItem: async (itemOrId, qty = 1, size) => {
    let productId = "";
    let itemQty = qty;
    let itemSize = size;

    if (typeof itemOrId === "string") {
      productId = itemOrId;
    } else if (itemOrId && typeof itemOrId === "object") {
      productId = itemOrId.product || itemOrId.productId || itemOrId.id || "";
      itemQty = itemOrId.qty ?? itemOrId.quantity ?? qty ?? 1;
      itemSize = itemOrId.size ?? size;
    }

    if (!productId) {
      return { ok: false, error: "Invalid product id" };
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api<{ data: Cart }>("/cart/items", {
        method: "POST",
        json: {
          product: productId,
          qty: itemQty,
          ...(itemSize ? { size: itemSize } : {}),
        },
      });
      const cart = res?.data ?? { id: "", items: [], subtotal: 0 };
      set({ cart, items: cart.items || [], isLoading: false });
      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to add item to cart";
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
      const res = await api<{ data: Cart }>(`/cart/items/${id}`, {
        method: "PUT",
        json: {
          qty,
          ...(size ? { size } : {}),
        },
      });
      const cart = res?.data ?? { id: "", items: [], subtotal: 0 };
      set({ cart, items: cart.items || [], isLoading: false });
      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to update quantity";
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
      const res = await api<{ data: Cart }>(`/cart/items/${id}`, {
        method: "DELETE",
      });
      const cart = res?.data ?? { id: "", items: [], subtotal: 0 };
      set({ cart, items: cart.items || [], isLoading: false });
      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to remove item";
      toast.error(message);
      await get().fetch();
      set({ error: message, isLoading: false });
      return { ok: false, error: message };
    }
  },

  clearCart: async () => {
    try {
      const res = await api<{ data: Cart }>("/cart", {
        method: "DELETE",
      });
      const cart = res?.data ?? { id: "", items: [], subtotal: 0 };
      set({ cart, items: cart.items || [], isLoading: false, error: null });
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
