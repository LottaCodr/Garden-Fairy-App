"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Users, ShoppingBag, TrendingUp, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { AdminCustomer } from "@/types/api";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const fetchCustomers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api<{ data: AdminCustomer[]; page?: number }>(`/admin/customers?page=${p}&limit=20`);
      if (res && Array.isArray(res.data)) {
        setCustomers(res.data);
      } else if (Array.isArray(res)) {
        setCustomers(res);
      }
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers(page);
  }, [page, fetchCustomers]);

  const filtered = customers.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((acc, c) => acc + (c.totalSpend || 0), 0);
  const avgSpend = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          View customer lifetime spend, order frequencies and VIP status tiers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Loaded Customers</p>
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
              <p className="text-xs text-muted-foreground">Customer Lifetime Spend</p>
              <p className="text-xl font-bold">₦{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/30 text-accent-foreground">
              <span className="text-base font-bold">₦</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average Spend</p>
              <p className="text-xl font-bold">₦{Math.round(avgSpend).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by customer name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No customers found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, idx) => {
            const isGuest = !c.id && !c.joinedAt;
            return (
              <Card key={c.id || c.email || idx} className="hover:border-primary/40 transition-colors">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {(c.name || c.email || "C").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-sm">{c.name || "Customer"}</p>
                        {isGuest && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            Guest
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <ShoppingBag className="h-3 w-3" />
                        Orders
                      </div>
                      <p className="mt-1 font-semibold">{c.ordersCount || 0}</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span className="text-xs">₦</span>
                        Spent
                      </div>
                      <p className="mt-1 font-semibold">
                        ₦{(c.totalSpend || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>
                      {c.joinedAt ? `Joined ${new Date(c.joinedAt).toLocaleDateString()}` : "Guest Checkout"}
                    </span>
                    <Badge variant={c.vip ? "default" : "secondary"} className="text-[10px]">
                      {c.vip ? "VIP Member" : "Regular"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Simple Next/Prev pagination */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <span className="text-xs text-muted-foreground px-2">
          Page {page}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={customers.length < 20 || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
