"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/custom/ProductCard";
import { useAdminStore } from "@/store/admin.store";
import { categories } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

export default function ShopPage() {
    const products = useAdminStore((s) => s.products);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>("all");
    const [premiumOnly, setPremiumOnly] = useState(false);
    const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");

    const filtered = useMemo(() => {
        let list = products.filter((p) => {
            if (category !== "all" && p.categoryId !== category) return false;
            if (premiumOnly && !p.isPremium) return false;
            if (query) {
                const q = query.toLowerCase();
                return (
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.tags.some((t) => t.toLowerCase().includes(q))
                );
            }
            return true;
        });

        if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
        if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);

        return list;
    }, [products, query, category, premiumOnly, sort]);

    return (
        <main className="mx-auto max-w-7xl px-4 py-12">
            {/* Header */}
            <div className="mb-8">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
                    Shop
                </p>
                <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                    Browse our collection
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    From lush indoor plants to AI-powered space planners, find what brings
                    your home and garden to life.
                </p>
            </div>

            {/* Controls */}
            <div className="mb-8 grid gap-3 rounded-xl border border-border bg-card/50 p-4 md:grid-cols-[1fr_auto_auto]">
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products..."
                        className="h-10 w-full bg-transparent text-sm focus:outline-none"
                    />
                </div>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
                >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to high</option>
                    <option value="price-desc">Price: High to low</option>
                </select>

                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                    <input
                        type="checkbox"
                        checked={premiumOnly}
                        onChange={(e) => setPremiumOnly(e.target.checked)}
                        className="accent-primary"
                    />
                    Premium only
                </label>
            </div>

            {/* Categories */}
            <div className="mb-8 flex flex-wrap gap-2">
                <CategoryChip
                    active={category === "all"}
                    onClick={() => setCategory("all")}
                    label="All"
                />
                {categories.map((c) => (
                    <CategoryChip
                        key={c.id}
                        active={category === c.id}
                        onClick={() => setCategory(c.id)}
                        label={`${c.icon} ${c.name}`}
                    />
                ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/30 py-20 text-center">
                    <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No products match your filters</p>
                    <button
                        onClick={() => {
                            setQuery("");
                            setCategory("all");
                            setPremiumOnly(false);
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </main>
    );
}

function CategoryChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary hover:text-primary"
            )}
        >
            {label}
        </button>
    );
}
