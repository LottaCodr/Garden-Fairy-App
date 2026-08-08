"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  ShoppingCart,
  PackageSearch,
  Loader2,
  Trash2,
  Send,
  MessageSquare,
} from "lucide-react";
import Recommendations from "./recommendations";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useSettingsStore } from "@/store/settings.store";
import { toast } from "@/store/toast.store";
import { SafeImage } from "@/components/custom/SafeImage";
import { api, ApiError } from "@/lib/api";
import type { Product, Review, Paged, DeliveryQuote } from "@/types/api";
import { getProductImages } from "@/lib/product-helpers";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Ogun",
  "Oyo",
  "Rivers",
  "Kano",
  "Kaduna",
  "Enugu",
  "Anambra",
  "Delta",
  "Edo",
  "Imo",
  "Abia",
  "Plateau",
];

export default function ProductDetailPage({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large">("medium");

  // Delivery estimate state
  const [state, setState] = useState("Lagos");
  const [city, setCity] = useState("Ikeja");
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [userRating, setUserRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const settings = useSettingsStore((s) => s.settings);

  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    try {
      const res = await api<{ success?: boolean; data?: Product }>(`/products/${productId}`);
      const p = res?.data ?? (res as unknown as Product);
      if (p && (p._id || p.slug)) {
        setProduct(p);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    void fetchProduct();
  }, [fetchProduct]);

  // Fetch delivery estimate
  const fetchEstimate = useCallback(async (selectedState: string, selectedCity: string, price: number) => {
    setQuoteLoading(true);
    try {
      const res = await api<{ data: DeliveryQuote }>("/checkout/estimate", {
        method: "POST",
        json: {
          state: selectedState,
          city: selectedCity,
          subtotal: price,
        },
      });
      if (res?.data) {
        setQuote(res.data);
      }
    } catch {
      // Fallback to settings
      setQuote({
        deliveryFee: price >= (settings?.freeShippingThreshold ?? 50000) ? 0 : (settings?.deliveryFee ?? 3500),
        etaDays: 2,
        freeShippingApplied: price >= (settings?.freeShippingThreshold ?? 50000),
        matchedArea: null,
        currency: "NGN",
      });
    } finally {
      setQuoteLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    if (product) {
      void fetchEstimate(state, city, product.price);
    }
  }, [state, city, product, fetchEstimate]);

  // Fetch reviews
  const fetchReviews = useCallback(async (targetId: string) => {
    setReviewsLoading(true);
    try {
      const res = await api<Paged<Review> | { data: Review[]; total: number }>(
        `/products/${targetId}/reviews?page=1&limit=10`,
      );
      if (res && Array.isArray(res.data)) {
        setReviews(res.data);
        setReviewsTotal(res.total ?? res.data.length);
      }
    } catch {
      setReviews([]);
      setReviewsTotal(0);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (product?._id) {
      void fetchReviews(product._id);
    }
  }, [product?._id, fetchReviews]);

  // Handle review submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?._id) return;
    if (!isAuthenticated) {
      toast.info("Please sign in to submit a review");
      return;
    }

    setSubmittingReview(true);
    try {
      await api<{ data: Review }>(`/products/${product._id}/reviews`, {
        method: "POST",
        json: {
          rating: userRating,
          comment: userComment.trim() || undefined,
        },
      });
      toast.success("Review posted", "Thank you for your feedback!");
      setUserComment("");
      // Refetch reviews and product for updated rating aggregate
      await fetchReviews(product._id);
      await fetchProduct();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to post review";
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle review delete
  const handleReviewDelete = async (reviewId: string) => {
    if (!product?._id) return;
    try {
      await api(`/reviews/${reviewId}`, {
        method: "DELETE",
      });
      toast.info("Review deleted");
      await fetchReviews(product._id);
      await fetchProduct();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete review";
      toast.error(msg);
    }
  };

  const images = useMemo(() => getProductImages(product), [product]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <PackageSearch className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Product not found</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            We couldn&apos;t find that product. It may have been archived or removed.
          </p>
          <Link href="/shop">
            <Button>
              Browse the shop
              <ShoppingCart className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const p = product;
  const cartItem = cartItems.find((i) => i.id === p._id || i.product === p._id);
  const quantity = cartItem?.qty ?? 0;
  const stock = p.stock ?? 0;
  const outOfStock = stock <= 0;
  const lowStockThreshold = 5;

  const categoryId = typeof p.category === "object" && p.category ? p.category._id : (p.category as string);
  const categoryName = typeof p.category === "object" && p.category ? p.category.name : "Plants";

  async function handleAdd() {
    if (!p) return;
    const res = await addItem(p._id, 1, selectedSize);
    if (res.ok) {
      toast.success("Added to cart", `${p.name} · ₦${p.price.toLocaleString()}`);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumbs */}
      <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link> /{" "}
        <Link href="/shop" className="hover:text-primary">Shop</Link> /{" "}
        {categoryName && (
          <>
            <Link href={`/shop?category=${categoryId}`} className="hover:text-primary">
              {categoryName}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-foreground">{p.name}</span>
      </nav>

      <section className="grid gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <motion.div
          key={activeImage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <Card className="overflow-hidden">
            <div className="relative aspect-square w-full bg-muted">
              <SafeImage
                src={images[activeImage] || "/images/plants/1.jpg"}
                alt={p.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
              {p.isPremium ? (
                <Badge className="absolute top-3 left-3">Premium</Badge>
              ) : null}
            </div>
          </Card>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <Card
                  onClick={() => setActiveImage(i)}
                  key={src + i}
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all",
                    activeImage === i
                      ? "ring-2 ring-primary"
                      : "border-muted hover:border-primary",
                  )}
                >
                  <div className="relative aspect-square w-full bg-muted">
                    <SafeImage
                      src={src}
                      alt={`${p.name} thumbnail ${i + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {p.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              {p.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5 text-accent">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i <= Math.round(p.rating || 5)
                        ? "fill-current text-accent"
                        : "fill-current/30 text-muted-foreground",
                    )}
                  />
                ))}
              </div>
              <span>({p.ratingCount || reviewsTotal || 0} reviews)</span>
              <span>·</span>
              <span className={cn(outOfStock ? "text-destructive" : "text-primary")}>
                {outOfStock
                  ? "Out of stock"
                  : stock < lowStockThreshold
                    ? `Only ${stock} left`
                    : `${stock} in stock`}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              ₦{p.price.toLocaleString()}
            </span>
            {p.compareAtPrice && p.compareAtPrice > p.price ? (
              <span className="text-lg text-muted-foreground line-through">
                ₦{p.compareAtPrice.toLocaleString()}
              </span>
            ) : null}
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Size</p>
            <Tabs
              value={selectedSize}
              onValueChange={(v) => setSelectedSize(v as typeof selectedSize)}
            >
              <TabsList className="grid w-full max-w-xs grid-cols-3">
                <TabsTrigger value="small">Small</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="large">Large</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Quantity + CTA */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center rounded-md border border-input">
              <Button
                variant="ghost"
                size="icon"
                disabled={quantity === 0}
                onClick={() => {
                  const wasLast = quantity === 1;
                  decrementItem(p._id);
                  if (wasLast) {
                    toast.info("Removed from cart", p.name);
                  }
                }}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-10 px-4 text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={outOfStock || quantity >= stock}
                onClick={handleAdd}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 min-w-[180px]"
              onClick={handleAdd}
              disabled={outOfStock}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {outOfStock ? "Out of stock" : "Add to Cart"}
            </Button>
          </div>
          {quantity > 0 && (
            <p className="text-xs text-muted-foreground">
              {quantity} in your cart ·{" "}
              <Link href="/cart" className="font-medium text-primary hover:underline">
                view cart
              </Link>
            </p>
          )}

          {/* Delivery estimate from API */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <p className="font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Delivery Estimate
              </p>
              <div className="grid grid-cols-2 gap-3 text-foreground">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / Area"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {quoteLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : quote ? (
                <Badge variant="secondary" className="w-full justify-center py-2 text-xs">
                  {quote.freeShippingApplied ? (
                    <span className="text-primary font-semibold">FREE delivery applied</span>
                  ) : (
                    <span>Estimated Fee: ₦{quote.deliveryFee.toLocaleString()}</span>
                  )}
                  {quote.etaDays ? ` · Arrives in ~${quote.etaDays} day${quote.etaDays !== 1 ? "s" : ""}` : ""}
                </Badge>
              ) : null}
            </CardContent>
          </Card>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border border-border bg-card p-3">
              <Truck className="mx-auto mb-1 h-4 w-4 text-primary" />
              <p className="text-[11px] font-medium">Free over ₦50k</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-primary" />
              <p className="text-[11px] font-medium">Healthy guarantee</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <RotateCcw className="mx-auto mb-1 h-4 w-4 text-primary" />
              <p className="text-[11px] font-medium">Easy returns</p>
            </div>
          </div>

          {/* Care */}
          {p.care && (
            <div className="space-y-4">
              <Separator />
              <h3 className="font-semibold">Care Instructions</h3>
              <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <p className="font-medium text-foreground text-xs mb-1">Sunlight</p>
                  <p className="text-xs">{p.care.sunlight || "Bright indirect"}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <p className="font-medium text-foreground text-xs mb-1">Watering</p>
                  <p className="text-xs">{p.care.watering || "Every 1–2 weeks"}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <p className="font-medium text-foreground text-xs mb-1">Temperature</p>
                  <p className="text-xs">{p.care.temperature || "18°C–27°C"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Separator />
            <h3 className="font-semibold">About this product</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {p.description}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Customer Reviews Section */}
      <section className="mt-20 border-t border-border pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
            <p className="text-sm text-muted-foreground">
              {reviewsTotal} review{reviewsTotal !== 1 ? "s" : ""} from verified buyers
            </p>
          </div>
        </div>

        {/* Review Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <h3 className="font-semibold text-sm">
                  {reviews.some((r) => r.user?._id === user?.id)
                    ? "Edit your review"
                    : "Write a review"}
                </h3>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star as 1 | 2 | 3 | 4 | 5)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            star <= userRating
                              ? "fill-current text-accent"
                              : "text-muted-foreground",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Share your experience with this plant or space planner..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <Button type="submit" size="sm" disabled={submittingReview}>
                  {submittingReview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-3.5 w-3.5" /> Submit Review
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Have you bought this product?</p>
                  <p className="text-xs text-muted-foreground">
                    Sign in to leave a review and help fellow plant lovers.
                  </p>
                </div>
                <Link href="/signin">
                  <Button variant="outline" size="sm">
                    Sign in to review
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">No reviews yet</p>
            <p className="text-xs text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => {
              const isOwnReview = user?.id && rev.user?._id === user.id;
              const isAdmin = user?.role === "admin";
              return (
                <Card key={rev._id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                          {rev.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{rev.user?.name || "Customer"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-accent">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5",
                                i <= rev.rating ? "fill-current text-accent" : "text-muted-foreground/30",
                              )}
                            />
                          ))}
                        </div>

                        {(isOwnReview || isAdmin) && (
                          <button
                            onClick={() => handleReviewDelete(rev._id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-2"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="mt-3 text-sm text-foreground/90 leading-relaxed">
                        {rev.comment}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommendations */}
      <Recommendations currentId={p._id} categoryId={categoryId} />
    </main>
  );
}
