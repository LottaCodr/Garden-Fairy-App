"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, ArrowRight, PackageSearch, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUIStore } from "@/store/ui.store";
import { api } from "@/lib/api";
import type { Product, Paged } from "@/types/api";
import { getProductImage } from "@/lib/product-helpers";

export function SearchDialog() {
  const open = useUIStore((s) => s.searchOpen);
  const closeSearch = useUIStore((s) => s.closeSearch);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: Cmd/Ctrl + K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const ui = useUIStore.getState();
        if (ui.searchOpen) ui.closeSearch();
        else ui.openSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounced search query (~300ms)
  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    let active = true;
    const handler = setTimeout(() => {
      setLoading(true);
      api<{ success?: boolean; data?: Product[] | Paged<Product> }>(
        `/products?q=${encodeURIComponent(q)}&limit=6`,
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
          setResults(list);
          setLoading(false);
        })
        .catch(() => {
          if (!active) return;
          setResults([]);
          setLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [query]);

  function handleOpenChange(v: boolean) {
    if (v) useUIStore.getState().openSearch();
    else {
      setQuery("");
      setResults([]);
      setLoading(false);
      closeSearch();
    }
  }

  function goToShop() {
    const q = query.trim();
    setQuery("");
    setResults([]);
    closeSearch();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  function goToProduct(product: Product) {
    const slugOrId = product.slug || product._id;
    setQuery("");
    setResults([]);
    closeSearch();
    router.push(`/product/${slugOrId}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[12%] translate-y-0 max-w-xl gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val.trim()) {
                setResults([]);
                setLoading(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") goToShop();
            }}
            placeholder="Search plants, planners, tools…"
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <button
            onClick={closeSearch}
            className="shrink-0 rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-medium text-foreground">Search the store</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try &ldquo;monstera&rdquo;, &ldquo;workspace&rdquo; or &ldquo;garden&rdquo; — or press Enter to see all results.
              </p>
            </div>
          ) : !loading && results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
              <PackageSearch className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No products found</p>
              <button
                onClick={goToShop}
                className="text-xs font-medium text-primary hover:underline"
              >
                Search all products for &ldquo;{query.trim()}&rdquo;
              </button>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {results.map((p) => {
                const img = getProductImage(p);
                const tag = p.tags?.[0];
                return (
                  <li key={p._id || p.slug}>
                    <button
                      onClick={() => goToProduct(p)}
                      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tag ? <span className="capitalize">{tag}</span> : "Product"}{" "}
                          · ₦{p.price.toLocaleString()}
                        </p>
                      </div>
                      {p.stock === 0 ? (
                        <span className="shrink-0 text-[10px] font-medium text-destructive">
                          Out of stock
                        </span>
                      ) : (
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={goToShop}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border-t border-border px-3 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  View all results in Shop
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </li>
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
