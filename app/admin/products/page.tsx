"use client";

import { useState, useEffect, useMemo, useCallback, type FormEvent, type ChangeEvent } from "react";
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
  Archive,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/custom/SafeImage";
import { toast } from "@/store/toast.store";
import { api, ApiError } from "@/lib/api";
import type { Product, Category, Paged } from "@/types/api";
import { getProductImage } from "@/lib/product-helpers";
import { cn } from "@/lib/utils";

const emptyForm = {
  name: "",
  categoryId: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "10",
  sunlight: "Bright, indirect light",
  watering: "Water every 1–2 weeks",
  temperature: "18°C–27°C",
  isPremium: false,
  tags: "",
  status: "active" as "active" | "archived",
};

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [query, setQuery] = useState(urlQuery);
  const [tab, setTab] = useState<"all" | "active" | "archived">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load categories
  useEffect(() => {
    api<{ success?: boolean; data?: Category[] }>("/categories")
      .then((res) => {
        if (Array.isArray(res?.data)) setCategories(res.data);
        else if (Array.isArray(res)) setCategories(res);
      })
      .catch(() => setCategories([]));
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("include_archived", "true");
      if (query.trim()) params.set("q", query.trim());
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await api<Paged<Product>>(`/admin/products?${params.toString()}`);
      if (res && Array.isArray(res.data)) {
        setProducts(res.data);
        setTotal(res.total ?? res.data.length);
        setTotalPages(res.pages || 1);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, categoryFilter, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    if (tab === "all") return products;
    return products.filter((p) => (p.status || "active") === tab);
  }, [products, tab]);

  // Open Create modal
  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?._id || "",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  // Open Edit modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    const catId = typeof p.category === "object" && p.category ? p.category._id : (p.category as string);
    setForm({
      name: p.name || "",
      categoryId: catId || categories[0]?._id || "",
      description: p.description || "",
      price: p.price ? p.price.toString() : "",
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : "",
      stock: p.stock !== undefined ? p.stock.toString() : "0",
      sunlight: p.care?.sunlight || "Bright, indirect light",
      watering: p.care?.watering || "Water every 1–2 weeks",
      temperature: p.care?.temperature || "18°C–27°C",
      isPremium: !!p.isPremium,
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      status: p.status || "active",
    });
    setImageFiles([]);
    setImagePreviews(p.images || (p.imageUrl ? p.imageUrl.map((i) => i.url) : []));
    setShowModal(true);
  };

  // Handle image files selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 6);
      setImageFiles(files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  // Submit product creation or update
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      toast.error("Please enter a product name.");
      return;
    }
    if (price <= 0 || isNaN(price)) {
      toast.error("Price must be greater than 0.");
      return;
    }
    if (stock < 0 || isNaN(stock)) {
      toast.error("Stock cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", price.toString());
      if (form.compareAtPrice) {
        formData.append("compareAtPrice", Number(form.compareAtPrice).toString());
      }
      if (form.categoryId) {
        formData.append("category", form.categoryId);
      }
      formData.append("stock", stock.toString());
      formData.append("care[sunlight]", form.sunlight);
      formData.append("care[watering]", form.watering);
      formData.append("care[temperature]", form.temperature);
      formData.append("isPremium", form.isPremium ? "true" : "false");
      formData.append("status", form.status);

      form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tag) => formData.append("tags", tag));

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (editingProduct) {
        await api(`/admin/products/${editingProduct._id}`, {
          method: "PUT",
          body: formData,
        });
        toast.success("Product updated", form.name);
      } else {
        await api("/admin/products", {
          method: "POST",
          body: formData,
        });
        toast.success("Product created", `${form.name} is now live.`);
      }

      setShowModal(false);
      await fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to save product";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Handle soft archive or permanent delete
  const handleDelete = async (permanent: boolean) => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api(`/admin/products/${deleteConfirm.id}${permanent ? "?permanent=true" : ""}`, {
        method: "DELETE",
      });
      toast.success(
        permanent ? "Product permanently deleted" : "Product archived",
        deleteConfirm.name,
      );
      setDeleteConfirm(null);
      await fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete product";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Products Admin</h1>
          <p className="text-sm text-muted-foreground">
            Manage inventory stock, pricing, care guidelines, and product imagery.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              tab === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary",
            )}
          >
            All Products
          </button>
          <button
            onClick={() => setTab("active")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              tab === "active"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary",
            )}
          >
            Active Only
          </button>
          <button
            onClick={() => setTab("archived")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              tab === "archived"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary",
            )}
          >
            Archived
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
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
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-xs text-muted-foreground">
                      <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const img = getProductImage(p);
                    const catName = typeof p.category === "object" && p.category ? p.category.name : "Category";
                    const isArchived = p.status === "archived";

                    return (
                      <tr
                        key={p._id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                              <SafeImage
                                src={img}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{p.name}</p>
                              {p.isPremium && (
                                <Badge variant="default" className="text-[9px] px-1 py-0">
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{catName}</td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                          {p.sku || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ₦{p.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              "inline-block min-w-10 rounded-full px-2 py-0.5 text-xs font-medium",
                              p.stock === 0
                                ? "bg-destructive/10 text-destructive font-bold"
                                : p.stock < 5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-primary/10 text-primary",
                            )}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="h-3.5 w-3.5 fill-current text-accent" />
                            {(p.rating || 5).toFixed(1)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={isArchived ? "secondary" : "outline"}
                            className="text-[10px] capitalize"
                          >
                            {p.status || "active"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditModal(p)}
                              aria-label="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteConfirm({ id: p._id, name: p.name })}
                              className="text-destructive hover:text-destructive"
                              aria-label="Delete or Archive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {page} of {totalPages} ({total} items)
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

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-card shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <form onSubmit={handleSubmit} className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="text-lg font-semibold">
                    {editingProduct ? "Edit Product" : "New Product"}
                  </h2>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-4 p-6 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Product Name *</label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Monstera Deliciosa"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="A lush, air-purifying indoor plant..."
                      className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Category *</label>
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Catalog Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "archived" })}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Price (₦) *</label>
                      <Input
                        type="number"
                        min={1}
                        required
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Compare At (₦)</label>
                      <Input
                        type="number"
                        min={0}
                        value={form.compareAtPrice}
                        onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Stock Units *</label>
                      <Input
                        type="number"
                        min={0}
                        required
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Care Specifications */}
                  <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/20">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Care Specifications
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium">Sunlight</label>
                        <Input
                          value={form.sunlight}
                          onChange={(e) => setForm({ ...form, sunlight: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium">Watering</label>
                        <Input
                          value={form.watering}
                          onChange={(e) => setForm({ ...form, watering: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium">Temperature</label>
                        <Input
                          value={form.temperature}
                          onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Uploads */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Product Imagery (Max 6)</label>
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-4 hover:border-primary/50 transition-colors">
                      <label className="flex flex-col items-center gap-1 cursor-pointer text-center">
                        <UploadCloud className="h-6 w-6 text-primary" />
                        <span className="text-xs font-medium">Click to upload image files</span>
                        <span className="text-[10px] text-muted-foreground">PNG, JPG or WebP (up to 5MB)</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {imagePreviews.map((src, i) => (
                          <div key={i} className="relative h-16 w-16 rounded border overflow-hidden bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="Preview" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Tags (comma separated)</label>
                    <Input
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="indoor, pet-friendly, low-light"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPremium}
                      onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                      className="accent-primary h-4 w-4"
                    />
                    Mark as Premium / Featured product
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingProduct ? "Save Changes" : "Create Product"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete / Archive Confirmation Modal */}
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
              className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-lg font-bold">Remove Product: {deleteConfirm.name}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Choose whether to soft-delete (archive) this product or permanently remove it from database records.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <Button
                  variant="outline"
                  disabled={deleting}
                  onClick={() => handleDelete(false)}
                  className="w-full justify-start text-xs"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Soft Archive (recommended for past order snapshots)
                </Button>

                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={() => handleDelete(true)}
                  className="w-full justify-start text-xs"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Permanent Delete (?permanent=true)
                </Button>

                <Button
                  variant="ghost"
                  disabled={deleting}
                  onClick={() => setDeleteConfirm(null)}
                  className="w-full mt-1 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
