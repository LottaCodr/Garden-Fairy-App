"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Package,
  Mail,
  Phone,
  ShoppingBag,
  ArrowRight,
  LogOut,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Ban,
  Truck,
  Eye,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/store/toast.store";
import { api, ApiError } from "@/lib/api";
import type { Order, Address, Paged, TimelineEntry, OrderStatus } from "@/types/api";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending_payment", label: "Pending" },
  { status: "paid", label: "Paid" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

export default function ProfilePage() {
  const router = useRouter();
  const hydrated = useHydrated();

  const user = useAuthStore((s) => s.user);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const signout = useAuthStore((s) => s.signout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const addAddress = useAuthStore((s) => s.addAddress);
  const updateAddress = useAuthStore((s) => s.updateAddress);
  const deleteAddress = useAuthStore((s) => s.deleteAddress);

  // Profile Form state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    avatarUrl: "",
  });

  // Address modal / form state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    street: "",
    city: "",
    state: "Lagos",
    isDefault: false,
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderTimeline, setOrderTimeline] = useState<TimelineEntry[]>([]);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Sync profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  // Auth protection
  useEffect(() => {
    if (hydrated && !isAuthed) {
      router.replace("/signin?redirect=/profile");
    }
  }, [hydrated, isAuthed, router]);

  // Fetch customer orders from GET /api/orders/my
  const fetchMyOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await api<Paged<Order> | { data: Order[] }>("/orders/my?page=1&limit=20");
      if (res && Array.isArray((res as Paged<Order>).data)) {
        setOrders((res as Paged<Order>).data);
      } else if (res && Array.isArray((res as { data: Order[] }).data)) {
        setOrders((res as { data: Order[] }).data);
      } else if (Array.isArray(res)) {
        setOrders(res);
      }
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) {
      void fetchMyOrders();
    }
  }, [isAuthed, fetchMyOrders]);

  // View order detail + timeline
  const handleViewOrder = async (orderId: string) => {
    try {
      const res = await api<{ data: Order; timeline?: TimelineEntry[] }>(`/orders/${orderId}`);
      if (res?.data) {
        setSelectedOrder(res.data);
        setOrderTimeline(res.timeline || []);
      }
    } catch {
      const fallback = orders.find((o) => o._id === orderId);
      if (fallback) {
        setSelectedOrder(fallback);
        setOrderTimeline([]);
      }
    }
  };

  // Pay now for pending orders
  const handlePayNow = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      const res = await api<{ txRef: string; paymentLink?: string }>("/payments/initialize", {
        method: "POST",
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
        json: { orderId },
      });

      if (res?.paymentLink) {
        window.location.assign(res.paymentLink);
      } else {
        router.push(`/payment/callback?tx_ref=${encodeURIComponent(res.txRef)}`);
      }
    } catch (err: unknown) {
      setPayingOrderId(null);
      const msg = err instanceof ApiError ? err.message : "Failed to initialize payment";
      toast.error(msg);
    }
  };

  // Cancel pending order
  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      await api(`/orders/${orderId}/cancel`, {
        method: "POST",
      });
      toast.success("Order cancelled", "Your order has been cancelled and stock returned.");
      await fetchMyOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Could not cancel this order";
      toast.error(msg);
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Save profile edits
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const res = await updateProfile(profileForm);
    if (res.ok) {
      toast.success("Profile updated");
      setEditingProfile(false);
    } else {
      toast.error(res.error || "Failed to update profile");
    }
  };

  // Address operations
  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: "Home",
      street: "",
      city: "Ikeja",
      state: "Lagos",
      isDefault: (user?.addresses?.length ?? 0) === 0,
    });
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddressId(addr._id || null);
    setAddressForm({
      label: addr.label || "Home",
      street: addr.street,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.state.trim()) {
      toast.error("Street, city, and state are required");
      return;
    }

    if (editingAddressId) {
      const res = await updateAddress(editingAddressId, addressForm);
      if (res.ok) {
        toast.success("Address updated");
        setShowAddressModal(false);
      } else {
        toast.error(res.error || "Failed to update address");
      }
    } else {
      const res = await addAddress(addressForm);
      if (res.ok) {
        toast.success("Address added");
        setShowAddressModal(false);
      } else {
        toast.error(res.error || "Failed to add address");
      }
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    const res = await deleteAddress(addrId);
    if (res.ok) {
      toast.info("Address removed");
    } else {
      toast.error(res.error || "Failed to delete address");
    }
  };

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const addresses = user.addresses || [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
            My Account
          </p>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.role === "admin" && (
            <Link href="/admin">
              <Button>
                Open Admin Panel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            onClick={async () => {
              await signout();
              router.push("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 text-accent-foreground">
              <span className="text-base font-bold">₦</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spend</p>
              <p className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Account Profile & Address Book */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Profile Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProfile(!editingProfile)}
              >
                {editingProfile ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {editingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Name</label>
                    <Input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Phone</label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="080 1234 5678"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Avatar URL</label>
                    <Input
                      value={profileForm.avatarUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full mt-2">
                    Save Profile
                  </Button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px] mt-0.5">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{user.phone}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Book Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Address Book</CardTitle>
                <CardDescription className="text-xs">
                  {addresses.length} of 10 addresses
                </CardDescription>
              </div>
              {addresses.length < 10 && (
                <Button size="sm" variant="outline" onClick={openNewAddressModal}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No saved addresses yet.
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr._id || `${addr.street}-${addr.city}`}
                    className="rounded-lg border border-border p-3 text-xs space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {addr.label || "Address"}
                      </span>
                      {addr.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{addr.street}</p>
                    <p className="text-muted-foreground">
                      {addr.city}, {addr.state}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => openEditAddressModal(addr)}
                        className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      {addr._id && (
                        <button
                          onClick={() => handleDeleteAddress(addr._id!)}
                          className="text-destructive hover:underline flex items-center gap-1 text-[11px] ml-auto"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Orders */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order History</CardTitle>
              <CardDescription className="text-xs">
                View your past orders, delivery status timeline and receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No orders yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your placed orders will appear here.
                  </p>
                  <Link href="/shop" className="mt-4 inline-block">
                    <Button size="sm">Start shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div
                      key={o._id}
                      className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-semibold">{o._id}</span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                              STATUS_STYLES[o.status] || "bg-muted text-muted-foreground",
                            )}
                          >
                            {o.status.replace("_", " ")}
                          </span>
                          <span className="font-bold text-sm">
                            ₦{o.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {o.items?.map((item, idx) => (
                          <span key={idx} className="bg-muted/60 rounded px-2 py-1">
                            {item.qty}× {item.name}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(o._id)}
                          className="text-xs"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View Details & Stepper
                        </Button>

                        <div className="flex items-center gap-2">
                          {o.status === "pending_payment" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelOrder(o._id)}
                                disabled={cancellingOrderId === o._id}
                                className="text-destructive hover:text-destructive text-xs"
                              >
                                {cancellingOrderId === o._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                  <Ban className="h-3.5 w-3.5 mr-1" />
                                )}
                                Cancel Order
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => handlePayNow(o._id)}
                                disabled={payingOrderId === o._id}
                                className="text-xs"
                              >
                                {payingOrderId === o._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                                )}
                                Pay Now
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Detail Modal / Stepper */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
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
                  <p className="text-xs text-muted-foreground">Order Details</p>
                  <h2 className="font-mono font-semibold">{selectedOrder._id}</h2>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedOrder(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6 p-6">
                {/* Timeline Stepper */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Status Timeline
                  </p>
                  {selectedOrder.status === "cancelled" ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
                      <p className="text-sm font-semibold text-destructive">Order Cancelled</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This order was cancelled and items returned to stock.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      {ORDER_STEPS.map((step, idx) => {
                        const currentIndex = ORDER_STEPS.findIndex((s) => s.status === selectedOrder.status);
                        const isDone = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;
                        const timelineMatch = orderTimeline.find((t) => t.status === step.status);

                        return (
                          <div key={step.status} className="relative flex items-start gap-3 text-xs">
                            <div
                              className={cn(
                                "absolute -left-6 top-0 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-colors",
                                isDone
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground border border-border",
                              )}
                            >
                              {isDone ? "✓" : idx + 1}
                            </div>
                            <div>
                              <p className={cn("font-semibold", isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground")}>
                                {step.label}
                              </p>
                              {timelineMatch?.at && (
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(timelineMatch.at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Delivery Info */}
                {selectedOrder.delivery && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-primary" /> Delivery Info
                    </p>
                    <div className="rounded-lg border border-border p-3 text-xs space-y-1">
                      {selectedOrder.delivery.provider && (
                        <p><span className="text-muted-foreground">Carrier:</span> {selectedOrder.delivery.provider}</p>
                      )}
                      {selectedOrder.delivery.trackingId && (
                        <p><span className="text-muted-foreground">Tracking ID:</span> <span className="font-mono">{selectedOrder.delivery.trackingId}</span></p>
                      )}
                      {selectedOrder.delivery.etaDays && (
                        <p><span className="text-muted-foreground">Estimated Delivery:</span> ~{selectedOrder.delivery.etaDays} days</p>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Shipping Address */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Shipping Address
                  </p>
                  <div className="text-xs space-y-0.5 text-muted-foreground">
                    <p className="font-medium text-foreground">{selectedOrder.shippingAddress?.name || selectedOrder.customerName}</p>
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                    <p>{selectedOrder.shippingAddress?.phone || selectedOrder.phone}</p>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Items ({selectedOrder.items?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.qty} {item.size ? `· Size: ${item.size}` : ""}</p>
                        </div>
                        <span className="font-semibold">
                          ₦{(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{(selectedOrder.subtotal || selectedOrder.total).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {selectedOrder.delivery?.fee === 0 ? "FREE" : `₦${(selectedOrder.delivery?.fee || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                    <span>Total</span>
                    <span>₦{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action button in drawer */}
                {selectedOrder.status === "pending_payment" && (
                  <div className="pt-4 flex gap-2">
                    <Button
                      onClick={() => handlePayNow(selectedOrder._id)}
                      disabled={payingOrderId === selectedOrder._id}
                      className="w-full"
                    >
                      {payingOrderId === selectedOrder._id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Pay ₦{selectedOrder.total.toLocaleString()}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowAddressModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Label</label>
                  <Input
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    placeholder="Home, Office, Studio..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Street Address *</label>
                  <Input
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="12 Garden Road, Lekki"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">City / Area *</label>
                    <Input
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Ikeja"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">State *</label>
                    <Input
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="Lagos"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="accent-primary h-4 w-4"
                  />
                  Set as default shipping address
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Address
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
