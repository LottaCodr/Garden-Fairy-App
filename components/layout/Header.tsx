"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

// MOCK AUTH — replace later
const useAuth = () => {
    return {
        isAuthenticated: false,
        user: null,
    };
};

const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export function Header() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-sm font-semibold tracking-tight"
                >
                    The Garden Fairy
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm transition-colors ${isActive
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <Button variant="ghost" size="sm">
                                Dashboard
                            </Button>
                            <Button size="sm">Cart</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm">
                                Sign in
                            </Button>
                            <Button size="sm">Cart</Button>
                        </>
                    )}

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

                                <div className="pt-4 border-t flex flex-col gap-2">
                                    {isAuthenticated ? (
                                        <Button variant="outline">Dashboard</Button>
                                    ) : (
                                        <Button variant="outline">Sign in</Button>
                                    )}
                                    <Button>Cart</Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
