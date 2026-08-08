"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminStore } from "@/store/admin.store";
import { SafeImage } from "@/components/custom/SafeImage";
import { cn } from "@/lib/utils";

export default function Recommendations({ currentId }: { currentId?: string }) {
    const products = useAdminStore((s) => s.products);
    const current = products.find((p) => p.id === currentId);

    const others = products.filter((p) => p.id !== currentId);
    const sameCategory = current
        ? others.filter((p) => p.categoryId === current.categoryId)
        : [];
    const rest = others.filter((p) => p.categoryId !== current?.categoryId);

    const recs = [...sameCategory, ...rest].slice(0, 4);

    if (recs.length === 0) return null;

    return (
        <section className="mt-24">
            <h2 className="mb-6 text-center text-2xl font-bold">You Might Also Like</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {recs.map((p) => (
                    <Link key={p.id} href={`/product/${p.id}`}>
                        <Card className="group h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
                            <CardContent className="p-3">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                                    <SafeImage
                                        src={p.image}
                                        alt={p.name}
                                        fill
                                        sizes="(min-width: 768px) 25vw, 50vw"
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                                <p className="mt-3 truncate font-medium">{p.name}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        ₦{p.price.toLocaleString()}
                                    </p>
                                    <span
                                        className={cn(
                                            "text-[10px] font-medium",
                                            p.stock <= 0 ? "text-destructive" : "text-primary"
                                        )}
                                    >
                                        {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
