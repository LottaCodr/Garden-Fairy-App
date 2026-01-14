import { create } from "zustand";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: string;
}

type CartState = {
    items: CartItem[];
    count: number;

    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;

    updateQty: (id: string, qty: number) => void;
    subTotal: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
    items: [
        {
            id: "suhjasa",
            name: "The Best",
            price: 67,
            image: "",
            quantity: 7
        }
    ],
    count: 1,

    addItem: (item) =>
        set((state) => {
            const existing = state.items.find((i) => i.id === item.id);

            const items = existing
                ? state.items.map((i) =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i)
                : [...state.items, { ...item, quantity: 1 }];

            return {
                items,
                count: items.reduce((acc, i) => acc + i.quantity, 0)
            };
        }),

    removeItem: (id: string) =>
        set((state) => {
            const items = state.items.filter((i) => i.id !== id);
            return {
                items,
                count: items.reduce((acc, i) => acc + i.quantity, 0),
            }
        }),

    clearCart: () => set({ items: [], count: 0 }),

    updateQty: (id, qty) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i),
    })),

    subTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}));



