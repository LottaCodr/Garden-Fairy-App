import { create } from "zustand";
import { api } from "@/lib/api";
import type { PublicSettings } from "@/types/api";

const DEFAULT_SETTINGS: PublicSettings = {
  storeName: "The Garden Fairy",
  supportEmail: "hello@gardenfairy.com",
  phone: "+234 123 456 7890",
  deliveryFee: 3500,
  freeShippingThreshold: 50000,
  paymentProvider: "flutterwave",
};

interface SettingsState {
  settings: PublicSettings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<PublicSettings>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api<{ data: PublicSettings }>("/settings");
      if (res?.data) {
        const merged = { ...DEFAULT_SETTINGS, ...res.data };
        set({ settings: merged, isLoading: false });
        return merged;
      }
      set({ isLoading: false });
      return get().settings;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load settings";
      set({ error: msg, isLoading: false });
      return get().settings;
    }
  },
}));
