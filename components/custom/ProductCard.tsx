"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart.store";
import { ProductQuickView } from "./ProductQuickView";
import { useProductUI } from "@/store/useProductUI";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
}

export function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const openQuickView = useProductUI((s) => s.openQuickView);
    const router = useRouter()


    const handleRedirectToDetailsPage = () => {
        console.log("/productPage")
        router.push("/product")
        
    }

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col h-full">
            {/* Full Image */}
            <div
                className="relative w-full flex-1 cursor-pointer min-h-[224px]" // h-56 = 224px
                style={{ minHeight: 224 }}
                onClick={() => openQuickView(product.id)}
            >
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="100vw"
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    priority={true}
                />
            </div>

            {/* Content */}
            <CardContent onClick={handleRedirectToDetailsPage} className="space-y-2 pt-4">
                <h3 className="text-sm font-semibold leading-tight">
                    {product.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
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
                    Add to cart
                </Button>
            </CardFooter>
        </Card>
    );
}
