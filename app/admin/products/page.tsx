"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Star,
    Package,
    X,
    Save,
} from "lucide-react";
import { useAdminStore, type Product } from "@/store/admin.store";
import { categories } from "@/lib/data/categories";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/custom/SafeImage";
import { toast } from "@/store/toast.store";
import { cn } from "@/lib/utils";

const emptyForm = {
    name: "",
    categoryId: "garden",
    description: "",
    image: "/images/plants/1.jpg",
    price: 0,
    stock: 0,
    isPremium: false,
    sku: "",
    tags: "",
};

function AdminProductsPageInner() {
    const products = useAdminStore((s) => s.products);
    const addProduct = useAdminStore((s) => s.addProduct);
    const updateProduct = useAdminStore((s) => s.updateProduct);
    const deleteProduct = useAdminStore((s) => s.deleteProduct);

    const searchParams = useSearchParams();
    const urlQuery = searchParams.get("q") ?? "";
    const [query, setQuery] = useState(urlQuery);
    const [category, setCategory] = useState<string>("all");
    const [editing, setEditing] = useState<Product | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Keep the search box in sync with ?q= (from the admin top-bar search)
    const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
    if (urlQuery !== prevUrlQuery) {
        setPrevUrlQuery(urlQuery);
        setQuery(urlQuery);
    }

    const filtered = useMemo(() => {
        let list = products;
        if (category !== "all") list = list.filter((p) => p.categoryId === category);
        if (query) {
            const q = query.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.sku?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [products, query, category]);

    function openCreate() {
        setForm(emptyForm);
        setEditing(null);
        setShowForm(true);
    }

    function openEdit(p: Product) {
        setForm({
            name: p.name,
            categoryId: p.categoryId,
            description: p.description,
            image: p.image,
            price: p.price,
            stock: p.stock,
            isPremium: p.isPremium,
            sku: p.sku || "",
            tags: p.tags.join(", "),
        });
        setEditing(p);
        setShowForm(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const price = Number(form.price);
        const stock = Number(form.stock);

        if (price <= 0) {
            toast.error("Invalid price", "Please enter a price greater than 0.");
            return;
        }
        if (stock < 0) {
            toast.error("Invalid stock", "Stock cannot be negative.");
            return;
        }
        if (!form.name.trim()) {
            toast.error("Missing name", "Please give the product a name.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            categoryId: form.categoryId,
            description: form.description.trim(),
            image: form.image,
            price,
            stock,
            isPremium: form.isPremium,
            sku: form.sku.trim() || `SKU-${Date.now()}`,
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        };

        if (editing) {
            updateProduct(editing.id, payload);
            toast.success("Product updated", payload.name);
        } else {
            addProduct(payload);
            toast.success("Product created", `${payload.name} is now live in your store.`);
        }
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
    }

    function handleDelete(id: string) {
        const target = products.find((p) => p.id === id);
        deleteProduct(id);
        setDeleteConfirm(null);
        toast.success("Product deleted", target?.name ?? "Removed from your store.");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Products</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your product catalog
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add product
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, SKU..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="all">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left">Product</th>
                                    <th className="px-4 py-3 text-left">Category</th>
                                    <th className="px-4 py-3 text-left">SKU</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right">Stock</th>
                                    <th className="px-4 py-3 text-left">Rating</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, idx) => (
                                    <motion.tr
                                        key={p.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="border-b border-border last:border-0 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                                                    <SafeImage
                                                        src={p.image}
                                                        alt={p.name}
                                                        fill
                                                        sizes="40px"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">{p.name}</p>
                                                    {p.isPremium ? (
                                                        <Badge variant="default" className="text-[10px]">
                                                            Premium
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 capitalize">{p.categoryId}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {p.sku}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            ₦{p.price.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={cn(
                                                    "inline-block min-w-12 rounded-full px-2 py-0.5 text-xs font-medium",
                                                    p.stock === 0
                                                        ? "bg-destructive/10 text-destructive"
                                                        : p.stock < 10
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-primary/10 text-primary"
                                                )}
                                            >
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-xs">
                                                <Star className="h-3 w-3 fill-current text-accent" />
                                                {(p.rating || 0).toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => openEdit(p)}
                                                    aria-label="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => setDeleteConfirm(p.id)}
                                                    className="text-destructive hover:text-destructive"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">No products found</p>
                                <p className="text-xs text-muted-foreground">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {/* Form modal */}
            <AnimatePresence>
                {showForm && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-50 bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                        />
                        <motion.div
                            className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-card shadow-2xl"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <form onSubmit={handleSubmit} className="flex h-full flex-col">
                                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                                    <h2 className="text-lg font-semibold">
                                        {editing ? "Edit product" : "New product"}
                                    </h2>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setShowForm(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-4 p-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <textarea
                                            required
                                            value={form.description}
                                            onChange={(e) =>
                                                setForm({ ...form, description: e.target.value })
                                            }
                                            rows={3}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Category</label>
                                            <select
                                                value={form.categoryId}
                                                onChange={(e) =>
                                                    setForm({ ...form, categoryId: e.target.value })
                                                }
                                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            >
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">SKU</label>
                                            <Input
                                                value={form.sku}
                                                onChange={(e) =>
                                                    setForm({ ...form, sku: e.target.value })
                                                }
                                                placeholder="auto-generated"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Price (₦)
                                            </label>
                                            <Input
                                                type="number"
                                                min={0}
                                                required
                                                value={form.price}
                                                onChange={(e) =>
                                                    setForm({ ...form, price: Number(e.target.value) })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Stock</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                required
                                                value={form.stock}
                                                onChange={(e) =>
                                                    setForm({ ...form, stock: Number(e.target.value) })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Image URL</label>
                                        <Input
                                            value={form.image}
                                            onChange={(e) =>
                                                setForm({ ...form, image: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Tags (comma separated)
                                        </label>
                                        <Input
                                            value={form.tags}
                                            onChange={(e) =>
                                                setForm({ ...form, tags: e.target.value })
                                            }
                                            placeholder="indoor, low-light"
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.isPremium}
                                            onChange={(e) =>
                                                setForm({ ...form, isPremium: e.target.checked })
                                            }
                                            className="h-4 w-4 accent-primary"
                                        />
                                        Mark as premium
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        <Save className="mr-2 h-4 w-4" />
                                        {editing ? "Save changes" : "Create product"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete confirm modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-50 bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirm(null)}
                        />
                        <motion.div
                            className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-6 shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h3 className="text-lg font-semibold">Delete product?</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                This action cannot be undone. The product will be permanently
                                removed from your store.
                            </p>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(deleteConfirm)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AdminProductsPage() {
    return (
        <Suspense>
            <AdminProductsPageInner />
        </Suspense>
    );
}
