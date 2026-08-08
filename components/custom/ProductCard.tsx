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
import type { Product } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const openQuickView = useProductUI((s) => s.openQuickView);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const outOfStock = product.stock <= 0;
  const isWishlisted = wishlistIds.includes(product.id);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product.id);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (isWishlisted) {
      toast.info("Removed from wishlist", product.name);
    } else {
      toast.success("Saved to wishlist", product.name);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success("Added to cart", `${product.name} · ₦${product.price.toLocaleString()}`);
  };

  return (
    <Card className={`group relative flex flex-col h-full overflow-hidden ${className || ""}`}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <SafeImage
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        </Link>

        {/* Image Overlay on Hover */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
          ) : product.stock < 10 ? (
            <Badge className="rounded-full px-3 py-1 bg-destructive/90 text-destructive-foreground text-xs font-medium backdrop-blur-sm">
              Only {product.stock} left
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
              ? "bg-primary text-primary-foreground"
              : "bg-background/90 hover:bg-background"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </button>
      </div>

      <CardHeader className="flex flex-col gap-1.5 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {product.tags.slice(0, 1).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-2 py-0 rounded-full capitalize"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={`/product/${product.id}`}>
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
      <CardFooter className="flex items-center justify-between mt-auto">
        <span className="text-lg font-bold">
          ₦{product.price.toLocaleString()}
        </span>

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
