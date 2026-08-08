"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { AuthCard } from "@/components/custom/AuthCard";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await forgotPassword(email);
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setMessage(res.message);
      if (res.devResetToken) {
        setDevResetToken(res.devResetToken);
      }
    } else {
      setError(res.error || "Failed to process request");
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email to receive a password reset link"
      footer={
        <>
          Remember your password?{" "}
          <Link href="/signin" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {success ? (
        <div className="space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">
            Check your inbox for the reset link. If it doesn&apos;t arrive in a few minutes, check your spam folder.
          </p>

          {devResetToken && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-primary">Development Reset Link:</p>
              <Link href={`/reset-password?token=${encodeURIComponent(devResetToken)}`}>
                <Button size="sm" className="w-full">
                  Click here to set new password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link href="/signin">
              <Button variant="outline" className="w-full">
                Back to Sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
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

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
