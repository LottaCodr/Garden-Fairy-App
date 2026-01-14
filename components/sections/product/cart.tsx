"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";

export default function CartPage() {
    const { items, updateQty, removeItem, subtotal } = useCartStore();

    return (
        <main className="mx-auto max-w-7xl px-4 py-10">
            <h1 className="mb-8 text-3xl font-black tracking-tight">Your Cart</h1>

            {items.length === 0 ? (
                <EmptyCart />
            ) : (
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Cart Items */}
                    <section className="lg:col-span-2 space-y-6">
                        {items.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="flex gap-4 p-4">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={120}
                                        height={120}
                                        className="rounded-md object-cover"
                                    />

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold">{item.name}</h3>
                                            {item.variant && (
                                                <p className="text-sm text-muted-foreground">
                                                    Size: {item.variant}
                                                </p>
                                            )}
                                            <p className="mt-1 font-medium">
                                                ₦{item.price.toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            {/* Quantity */}
                                            <div className="flex items-center rounded-md border">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateQty(item.id, item.quantity - 1)
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>

                                                <span className="px-4 text-sm">
                                                    {item.quantity}
                                                </span>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateQty(item.id, item.quantity + 1)
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Remove */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(item.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    {/* Summary */}
                    <OrderSummary subtotal={subtotal()} />
                </div>
            )}
        </main>
    );
}

function OrderSummary({ subtotal }: { subtotal: number }) {
    const deliveryFee = 3500;
    const total = subtotal + deliveryFee;

    return (
        <Card className="h-fit">
            <CardContent className="space-y-6 p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>₦{deliveryFee.toLocaleString()}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₦{total.toLocaleString()}</span>
                    </div>
                </div>

                <Button size="lg" className="w-full">
                    Proceed to Checkout
                </Button>

                <Link
                    href="/shop"
                    className="block text-center text-sm text-muted-foreground hover:text-primary"
                >
                    Continue shopping
                </Link>
            </CardContent>
        </Card>
    );
}


function EmptyCart() {
    return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
                Looks like you haven’t added anything yet.
            </p>
            <Link href="/shop">
                <Button>Browse products</Button>
            </Link>
        </div>
    );
}

