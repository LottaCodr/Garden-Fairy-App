"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminStore } from "@/store/admin.store";

export default function Recommendations({ currentId }: { currentId?: string }) {
    const products = useAdminStore((s) => s.products);
    const recs = products.filter((p) => p.id !== currentId).slice(0, 4);

    return (
        <section className="mt-24">
            <h2 className="mb-6 text-center text-2xl font-bold">You Might Also Like</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {recs.map((p) => (
                    <Link key={p.id} href={`/product/${p.id}`}>
                        <Card className="group h-full cursor-pointer overflow-hidden">
                            <CardContent className="p-3">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                                    <Image
                                        src={p.image}
                                        alt={p.name}
                                        fill
                                        sizes="(min-width: 768px) 25vw, 50vw"
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                                <p className="mt-3 truncate font-medium">{p.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    ₦{p.price.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}
