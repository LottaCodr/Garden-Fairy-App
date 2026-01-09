"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProductUI } from "@/store/useProductUI"

interface Product {
    id: string
    name: string
    price: number
    image: string
    isOnSale?: boolean
    isFeatured?: boolean
}

export function ProductCard({ product }: { product: Product }) {
    const { openQuickView } = useProductUI()

    return (
        <Card className="group relative overflow-hidden transition hover:shadow-lg">
            {/* Badges */}
            <div className="absolute left-3 top-3 z-10 flex gap-2">
                {product.isFeatured && (
                    <Badge variant="secondary">Featured</Badge>
                )}
                {product.isOnSale && (
                    <Badge className="bg-red-500 text-white">Sale</Badge>
                )}
            </div>

            {/* Image */}
            <CardContent className="p-0">
                <div className="relative h-64 w-full overflow-hidden">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                <div className="p-4 space-y-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        ₦{product.price.toLocaleString()}
                    </p>
                </div>
            </CardContent>

            {/* Actions */}
            <CardFooter className="flex gap-2">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => openQuickView(product.id)}
                >
                    Quick View
                </Button>
                <Button className="w-full">Add to Cart</Button>
            </CardFooter>
        </Card>
    )
}
