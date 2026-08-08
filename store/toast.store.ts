import { create } from "zustand";

export type ToastKind = "success" | "error" | "info";

export type Toast = {
    id: string;
    kind: ToastKind;
    title: string;
    description?: string;
};

type ToastState = {
    toasts: Toast[];
    push: (t: Omit<Toast, "id">) => void;
    dismiss: (id: string) => void;
};

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    push: (t) => {
        const id = `toast_${Date.now()}_${counter++}`;
        set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
        // Auto-dismiss after 3.2s
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
        }, 3200);
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
    success: (title: string, description?: string) =>
        useToastStore.getState().push({ kind: "success", title, description }),
    error: (title: string, description?: string) =>
        useToastStore.getState().push({ kind: "error", title, description }),
    info: (title: string, description?: string) =>
        useToastStore.getState().push({ kind: "info", title, description }),
};
