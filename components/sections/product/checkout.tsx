"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    Truck,
    ShieldCheck,
    CreditCard,
    CheckCircle2,
    ArrowLeft,
    Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart.store";
import { useAdminStore } from "@/store/admin.store";
import { useAuthStore } from "@/store/auth.store";
import EmptyCart from "./empty.card";

const NIGERIAN_STATES = [
    "Lagos", "Abuja (FCT)", "Ogun", "Oyo", "Rivers", "Kano", "Kaduna",
    "Enugu", "Anambra", "Delta", "Edo", "Imo", "Abia", "Plateau", "Borno",
];

export default function CheckoutPageComponent() {
    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const subTotal = useCartStore((s) => s.subTotal());
    const clearCart = useCartStore((s) => s.clearCart);
    const addOrder = useAdminStore((s) => s.addOrder);
    const user = useAuthStore((s) => s.user);
    const isAuthed = useAuthStore((s) => s.isAuthenticated);

    const [step, setStep] = useState<"shipping" | "payment" | "success">("shipping");
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const updateProduct = useAdminStore((s) => s.updateProduct);
    const adminProducts = useAdminStore((s) => s.products);

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        state: "Lagos",
        notes: "",
        // payment
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
    });

    useEffect(() => {
        if (!isAuthed) {
            router.replace("/signin?redirect=/checkout");
        }
    }, [isAuthed, router]);

    useEffect(() => {
        if (user) {
            setForm((f) => ({
                ...f,
                name: f.name || user.name,
                email: f.email || user.email,
            }));
        }
        // intentionally depend on user.id only to avoid cascading re-renders
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const deliveryFee = subTotal >= 50000 ? 0 : 3500;
    const total = subTotal + deliveryFee;

    if (items.length === 0 && step !== "success") {
        return <EmptyCart />;
    }

    function goNext(e: FormEvent) {
        e.preventDefault();
        if (step === "shipping") {
            setStep("payment");
            return;
        }
        // step === "payment": place order
        handlePlaceOrder();
    }

    async function handlePlaceOrder() {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 900));

        const order = addOrder({
            customerName: form.name,
            customerEmail: form.email,
            items: items.map((i) => ({
                productId: i.id,
                name: i.name,
                price: i.price,
                image: i.image,
                quantity: i.quantity,
            })),
            subtotal: subTotal,
            delivery: deliveryFee,
            total,
            shippingAddress: `${form.address}, ${form.city}, ${form.state}`,
        });

        // Decrement live stock so inventory stays consistent with sales
        for (const i of items) {
            const product = adminProducts.find((p) => p.id === i.id);
            if (product) {
                updateProduct(product.id, {
                    stock: Math.max(0, product.stock - i.quantity),
                });
            }
        }

        setOrderId(order.id);
        clearCart();
        setLoading(false);
        setStep("success");
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            {/* Stepper */}
            <div className="mb-8 flex items-center justify-center gap-2 text-sm">
                <StepBadge label="Shipping" active={step === "shipping"} done={step === "payment" || step === "success"} />
                <Separator className="w-12" />
                <StepBadge label="Payment" active={step === "payment"} done={step === "success"} />
                <Separator className="w-12" />
                <StepBadge label="Confirmation" active={step === "success"} done={false} />
            </div>

            <h1 className="mb-8 text-3xl font-black tracking-tight">Checkout</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Form area */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {step === "shipping" && (
                            <motion.form
                                key="shipping"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                onSubmit={goNext}
                            >
                                <Card>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-primary" />
                                            <h2 className="font-semibold">Shipping details</h2>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                label="Full name"
                                                value={form.name}
                                                onChange={(v) => setForm({ ...form, name: v })}
                                                required
                                            />
                                            <Field
                                                label="Email"
                                                type="email"
                                                value={form.email}
                                                onChange={(v) => setForm({ ...form, email: v })}
                                                required
                                            />
                                            <Field
                                                label="Phone"
                                                value={form.phone}
                                                onChange={(v) => setForm({ ...form, phone: v })}
                                                required
                                            />
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">State</label>
                                                <select
                                                    value={form.state}
                                                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                >
                                                    {NIGERIAN_STATES.map((s) => (
                                                        <option key={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Field
                                                label="City"
                                                value={form.city}
                                                onChange={(v) => setForm({ ...form, city: v })}
                                                required
                                            />
                                            <Field
                                                label="Street address"
                                                value={form.address}
                                                onChange={(v) => setForm({ ...form, address: v })}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Order notes (optional)
                                            </label>
                                            <textarea
                                                value={form.notes}
                                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                                rows={3}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                placeholder="Delivery instructions, gate code, etc."
                                            />
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
                                            <Button type="submit">Continue to payment</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.form>
                        )}

                        {step === "payment" && (
                            <motion.form
                                key="payment"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                onSubmit={goNext}
                            >
                                <Card>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="mb-2 flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-primary" />
                                            <h2 className="font-semibold">Payment</h2>
                                            <Badge variant="secondary" className="ml-auto gap-1">
                                                <Lock className="h-3 w-3" /> Demo
                                            </Badge>
                                        </div>

                                        <Field
                                            label="Name on card"
                                            value={form.cardName}
                                            onChange={(v) => setForm({ ...form, cardName: v })}
                                            required
                                        />
                                        <Field
                                            label="Card number"
                                            value={form.cardNumber}
                                            onChange={(v) => setForm({ ...form, cardNumber: formatCardNumber(v) })}
                                            placeholder="4242 4242 4242 4242"
                                            maxLength={19}
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field
                                                label="Expiry"
                                                value={form.expiry}
                                                onChange={(v) => setForm({ ...form, expiry: formatExpiry(v) })}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                required
                                            />
                                            <Field
                                                label="CVV"
                                                value={form.cvv}
                                                onChange={(v) => setForm({ ...form, cvv: v.replace(/\D/g, "").slice(0, 3) })}
                                                placeholder="123"
                                                maxLength={3}
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            Your card details are not stored. This is a demo checkout.
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setStep("shipping")}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back
                                            </Button>
                                            <Button type="submit" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Processing payment...
                                                    </>
                                                ) : (
                                                    `Pay ₦${total.toLocaleString()}`
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.form>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card>
                                    <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                                            <CheckCircle2 className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Thank you for your order!</h2>
                                        <p className="max-w-md text-sm text-muted-foreground">
                                            Your order has been placed successfully. A confirmation
                                            email will be sent to <span className="font-medium">{form.email}</span>.
                                        </p>
                                        <div className="rounded-md border border-border bg-card/50 px-6 py-3">
                                            <p className="text-xs text-muted-foreground">Order ID</p>
                                            <p className="font-mono font-semibold">{orderId}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => router.push("/shop")}>
                                                Continue shopping
                                            </Button>
                                            <Button onClick={() => router.push("/profile")}>
                                                View my orders
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Order summary sidebar */}
                {step !== "success" && (
                    <aside className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="space-y-4 p-6">
                                <h2 className="font-semibold">Order summary</h2>

                                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                    {items.map((i) => (
                                        <div key={i.id} className="flex items-center gap-3">
                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={i.image}
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
                                                    {i.quantity} × ₦{i.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold">
                                                ₦{(i.price * i.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₦{subTotal.toLocaleString()}</span>
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
                                    <div className="flex justify-between text-base font-semibold">
                                        <span>Total</span>
                                        <span>₦{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                )}
            </div>
        </main>
    );
}

function StepBadge({
    label,
    active,
    done,
}: {
    label: string;
    active: boolean;
    done: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                        ? "bg-primary text-primary-foreground"
                        : active
                            ? "bg-primary/15 text-primary ring-2 ring-primary"
                            : "bg-muted text-muted-foreground"
                }`}
            >
                {done ? <CheckCircle2 className="h-4 w-4" /> : null}
                {!done && active}
                {!done && !active ? "·" : null}
            </div>
            <span className={active ? "font-semibold" : "text-muted-foreground"}>{label}</span>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required,
    maxLength,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
            />
        </div>
    );
}

function formatCardNumber(v: string) {
    return v
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
