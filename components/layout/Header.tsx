"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShoppingBag, LogOut, LayoutDashboard, Search, Leaf } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useScrollHeader } from "@/lib/hooks/useScrollheader";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
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
  const cartCount = useCartStore((s) => s.count());

  // avoid SSR hydration mismatch with persisted store
  const hydrated = useHydrated();

  const role = user?.role;
  const visibleLinks = navLinks.filter((l) => {
    if (!hydrated) return !l.roles || l.roles.length === 0;
    if (!isAuthenticated) return !l.roles || l.roles.length === 0;
    return role ? l.roles.includes(role) : false;
  });

  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2.5 group"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Leaf className="h-4 w-4" />
            </span>
            <span>The Garden Fairy</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const active = isActiveRoute(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-4 bottom-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Auth State */}
            {hydrated && !isAuthenticated ? (
              <Link href="/signin">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Sign in
                </Button>
              </Link>
            ) : null}

            {hydrated && isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full px-3"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full border-border hover:border-primary"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Dashboard</span>
                    </Button>
                  </Link>
                )}
              </div>
            ) : null}

            {/* Cart */}
            <CartDropdown />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-80 p-6">
                <div className="flex flex-col gap-6">
                  {/* Mobile Logo */}
                  <Link
                    href="/"
                    className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Leaf className="h-4 w-4" />
                    </span>
                    The Garden Fairy
                  </Link>

                  {/* Mobile Nav */}
                  <nav className="flex flex-col gap-1">
                    {visibleLinks.map((link) => {
                      const active = isActiveRoute(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            active
                              ? "text-primary bg-primary/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Divider */}
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Account
                    </p>
                    <div className="flex flex-col gap-2">
                      {hydrated && isAuthenticated ? (
                        <>
                          <Link href="/profile">
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-3 rounded-lg"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                {user?.name.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {user?.role === "admin" ? "Admin" : "Customer"}
                                </p>
                              </div>
                            </Button>
                          </Link>
                          {user?.role === "admin" && (
                            <Link href="/admin">
                              <Button
                                variant="outline"
                                className="w-full justify-start gap-3 rounded-lg"
                              >
                                <LayoutDashboard className="h-4 w-4" />
                                Admin Dashboard
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-destructive rounded-lg"
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
                            <Button variant="outline" className="w-full rounded-lg">
                              Sign in
                            </Button>
                          </Link>
                          <Link href="/signup">
                            <Button className="w-full rounded-lg">
                              Create account
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cart Link */}
                  <Link href="/cart" className="mt-auto">
                    <Button className="w-full justify-start gap-3 rounded-lg">
                      <ShoppingBag className="h-4 w-4" />
                      View Cart
                      {cartCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                        >
                          {cartCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
