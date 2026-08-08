"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus, Truck, ShieldCheck, RotateCcw, Star } from "lucide-react";
import Recommendations from "./recommendations";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { useAdminStore } from "@/store/admin.store";
import type { Product } from "@/lib/data/products";

const FALLBACK_IMAGES = ["/images/plants/1.jpg", "/images/plants/2.jpg", "/images/plants/3.jpg", "/images/plants/4.jpg"];

export default function ProductDetailPage({ product }: { product: Product }) {
    const products = useAdminStore((s) => s.products);
    const addItem = useCartStore((s) => s.addItem);
    const items = useCartStore((s) => s.items);

    const images = [product.image, ...FALLBACK_IMAGES.filter((i) => i !== product.image)].slice(0, 4);
    const [activeImage, setActiveImage] = useState(images[0]);
    const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large">("medium");
    const cartItem = items.find((i) => i.id === product.id);
    const quantity = cartItem?.quantity ?? 0;

    const live = products.find((p) => p.id === product.id);
    const stock = live?.stock ?? 0;

    return (
        <main className="mx-auto max-w-7xl px-4 py-10">
            {/* Breadcrumbs */}
            <nav className="mb-8 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Home</Link> /{" "}
                <Link href="/shop" className="hover:text-primary">Shop</Link> /{" "}
                <span className="text-foreground">{product.name}</span>
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
                            <Image
                                src={activeImage}
                                alt={product.name}
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
                                onClick={() => setActiveImage(src)}
                                key={src + i}
                                className={cn(
                                    "cursor-pointer overflow-hidden transition-all",
                                    activeImage === src
                                        ? "ring-2 ring-primary"
                                        : "border-muted hover:border-primary"
                                )}
                            >
                                <div className="relative aspect-square w-full">
                                    <Image
                                        src={src}
                                        alt={`${product.name} thumbnail ${i + 1}`}
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
                            {product.name}
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
                            <span className={cn(stock > 0 ? "text-primary" : "text-destructive")}>
                                {stock > 0 ? `${stock} in stock` : "Out of stock"}
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
                                    if (quantity > 1) {
                                        addItem({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.image,
                                        });
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
                                onClick={() =>
                                    addItem({
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.image,
                                    })
                                }
                                aria-label="Increase quantity"
                            >
                                <Plus />
                            </Button>
                        </div>
                        <Button
                            size="lg"
                            className="flex-1 min-w-[180px]"
                            onClick={() =>
                                addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                })
                            }
                            disabled={stock === 0}
                        >
                            {stock === 0 ? "Out of stock" : "Add to Cart"}
                        </Button>
                    </div>

                    {/* Delivery */}
                    <Card>
                        <CardContent className="space-y-3 pt-6">
                            <p className="font-semibold">Estimate Your Delivery</p>
                            <div className="grid grid-cols-2 gap-3 text-foreground">
                                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                    <option>Lagos</option>
                                    <option>Abuja</option>
                                    <option>Port Harcourt</option>
                                    <option>Ibadan</option>
                                </select>
                                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                    <option>Lekki</option>
                                    <option>Victoria Island</option>
                                    <option>Ikeja</option>
                                    <option>Yaba</option>
                                </select>
                            </div>
                            <Badge variant="secondary" className="w-full justify-center py-2">
                                Estimated Fee: ₦3,500 · 2-3 days
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
            <Recommendations currentId={product.id} />
        </main>
    );
}
