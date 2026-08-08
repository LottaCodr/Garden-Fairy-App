"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { AuthCard } from "@/components/custom/AuthCard";
import { Button } from "@/components/ui/button";

function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirect") || "/";

  const signin = useAuthStore((s) => s.signin);
  const demoLogin = useAuthStore((s) => s.demoLogin);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await signin(email, password);
    if (!result.ok) {
      setError(result.error || "Invalid email or password");
      return;
    }
    const user = useAuthStore.getState().user;
    if (user?.role === "admin" && (!redirectTo || redirectTo === "/")) {
      router.push("/admin");
    } else {
      router.push(redirectTo || "/");
    }
    router.refresh();
  }

  async function handleDemo(role: "admin" | "customer") {
    setError(null);
    const result = await demoLogin(role);
    if (!result.ok) {
      setError(result.error || "Demo login failed");
      return;
    }
    if (role === "admin" && (!redirectTo || redirectTo === "/")) {
      router.push("/admin");
    } else {
      router.push(redirectTo || "/");
    }
    router.refresh();
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your Garden Fairy account"
      footer={
        <div className="flex flex-col items-center gap-2">
          <div>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </div>
          <div>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        {/* Demo buttons */}
        <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Demo accounts
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDemo("customer")}
            className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary hover:text-primary transition disabled:opacity-50"
          >
            {isLoading ? "Signing in…" : "Continue as Demo User"}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDemo("admin")}
            className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary hover:text-primary transition disabled:opacity-50"
          >
            {isLoading ? "Signing in…" : "Continue as Admin"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Welcome back" description="Sign in to your Garden Fairy account">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </AuthCard>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
