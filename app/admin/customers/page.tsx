"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { useAdminStore } from "@/store/admin.store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminCustomersPage() {
    const customers = useAdminStore((s) => s.customers);
    const orders = useAdminStore((s) => s.orders);

    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        if (!query) return customers;
        const q = query.toLowerCase();
        return customers.filter(
            (c) =>
                c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        );
    }, [customers, query]);

    const totalCustomers = customers.length;
    const totalRevenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + o.total, 0);
    const avgSpend = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight">Customers</h1>
                <p className="text-sm text-muted-foreground">
                    View and manage your customer base
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total customers</p>
                            <p className="text-xl font-bold">{totalCustomers}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total revenue</p>
                            <p className="text-xl font-bold">₦{totalRevenue.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/30">
                            <span className="text-base font-bold">₦</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Avg spend</p>
                            <p className="text-xl font-bold">₦{Math.round(avgSpend).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No customers found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((c, idx) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                        >
                            <Card>
                                <CardContent className="space-y-3 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold">{c.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {c.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-md bg-muted/50 p-2">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <ShoppingBag className="h-3 w-3" />
                                                Orders
                                            </div>
                                            <p className="mt-1 font-semibold">{c.ordersCount}</p>
                                        </div>
                                        <div className="rounded-md bg-muted/50 p-2">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span className="text-xs">₦</span>
                                                Spent
                                            </div>
                                            <p className="mt-1 font-semibold">
                                                ₦{c.totalSpend.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            Joined {new Date(c.joinedAt).toLocaleDateString()}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px]">
                                            {c.totalSpend > 20000 ? "VIP" : "Regular"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
