"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 50000;

export default function OrderSummary({ subtotal }: { subtotal: number }) {
    const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3500;
    const total = subtotal + deliveryFee;
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const isAuthed = useAuthStore((s) => s.isAuthenticated);

    function handleCheckout() {
        if (!isAuthed) {
            router.push("/signin?redirect=/checkout");
            return;
        }
        router.push("/checkout");
    }

    return (
        <Card className="h-fit sticky top-24">
            <CardContent className="space-y-6 p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>

                <div className="space-y-6">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₦{subtotal.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span>
                                {deliveryFee === 0 ? (
                                    <span className="text-primary font-semibold">FREE</span>
                                ) : (
                                    `₦${deliveryFee.toLocaleString()}`
                                )}
                            </span>
                        </div>

                        <Separator />

                        <div className="flex justify-between font-semibold text-base">
                            <span>Total</span>
                            <span>₦{total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Free shipping progress */}
                    {subtotal > 0 && remaining > 0 ? (
                        <div className="space-y-1.5 rounded-md border border-primary/20 bg-primary/5 p-3">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <ShoppingBag className="h-3 w-3 text-primary" />
                                    Add ₦{remaining.toLocaleString()} more
                                </span>
                                <span className="font-medium text-primary">Free delivery</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : subtotal > 0 ? (
                        <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-center text-xs font-semibold text-primary">
                            🎉 You&apos;ve unlocked FREE delivery!
                        </p>
                    ) : null}

                    <Button
                        size="lg"
                        className="w-full"
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                    >
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="text-center text-[11px] text-muted-foreground">
                        Secure 3-step checkout — no payment is taken in this demo.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
