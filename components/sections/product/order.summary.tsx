"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { useAdminStore } from "@/store/admin.store";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderSummary({ subtotal }: { subtotal: number }) {
    const deliveryFee = subtotal >= 50000 ? 0 : 3500;
    const total = subtotal + deliveryFee;
    const [placing, setPlacing] = useState(false);
    const [placedId, setPlacedId] = useState<string | null>(null);

    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const clearCart = useCartStore((s) => s.clearCart);
    const addOrder = useAdminStore((s) => s.addOrder);
    const user = useAuthStore((s) => s.user);
    const isAuthed = useAuthStore((s) => s.isAuthenticated);

    async function handleCheckout() {
        if (!isAuthed) {
            router.push("/signin?redirect=/checkout");
            return;
        }
        if (items.length === 0) return;

        setPlacing(true);
        // simulate payment latency
        await new Promise((r) => setTimeout(r, 800));

        const order = addOrder({
            customerName: user?.name || "Guest",
            customerEmail: user?.email || "guest@example.com",
            items: items.map((i) => ({
                productId: i.id,
                name: i.name,
                price: i.price,
                image: i.image,
                quantity: i.quantity,
            })),
            subtotal,
            delivery: deliveryFee,
            total,
            shippingAddress: "Default address (update in profile)",
        });
        clearCart();
        setPlacing(false);
        setPlacedId(order.id);
    }

    return (
        <Card className="h-fit sticky top-24">
            <CardContent className="space-y-6 p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>

                <AnimatePresence mode="wait">
                    {placedId ? (
                        <motion.div
                            key="placed"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <div className="rounded-md border border-primary/30 bg-primary/10 p-4 text-sm">
                                <p className="font-semibold text-primary">
                                    Order placed successfully!
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Order <span className="font-mono">{placedId}</span> is being
                                    processed. Track it from your profile.
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => router.push("/profile")}
                            >
                                View my orders
                            </Button>
                            <Button
                                className="w-full"
                                variant="ghost"
                                onClick={() => router.push("/shop")}
                            >
                                Continue shopping
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
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

                                {subtotal > 0 && subtotal < 50000 ? (
                                    <p className="text-[11px] text-muted-foreground">
                                        Add ₦{(50000 - subtotal).toLocaleString()} more for free
                                        delivery
                                    </p>
                                ) : null}

                                <Separator />

                                <div className="flex justify-between font-semibold text-base">
                                    <span>Total</span>
                                    <span>₦{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handleCheckout}
                                disabled={placing || items.length === 0}
                            >
                                {placing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Proceed to Checkout"
                                )}
                            </Button>

                            <p className="text-center text-[11px] text-muted-foreground">
                                Demo checkout — no payment is taken.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
