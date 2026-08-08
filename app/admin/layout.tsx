"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
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
  MessageSquare,
  Tags,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { api } from "@/lib/api";
import type { AdminNotification } from "@/types/api";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/contact-messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = useAuthStore((s) => s.user);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const signout = useAuthStore((s) => s.signout);

  // Admin notifications
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api<{
        data: AdminNotification[];
        unreadCount?: number;
      }>("/admin/notifications");
      if (res?.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount ?? res.data.filter((n) => !n.readAt).length);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed) {
      router.replace("/signin?redirect=/admin");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/");
      return;
    }

    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 0);

    const interval = setInterval(() => {
      void fetchNotifications();
    }, 30000); // 30s poll

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [hydrated, isAuthed, user, router, fetchNotifications]);

  const markNotificationRead = async (id: string, path?: string) => {
    try {
      await api(`/admin/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (path) router.push(path);
    } catch {
      if (path) router.push(path);
    }
  };

  const markAllRead = async () => {
    try {
      await api("/admin/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!hydrated || !isAuthed || user?.role !== "admin") {
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

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/admin/products?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-h))] bg-muted/30">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex sticky top-[var(--header-h)] h-[calc(100vh-var(--header-h))] w-64 shrink-0 flex-col border-r border-border bg-card">
          <div className="px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Store Admin
            </p>
            <p className="mt-1 text-sm font-bold">The Garden Fairy</p>
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
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
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
              onClick={async () => {
                await signout();
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
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-border p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={async () => {
                      await signout();
                      router.push("/");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="sticky top-[var(--header-h)] z-30 flex items-center gap-2 border-b border-border bg-background/95 backdrop-blur px-4 py-3 md:px-6">
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Breadcrumb path={pathname} />

            <div className="ml-auto flex items-center gap-2">
              <form onSubmit={handleSearch} className="hidden sm:flex relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="h-9 w-48 pl-8 lg:w-64"
                />
              </form>

              {/* Notifications Bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="relative" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-lg p-2"
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                    <p className="text-sm font-semibold">Admin Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                    {notifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No notifications yet 🎉
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((n) => {
                        const isUnread = !n.readAt;
                        const isNewOrder = n.type === "NEW_ORDER";
                        const isLowStock = n.type === "LOW_STOCK";
                        const targetPath = isNewOrder
                          ? `/admin/orders`
                          : isLowStock
                            ? `/admin/products`
                            : `/admin/orders`;

                        return (
                          <div
                            key={n._id}
                            onClick={() => markNotificationRead(n._id, targetPath)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors cursor-pointer hover:bg-muted",
                              isUnread && "bg-primary/5 font-medium",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs",
                                isNewOrder
                                  ? "bg-primary/15 text-primary"
                                  : isLowStock
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-muted text-foreground",
                              )}
                            >
                              {isNewOrder ? (
                                <ShoppingBag className="h-3.5 w-3.5" />
                              ) : isLowStock ? (
                                <AlertTriangle className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {n.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            {isUnread && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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
              {s.replace("-", " ").charAt(0).toUpperCase() + s.replace("-", " ").slice(1)}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
