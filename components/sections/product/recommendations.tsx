"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/custom/SafeImage";
import { api } from "@/lib/api";
import type { Product, Paged } from "@/types/api";
import { getProductImage } from "@/lib/product-helpers";
import { cn } from "@/lib/utils";

export default function Recommendations({
  currentId,
  categoryId,
}: {
  currentId?: string;
  categoryId?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    const catQuery = categoryId ? `&category=${categoryId}` : "";
    api<{ success?: boolean; data?: Product[] | Paged<Product> }>(
      `/products?limit=8${catQuery}`,
    )
      .then((res) => {
        if (!active) return;
        let list: Product[] = [];
        if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (res?.data && Array.isArray((res.data as Paged<Product>).data)) {
          list = (res.data as Paged<Product>).data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setProducts(list.filter((p) => p._id !== currentId && p.slug !== currentId).slice(0, 4));
      })
      .catch(() => {
        if (active) setProducts([]);
      });

    return () => {
      active = false;
    };
  }, [currentId, categoryId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-24">
      <h2 className="mb-6 text-center text-2xl font-bold">You Might Also Like</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p) => {
          const img = getProductImage(p);
          const slugOrId = p.slug || p._id;
          return (
            <Link key={p._id || p.slug} href={`/product/${slugOrId}`}>
              <Card className="group h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                    <SafeImage
                      src={img}
                      alt={p.name}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 truncate font-medium">{p.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground">
                      ₦{p.price.toLocaleString()}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        p.stock <= 0 ? "text-destructive" : "text-primary",
                      )}
                    >
                      {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
