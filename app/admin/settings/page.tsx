"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Save, Store, CreditCard, Bell, Truck, Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/store/toast.store";
import { api, ApiError } from "@/lib/api";
import { useSettingsStore } from "@/store/settings.store";
import type { AdminSettings } from "@/types/api";

export default function AdminSettingsPage() {
  const fetchPublicSettings = useSettingsStore((s) => s.fetchSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<AdminSettings>({
    storeName: "The Garden Fairy",
    supportEmail: "hello@gardenfairy.com",
    phone: "+234 123 456 7890",
    deliveryFee: 3500,
    freeShippingThreshold: 50000,
    paymentProvider: "flutterwave",
    lowStockThreshold: 5,
    vipThreshold: 20000,
    notifyOnNewOrder: true,
    notifyOnLowStock: true,
  });

  useEffect(() => {
    let active = true;
    api<{ data: AdminSettings }>("/admin/settings")
      .then((res) => {
        if (active && res?.data) {
          setForm({
            storeName: res.data.storeName || "The Garden Fairy",
            supportEmail: res.data.supportEmail || "hello@gardenfairy.com",
            phone: res.data.phone || "+234 123 456 7890",
            deliveryFee: Number(res.data.deliveryFee) || 3500,
            freeShippingThreshold: Number(res.data.freeShippingThreshold) || 50000,
            paymentProvider: res.data.paymentProvider || "flutterwave",
            lowStockThreshold: Number(res.data.lowStockThreshold) || 5,
            vipThreshold: Number(res.data.vipThreshold) || 20000,
            notifyOnNewOrder: !!res.data.notifyOnNewOrder,
            notifyOnLowStock: !!res.data.notifyOnLowStock,
          });
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        storeName: form.storeName.trim(),
        supportEmail: form.supportEmail.trim(),
        phone: form.phone.trim(),
        deliveryFee: Number(form.deliveryFee) >= 0 ? Number(form.deliveryFee) : 3500,
        freeShippingThreshold: Number(form.freeShippingThreshold) >= 0 ? Number(form.freeShippingThreshold) : 50000,
        paymentProvider: form.paymentProvider === "paystack" ? "paystack" : "flutterwave",
        lowStockThreshold: Number(form.lowStockThreshold) >= 0 ? Number(form.lowStockThreshold) : 5,
        vipThreshold: Number(form.vipThreshold) >= 0 ? Number(form.vipThreshold) : 20000,
        notifyOnNewOrder: Boolean(form.notifyOnNewOrder),
        notifyOnLowStock: Boolean(form.notifyOnLowStock),
      };

      const res = await api<{ message?: string; data?: AdminSettings }>("/admin/settings", {
        method: "PUT",
        json: payload,
      });

      // Invalidate and refresh public settings store
      await fetchPublicSettings();

      toast.success("Settings saved", res?.message || "Store preferences updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to save settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Store Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure storefront identity, delivery rate logic, inventory alert thresholds and notifications.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </>
          )}
        </Button>
      </div>

      {/* Group 1: Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-primary" />
            Store Information
          </CardTitle>
          <CardDescription>
            Public details rendered on footer, customer receipts and contact forms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Store Name</label>
              <Input
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Support Email</label>
              <Input
                type="email"
                required
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Support Phone</label>
              <Input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group 2: Shipping & Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-primary" />
            Shipping & Rates
          </CardTitle>
          <CardDescription>
            Flat rate fallback fee and minimum subtotal threshold to trigger free delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Default Flat Delivery Fee (₦)</label>
              <Input
                type="number"
                min={0}
                required
                value={form.deliveryFee}
                onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Free Shipping Subtotal Threshold (₦)</label>
              <Input
                type="number"
                min={0}
                required
                value={form.freeShippingThreshold}
                onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group 3: Inventory & Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" />
            Inventory & VIP Thresholds
          </CardTitle>
          <CardDescription>
            Parameters that drive low stock badges and customer VIP classification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Low Stock Warning Threshold (units)</label>
              <Input
                type="number"
                min={0}
                required
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Customer VIP Spend Threshold (₦)</label>
              <Input
                type="number"
                min={0}
                required
                value={form.vipThreshold}
                onChange={(e) => setForm({ ...form, vipThreshold: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group 4: Payments & Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Payment Provider
          </CardTitle>
          <CardDescription>
            Active checkout payment gateway for card processing and webhooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Primary Gateway</label>
            <select
              value={form.paymentProvider}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentProvider: e.target.value as "flutterwave" | "paystack",
                })
              }
              className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="flutterwave">Flutterwave Hosted Checkout</option>
              <option value="paystack">Paystack Inline Gateway</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Group 5: Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            Admin Notifications
          </CardTitle>
          <CardDescription>
            Configure operational alert triggers for the admin notification bell
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            label="Notify on New Orders"
            description="Push notification to the bell whenever a customer commits checkout"
            checked={form.notifyOnNewOrder}
            onChange={(v) => setForm({ ...form, notifyOnNewOrder: v })}
          />
          <Separator />
          <ToggleRow
            label="Notify on Low Stock"
            description="Push notification when product inventory drops below the configured threshold"
            checked={form.notifyOnLowStock}
            onChange={(v) => setForm({ ...form, notifyOnLowStock: v })}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Settings
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-primary" : "bg-muted border border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
