"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useSettingsStore } from "@/store/settings.store";

export function AppBootstrap() {
  useEffect(() => {
    // Bootstrap auth state (rotates refresh token or enters guest mode)
    void useAuthStore.getState().bootstrap();
    // Load public store settings (free shipping threshold, delivery fee, store info)
    void useSettingsStore.getState().fetchSettings();
  }, []);

  return null;
}
