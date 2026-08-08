"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types/api";
import { getProductImage } from "@/lib/product-helpers";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: "easeOut" as const },
  }),
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api<{ data: DashboardData }>("/admin/dashboard")
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

  const metrics = data?.metrics || {
    revenue: 0,
    monthOverMonthPct: 0,
    orders: 0,
    products: 0,
    customers: 0,
    lowStockCount: 0,
  };
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back. Real-time metrics and operational overview.
          </p>
        </div>
        <Link href="/admin/orders">
          <Button>
            View all orders
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* 6 Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          i={0}
          label="Total Revenue"
          value={`₦${metrics.revenue.toLocaleString()}`}
          delta={`${metrics.monthOverMonthPct >= 0 ? "+" : ""}${metrics.monthOverMonthPct.toFixed(1)}% MoM`}
          trend={metrics.monthOverMonthPct >= 0 ? "up" : "down"}
          icon={DollarSign}
        />
        <StatCard
          i={1}
          label="Total Orders"
          value={metrics.orders.toString()}
          delta="All-time"
          icon={ShoppingBag}
        />
        <StatCard
          i={2}
          label="Catalog Products"
          value={metrics.products.toString()}
          delta="Active & live"
          icon={Package}
        />
        <StatCard
          i={3}
          label="Customers"
          value={metrics.customers.toString()}
          delta="Registered & guest"
          icon={Users}
        />
        <StatCard
          i={4}
          label="MoM Growth"
          value={`${metrics.monthOverMonthPct >= 0 ? "+" : ""}${metrics.monthOverMonthPct.toFixed(1)}%`}
          delta="Monthly trend"
          trend={metrics.monthOverMonthPct >= 0 ? "up" : "down"}
          icon={TrendingUp}
        />
        <Link href="/admin/products" className="block">
          <StatCard
            i={5}
            label="Low Stock Alerts"
            value={metrics.lowStockCount.toString()}
            delta={metrics.lowStockCount > 0 ? "Needs restock" : "Healthy inventory"}
            trend={metrics.lowStockCount > 0 ? "down" : "up"}
            icon={AlertTriangle}
            highlight={metrics.lowStockCount > 0}
          />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">
                View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders recorded yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o, idx) => (
                  <motion.div
                    key={o._id}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-semibold">
                      {(o.customerName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {o.customerName || o.customerEmail || "Customer"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o._id} · {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                          STATUS_STYLES[o.status] || "bg-muted text-muted-foreground",
                        )}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                      <span className="text-sm font-semibold">
                        ₦{o.total.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top Selling Products</CardTitle>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                Products <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No top products yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((p) => {
                  const img = getProductImage(p);
                  return (
                    <div key={p._id || p.slug} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₦{p.price.toLocaleString()} · {p.sold || 0} sold
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {p.stock} left
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  i,
  highlight,
}: {
  label: string;
  value: string;
  delta: string;
  trend?: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  i: number;
  highlight?: boolean;
}) {
  return (
    <motion.div custom={i} initial="hidden" animate="visible" variants={fadeIn}>
      <Card className={cn(highlight && "border-destructive/40 bg-destructive/5")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
              <p className="mt-1 text-xl font-black tracking-tight">{value}</p>
              <div className="mt-1 flex items-center gap-1 text-[11px]">
                {trend ? (
                  trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-primary shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive shrink-0" />
                  )
                ) : null}
                <span className="text-muted-foreground truncate">{delta}</span>
              </div>
            </div>
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ml-2",
                highlight ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
