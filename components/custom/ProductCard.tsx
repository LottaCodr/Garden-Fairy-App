"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import { useProductUI } from "@/store/useProductUI";
import { toast } from "@/store/toast.store";
import { SafeImage } from "./SafeImage";
import type { Product } from "@/types/api";
import { getProductImage } from "@/lib/product-helpers";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: Product | (Partial<Product> & { id?: string; name: string; price: number });
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const openQuickView = useProductUI((s) => s.openQuickView);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistStore = useWishlistStore();

  const productId = product._id || (product as { id?: string }).id || "";
  const productSlug = product.slug || productId;
  const isWishlisted = wishlistStore.has(productId);

  const stock = typeof product.stock === "number" ? product.stock : 10;
  const outOfStock = stock <= 0;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const image = getProductImage(product as Product);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (productId) openQuickView(productId);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;
    const res = await wishlistStore.toggle(productId);
    if (res.ok) {
      if (res.action === "removed") {
        toast.info("Removed from wishlist", product.name);
      } else {
        toast.success("Saved to wishlist", product.name);
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;
    const res = await addItem(productId, 1);
    if (res.ok) {
      toast.success("Added to cart", `${product.name} · ₦${product.price.toLocaleString()}`);
    }
  };

  return (
    <Card className={cn("group relative flex flex-col h-full overflow-hidden", className)}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${productSlug}`} className="block w-full h-full">
          <SafeImage
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isPremium && (
            <Badge className="rounded-full px-3 py-1 bg-accent/90 text-accent-foreground text-xs font-medium backdrop-blur-sm">
              Premium
            </Badge>
          )}
          {outOfStock ? (
            <Badge className="rounded-full px-3 py-1 bg-foreground/80 text-background text-xs font-medium backdrop-blur-sm">
              Out of stock
            </Badge>
          ) : stock < 10 ? (
            <Badge className="rounded-full px-3 py-1 bg-destructive/90 text-destructive-foreground text-xs font-medium backdrop-blur-sm">
              Only {stock} left
            </Badge>
          ) : null}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus-within:opacity-100">
          <button
            onClick={handleQuickView}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm shadow-sm hover:bg-background hover:scale-105 transition-all"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110",
            "opacity-0 group-hover:opacity-100 focus:opacity-100",
            isWishlisted
              ? "bg-primary text-primary-foreground opacity-100"
              : "bg-background/90 hover:bg-background text-foreground"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </button>
      </div>

      <CardHeader className="flex flex-col gap-1.5 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {tags.slice(0, 1).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-2 py-0 rounded-full capitalize"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={`/product/${productSlug}`}>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="px-4 pb-2">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between mt-auto px-4 pb-4 pt-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold">
            ₦{product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-xs text-muted-foreground line-through">
              ₦{product.compareAtPrice.toLocaleString()}
            </span>
          ) : null}
        </div>

        {outOfStock ? (
          <Button size="sm" disabled variant="outline">
            Out of stock
          </Button>
        ) : (
          <Button size="sm" onClick={handleAddToCart}>
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
