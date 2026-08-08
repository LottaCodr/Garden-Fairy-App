"use client";

import { Suspense, useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/custom/ProductCard";
import { ProductQuickView } from "@/components/custom/ProductQuickView";
import { CategoryIcon } from "@/lib/category-icons";
import { api } from "@/lib/api";
import type { Category, Product, Paged } from "@/types/api";
import { cn } from "@/lib/utils";

function ShopPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "all";
  const urlSort = searchParams.get("sort") ?? "newest";
  const urlPage = parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const urlPremium = searchParams.get("premium") === "1";

  const [query, setQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [premiumOnly, setPremiumOnly] = useState(urlPremium);
  const [sort, setSort] = useState(urlSort);
  const [page, setPage] = useState(urlPage);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch categories once on mount
  useEffect(() => {
    api<{ success?: boolean; data?: Category[] }>("/categories")
      .then((res) => {
        if (Array.isArray(res?.data)) {
          setCategories(res.data);
        } else if (Array.isArray(res)) {
          setCategories(res);
        }
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Update query string in URL
  const updateUrl = useCallback(
    (newParams: {
      q?: string;
      category?: string;
      premium?: boolean;
      sort?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams();
      const nextQ = newParams.q !== undefined ? newParams.q : query;
      const nextCat = newParams.category !== undefined ? newParams.category : selectedCategory;
      const nextPrem = newParams.premium !== undefined ? newParams.premium : premiumOnly;
      const nextSort = newParams.sort !== undefined ? newParams.sort : sort;
      const nextPage = newParams.page !== undefined ? newParams.page : page;

      if (nextQ.trim()) params.set("q", nextQ.trim());
      if (nextCat && nextCat !== "all") params.set("category", nextCat);
      if (nextPrem) params.set("premium", "1");
      if (nextSort && nextSort !== "newest") params.set("sort", nextSort);
      if (nextPage > 1) params.set("page", nextPage.toString());

      const qs = params.toString();
      startTransition(() => {
        router.replace(`/shop${qs ? `?${qs}` : ""}`);
      });
    },
    [router, query, selectedCategory, premiumOnly, sort, page],
  );

  // Fetch products from server whenever filters change
  useEffect(() => {
    let active = true;

    const queryTimer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());

      // If category is a slug or _id, check matching category
      if (selectedCategory && selectedCategory !== "all") {
        const found = categories.find(
          (c) => c._id === selectedCategory || c.slug === selectedCategory,
        );
        params.set("category", found ? found._id : selectedCategory);
      }

      if (premiumOnly) params.set("premium", "1");
      if (sort && sort !== "newest") params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "12");

      api<{
        success?: boolean;
        data?: Product[] | Paged<Product>;
        total?: number;
        page?: number;
        pages?: number;
      }>(`/products?${params.toString()}`)
        .then((res) => {
          if (!active) return;
          let list: Product[] = [];
          let resTotal = 0;
          let resPages = 1;

          if (res?.data && Array.isArray((res.data as Paged<Product>).data)) {
            const paged = res.data as Paged<Product>;
            list = paged.data;
            resTotal = paged.total;
            resPages = paged.pages;
          } else if (Array.isArray(res?.data)) {
            list = res.data;
            resTotal = res.total ?? list.length;
            resPages = res.pages ?? 1;
          } else if (Array.isArray(res)) {
            list = res;
            resTotal = list.length;
          }

          setProducts(list);
          setTotal(resTotal);
          setTotalPages(resPages || 1);
          setLoading(false);
        })
        .catch(() => {
          if (active) {
            setProducts([]);
            setTotal(0);
            setTotalPages(1);
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(queryTimer);
    };
  }, [query, selectedCategory, premiumOnly, sort, page, categories]);

  const hasActiveFilters =
    query !== "" ||
    selectedCategory !== "all" ||
    premiumOnly ||
    sort !== "newest";

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setPremiumOnly(false);
    setSort("newest");
    setPage(1);
    updateUrl({ q: "", category: "all", premium: false, sort: "newest", page: 1 });
  };

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
      <div className="mb-6 grid gap-3 rounded-xl border border-border bg-card/50 p-4 md:grid-cols-[1fr_auto_auto]">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setPage(1);
              setLoading(true);
              updateUrl({ q: val, page: 1 });
            }}
            placeholder="Search products..."
            className="h-10 w-full bg-transparent text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setPage(1);
                setLoading(true);
                updateUrl({ q: "", page: 1 });
              }}
              aria-label="Clear search"
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            const nextSort = e.target.value;
            setSort(nextSort);
            setPage(1);
            setLoading(true);
            updateUrl({ sort: nextSort, page: 1 });
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Sort products"
        >
          <option value="newest">Newest arrivals</option>
          <option value="popular">Most popular</option>
          <option value="rating">Highest rated</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>

        {/* Premium Toggle */}
        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
          <input
            type="checkbox"
            checked={premiumOnly}
            onChange={(e) => {
              const nextPrem = e.target.checked;
              setPremiumOnly(nextPrem);
              setPage(1);
              setLoading(true);
              updateUrl({ premium: nextPrem, page: 1 });
            }}
            className="accent-primary"
          />
          Premium only
        </label>
      </div>

      {/* Category chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <CategoryChip
          active={selectedCategory === "all"}
          onClick={() => {
            setSelectedCategory("all");
            setPage(1);
            setLoading(true);
            updateUrl({ category: "all", page: 1 });
          }}
          label="All"
        />
        {categories.map((c) => {
          const isSelected = selectedCategory === c._id || selectedCategory === c.slug;
          return (
            <CategoryChip
              key={c._id}
              active={isSelected}
              onClick={() => {
                const nextCat = isSelected ? "all" : c._id;
                setSelectedCategory(nextCat);
                setPage(1);
                setLoading(true);
                updateUrl({ category: nextCat, page: 1 });
              }}
              icon={<CategoryIcon name={c.icon} className="h-3.5 w-3.5 mr-1 inline" />}
              label={c.name}
            />
          );
        })}
      </div>

      {/* Result Count & Loading State */}
      <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading catalog…
            </span>
          ) : (
            `${total} product${total !== 1 ? "s" : ""}${query ? ` for “${query}”` : ""}`
          )}
        </span>
        {hasActiveFilters && !loading && (
          <button
            onClick={clearFilters}
            className="text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-xl border border-border bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/30 py-20 text-center">
          <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No products match your filters</p>
          <p className="text-xs text-muted-foreground">
            Try a different search term or clear the filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-1 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id || p.slug} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => {
              const prev = Math.max(1, page - 1);
              setPage(prev);
              setLoading(true);
              updateUrl({ page: prev });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40 hover:bg-muted"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-4 text-xs font-medium text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => {
              const next = Math.min(totalPages, page + 1);
              setPage(next);
              setLoading(true);
              updateUrl({ page: next });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background disabled:opacity-40 hover:bg-muted"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <ProductQuickView />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageInner />
    </Suspense>
  );
}

function CategoryChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-primary hover:text-primary",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
