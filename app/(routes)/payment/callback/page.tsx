"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import { toast } from "@/store/toast.store";
import type { Order } from "@/types/api";

interface VerifyResponse {
  status: "successful" | "failed" | "pending";
  message?: string;
  payment?: {
    reference?: string;
    amount?: number;
    status?: string;
    orderId?: string;
    order?: Order;
  };
  order?: Order;
}

function PaymentCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const txRef = searchParams.get("tx_ref") || searchParams.get("txRef") || "";
  const [status, setStatus] = useState<"loading" | "successful" | "failed" | "pending" | "auth_required">("loading");
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const pollAttempts = useRef(0);
  const maxAttempts = 10; // 10 attempts * 3s = 30s

  useEffect(() => {
    if (!txRef) {
      const t = setTimeout(() => {
        setStatus("failed");
        setErrorMsg("No transaction reference found in payment response.");
      }, 0);
      return () => clearTimeout(t);
    }

    let isCancelled = false;
    let timer: NodeJS.Timeout;

    const verifyPayment = async () => {
      try {
        const res = await api<VerifyResponse>(`/payments/verify/${encodeURIComponent(txRef)}`);
        if (isCancelled) return;

        const paymentStatus = res?.status;
        const resolvedOrder = res?.order || res?.payment?.order;
        if (resolvedOrder) {
          setOrderDetails(resolvedOrder);
        }

        if (paymentStatus === "successful") {
          setStatus("successful");
        } else if (paymentStatus === "failed") {
          setStatus("failed");
          setErrorMsg(res?.message || "Payment transaction was declined or failed.");
        } else {
          // pending
          pollAttempts.current += 1;
          if (pollAttempts.current < maxAttempts) {
            timer = setTimeout(verifyPayment, 3000);
          } else {
            setStatus("pending");
          }
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setStatus("auth_required");
        } else {
          pollAttempts.current += 1;
          if (pollAttempts.current < maxAttempts) {
            timer = setTimeout(verifyPayment, 3000);
          } else {
            setStatus("pending");
          }
        }
      }
    };

    void verifyPayment();

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [txRef]);

  // Retry payment for failed orders
  async function handleRetryPayment() {
    const orderId = orderDetails?._id || txRef;
    setRetrying(true);
    try {
      const res = await api<{ txRef: string; paymentLink?: string }>("/payments/initialize", {
        method: "POST",
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
        json: { orderId },
      });

      if (res?.paymentLink) {
        window.location.assign(res.paymentLink);
      } else {
        router.push(`/payment/callback?tx_ref=${encodeURIComponent(res.txRef)}`);
      }
    } catch (err: unknown) {
      setRetrying(false);
      const msg = err instanceof Error ? err.message : "Failed to initialize payment retry";
      toast.error(msg);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Card className="overflow-hidden border-border/70 shadow-lg">
        <CardContent className="p-8 sm:p-12 text-center">
          {/* Loading / Polling */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Verifying your payment</h1>
              <p className="text-sm text-muted-foreground max-w-sm">
                We are securely confirming your transaction with the payment provider. This takes a few moments.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span>Ref: {txRef}</span>
              </div>
            </div>
          )}

          {/* Success */}
          {status === "successful" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Payment successful!
              </h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Thank you for your order! Your payment has been confirmed and we&apos;re getting your plants ready for delivery.
              </p>

              {orderDetails && (
                <div className="my-4 w-full rounded-lg border border-border bg-card/60 p-4 text-left text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono font-semibold">{orderDetails._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total paid:</span>
                    <span className="font-semibold text-primary">₦{orderDetails.total.toLocaleString()}</span>
                  </div>
                  {orderDetails.delivery?.etaDays && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated delivery:</span>
                      <span>~{orderDetails.delivery.etaDays} days</span>
                    </div>
                  )}
                  {orderDetails.items && orderDetails.items.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Items ordered:</p>
                      <p className="font-medium text-xs">
                        {orderDetails.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/profile">
                  <Button>
                    View order status
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue shopping
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Failed */}
          {status === "failed" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-destructive">
                Payment could not be completed
              </h1>
              <p className="text-sm text-muted-foreground max-w-md">
                {errorMsg || "The transaction was cancelled or declined by your bank."}
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button onClick={handleRetryPayment} disabled={retrying}>
                  {retrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Retrying…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try payment again
                    </>
                  )}
                </Button>
                <Link href="/cart">
                  <Button variant="outline">Back to cart</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Pending Timeout */}
          {status === "pending" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-800">
                <Clock className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Payment is processing</h1>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Your payment is still being processed by your bank. We&apos;ll automatically update your order and send a confirmation email once it settles.
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                <Link href="/profile">
                  <Button>Check orders in profile</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">Contact support</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Auth Required */}
          {status === "auth_required" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Sign in to view payment</h1>
              <p className="text-sm text-muted-foreground max-w-sm">
                This registered order belongs to your account. Please sign in to see the confirmation.
              </p>
              <div className="pt-2">
                <Link href={`/signin?redirect=/payment/callback?tx_ref=${encodeURIComponent(txRef)}`}>
                  <Button>Sign in now</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </main>
      }
    >
      <PaymentCallbackInner />
    </Suspense>
  );
}
