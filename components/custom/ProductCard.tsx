"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { ProductQuickView } from "./ProductQuickView";
import { useProductUI } from "@/store/useProductUI";

interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
}

export function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const openQuickView = useProductUI((s)=> s.openQuickView)
    

    return (
        <Card  className="overflow-hidden transition-shadow hover:shadow-lg">
            {/* Image */}
            <div className="relative h-56 w-full overflow-hidden" onClick={() => openQuickView(product.id)}>
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                />
            </div>

            {/* Content */}
            <CardContent className="space-y-2 pt-4">
                <h3 className="text-sm font-semibold leading-tight">
                    {product.name}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                </p>
            </CardContent>

            {/* Footer */}
            <CardFooter className="flex items-center justify-between">
                <span className="text-sm font-bold">
                    ₦{product.price}
                </span>

                <Button
                    size="sm"
                    onClick={(e) =>
                        // e.stopPropagation();
                        addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                        })
                    }
                >
                    Add to cart
                </Button>
            </CardFooter>
        </Card>
    );
}
