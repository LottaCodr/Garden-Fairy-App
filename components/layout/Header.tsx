"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useScrollHeader } from "@/lib/hooks/useScrollheader";
import { CartDropdown } from "../custom/CartDropdown";


/* ------------------------------------------------------------------
   MOCK AUTH
------------------------------------------------------------------ */
type UserRole = "admin" | "user";

const useAuth = () => ({
    isAuthenticated: true,
    role: "user" as UserRole,
    cartCount: 2,
});

/* ------------------------------------------------------------------
   NAV CONFIG
------------------------------------------------------------------ */
const navLinks = [
    { label: "Shop", href: "/shop", roles: ["user", "admin"] },
    { label: "About", href: "/about", roles: ["user", "admin"] },
    { label: "Contact", href: "/contact", roles: ["user", "admin"] },
    { label: "Admin", href: "/admin", roles: ["admin"] },
];

export function Header() {
    const pathname = usePathname();
    const compact = useScrollHeader();
    const { isAuthenticated, role, cartCount } = useAuth();

    const visibleLinks = navLinks.filter((l) =>
        isAuthenticated ? l.roles.includes(role) : true
    );

    const isActiveRoute = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur transition-shadow ${compact ? "shadow-sm" : ""
                }`}
        >
            <nav
                className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 transition-all duration-300 ${compact ? "h-12" : "h-16"
                    }`}
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="text-sm font-semibold tracking-tight text-foreground"
                >
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
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {!isAuthenticated && (
                        <Button variant="ghost" size="sm">
                            Sign in
                        </Button>
                    )}

                    <CartDropdown count={cartCount} />

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

                        <SheetContent side="right" className="w-64 bg-background">
                            <div className="flex flex-col gap-6 pt-6">
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
                                    {!isAuthenticated && (
                                        <Button variant="outline">Sign in</Button>
                                    )}
                                    <Link href="/cart">
                                        <Button>View Cart</Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
