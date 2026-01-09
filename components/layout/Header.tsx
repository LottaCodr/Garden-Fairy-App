"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import { useCartStore } from "@/store/cart.store";

/* ----------------------------------------
   Navigation config
---------------------------------------- */

const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export function Header() {
    const pathname = usePathname();
    const cartCount = useCartStore((s) => s.count);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
            <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-sm font-semibold tracking-tight text-foreground"
                >
                    The Garden Fairy
                </Link>

                {/* Desktop Nav */}
                <div className="relative hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
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

                                {isActive && (
                                    <motion.span
                                        layoutId="nav-underline"
                                        className="absolute -bottom-[18px] left-0 h-[2px] w-full bg-primary"
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
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
                    {/* Cart */}
                    <Button size="sm" className="relative">
                        <ShoppingCart className="h-4 w-4" />
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

                        <SheetContent side="right" className="w-64">
                            <div className="flex flex-col gap-6 pt-6">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`text-sm ${isActive
                                                    ? "font-medium text-foreground"
                                                    : "text-muted-foreground"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
