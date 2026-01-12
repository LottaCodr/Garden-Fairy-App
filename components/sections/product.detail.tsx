// Senior-level Product Details Page
// Stack: Next.js App Router + Tailwind + shadcn/ui + Framer Motion

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

export default function ProductDetailPage() {
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                >
                    <Card className="overflow-hidden">
                        <Image
                            src="/monstera-main.png"
                            alt="Monstera Deliciosa"
                            width={700}
                            height={700}
                            className="aspect-square object-cover"
                        />
                    </Card>

                    <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Card
                                key={i}
                                className="cursor-pointer overflow-hidden border-muted hover:border-primary"
                            >
                                <Image
                                    src={`/monstera-${i}.png`}
                                    alt="Monstera thumbnail"
                                    width={200}
                                    height={200}
                                    className="aspect-square object-cover"
                                />
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
                            <Button variant="ghost" size="icon"><Minus /></Button>
                            <span className="px-4">1</span>
                            <Button variant="ghost" size="icon"><Plus /></Button>
                        </div>
                        <Button size="lg" className="flex-1">Add to Cart</Button>
                    </div>

                    {/* Delivery */}
                    <Card>
                        <CardContent className="space-y-3 pt-6">
                            <p className="font-semibold">Estimate Your Delivery</p>
                            <div className="grid grid-cols-2 gap-3">
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
            <section className="mt-24">
                <h2 className="mb-6 text-center text-2xl font-bold">You Might Also Like</h2>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                    {["Fiddle Leaf Fig", "Snake Plant", "ZZ Plant", "Pothos"].map((p) => (
                        <Card key={p} className="group cursor-pointer">
                            <CardContent className="p-3">
                                <div className="overflow-hidden rounded-md">
                                    <Image
                                        src={`/recommend-${p}.png`}
                                        alt={p}
                                        width={400}
                                        height={500}
                                        className="aspect-[4/5] object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                                <p className="mt-3 font-medium">{p}</p>
                                <p className="text-sm text-muted-foreground">₦12,000</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </main>
    );
}
