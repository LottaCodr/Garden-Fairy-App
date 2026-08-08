"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Star, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductUI } from "@/store/useProductUI";
import { useAdminStore } from "@/store/admin.store";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/store/toast.store";
import { SafeImage } from "./SafeImage";

export function ProductQuickView() {
    const { quickViewProductId, closeQuickView } = useProductUI();
    const products = useAdminStore((s) => s.products);
    const addItem = useCartStore((s) => s.addItem);
    const router = useRouter();
    const [qty, setQty] = useState(1);

    const product = products.find((p) => p.id === quickViewProductId);

    if (!product) return null;

    const p = product; // narrowed reference for closures
    const outOfStock = p.stock <= 0;

    function handleAdd() {
        addItem({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
        });
        toast.success(
            "Added to cart",
            `${p.name} · ${qty} × ₦${p.price.toLocaleString()}`
        );
        closeQuickView();
    }

    return (
        <Dialog
            open={!!quickViewProductId}
            onOpenChange={(open) => {
                if (!open) {
                    setQty(1);
                    closeQuickView();
                }
            }}
        >
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
                <div className="grid md:grid-cols-2">
                    {/* Image */}
                    <div className="relative h-72 md:h-full min-h-72">
                        <SafeImage
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col p-6 space-y-4">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                {p.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="capitalize text-[10px]"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                                {p.isPremium && (
                                    <Badge className="text-[10px]">Premium</Badge>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                {p.name}
                            </h2>

                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-0.5 text-accent">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <Star
                                            key={i}
                                            className="h-3.5 w-3.5 fill-current"
                                        />
                                    ))}
                                </span>
                                <span>·</span>
                                <span className={outOfStock ? "text-destructive font-medium" : "text-primary font-medium"}>
                                    {outOfStock
                                        ? "Out of stock"
                                        : p.stock < 10
                                            ? `Only ${p.stock} left`
                                            : `${p.stock} in stock`}
                                </span>
                            </div>
                        </div>

                        <p className="text-2xl font-bold">
                            ₦{p.price.toLocaleString()}
                        </p>

                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                            {p.description}
                        </p>

                        {/* Quantity */}
                        {!outOfStock && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">Quantity</span>
                                <div className="flex items-center rounded-md border border-input">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        disabled={qty <= 1}
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="min-w-10 px-2 text-center text-sm font-medium">
                                        {qty}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        disabled={qty >= p.stock}
                                        onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                className="flex-1"
                                disabled={outOfStock}
                                onClick={handleAdd}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {outOfStock ? "Out of stock" : "Add to Cart"}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    closeQuickView();
                                    router.push(`/product/${p.id}`);
                                }}
                            >
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
