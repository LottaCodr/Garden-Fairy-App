"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart.store";
import CheckOutSkeleton from "./skeleton/CheckOutSkeleton";

type Quote = {
    subtotal: number;
    delivery: number;
    total: number;
};

export default function CheckoutPageComponent() {
    const { items, subTotal } = useCartStore();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/checkout/quote", {
            method: "POST",
            body: JSON.stringify({ items }),
        })
            .then((res) => res.json())
            .then(setQuote);
    }, [items]);

    async function handlePayment() {
        setLoading(true);
        const res = await fetch("/api/checkout/pay", {
            method: "POST",
            body: JSON.stringify({ items }),
        });

        const data = await res.json();
        window.location.href = data.paymentLink;
    }

    if (!quote)
        // return <CheckOutSkeleton />;

        return (
            <main className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

                <Card>
                    <CardContent className="space-y-4 p-6">
                        <Row label="Subtotal" value={978787} />
                        <Row label="Delivery" value={6768789} />
                        <Separator />
                        <Row label="Total" value={87987979} strong />

                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Pay Now"} 
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
}

function Row({
    label,
    value,
    strong,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div className={`flex justify-between ${strong && "font-semibold"}`}>
            <span>{label}</span>
            <span>₦{value.toLocaleString()}</span>
        </div>
    );
}
