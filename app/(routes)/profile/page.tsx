"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Loader2,
    Package,
    User as UserIcon,
    Mail,
    ShoppingBag,
    ArrowRight,
    LogOut,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { useAdminStore } from "@/store/admin.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useHydrated } from "@/lib/hooks/useHydrated";

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function ProfilePage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const isAuthed = useAuthStore((s) => s.isAuthenticated);
    const signout = useAuthStore((s) => s.signout);

    const allOrders = useAdminStore((s) => s.orders);
    const products = useAdminStore((s) => s.products);

    const hydrated = useHydrated();

    useEffect(() => {
        if (hydrated && !isAuthed) {
            router.replace("/signin?redirect=/profile");
        }
    }, [hydrated, isAuthed, router]);

    if (!hydrated || !user) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const myOrders = allOrders.filter(
        (o) => o.customerEmail.toLowerCase() === user.email.toLowerCase()
    );

    const totalSpent = myOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + o.total, 0);

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
                        My account
                    </p>
                    <h1 className="text-3xl font-black tracking-tight">
                        Welcome, {user.name.split(" ")[0]}
                    </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                    {user.role === "admin" && (
                        <Link href="/admin">
                            <Button>
                                Open admin panel
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => {
                            signout();
                            router.push("/");
                        }}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Stats */}
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total orders</p>
                            <p className="text-2xl font-bold">{myOrders.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Delivered</p>
                            <p className="text-2xl font-bold">
                                {myOrders.filter((o) => o.status === "delivered").length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 text-accent-foreground">
                            <span className="text-base font-bold">₦</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total spent</p>
                            <p className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Account info */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{user.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Role</span>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Order history</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {myOrders.length === 0 ? (
                            <div className="rounded-md border border-dashed border-border p-8 text-center">
                                <p className="text-sm font-medium">No orders yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Your placed orders will appear here.
                                </p>
                                <Link href="/shop" className="mt-4 inline-block">
                                    <Button size="sm">Start shopping</Button>
                                </Link>
                            </div>
                        ) : (
                            <motion.ul
                                className="space-y-3"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: { transition: { staggerChildren: 0.06 } },
                                }}
                            >
                                {myOrders.map((o) => {
                                    const product = products.find(
                                        (p) => p.id === o.items[0]?.productId
                                    );
                                    return (
                                        <motion.li
                                            key={o.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 8 },
                                                visible: { opacity: 1, y: 0 },
                                            }}
                                            className="flex flex-wrap items-center gap-4 rounded-md border border-border p-3"
                                        >
                                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={o.items[0]?.image || product?.image}
                                                    alt={o.items[0]?.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-semibold">
                                                        {o.items[0]?.name}
                                                        {o.items.length > 1
                                                            ? ` + ${o.items.length - 1} more`
                                                            : ""}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {o.id} · {new Date(o.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                                                        STATUS_STYLES[o.status] ||
                                                        "bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    {o.status}
                                                </span>
                                                <span className="text-sm font-semibold">
                                                    ₦{o.total.toLocaleString()}
                                                </span>
                                            </div>
                                        </motion.li>
                                    );
                                })}
                            </motion.ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
