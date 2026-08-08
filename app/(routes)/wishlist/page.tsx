"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useAdminStore } from "@/store/admin.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { ProductCard } from "@/components/custom/ProductCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast.store";

export default function WishlistPage() {
    const hydrated = useHydrated();
    const ids = useWishlistStore((s) => s.ids);
    const remove = useWishlistStore((s) => s.remove);
    const clear = useWishlistStore((s) => s.clear);
    const products = useAdminStore((s) => s.products);
    const addItem = useCartStore((s) => s.addItem);

    const wishlistProducts = products.filter((p) => ids.includes(p.id));

    return (
        <main className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
                        Saved for later
                    </p>
                    <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                        Your Wishlist
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {hydrated && wishlistProducts.length > 0
                            ? `${wishlistProducts.length} item${wishlistProducts.length !== 1 ? "s" : ""} waiting for you`
                            : "Products you love, in one place."}
                    </p>
                </div>

                {hydrated && wishlistProducts.length > 0 ? (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                wishlistProducts.forEach((p) => {
                                    addItem({
                                        id: p.id,
                                        name: p.name,
                                        price: p.price,
                                        image: p.image,
                                    });
                                });
                                toast.success(
                                    "Added to cart",
                                    `${wishlistProducts.length} item${wishlistProducts.length !== 1 ? "s" : ""} moved to your cart`
                                );
                                clear();
                            }}
                        >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Add all to cart
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                                clear();
                                toast.info("Wishlist cleared");
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                ) : null}
            </div>

            {!hydrated ? null : wishlistProducts.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/30 py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Your wishlist is empty</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Tap the heart on any product to save it here.
                        </p>
                    </div>
                    <Link href="/shop">
                        <Button>Discover products</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlistProducts.map((p) => (
                        <div key={p.id} className="relative">
                            <ProductCard product={p} />
                            <button
                                onClick={() => {
                                    remove(p.id);
                                    toast.info("Removed from wishlist", p.name);
                                }}
                                aria-label={`Remove ${p.name} from wishlist`}
                                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-background backdrop-blur transition-colors hover:bg-destructive"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
