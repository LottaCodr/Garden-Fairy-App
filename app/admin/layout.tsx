"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronRight,
    Loader2,
    BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useAdminStore } from "@/store/admin.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks/useHydrated";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const hydrated = useHydrated();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = useAuthStore((s) => s.user);
    const isAuthed = useAuthStore((s) => s.isAuthenticated);
    const signout = useAuthStore((s) => s.signout);

    const orders = useAdminStore((s) => s.orders);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthed) {
            router.replace("/signin?redirect=/admin");
            return;
        }
        if (user?.role !== "admin") {
            router.replace("/");
        }
    }, [hydrated, isAuthed, user, router]);

    if (!hydrated) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!isAuthed || user?.role !== "admin") {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <div className="min-h-[calc(100vh-160px)] bg-muted/30">
            <div className="flex">
                {/* Sidebar (desktop) */}
                <aside className="hidden md:flex sticky top-[57px] h-[calc(100vh-57px)] w-64 shrink-0 flex-col border-r border-border bg-card">
                    <div className="px-4 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Admin
                        </p>
                        <p className="mt-1 text-sm font-semibold">The Garden Fairy</p>
                    </div>

                    <nav className="flex-1 space-y-1 px-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive(item.href, item.exact)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                                {item.href === "/admin/orders" && pendingOrders > 0 ? (
                                    <Badge className="ml-auto" variant="secondary">
                                        {pendingOrders}
                                    </Badge>
                                ) : null}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-border p-4">
                        <div className="mb-3 flex items-center gap-3 rounded-md bg-muted/50 p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{user.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-destructive hover:text-destructive"
                            onClick={() => {
                                signout();
                                router.push("/");
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </Button>
                    </div>
                </aside>

                {/* Mobile sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.aside
                                className="fixed inset-y-0 left-0 z-50 w-72 bg-card md:hidden"
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="flex items-center justify-between border-b border-border px-4 py-4">
                                    <p className="text-sm font-semibold">Admin menu</p>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <nav className="space-y-1 p-3">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                                isActive(item.href, item.exact)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Top bar */}
                    <div className="sticky top-[57px] z-30 flex items-center gap-2 border-b border-border bg-background/95 backdrop-blur px-4 py-3 md:px-6">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="md:hidden"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <Breadcrumb path={pathname} />

                        <div className="ml-auto flex items-center gap-2">
                            <div className="hidden sm:flex relative">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    className="h-9 w-48 pl-8 lg:w-64"
                                />
                            </div>
                            <Button size="icon" variant="ghost" className="relative" aria-label="Notifications">
                                <Bell className="h-4 w-4" />
                                {pendingOrders > 0 ? (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                                ) : null}
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 md:p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}

function Breadcrumb({ path }: { path: string }) {
    const segments = path.split("/").filter(Boolean);
    return (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {segments.map((s, i) => {
                const isLast = i === segments.length - 1;
                return (
                    <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                        <span className={cn(isLast && "font-medium text-foreground")}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </span>
                    </span>
                );
            })}
        </nav>
    );
}
