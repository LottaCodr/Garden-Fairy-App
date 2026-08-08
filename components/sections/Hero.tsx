"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden bg-background"
      aria-label="Hero section"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/30" />

        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="container-2xl relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-12 lg:grid-cols-2 lg:items-center"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Fresh Arrivals Weekly
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="text-balance text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Bring Nature{" "}
              <span className="text-primary">Home</span>
              <br />
              with Confidence
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
              style={{ maxWidth: "560px" }}
            >
              Handpicked plants, expert care guides, and a community that loves
              greenery as much as you do. Your urban jungle starts here.
            </motion.p>

            {/* Search */}
            <motion.form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search plants, care tips, collections..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/shop">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                >
                  Shop Plants
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/shop?category=garden">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-border hover:border-primary hover:text-primary"
                >
                  Explore Collections
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="flex flex-wrap items-center gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                  ✓
                </span>
                Free shipping over ₦50,000
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                  ✓
                </span>
                7-day return guarantee
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Leaf className="h-4 w-4 text-primary" />
                Eco-friendly packaging
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            variants={itemVariants}
            className="relative hidden lg:block"
          >
            {/* Main image card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-primary/10 ring-1 ring-border">
                <Image
                  src="/images/hero.jpg"
                  alt="Beautiful indoor plants collection"
                  width={800}
                  height={1000}
                  priority
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute -bottom-6 -left-8 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-lg backdrop-blur"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Leaf className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">10,000+ happy homes</p>
                  <p className="text-xs text-muted-foreground">thriving with our plants</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
