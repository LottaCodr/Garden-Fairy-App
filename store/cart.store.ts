import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: string;
};

type CartState = {
    items: CartItem[];

    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    decrementItem: (id: string) => void;
    updateQty: (id: string, qty: number) => void;

    count: () => number;
    subTotal: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    const items = existing
                        ? state.items.map((i) =>
                            i.id === item.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        )
                        : [...state.items, { ...item, quantity: 1 }];
                    return { items };
                }),

            decrementItem: (id) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === id);
                    if (!existing) return state;
                    if (existing.quantity <= 1) {
                        return { items: state.items.filter((i) => i.id !== id) };
                    }
                    return {
                        items: state.items.map((i) =>
                            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                        ),
                    };
                }),

            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

            clearCart: () => set({ items: [] }),

            updateQty: (id, qty) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(1, qty) } : i
                    ),
                })),

            count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
            subTotal: () =>
                get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        {
            name: "garden-fairy-cart",
        }
    )
);
