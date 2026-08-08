"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, Loader2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist.store";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { ProductCard } from "@/components/custom/ProductCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast.store";
import type { Product } from "@/types/api";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useWishlistStore((s) => s.items);
  const loading = useWishlistStore((s) => s.isLoading);
  const fetchWishlist = useWishlistStore((s) => s.fetch);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  if (!hydrated) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to save products across all your devices and keep track of your plant favorites.
          </p>
          <div className="flex gap-3 pt-2">
            <Link href="/signin?redirect=/wishlist">
              <Button>
                Sign in to save items
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline">Browse Shop</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const validEntries = items.filter((e) => e.product && (e.product as unknown as Product).status !== "archived");

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
            {validEntries.length > 0
              ? `${validEntries.length} item${validEntries.length !== 1 ? "s" : ""} waiting for you`
              : "Products you love, saved in your personal garden."}
          </p>
        </div>

        {validEntries.length > 0 ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                for (const entry of validEntries) {
                  const pid = entry.product._id || (entry.product as unknown as { id?: string }).id;
                  if (pid) {
                    await addItem(pid, 1);
                  }
                }
                toast.success(
                  "Added to cart",
                  `${validEntries.length} item${validEntries.length !== 1 ? "s" : ""} moved to your cart`,
                );
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

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : validEntries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card/30 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Your wishlist is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the heart icon on any product to save it here.
            </p>
          </div>
          <Link href="/shop">
            <Button>Discover products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {validEntries.map((entry) => {
            const p = entry.product as unknown as Product;
            const productId = p._id || (p as { id?: string }).id || "";
            return (
              <div key={entry._id || productId} className="relative">
                <ProductCard product={p} />
                {productId ? (
                  <button
                    onClick={() => {
                      void remove(productId);
                      toast.info("Removed from wishlist", p.name);
                    }}
                    aria-label={`Remove ${p.name} from wishlist`}
                    className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-background backdrop-blur transition-colors hover:bg-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
