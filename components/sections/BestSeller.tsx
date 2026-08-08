"use client";

import { products } from "@/lib/data/products";
import { ProductCard } from "../custom/ProductCard";
import { ProductSkeleton } from "../custom/ProductSkeleton";
import { ProductQuickView } from "../custom/ProductQuickView";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function BestSellers() {
  const isLoading = false;

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
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 rounded-full border-dashed border-border hover:border-primary"
          >
            View All Plants
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            [...Array(4)].map((_, idx) => <ProductSkeleton key={idx} />)
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id}
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
