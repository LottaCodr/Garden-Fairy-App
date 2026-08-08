"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Minus,
    Plus,
    Truck,
    ShieldCheck,
    RotateCcw,
    Star,
    ShoppingCart,
    PackageSearch,
} from "lucide-react";
import Recommendations from "./recommendations";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { useAdminStore } from "@/store/admin.store";
import { products as seedProducts } from "@/lib/data/products";
import { toast } from "@/store/toast.store";
import { SafeImage } from "@/components/custom/SafeImage";

const FALLBACK_IMAGES = [
    "/images/plants/1.jpg",
    "/images/plants/2.jpg",
    "/images/plants/3.jpg",
    "/images/plants/4.jpg",
];

const CITIES: Record<string, { areas: string[]; fee: number; eta: string }> = {
    Lagos: {
        areas: ["Lekki", "Victoria Island", "Ikeja", "Yaba", "Surulere", "Ajah"],
        fee: 3500,
        eta: "1–2 days",
    },
    Abuja: {
        areas: ["Wuse", "Garki", "Maitama", "Gwarinpa"],
        fee: 4000,
        eta: "2–3 days",
    },
    "Port Harcourt": {
        areas: ["GRA", "Trans Amadi", "Rumuola"],
        fee: 4500,
        eta: "2–4 days",
    },
    Ibadan: {
        areas: ["Bodija", "Ring Road", "Agodi"],
        fee: 4000,
        eta: "2–3 days",
    },
};

export default function ProductDetailPage({ productId }: { productId: string }) {
    const adminProducts = useAdminStore((s) => s.products);
    const addItem = useCartStore((s) => s.addItem);
    const decrementItem = useCartStore((s) => s.decrementItem);
    const items = useCartStore((s) => s.items);

    const product = useMemo(
        () =>
            adminProducts.find((p) => p.id === productId) ??
            seedProducts.find((p) => p.id === productId) ??
            null,
        [adminProducts, productId]
    );

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large">("medium");
    const [state, setState] = useState("Lagos");
    const [area, setArea] = useState(CITIES.Lagos.areas[0]);

    if (!product) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-24 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <PackageSearch className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">Product not found</h1>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        We couldn&apos;t find that product. It may have been removed or the
                        link may be incorrect.
                    </p>
                    <Link href="/shop">
                        <Button>
                            Browse the shop
                            <ShoppingCart className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </main>
        );
    }

    const p = product; // narrowed reference for closures

    const cartItem = items.find((i) => i.id === p.id);
    const quantity = cartItem?.quantity ?? 0;
    const stock = p.stock;
    const outOfStock = stock <= 0;

    const images = [p.image, ...FALLBACK_IMAGES.filter((i) => i !== p.image)].slice(0, 4);

    const city = CITIES[state] ?? CITIES.Lagos;
    const deliveryFee = city.fee;
    const deliveryEta = city.eta;

    function handleAdd() {
        addItem({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
        });
        toast.success("Added to cart", `${p.name} · ₦${p.price.toLocaleString()}`);
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-10">
            {/* Breadcrumbs */}
            <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-primary">Home</Link> /{" "}
                <Link href="/shop" className="hover:text-primary">Shop</Link> /{" "}
                <span className="text-foreground">{p.name}</span>
            </nav>

            <section className="grid gap-12 lg:grid-cols-2">
                {/* Image Gallery */}
                <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                >
                    <Card className="overflow-hidden">
                        <div className="relative aspect-square w-full">
                            <SafeImage
                                src={images[activeImage]}
                                alt={p.name}
                                fill
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                className="object-cover"
                            />
                            {product.isPremium ? (
                                <Badge className="absolute top-3 left-3">Premium</Badge>
                            ) : null}
                        </div>
                    </Card>

                    <div className="grid grid-cols-4 gap-3">
                        {images.map((src, i) => (
                            <Card
                                onClick={() => setActiveImage(i)}
                                key={src + i}
                                className={cn(
                                    "cursor-pointer overflow-hidden transition-all",
                                    activeImage === i
                                        ? "ring-2 ring-primary"
                                        : "border-muted hover:border-primary"
                                )}
                            >
                                <div className="relative aspect-square w-full">
                                    <SafeImage
                                        src={src}
                                        alt={`${p.name} thumbnail ${i + 1}`}
                                        fill
                                        sizes="120px"
                                        className="object-cover"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                            {product.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="capitalize">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                            {p.name}
                        </h1>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-0.5 text-accent">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-3.5 w-3.5",
                                            i < 4 ? "fill-current" : "fill-current/30"
                                        )}
                                    />
                                ))}
                            </div>
                            <span>(124 reviews)</span>
                            <span>·</span>
                            <span className={cn(outOfStock ? "text-destructive" : "text-primary")}>
                                {outOfStock ? "Out of stock" : `${stock} in stock`}
                            </span>
                        </div>
                    </div>

                    <div className="text-3xl font-bold">
                        ₦{product.price.toLocaleString()}
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Size</p>
                        <Tabs
                            value={selectedSize}
                            onValueChange={(v) => setSelectedSize(v as typeof selectedSize)}
                        >
                            <TabsList className="grid w-full max-w-xs grid-cols-3">
                                <TabsTrigger value="small">Small</TabsTrigger>
                                <TabsTrigger value="medium">Medium</TabsTrigger>
                                <TabsTrigger value="large">Large</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Quantity + CTA */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center rounded-md border border-input">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={quantity === 0}
                                onClick={() => {
                                    const wasLast = quantity === 1;
                                    decrementItem(p.id);
                                    if (wasLast) {
                                        toast.info("Removed from cart", p.name);
                                    }
                                }}
                                aria-label="Decrease quantity"
                            >
                                <Minus />
                            </Button>
                            <span className="min-w-10 px-4 text-center text-sm">
                                {quantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={outOfStock || quantity >= stock}
                                onClick={handleAdd}
                                aria-label="Increase quantity"
                            >
                                <Plus />
                            </Button>
                        </div>
                        <Button
                            size="lg"
                            className="flex-1 min-w-[180px]"
                            onClick={handleAdd}
                            disabled={outOfStock}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {outOfStock ? "Out of stock" : "Add to Cart"}
                        </Button>
                    </div>
                    {quantity > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {quantity} in your cart ·{" "}
                            <Link href="/cart" className="font-medium text-primary hover:underline">
                                view cart
                            </Link>
                        </p>
                    )}

                    {/* Delivery */}
                    <Card>
                        <CardContent className="space-y-3 pt-6">
                            <p className="font-semibold">Estimate Your Delivery</p>
                            <div className="grid grid-cols-2 gap-3 text-foreground">
                                <select
                                    value={state}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        setState(next);
                                        setArea(CITIES[next]?.areas[0] ?? "");
                                    }}
                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                >
                                    {Object.keys(CITIES).map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                                <select
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                >
                                    {city.areas.map((a) => (
                                        <option key={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                            <Badge variant="secondary" className="w-full justify-center py-2">
                                Estimated Fee: ₦{deliveryFee.toLocaleString()} · {deliveryEta}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-md border border-border bg-card p-3">
                            <Truck className="mx-auto mb-1 h-4 w-4 text-primary" />
                            <p className="text-[11px] font-medium">Free over ₦50k</p>
                        </div>
                        <div className="rounded-md border border-border bg-card p-3">
                            <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-primary" />
                            <p className="text-[11px] font-medium">7-day guarantee</p>
                        </div>
                        <div className="rounded-md border border-border bg-card p-3">
                            <RotateCcw className="mx-auto mb-1 h-4 w-4 text-primary" />
                            <p className="text-[11px] font-medium">Easy returns</p>
                        </div>
                    </div>

                    {/* Care */}
                    <div className="space-y-4">
                        <Separator />
                        <h3 className="font-semibold">Care Instructions</h3>
                        <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
                            <div>🌤 Bright, indirect light</div>
                            <div>💧 Water every 1–2 weeks</div>
                            <div>🌱 High humidity</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Separator />
                        <h3 className="font-semibold">About this product</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Recommendations */}
            <Recommendations currentId={p.id} />
        </main>
    );
}
