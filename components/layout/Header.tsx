"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShoppingBag, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useScrollHeader } from "@/lib/hooks/useScrollheader";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuthStore } from "@/store/auth.store";
import { CartDropdown } from "../custom/CartDropdown";

const navLinks: { label: string; href: string; roles: Array<"user" | "admin"> }[] = [
    { label: "Shop", href: "/shop", roles: ["user", "admin"] },
    { label: "About", href: "/about", roles: ["user", "admin"] },
    { label: "Contact", href: "/contact", roles: ["user", "admin"] },
    { label: "Admin", href: "/admin", roles: ["admin"] },
];

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const compact = useScrollHeader();

    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const signout = useAuthStore((s) => s.signout);

    // avoid SSR hydration mismatch with persisted store
    const hydrated = useHydrated();

    const role = user?.role;
    const visibleLinks = navLinks.filter((l) => {
        if (!hydrated) return !l.roles || l.roles.length === 0; // before hydration, hide role-restricted
        if (!isAuthenticated) return !l.roles || l.roles.length === 0;
        return role ? l.roles.includes(role) : false;
    });

    const isActiveRoute = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    const headerVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120 } },
    };

    const navVariants = {
        compact: { height: 56, transition: { type: "spring" as const, stiffness: 200 } },
        expanded: { height: 72, transition: { type: "spring" as const, stiffness: 200 } },
    };

    return (
        <motion.header
            className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            initial="hidden"
            animate="visible"
            variants={headerVariants}
        >
            <motion.nav
                className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 transition-all"
                animate={compact ? "compact" : "expanded"}
                variants={navVariants}
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2"
                >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-base">
                        🌿
                    </span>
                    The Garden Fairy
                </Link>

                {/* Desktop Nav */}
                <div className="relative hidden md:flex items-center gap-8">
                    {visibleLinks.map((link) => {
                        const active = isActiveRoute(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative text-sm font-medium transition-colors ${active
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {link.label}
                                {active && (
                                    <motion.span
                                        layoutId="nav-underline"
                                        className="absolute -bottom-[18px] left-0 h-[2px] w-full bg-primary"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {hydrated && !isAuthenticated ? (
                        <Link href="/signin" className="hidden sm:block">
                            <Button variant="ghost" size="sm">
                                Sign in
                            </Button>
                        </Link>
                    ) : null}

                    {hydrated && isAuthenticated && user ? (
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/profile">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
                                </Button>
                            </Link>
                            {user.role === "admin" ? (
                                <Link href="/admin" className="hidden lg:block">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : null}
                        </div>
                    ) : null}

                    <CartDropdown />

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-72 bg-background">
                            <div className="flex flex-col gap-6 pt-8">
                                <Link
                                    href="/"
                                    className="text-base font-bold tracking-tight flex items-center gap-2"
                                >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-base">
                                        🌿
                                    </span>
                                    The Garden Fairy
                                </Link>

                                {visibleLinks.map((link) => {
                                    const active = isActiveRoute(link.href);
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`text-sm font-medium transition-colors ${active
                                                    ? "text-foreground"
                                                    : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}

                                <div className="pt-4 border-t border-border flex flex-col gap-2">
                                    {hydrated && isAuthenticated ? (
                                        <>
                                            <Link href="/profile">
                                                <Button variant="outline" className="w-full justify-start gap-2">
                                                    <UserIcon className="h-4 w-4" />
                                                    {user?.name}
                                                </Button>
                                            </Link>
                                            {user?.role === "admin" && (
                                                <Link href="/admin">
                                                    <Button variant="outline" className="w-full justify-start gap-2">
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        Admin dashboard
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start gap-2 text-destructive"
                                                onClick={() => {
                                                    signout();
                                                    router.push("/");
                                                }}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign out
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/signin">
                                                <Button variant="outline" className="w-full">
                                                    Sign in
                                                </Button>
                                            </Link>
                                            <Link href="/signup">
                                                <Button className="w-full">Create account</Button>
                                            </Link>
                                        </>
                                    )}
                                    <Link href="/cart" className="mt-2">
                                        <Button className="w-full">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            View Cart
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </motion.nav>
        </motion.header>
    );
}
