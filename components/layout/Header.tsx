"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

/* ------------------------------------------------------------------
   MOCK AUTH (replace with real auth/store later)
------------------------------------------------------------------ */
type UserRole = "admin" | "user";

const useAuth = () => {
    return {
        isAuthenticated: true,
        role: "user" as UserRole,
        cartCount: 2,
    };
};

/* ------------------------------------------------------------------
   Navigation config (role-aware)
------------------------------------------------------------------ */
const navLinks = [
    { label: "Shop", href: "/shop", roles: ["user", "admin"] },
    { label: "About", href: "/about", roles: ["user", "admin"] },
    { label: "Contact", href: "/contact", roles: ["user", "admin"] },
    { label: "Admin", href: "/admin", roles: ["admin"] },
];

export function Header() {
    const pathname = usePathname();
    const { isAuthenticated, role, cartCount } = useAuth();

    /* --------------------------------------------------------------
       Scroll elevation + blur
    -------------------------------------------------------------- */
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const visibleLinks = navLinks.filter((l) =>
        isAuthenticated ? l.roles.includes(role) : true
    );

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur transition-shadow ${scrolled ? "shadow-sm" : ""
                }`}
        >
            <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-sm font-semibold tracking-tight text-foreground"
                >
                    The Garden Fairy
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {visibleLinks.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative text-sm transition-colors ${isActive
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {link.label}

                                {/* Active underline */}
                                {isActive && (
                                    <span className="absolute -bottom-[18px] left-0 h-[2px] w-full bg-primary" />
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

                    {/* Cart with badge */}
                    <Button size="sm" className="relative">
                        Cart
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
                                {cartCount}
                            </span>
                        )}
                    </Button>

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
                                    const isActive = pathname === link.href;

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`text-sm transition-colors ${isActive
                                                    ? "font-medium text-foreground"
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
                                    <Button>
                                        Cart
                                        {cartCount > 0 && (
                                            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
