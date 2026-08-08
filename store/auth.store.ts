import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "admin";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    signin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
    signout: () => void;
    setUser: (user: AuthUser | null) => void;
}

/**
 * Demo accounts. In a real app these would live behind an API.
 * The admin account is hard-coded so reviewers can immediately see the admin module.
 */
const DEMO_USERS: Array<AuthUser & { password: string }> = [
    {
        id: "u_admin",
        name: "Fairy Admin",
        email: "admin@gardenfairy.com",
        password: "admin123",
        role: "admin",
    },
    {
        id: "u_demo",
        name: "Amaka Okoye",
        email: "user@gardenfairy.com",
        password: "user123",
        role: "user",
    },
];

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            signin: async (email, password) => {
                set({ isLoading: true });
                // simulate a network round trip
                await new Promise((r) => setTimeout(r, 400));

                const found = DEMO_USERS.find(
                    (u) =>
                        u.email.toLowerCase() === email.trim().toLowerCase() &&
                        u.password === password
                );

                if (!found) {
                    set({ isLoading: false });
                    return { ok: false, error: "Invalid email or password" };
                }

                const { password: _pw, ...safe } = found;
                void _pw;
                set({ user: safe, isAuthenticated: true, isLoading: false });
                return { ok: true };
            },

            signup: async (name, email, password) => {
                set({ isLoading: true });
                await new Promise((r) => setTimeout(r, 400));

                if (!name.trim() || !email.trim() || password.length < 6) {
                    set({ isLoading: false });
                    return {
                        ok: false,
                        error: "Please provide a name, valid email and 6+ char password",
                    };
                }

                if (
                    DEMO_USERS.some(
                        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
                    )
                ) {
                    set({ isLoading: false });
                    return { ok: false, error: "An account with that email already exists" };
                }

                const newUser: AuthUser = {
                    id: `u_${Date.now()}`,
                    name: name.trim(),
                    email: email.trim(),
                    role: "user",
                };

                const user: AuthUser = newUser;
                set({ user, isAuthenticated: true, isLoading: false });
                return { ok: true };
            },

            signout: () => set({ user: null, isAuthenticated: false }),
            setUser: (user) => set({ user, isAuthenticated: !!user }),
        }),
        {
            name: "garden-fairy-auth",
        }
    )
);
