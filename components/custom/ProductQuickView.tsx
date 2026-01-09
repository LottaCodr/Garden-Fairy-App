"use client"

import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useProductUI } from "@/store/useProductUI"
import { products } from "@/lib/data/products"

export function ProductQuickView() {
    const { quickViewProductId, closeQuickView } = useProductUI()

    const product = products.find(p => p.id === quickViewProductId)

    if (!product) return null

    return (
        <Dialog open={!!quickViewProductId} onOpenChange={closeQuickView}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
                <div className="grid md:grid-cols-2">
                    {/* Image */}
                    <div className="relative h-96">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-semibold">{product.name}</h2>
                        <p className="text-muted-foreground">
                            ₦{product.price.toLocaleString()}
                        </p>

                        <p className="text-sm">
                            This is a premium quality product designed for modern lifestyles.
                        </p>

                        <div className="flex gap-3 pt-4">
                            <Button className="w-full">Add to Cart</Button>
                            <Button variant="outline" className="w-full">
                                View Details
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
