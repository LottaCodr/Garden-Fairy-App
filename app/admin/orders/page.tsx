"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Eye, X, ChevronDown, Trash2 } from "lucide-react";
import { useAdminStore, type OrderStatus } from "@/store/admin.store";
import { toast } from "@/store/toast.store";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminOrdersPage() {
    const orders = useAdminStore((s) => s.orders);
    const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);
    const deleteOrder = useAdminStore((s) => s.deleteOrder);

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<"all" | OrderStatus>("all");
    const [selected, setSelected] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const filtered = useMemo(() => {
        let list = orders;
        if (status !== "all") list = list.filter((o) => o.status === status);
        if (query) {
            const q = query.toLowerCase();
            list = list.filter(
                (o) =>
                    o.id.toLowerCase().includes(q) ||
                    o.customerName.toLowerCase().includes(q) ||
                    o.customerEmail.toLowerCase().includes(q)
            );
        }
        return list;
    }, [orders, query, status]);

    const selectedOrder = orders.find((o) => o.id === selected);

    const counts = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = orders.filter((o) => o.status === s).length;
        return acc;
    }, {} as Record<OrderStatus, number>);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight">Orders</h1>
                <p className="text-sm text-muted-foreground">
                    Track and manage customer orders
                </p>
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setStatus("all")}
                    className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        status === "all"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary"
                    )}
                >
                    All ({orders.length})
                </button>
                {STATUS_OPTIONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition",
                            status === s
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card hover:border-primary"
                        )}
                    >
                        {s} ({counts[s]})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search by order ID, customer..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Orders list */}
            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No orders found</p>
                        <p className="text-xs text-muted-foreground">
                            Try changing your filters
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filtered.map((o, idx) => (
                        <motion.div
                            key={o.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                        >
                            <Card className="hover:border-primary transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                                            {o.customerName.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold">{o.customerName}</p>
                                                <span
                                                    className={cn(
                                                        "rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                                                        STATUS_STYLES[o.status]
                                                    )}
                                                >
                                                    {o.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {o.id} · {o.items.length} item
                                                {o.items.length !== 1 ? "s" : ""} ·{" "}
                                                {new Date(o.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold">
                                                ₦{o.total.toLocaleString()}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelected(o.id)}
                                            >
                                                <Eye className="mr-1 h-3.5 w-3.5" />
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Order detail drawer */}
            {selectedOrder && (
                <>
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelected(null)}
                    />
                    <motion.div
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-card shadow-2xl"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                    >
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Order</p>
                                <h2 className="font-mono font-semibold">{selectedOrder.id}</h2>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelected(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Status update */}
                            <div>
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Status
                                </p>
                                <div className="relative">
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => {
                                            const next = e.target.value as OrderStatus;
                                            updateOrderStatus(selectedOrder.id, next);
                                            toast.success(
                                                "Order updated",
                                                `${selectedOrder.id} is now ${next}.`
                                            );
                                        }}
                                        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s} className="capitalize">
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>

                            <Separator />

                            {/* Customer */}
                            <div>
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Customer
                                </p>
                                <p className="font-medium">{selectedOrder.customerName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedOrder.customerEmail}
                                </p>
                            </div>

                            <Separator />

                            {/* Shipping */}
                            <div>
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Shipping address
                                </p>
                                <p className="text-sm">{selectedOrder.shippingAddress}</p>
                            </div>

                            <Separator />

                            {/* Items */}
                            <div>
                                <p className="mb-3 text-xs font-medium text-muted-foreground">
                                    Items
                                </p>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((i) => (
                                        <div key={i.productId} className="flex items-center gap-3">
                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={i.image}
                                                    alt={i.name}
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/images/plants/1.jpg";
                                                    }}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {i.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {i.quantity} × ₦{i.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold">
                                                ₦{(i.price * i.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Totals */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₦{selectedOrder.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span>₦{selectedOrder.delivery.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Total</span>
                                    <span>₦{selectedOrder.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-muted-foreground">Payment</span>
                                    <Badge
                                        variant={
                                            selectedOrder.paymentStatus === "paid"
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        {selectedOrder.paymentStatus}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Delete */}
                            <div className="border-t border-border pt-4">
                                {confirmDelete ? (
                                    <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                                        <p className="text-xs font-medium text-destructive">
                                            Delete this order? This cannot be undone.
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1"
                                                onClick={() => setConfirmDelete(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => {
                                                    deleteOrder(selectedOrder.id);
                                                    setConfirmDelete(false);
                                                    setSelected(null);
                                                    toast.success(
                                                        "Order deleted",
                                                        selectedOrder.id
                                                    );
                                                }}
                                            >
                                                Delete order
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-destructive hover:text-destructive"
                                        onClick={() => setConfirmDelete(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete order
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
