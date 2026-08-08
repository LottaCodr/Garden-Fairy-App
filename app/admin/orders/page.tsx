"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Eye,
  X,
  Trash2,
  User as UserIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/store/toast.store";
import { api, ApiError } from "@/lib/api";
import type { Order, OrderStatus, Paged, TimelineEntry } from "@/types/api";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status update dialog
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [deliveryProvider, setDeliveryProvider] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (query.trim()) params.set("q", query.trim());
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await api<Paged<Order>>(`/admin/orders?${params.toString()}`);
      if (res && Array.isArray(res.data)) {
        setOrders(res.data);
        setTotal(res.total ?? res.data.length);
        setTotalPages(res.pages || 1);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, query, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  // Open order detail
  const openOrderDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailLoading(true);
    try {
      const res = await api<{ data: Order; timeline?: TimelineEntry[] }>(`/admin/orders/${orderId}`);
      if (res?.data) {
        setSelectedOrder(res.data);
        setTimeline(res.timeline || []);
        setNewStatus(res.data.status);
        setDeliveryProvider(res.data.delivery?.provider || "");
        setTrackingId(res.data.delivery?.trackingId || "");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order details";
      toast.error(msg);
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit status update
  const handleUpdateStatus = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setUpdatingStatus(true);
    try {
      await api<{ data?: Order }>(`/admin/orders/${selectedOrder._id}/status`, {
        method: "PUT",
        json: {
          status: newStatus,
          ...(newStatus === "shipped" || deliveryProvider ? { deliveryProvider } : {}),
          ...(newStatus === "shipped" || trackingId ? { trackingId } : {}),
        },
      });

      toast.success("Order status updated", `Order marked as ${newStatus}`);
      await fetchOrders();
      if (selectedOrder._id) {
        await openOrderDetail(selectedOrder._id);
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to update order status";
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete unpaid pending order
  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrder(true);
    try {
      await api(`/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      toast.success("Order deleted", "The unpaid order was purged and items restocked.");
      setDeleteConfirmId(null);
      setSelectedOrderId(null);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Only pending unpaid orders can be deleted.";
      toast.error(msg);
    } finally {
      setDeletingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Orders Management</h1>
        <p className="text-sm text-muted-foreground">
          Fulfill customer purchases, update delivery tracking and monitor order flows.
        </p>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            statusFilter === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-primary",
          )}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition",
              statusFilter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary",
            )}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, email, phone or ID..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Orders Table / List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No matching orders found</p>
            <p className="text-xs text-muted-foreground">Try clearing filters or search query</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o._id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold text-sm">
                    {(o.customerName || "U").charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {o.customerName || o.customerEmail || "Customer"}
                      </p>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                          STATUS_STYLES[o.status] || "bg-muted text-muted-foreground",
                        )}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{o._id}</span> · {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">
                      ₦{o.total.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openOrderDetail(o._id)}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({total} orders)
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {selectedOrderId && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderId(null)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-card shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order Management</p>
                  <h2 className="font-mono font-semibold">{selectedOrderId}</h2>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedOrderId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {detailLoading || !selectedOrder ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6 p-6">
                  {/* Status update form */}
                  <form onSubmit={handleUpdateStatus} className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Update Order Status
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Order Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* If changing to shipped, prompt for tracking info */}
                    {newStatus === "shipped" && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Carrier</label>
                          <Input
                            placeholder="GIG Logistics, DHL..."
                            value={deliveryProvider}
                            onChange={(e) => setDeliveryProvider(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Tracking ID</label>
                          <Input
                            placeholder="TRK-987654"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <Button type="submit" size="sm" className="w-full" disabled={updatingStatus}>
                      {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                      Save Status
                    </Button>
                  </form>

                  {/* Status Timeline */}
                  {timeline.length > 0 && (
                    <div className="rounded-lg border border-border p-3 text-xs space-y-2">
                      <p className="font-semibold text-muted-foreground uppercase text-[10px]">Timeline Log</p>
                      <div className="space-y-1">
                        {timeline.map((t, idx) => (
                          <div key={idx} className="flex justify-between text-muted-foreground text-[11px]">
                            <span className="capitalize font-medium text-foreground">{t.status.replace("_", " ")}</span>
                            <span>{t.at ? new Date(t.at).toLocaleString() : "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Customer Information */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-primary" /> Customer Info
                    </p>
                    <div className="rounded-lg border border-border p-3 text-xs space-y-1">
                      <p className="font-semibold text-foreground">{selectedOrder.customerName || "Customer"}</p>
                      <p className="text-muted-foreground">{selectedOrder.customerEmail}</p>
                      {selectedOrder.phone ? <p className="text-muted-foreground">{selectedOrder.phone}</p> : null}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Shipping Destination
                    </p>
                    <div className="rounded-lg border border-border p-3 text-xs space-y-0.5 text-muted-foreground">
                      <p className="font-medium text-foreground">{selectedOrder.shippingAddress?.name || selectedOrder.customerName}</p>
                      <p>{selectedOrder.shippingAddress?.street}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                      <p>{selectedOrder.shippingAddress?.phone || selectedOrder.phone}</p>
                      {selectedOrder.notes && (
                        <p className="pt-2 text-[11px] text-foreground font-medium italic border-t border-border mt-2">
                          &ldquo;{selectedOrder.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Items snapshot */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Order Items ({selectedOrder.items?.length || 0})
                    </p>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-muted-foreground">
                              {item.qty} × ₦{item.price.toLocaleString()} {item.size ? `· Size: ${item.size}` : ""}
                            </p>
                          </div>
                          <span className="font-semibold">
                            ₦{(item.price * item.qty).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment & Totals */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₦{(selectedOrder.subtotal || selectedOrder.total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>₦{(selectedOrder.delivery?.fee || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-1 border-t border-border">
                      <span>Total Amount</span>
                      <span>₦{selectedOrder.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground">Payment Provider / Status:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono capitalize text-[11px]">{selectedOrder.payment?.provider || "Flutterwave"}</span>
                        <Badge
                          variant={selectedOrder.payment?.status === "paid" ? "default" : "destructive"}
                          className="text-[10px]"
                        >
                          {selectedOrder.payment?.status || "unpaid"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Guarded Delete for unpaid pending orders */}
                  {selectedOrder.status === "pending_payment" && selectedOrder.payment?.status !== "paid" && (
                    <div className="border-t border-border pt-4">
                      {deleteConfirmId === selectedOrder._id ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                          <p className="text-xs font-semibold text-destructive">
                            Purge this unpaid pending order? This will restock reserved units.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-1 text-xs"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 text-xs"
                              disabled={deletingOrder}
                              onClick={() => handleDeleteOrder(selectedOrder._id)}
                            >
                              {deletingOrder ? "Deleting…" : "Confirm Delete"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:text-destructive text-xs"
                          onClick={() => setDeleteConfirmId(selectedOrder._id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete Unpaid Order
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
