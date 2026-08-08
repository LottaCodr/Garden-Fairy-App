import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
    ids: string[];
    toggle: (id: string) => void;
    has: (id: string) => boolean;
    remove: (id: string) => void;
    clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            ids: [],

            toggle: (id) =>
                set((state) => ({
                    ids: state.ids.includes(id)
                        ? state.ids.filter((x) => x !== id)
                        : [...state.ids, id],
                })),

            has: (id) => get().ids.includes(id),

            remove: (id) =>
                set((state) => ({ ids: state.ids.filter((x) => x !== id) })),

            clear: () => set({ ids: [] }),
        }),
        {
            name: "garden-fairy-wishlist",
        }
    )
);
