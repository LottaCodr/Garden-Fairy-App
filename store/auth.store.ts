import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import type { User, Address, AuthPayload } from "@/types/api";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";

export type { User, Address, AuthPayload };

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  bootstrap: () => Promise<User | null>;
  signin: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; user?: User }>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<{ ok: boolean; error?: string; user?: User }>;
  demoLogin: (
    role: "admin" | "customer",
  ) => Promise<{ ok: boolean; error?: string; user?: User }>;
  signout: () => Promise<void>;

  fetchMe: () => Promise<User | null>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
  }) => Promise<{ ok: boolean; error?: string; user?: User }>;

  addAddress: (
    addr: Omit<Address, "_id">,
  ) => Promise<{ ok: boolean; error?: string; addresses?: Address[] }>;
  updateAddress: (
    addrId: string,
    addr: Partial<Address>,
  ) => Promise<{ ok: boolean; error?: string; addresses?: Address[] }>;
  deleteAddress: (
    addrId: string,
  ) => Promise<{ ok: boolean; error?: string; addresses?: Address[] }>;

  forgotPassword: (
    email: string,
  ) => Promise<{ ok: boolean; message: string; devResetToken?: string; error?: string }>;
  resetPassword: (
    token: string,
    password: string,
  ) => Promise<{ ok: boolean; message: string; error?: string }>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  bootstrap: async () => {
    set({ isLoading: true });
    try {
      const res = await api<AuthPayload>("/auth/refresh", {
        method: "POST",
      });

      if (res?.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
        // Post-auth refetch: server already merged guest cart into user cart
        void useCartStore.getState().fetch();
        void useWishlistStore.getState().fetch();
        return res.user;
      }
      throw new Error("No user payload returned");
    } catch {
      // Guest mode
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      // Guest mode still reads/creates guest cart via gf_session cookie
      void useCartStore.getState().fetch();
      return null;
    }
  },

  signin: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api<AuthPayload>("/auth/signin", {
        method: "POST",
        json: { email: email.trim(), password },
      });

      if (res?.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
        });
        void useCartStore.getState().fetch();
        void useWishlistStore.getState().fetch();
        return { ok: true, user: res.user };
      }
      set({ isLoading: false });
      return { ok: false, error: "Authentication failed" };
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Invalid email or password";
      set({ isLoading: false });
      return { ok: false, error: message };
    }
  },

  signup: async (name, email, password, phone) => {
    set({ isLoading: true });
    try {
      const res = await api<AuthPayload>("/auth/signup", {
        method: "POST",
        json: {
          name: name.trim(),
          email: email.trim(),
          password,
          ...(phone ? { phone: phone.trim() } : {}),
        },
      });

      if (res?.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
        });
        void useCartStore.getState().fetch();
        void useWishlistStore.getState().fetch();
        return { ok: true, user: res.user };
      }
      set({ isLoading: false });
      return { ok: false, error: "Signup failed" };
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Signup failed";
      set({ isLoading: false });
      return { ok: false, error: message };
    }
  },

  demoLogin: async (role) => {
    set({ isLoading: true });
    try {
      const res = await api<AuthPayload>("/auth/demo-login", {
        method: "POST",
        json: { role },
      });

      if (res?.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
        });
        void useCartStore.getState().fetch();
        void useWishlistStore.getState().fetch();
        return { ok: true, user: res.user };
      }
      set({ isLoading: false });
      return { ok: false, error: "Demo login failed" };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Demo login failed";
      set({ isLoading: false });
      return { ok: false, error: message };
    }
  },

  signout: async () => {
    set({ isLoading: true });
    try {
      await api("/auth/signout", { method: "POST" });
    } catch {
      // proceed with local cleanup anyway
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
    useWishlistStore.getState().clear();
    // After signout, refetch cart to initialize a clean guest cart
    void useCartStore.getState().clearCart();
  },

  fetchMe: async () => {
    try {
      const res = await api<{ user: User }>("/auth/me");
      if (res?.user) {
        const current = get().user;
        const updated = {
          ...current,
          ...res.user,
          addresses: current?.addresses || res.user.addresses || [],
        } as User;
        set({ user: updated, isAuthenticated: true });
        return updated;
      }
      return null;
    } catch {
      return null;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api<{ user?: User; data?: User }>("/auth/me", {
        method: "PATCH",
        json: data,
      });
      const updated = res?.user || res?.data;
      if (updated) {
        set({ user: updated, isLoading: false });
        return { ok: true, user: updated };
      }
      set({ isLoading: false });
      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      set({ isLoading: false });
      return { ok: false, error: message };
    }
  },

  addAddress: async (addr) => {
    try {
      const res = await api<{ addresses?: Address[]; data?: { addresses: Address[] } }>(
        "/auth/me/addresses",
        {
          method: "POST",
          json: addr,
        },
      );
      const addresses = res?.addresses || res?.data?.addresses;
      if (addresses && get().user) {
        set({ user: { ...get().user!, addresses } });
        return { ok: true, addresses };
      }
      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add address";
      return { ok: false, error: message };
    }
  },

  updateAddress: async (addrId, addr) => {
    try {
      const res = await api<{ addresses?: Address[]; data?: { addresses: Address[] } }>(
        `/auth/me/addresses/${addrId}`,
        {
          method: "PUT",
          json: addr,
        },
      );
      const addresses = res?.addresses || res?.data?.addresses;
      if (addresses && get().user) {
        set({ user: { ...get().user!, addresses } });
        return { ok: true, addresses };
      }
      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update address";
      return { ok: false, error: message };
    }
  },

  deleteAddress: async (addrId) => {
    try {
      const res = await api<{ addresses?: Address[]; data?: { addresses: Address[] } }>(
        `/auth/me/addresses/${addrId}`,
        {
          method: "DELETE",
        },
      );
      const addresses = res?.addresses || res?.data?.addresses;
      if (addresses && get().user) {
        set({ user: { ...get().user!, addresses } });
        return { ok: true, addresses };
      }
      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete address";
      return { ok: false, error: message };
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await api<{ message: string; devResetToken?: string }>(
        "/auth/forgot-password",
        {
          method: "POST",
          json: { email: email.trim() },
        },
      );
      return {
        ok: true,
        message: res?.message || "Password reset instructions sent to your email",
        devResetToken: res?.devResetToken,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to request password reset";
      return { ok: false, message, error: message };
    }
  },

  resetPassword: async (token, password) => {
    try {
      const res = await api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        json: { token, password },
      });
      return {
        ok: true,
        message: res?.message || "Password has been reset successfully",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to reset password";
      return { ok: false, message, error: message };
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
