

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus } from "lucide-react";
import Recommendations from "./recommendations";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { Product } from "@/components/custom/ProductCard";

const images = [
    "/monstera-main.png",
    "/monstera-1.png",
    "/monstera-2.png",
    "/monstera-3.png",
    // "/monstera-4.png",
];


export default function ProductDetailPage({ product }: { product: Product }) {
    const [activeImage, setActiveImage] = useState(images[0])
    const addItem = useCartStore((add) => add.addItem);
    const removeItem = useCartStore((remove) => remove.removeItem)


    return (
        <main className="mx-auto max-w-7xl px-4 py-10">
            {/* Breadcrumbs */}
            <nav className="mb-8 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Home</Link> /{" "}
                <Link href="/shop" className="hover:text-primary">Shop All</Link> /{" "}
                <span className="text-foreground">Monstera Deliciosa</span>
            </nav>

            <section className="grid gap-12 lg:grid-cols-2">
                {/* Image Gallery */}
                <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                >
                    <Card className="overflow-hidden">
                        <Image
                            src={activeImage}
                            alt={activeImage}
                            width={700}
                            height={700}
                            className="aspect-square object-cover"
                        />
                    </Card>

                    <div className="grid grid-cols-4 gap-3">
                        {images.map((selected, i) => (
                            <Card
                                onClick={() => setActiveImage(selected)}
                                key={selected}
                                className={cn(
                                    "cursor-pointer overflow-hidden transition-all",
                                    activeImage === selected
                                        ? "ring-2 ring-primary"
                                        : "border-muted hover:border-primary"
                                )}
                            >
                                <Image
                                    src={selected}
                                    alt={`Monstera thumbnail ${i + 1}`}
                                    width={200}
                                    height={200}
                                    className="aspect-square object-cover"
                                />
                                {/* <span
                                    className={cn(
                                        "absolute inset-0 rounded-md ring-2 ring-offset-2",
                                        selected ? "ring-black" : "ring-transparent"
                                    )}
                                /> */}
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Monstera Deliciosa</h1>
                        <p className="text-muted-foreground">Swiss Cheese Plant</p>
                    </div>

                    <div className="text-3xl font-bold">₦15,000</div>

                    {/* Size Selector */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Size</p>
                        <Tabs defaultValue="small">
                            <TabsList className="grid grid-cols-3">
                                <TabsTrigger value="small">Small</TabsTrigger>
                                <TabsTrigger value="medium">Medium</TabsTrigger>
                                <TabsTrigger value="large">Large</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Quantity + CTA */}
                    <div className="flex gap-4">
                        <div className="flex items-center rounded-md border">
                            <Button variant="ghost" onClick={() => removeItem(
                                product.id
                            )} size="icon"><Minus /></Button>
                            <span className="px-4">1</span>
                            <Button onClick={() => addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                            })} variant="ghost" size="icon"><Plus /></Button>
                        </div>
                        <Button onClick={() => addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                        })} size="lg" className="flex-1">Add to Cart</Button>
                    </div>

                    {/* Delivery */}
                    <Card>
                        <CardContent className="space-y-3 pt-6">
                            <p className="font-semibold">Estimate Your Delivery</p>
                            <div className="grid grid-cols-2 text-black gap-3">
                                <select className="input">Select State</select>
                                <select className="input">Select City</select>
                            </div>
                            <Badge variant="secondary" className="w-full justify-center">
                                Estimated Fee: ₦3,500
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Care */}
                    <div className="space-y-4">
                        <Separator />
                        <h3 className="font-semibold">Care Instructions</h3>
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>🌤 Bright, indirect light</div>
                            <div>💧 Water every 1–2 weeks</div>
                            <div>🌱 High humidity</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Separator />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Native to southern Mexico, Monstera Deliciosa is known for its iconic
                            split leaves. A bold statement plant that’s easy to maintain and
                            improves air quality.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Recommendations */}
            <Recommendations />
        </main>
    );
}
