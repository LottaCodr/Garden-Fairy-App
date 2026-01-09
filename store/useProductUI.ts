import { create } from "zustand";

interface ProductUIState {
    quickViewProductId: string | null;
    openQuickView: (id: string) => void;
    closeQuickView: ()=> void
}

export const useProductUI = create<ProductUIState>((set) => ({
    quickViewProductId: null,
    openQuickView: (id) => set({ quickViewProductId: id }),
    closeQuickView: () => set({ quickViewProductId: null})
}))