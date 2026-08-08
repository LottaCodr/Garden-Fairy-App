"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Truck,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useSettingsStore } from "@/store/settings.store";
import { toast } from "@/store/toast.store";
import { api, ApiError } from "@/lib/api";
import type { CheckoutResult, DeliveryQuote, Address } from "@/types/api";
import { cn } from "@/lib/utils";
import EmptyCart from "./empty.card";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Ogun",
  "Oyo",
  "Rivers",
  "Kano",
  "Kaduna",
  "Enugu",
  "Anambra",
  "Delta",
  "Edo",
  "Imo",
  "Abia",
  "Plateau",
  "Borno",
];

export default function CheckoutPageComponent() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subTotal = useCartStore((s) => s.subTotal());
  const refetchCart = useCartStore((s) => s.fetch);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const settings = useSettingsStore((s) => s.settings);

  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<DeliveryQuote | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");

  // Idempotency key generated per checkout attempt and regenerated if cart changes
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());

  useEffect(() => {
    // Regenerate idempotency key when cart items or subtotal change
    setIdempotencyKey(crypto.randomUUID());
  }, [items.length, subTotal]);

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: defaultAddr?.street || "",
    city: defaultAddr?.city || "Ikeja",
    state: defaultAddr?.state || "Lagos",
    notes: "",
  });

  // Prefill profile data when user loads
  useEffect(() => {
    if (user) {
      const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        street: prev.street || def?.street || "",
        city: prev.city || def?.city || "Ikeja",
        state: prev.state || def?.state || "Lagos",
      }));
    }
  }, [user]);

  // Handle saved address picker
  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr._id || "saved");
    setForm((prev) => ({
      ...prev,
      street: addr.street,
      city: addr.city,
      state: addr.state,
    }));
  };

  // Fetch delivery estimate
  const fetchDeliveryEstimate = useCallback(
    async (st: string, ct: string, sub: number) => {
      setEstimateLoading(true);
      try {
        const res = await api<{ data: DeliveryQuote }>("/checkout/estimate", {
          method: "POST",
          json: {
            state: st,
            city: ct,
            subtotal: sub,
          },
        });
        if (res?.data) {
          setEstimate(res.data);
        }
      } catch {
        // fallback
        const free = sub >= (settings?.freeShippingThreshold ?? 50000);
        setEstimate({
          deliveryFee: free ? 0 : (settings?.deliveryFee ?? 3500),
          etaDays: 2,
          freeShippingApplied: free,
          matchedArea: null,
          currency: "NGN",
        });
      } finally {
        setEstimateLoading(false);
      }
    },
    [settings],
  );

  useEffect(() => {
    if (form.state && subTotal > 0) {
      const timer = setTimeout(() => {
        void fetchDeliveryEstimate(form.state, form.city, subTotal);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [form.state, form.city, subTotal, fetchDeliveryEstimate]);

  const deliveryFee = estimate?.deliveryFee ?? (subTotal >= (settings?.freeShippingThreshold ?? 50000) ? 0 : (settings?.deliveryFee ?? 3500));
  const total = subTotal + deliveryFee;

  if (items.length === 0) {
    return <EmptyCart />;
  }

  async function handleCheckout(e: FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim()) {
      toast.error("Please fill in all required shipping fields.");
      return;
    }

    setLoading(true);

    try {
      // POST /api/checkout with Idempotency-Key
      const payload = {
        items: items.map((i) => ({
          productId: i.product || i.id,
          qty: i.qty,
          size: i.size,
        })),
        shippingAddress: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
        },
        notes: form.notes.trim() || undefined,
      };

      const result = await api<CheckoutResult>("/checkout", {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        json: payload,
      });

      // Refetch cart to reset badge (server cleared it)
      await refetchCart();

      // If Flutterwave paymentLink returned, redirect browser
      if (result?.paymentLink) {
        window.location.assign(result.paymentLink);
      } else {
        // Development fallback or direct callback
        router.push(`/payment/callback?tx_ref=${encodeURIComponent(result.txRef)}`);
      }
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("Cart conflict", err.message);
          await refetchCart();
        } else {
          toast.error(err.message);
        }
      } else {
        const msg = err instanceof Error ? err.message : "Failed to place order";
        toast.error(msg);
      }
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">
          Checkout
        </p>
        <h1 className="text-3xl font-black tracking-tight">Shipping & Payment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete your delivery details to proceed to secure payment.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form area */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCheckout} className="space-y-6">
            {/* Saved Addresses Picker (if logged in & has saved addresses) */}
            {isAuthenticated && user?.addresses && user.addresses.length > 0 ? (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-sm">Saved Addresses</h2>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {user.addresses.map((addr) => {
                      const isSelected =
                        selectedAddressId === addr._id ||
                        (form.street === addr.street && form.city === addr.city);
                      return (
                        <div
                          key={addr._id || `${addr.street}-${addr.city}`}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={cn(
                            "cursor-pointer rounded-lg border p-3 text-xs transition-colors",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground">
                              {addr.label || "Address"}
                            </span>
                            {addr.isDefault && (
                              <Badge variant="secondary" className="text-[10px]">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground truncate">{addr.street}</p>
                          <p className="text-muted-foreground">
                            {addr.city}, {addr.state}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Shipping Address Form */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-sm">Shipping Information</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Full name *</label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">Email address *</label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">Phone number *</label>
                    <Input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="080 1234 5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">State *</label>
                    <select
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">City / Area *</label>
                    <Input
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Ikeja, Lekki, Wuse..."
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-medium">Street address *</label>
                    <Input
                      required
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      placeholder="12 Garden Road, Floor 2"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-medium">Order notes (optional)</label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Special delivery instructions, gate code, etc."
                      className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-sm">Payment Provider</h2>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {settings?.paymentProvider || "Flutterwave"}
                  </Badge>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Secure Hosted Checkout
                  </div>
                  <p>
                    You will be directed to {settings?.paymentProvider === "paystack" ? "Paystack" : "Flutterwave"} to complete your payment with card, bank transfer, or USSD.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("/cart")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to cart
                  </Button>

                  <Button type="submit" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initiating payment...
                      </>
                    ) : (
                      `Pay ₦${total.toLocaleString()}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Order summary sidebar */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-semibold">Order Summary</h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id || i.product} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={i.image || "/images/plants/1.jpg"}
                        alt={i.name}
                        onError={(e) => {
                          e.currentTarget.src = "/images/plants/1.jpg";
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.qty} × ₦{i.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ₦{(i.lineTotal || i.price * i.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₦{subTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivery</span>
                  {estimateLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  ) : deliveryFee === 0 ? (
                    <span className="text-primary font-semibold">FREE</span>
                  ) : (
                    <span>₦{deliveryFee.toLocaleString()}</span>
                  )}
                </div>

                {estimate?.etaDays ? (
                  <p className="text-[11px] text-muted-foreground text-right">
                    Arrives in ~{estimate.etaDays} day{estimate.etaDays !== 1 ? "s" : ""}
                  </p>
                ) : null}

                <Separator />

                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
