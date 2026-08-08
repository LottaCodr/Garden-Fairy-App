"use client";

import { useState } from "react";
import { Save, Store, Mail, CreditCard, Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/store/toast.store";

export default function AdminSettingsPage() {
    const user = useAuthStore((s) => s.user);

    const [storeSettings, setStoreSettings] = useState({
        storeName: "The Garden Fairy",
        supportEmail: "hello@gardenfairy.com",
        phone: "+234 800 000 0000",
        address: "12 Admiralty Way, Lekki, Lagos",
    });

    const [paymentSettings, setPaymentSettings] = useState({
        currency: "NGN",
        deliveryFee: 3500,
        freeShippingThreshold: 50000,
        paymentProvider: "Paystack",
    });

    const [notifSettings, setNotifSettings] = useState({
        newOrderEmail: true,
        lowStockAlerts: true,
        weeklyReports: false,
    });

    const [saved, setSaved] = useState(false);

    function handleSave() {
        // In a real app this would POST to an API
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        toast.success("Settings saved", "Your store preferences have been updated.");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Configure your store preferences
                </p>
            </div>

            {/* Store info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Store className="h-4 w-4 text-primary" />
                        Store information
                    </CardTitle>
                    <CardDescription>
                        Public details shown to your customers
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Store name</label>
                            <Input
                                value={storeSettings.storeName}
                                onChange={(e) =>
                                    setStoreSettings({ ...storeSettings, storeName: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Support email</label>
                            <Input
                                type="email"
                                value={storeSettings.supportEmail}
                                onChange={(e) =>
                                    setStoreSettings({ ...storeSettings, supportEmail: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                                value={storeSettings.phone}
                                onChange={(e) =>
                                    setStoreSettings({ ...storeSettings, phone: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <Input
                                value={storeSettings.address}
                                onChange={(e) =>
                                    setStoreSettings({ ...storeSettings, address: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Payments & delivery
                    </CardTitle>
                    <CardDescription>
                        Configure how you accept payments and calculate shipping
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Currency</label>
                            <Input
                                value={paymentSettings.currency}
                                onChange={(e) =>
                                    setPaymentSettings({ ...paymentSettings, currency: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payment provider</label>
                            <select
                                value={paymentSettings.paymentProvider}
                                onChange={(e) =>
                                    setPaymentSettings({
                                        ...paymentSettings,
                                        paymentProvider: e.target.value,
                                    })
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option>Paystack</option>
                                <option>Flutterwave</option>
                                <option>Stripe</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Standard delivery fee (₦)
                            </label>
                            <Input
                                type="number"
                                value={paymentSettings.deliveryFee}
                                onChange={(e) =>
                                    setPaymentSettings({
                                        ...paymentSettings,
                                        deliveryFee: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Free shipping threshold (₦)
                            </label>
                            <Input
                                type="number"
                                value={paymentSettings.freeShippingThreshold}
                                onChange={(e) =>
                                    setPaymentSettings({
                                        ...paymentSettings,
                                        freeShippingThreshold: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="h-4 w-4 text-primary" />
                        Notifications
                    </CardTitle>
                    <CardDescription>
                        Choose what you want to be notified about
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <ToggleRow
                        label="New order email"
                        description="Receive an email when a new order is placed"
                        checked={notifSettings.newOrderEmail}
                        onChange={(v) => setNotifSettings({ ...notifSettings, newOrderEmail: v })}
                    />
                    <Separator />
                    <ToggleRow
                        label="Low stock alerts"
                        description="Get notified when product stock drops below 10 units"
                        checked={notifSettings.lowStockAlerts}
                        onChange={(v) => setNotifSettings({ ...notifSettings, lowStockAlerts: v })}
                    />
                    <Separator />
                    <ToggleRow
                        label="Weekly performance report"
                        description="A summary of your store's performance every Monday"
                        checked={notifSettings.weeklyReports}
                        onChange={(v) => setNotifSettings({ ...notifSettings, weeklyReports: v })}
                    />
                </CardContent>
            </Card>

            {/* Account info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="h-4 w-4 text-primary" />
                        Your account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{user?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-medium capitalize">{user?.role}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
                {saved ? (
                    <span className="text-xs text-primary font-medium">
                        ✓ Settings saved
                    </span>
                ) : null}
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save changes
                </Button>
            </div>
        </div>
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
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 rounded-full transition ${
                    checked ? "bg-primary" : "bg-muted"
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
