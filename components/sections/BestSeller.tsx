"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "../custom/ProductCard";
import { ProductSkeleton } from "../custom/ProductSkeleton";
import { ProductQuickView } from "../custom/ProductQuickView";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import type { Product, Paged } from "@/types/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function BestSellers() {
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api<{ success?: boolean; data?: Product[] | Paged<Product> }>("/products?sort=popular&limit=8")
      .then((res) => {
        if (!mounted) return;
        let list: Product[] = [];
        if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (res?.data && Array.isArray((res.data as Paged<Product>).data)) {
          list = (res.data as Paged<Product>).data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setBestsellers(list);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            <Star className="h-3.5 w-3.5 fill-current" />
            Customer Favorites
          </span>
          <h2
            style={{ fontFamily: "var(--font-serif)" }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            Our Bestsellers
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Plants our customers love the most - tried, tested, and thriving in
            homes everywhere.
          </p>
          <Link href="/shop" className="inline-block mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full border-dashed border-border hover:border-primary"
            >
              View All Plants
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            [...Array(4)].map((_, idx) => <ProductSkeleton key={idx} />)
          ) : bestsellers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No products available right now.
            </div>
          ) : (
            bestsellers.map((product, index) => (
              <motion.div
                key={product._id || product.slug || index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>

        {/* Quick View Dialog */}
        <ProductQuickView />
      </div>
    </section>
  );
}
