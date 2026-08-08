"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { useAdminStore } from "@/store/admin.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
    const orders = useAdminStore((s) => s.orders);
    const products = useAdminStore((s) => s.products);
    const customers = useAdminStore((s) => s.customers);

    // Monthly sales for last 6 months
    const monthlySales = useMemo(() => {
        const months: { label: string; value: number; orders: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthOrders = orders.filter((o) => {
                const od = new Date(o.createdAt);
                return od >= d && od <= monthEnd && o.status !== "cancelled";
            });
            const value = monthOrders.reduce((s, o) => s + o.total, 0);
            months.push({
                label: d.toLocaleString("en", { month: "short" }),
                value,
                orders: monthOrders.length,
            });
        }
        return months;
    }, [orders]);

    const maxSale = Math.max(1, ...monthlySales.map((m) => m.value));

    // Status distribution
    const statusDist = useMemo(() => {
        const map: Record<string, number> = {};
        orders.forEach((o) => {
            map[o.status] = (map[o.status] || 0) + 1;
        });
        return map;
    }, [orders]);

    const totalOrders = orders.length;
    const totalRevenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
                <p className="text-sm text-muted-foreground">
                    Performance overview of your store
                </p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPI
                    label="Revenue"
                    value={`₦${totalRevenue.toLocaleString()}`}
                    change="+12.4%"
                    trend="up"
                    icon={DollarSign}
                />
                <KPI
                    label="Orders"
                    value={totalOrders.toString()}
                    change={`${orders.filter((o) => o.status === "delivered").length} delivered`}
                    icon={ShoppingBag}
                />
                <KPI
                    label="Customers"
                    value={customers.length.toString()}
                    change="+3 this month"
                    trend="up"
                    icon={Users}
                />
                <KPI
                    label="Avg order value"
                    value={`₦${Math.round(avgOrderValue).toLocaleString()}`}
                    change="-2.1%"
                    trend="down"
                    icon={Package}
                />
            </div>

            {/* Sales chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Monthly sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex h-56 items-end gap-2 sm:gap-4">
                            {monthlySales.map((m, i) => {
                                const heightPct = (m.value / maxSale) * 100;
                                return (
                                    <div
                                        key={m.label}
                                        className="flex flex-1 flex-col items-center gap-2"
                                    >
                                        <div className="relative flex w-full flex-1 items-end">
                                            <motion.div
                                                className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPct}%` }}
                                                transition={{
                                                    duration: 0.6,
                                                    delay: i * 0.08,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground">
                                                    ₦{(m.value / 1000).toFixed(0)}k
                                                </div>
                                            </motion.div>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {m.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Status distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Order status breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(statusDist).map(([status, count]) => {
                            const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                            return (
                                <div key={status} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize font-medium">{status}</span>
                                        <span className="text-muted-foreground">
                                            {count} ({pct.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                            className={`h-full ${getStatusColor(status)}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Top products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Best sellers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[...products]
                                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                                .slice(0, 5)
                                .map((p, i) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                                            {i + 1}
                                        </span>
                                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-muted">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {p.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                ₦{p.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            ⭐ {(p.rating || 0).toFixed(1)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function KPI({
    label,
    value,
    change,
    trend,
    icon: Icon,
}: {
    label: string;
    value: string;
    change: string;
    trend?: "up" | "down";
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 text-xl font-black tracking-tight">{value}</p>
                        <div className="mt-2 flex items-center gap-1 text-xs">
                            {trend === "up" ? (
                                <TrendingUp className="h-3 w-3 text-primary" />
                            ) : trend === "down" ? (
                                <TrendingDown className="h-3 w-3 text-destructive" />
                            ) : null}
                            <span className="text-muted-foreground">{change}</span>
                        </div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function getStatusColor(status: string) {
    const map: Record<string, string> = {
        pending: "bg-yellow-400",
        processing: "bg-blue-400",
        shipped: "bg-purple-400",
        delivered: "bg-green-400",
        cancelled: "bg-red-400",
    };
    return map[status] || "bg-primary";
}
