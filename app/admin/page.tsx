"use client";

import { motion } from "framer-motion";
import {
    DollarSign,
    Package,
    ShoppingBag,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
} from "lucide-react";
import { useAdminStore } from "@/store/admin.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
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
    const orders = useAdminStore((s) => s.orders);
    const products = useAdminStore((s) => s.products);
    const customers = useAdminStore((s) => s.customers);

    const totalRevenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + o.total, 0);
    const monthRevenue = orders
        .filter((o) => {
            const d = new Date(o.createdAt);
            const now = new Date();
            return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear() &&
                o.status !== "cancelled"
            );
        })
        .reduce((s, o) => s + o.total, 0);
    const lastMonthRevenue = monthRevenue * 0.78; // demo number
    const revenueDelta = monthRevenue - lastMonthRevenue;
    const revenueDeltaPct = lastMonthRevenue > 0 ? (revenueDelta / lastMonthRevenue) * 100 : 0;

    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const lowStock = products.filter((p) => p.stock < 10).length;

    const recentOrders = orders.slice(0, 5);
    const topProducts = [...products]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);

    // Sales by category (mock computation based on existing orders + product data)
    const salesByCategory = products.reduce((acc, p) => {
        const sales = orders.reduce((sum, o) => {
            const item = o.items.find((i) => i.productId === p.id);
            return sum + (item ? item.price * item.quantity : 0);
        }, 0);
        acc[p.categoryId] = (acc[p.categoryId] || 0) + sales;
        return acc;
    }, {} as Record<string, number>);

    const maxCategorySales = Math.max(1, ...Object.values(salesByCategory));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Welcome back. Here&apos;s what&apos;s happening with your store.
                    </p>
                </div>
                <Link href="/admin/orders">
                    <Button>
                        View all orders
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    i={0}
                    label="Total revenue"
                    value={`₦${totalRevenue.toLocaleString()}`}
                    delta={`${revenueDeltaPct.toFixed(1)}%`}
                    trend={revenueDelta >= 0 ? "up" : "down"}
                    icon={DollarSign}
                />
                <StatCard
                    i={1}
                    label="Orders"
                    value={orders.length.toString()}
                    delta={`${pendingOrders} pending`}
                    icon={ShoppingBag}
                />
                <StatCard
                    i={2}
                    label="Products"
                    value={products.length.toString()}
                    delta={`${lowStock} low stock`}
                    icon={Package}
                />
                <StatCard
                    i={3}
                    label="Customers"
                    value={customers.length.toString()}
                    delta={`${totalStock} items in stock`}
                    icon={Users}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Recent orders */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Recent orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((o, idx) => (
                                    <motion.div
                                        key={o.id}
                                        custom={idx}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeIn}
                                        className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-semibold">
                                            {o.customerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {o.customerName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {o.id} · {o.items[0]?.name}
                                                {o.items.length > 1
                                                    ? ` + ${o.items.length - 1} more`
                                                    : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                                                    STATUS_STYLES[o.status]
                                                }`}
                                            >
                                                {o.status}
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

                {/* Sales by category */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sales by category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(salesByCategory)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cat, sales]) => (
                                <div key={cat} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="capitalize font-medium">{cat}</span>
                                        <span className="text-muted-foreground">
                                            ₦{sales.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(sales / maxCategorySales) * 100}%` }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        {Object.keys(salesByCategory).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No sales yet</p>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            {/* Top products */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Top products</CardTitle>
                    <Link href="/admin/products">
                        <Button variant="ghost" size="sm">
                            Manage products
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {topProducts.map((p, idx) => (
                            <motion.div
                                key={p.id}
                                custom={idx}
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="rounded-md border border-border p-3"
                            >
                                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <p className="mt-2 truncate text-sm font-medium">{p.name}</p>
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="font-semibold">
                                        ₦{p.price.toLocaleString()}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {p.stock} in stock
                                    </Badge>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
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
}: {
    label: string;
    value: string;
    delta: string;
    trend?: "up" | "down";
    icon: React.ComponentType<{ className?: string }>;
    i: number;
}) {
    return (
        <motion.div custom={i} initial="hidden" animate="visible" variants={fadeIn}>
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                            <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
                            <div className="mt-2 flex items-center gap-1 text-xs">
                                {trend ? (
                                    trend === "up" ? (
                                        <TrendingUp className="h-3 w-3 text-primary" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-destructive" />
                                    )
                                ) : null}
                                <span className="text-muted-foreground">{delta}</span>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Icon className="h-5 w-5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
