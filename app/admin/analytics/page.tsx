"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingBag, Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { AnalyticsData } from "@/types/api";
import { getProductImage } from "@/lib/product-helpers";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<{ data: AnalyticsData }>("/admin/analytics")
      .then((res) => {
        if (active && res?.data) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const monthlySales = data?.monthlySales || [];
  const statusDistribution = data?.statusDistribution || [];
  const bestSellersBySales = data?.bestSellersBySales || [];
  const bestSellersByRating = data?.bestSellersByRating || [];

  const maxSale = Math.max(1, ...monthlySales.map((m) => m.revenue));
  const totalRevenue = monthlySales.reduce((acc, m) => acc + m.revenue, 0);
  const totalOrders = monthlySales.reduce((acc, m) => acc + m.orders, 0);
  const totalStatusCount = statusDistribution.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Aggregated store performance, sales charts and top converting catalog products.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">6-Month Revenue</p>
              <p className="text-xl font-bold">₦{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">6-Month Orders</p>
              <p className="text-xl font-bold">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/30 text-accent-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <p className="text-xl font-bold">
                ₦{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Chart (Zero-filled, Chronological) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue Trend (Last 6 Months)</CardTitle>
          <CardDescription className="text-xs">
            Excludes cancelled orders. Sourced directly from Express aggregation pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex h-64 items-end gap-3 sm:gap-6 pt-8">
              {monthlySales.map((m, i) => {
                const heightPct = (m.revenue / maxSale) * 100;
                const label = MONTH_NAMES[(m.month - 1) % 12] || `M${m.month}`;
                return (
                  <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full flex-1 items-end">
                      <motion.div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60 hover:opacity-90 transition-opacity"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(4, heightPct)}%` }}
                        transition={{
                          duration: 0.6,
                          delay: i * 0.08,
                          ease: "easeOut",
                        }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-foreground whitespace-nowrap">
                          ₦{(m.revenue / 1000).toFixed(0)}k
                        </div>
                      </motion.div>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Distribution & Best Sellers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status Distribution</CardTitle>
            <CardDescription className="text-xs">
              Breakdown of all active and fulfilled orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusDistribution.map((item) => {
              const pct = totalStatusCount > 0 ? (item.count / totalStatusCount) * 100 : 0;
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize font-semibold">
                      {item.status.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {item.count} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full ${getStatusColor(item.status)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              );
            })}
            {statusDistribution.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No order data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Best Sellers by Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Sellers (By Units Sold)</CardTitle>
            <CardDescription className="text-xs">
              Top volume products across all settled orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestSellersBySales.slice(0, 5).map((p, i) => {
                const img = getProductImage(p);
                return (
                  <div key={p._id || p.slug} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                      {i + 1}
                    </span>
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        ₦{p.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {p.sold || 0} sold
                    </span>
                  </div>
                );
              })}
              {bestSellersBySales.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Best Sellers by Rating */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Customer Favorites (By Rating & Reviews)</CardTitle>
            <CardDescription className="text-xs">
              Products with highest customer review averages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellersByRating.slice(0, 4).map((p) => {
                const img = getProductImage(p);
                return (
                  <div key={p._id || p.slug} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <p className="text-xs font-semibold truncate">{p.name}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">₦{p.price.toLocaleString()}</span>
                      <span className="flex items-center gap-0.5 text-accent text-xs">
                        <Star className="h-3 w-3 fill-current" />
                        {(p.rating || 5).toFixed(1)} ({p.ratingCount || 0})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending_payment: "bg-yellow-400",
    paid: "bg-emerald-500",
    processing: "bg-blue-400",
    shipped: "bg-purple-400",
    delivered: "bg-green-500",
    cancelled: "bg-red-400",
  };
  return map[status] || "bg-primary";
}
