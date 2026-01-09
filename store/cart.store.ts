import { create } from "zustand";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

type CartState = {
    items: CartItem[];
    count: number;

    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    count: 0,

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
    
    clearCart: () => set({ items: [], count: 0 })
}));



