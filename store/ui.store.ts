import { create } from "zustand";

type UIState = {
    searchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
};

export const useUIStore = create<UIState>((set) => ({
    searchOpen: false,
    openSearch: () => set({ searchOpen: true }),
    closeSearch: () => set({ searchOpen: false }),
}));
