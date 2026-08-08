import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import type { WishlistEntry } from "@/types/api";
import { toast } from "@/store/toast.store";

export type { WishlistEntry };

interface WishlistState {
  items: WishlistEntry[];
  ids: string[];
  isLoading: boolean;
  error: string | null;

  fetch: () => Promise<WishlistEntry[]>;
  add: (productId: string) => Promise<{ ok: boolean; error?: string }>;
  remove: (productId: string) => Promise<{ ok: boolean; error?: string }>;
  toggle: (productId: string) => Promise<{ ok: boolean; action?: "added" | "removed" }>;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  ids: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api<{ data: WishlistEntry[] }>("/wishlist");
      const items = res?.data ?? [];
      const ids = items
        .map((entry) => entry.product?._id || "")
        .filter(Boolean);
      set({ items, ids, isLoading: false });
      return items;
    } catch {
      // 401 or guest mode
      set({ items: [], ids: [], isLoading: false });
      return [];
    }
  },

  add: async (productId: string) => {
    if (!productId) return { ok: false, error: "Invalid product id" };
    // Optimistic update
    const prevIds = get().ids;
    if (!prevIds.includes(productId)) {
      set({ ids: [...prevIds, productId] });
    }
    try {
      await api(`/wishlist/${productId}`, { method: "POST" });
      await get().fetch();
      return { ok: true };
    } catch (err: unknown) {
      // rollback
      set({ ids: prevIds });
      if (err instanceof ApiError && err.status === 401) {
        toast.info("Please sign in to save items to your wishlist");
        return { ok: false, error: "Sign in required" };
      }
      const msg = err instanceof Error ? err.message : "Failed to add to wishlist";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  },

  remove: async (productId: string) => {
    if (!productId) return { ok: false, error: "Invalid product id" };
    const prevIds = get().ids;
    const prevItems = get().items;
    set({
      ids: prevIds.filter((id) => id !== productId),
      items: prevItems.filter(
        (e) => e.product?._id !== productId && e.product?.slug !== productId,
      ),
    });
    try {
      await api(`/wishlist/${productId}`, { method: "DELETE" });
      return { ok: true };
    } catch (err: unknown) {
      // rollback
      set({ ids: prevIds, items: prevItems });
      const msg = err instanceof Error ? err.message : "Failed to remove from wishlist";
      toast.error(msg);
      return { ok: false, error: msg };
    }
  },

  toggle: async (productId: string) => {
    const isSaved = get().has(productId);
    if (isSaved) {
      const res = await get().remove(productId);
      return { ok: res.ok, action: "removed" };
    } else {
      const res = await get().add(productId);
      return { ok: res.ok, action: "added" };
    }
  },

  has: (productId: string) => {
    if (!productId) return false;
    const ids = get().ids;
    if (ids.includes(productId)) return true;
    return get().items.some(
      (entry) =>
        entry.product?._id === productId || entry.product?.slug === productId,
    );
  },

  clear: () => set({ items: [], ids: [] }),
}));
