"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Leaf, ShoppingCart } from "lucide-react";
import { useProductUI } from "@/store/useProductUI";
import type { Product } from "@/lib/data/products";

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const openQuickView = useProductUI((s) => s.openQuickView);
  const addItem = useCartStore((s) => s.addItem);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product.id);
  };

  return (
    <Card className={`group relative flex flex-col h-full overflow-hidden ${className || ""}`}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image
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
          {product.stock < 10 && product.stock > 0 && (
            <Badge className="rounded-full px-3 py-1 bg-destructive/90 text-destructive-foreground text-xs font-medium backdrop-blur-sm">
              Only {product.stock} left
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickView}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm shadow-sm hover:bg-background hover:scale-105 transition-all"
            aria-label="Quick view"
          >
            <ShoppingCart className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Favorite Button */}
        <button
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Leaf className="h-4 w-4 text-foreground opacity-70" />
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
            <CardFooter className="flex items-center justify-between">
                <span className="text-lg font-bold">
                    ₦{product.price}
                </span>

                <Button
                    size="sm"
                    onClick={() =>
                        addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                        })
                    }
                >
                    Add to Cart
                </Button>
      </CardFooter>
    </Card>
  );
}
