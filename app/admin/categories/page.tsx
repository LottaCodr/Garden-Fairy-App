"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Plus, Edit, Trash2, Tags, Loader2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/store/toast.store";
import { api, ApiError } from "@/lib/api";
import type { Category } from "@/types/api";
import { CategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  "leaf",
  "tree-pine",
  "flower-2",
  "flower",
  "sparkles",
  "home",
  "laptop",
  "shirt",
  "package",
  "sun",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "leaf",
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ success?: boolean; data?: Category[] }>("/categories");
      if (Array.isArray(res?.data)) {
        setCategories(res.data);
      } else if (Array.isArray(res)) {
        setCategories(res);
      }
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      icon: "leaf",
    });
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      icon: cat.icon || "leaf",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await api(`/categories/${editingCategory._id}`, {
          method: "PUT",
          json: {
            name: form.name.trim(),
            slug: form.slug.trim() || undefined,
            description: form.description.trim() || undefined,
            icon: form.icon,
          },
        });
        toast.success("Category updated", form.name);
      } else {
        await api("/categories", {
          method: "POST",
          json: {
            name: form.name.trim(),
            slug: form.slug.trim() || undefined,
            description: form.description.trim() || undefined,
            icon: form.icon,
          },
        });
        toast.success("Category created", form.name);
      }

      setShowModal(false);
      await fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to save category";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/categories/${id}`, {
        method: "DELETE",
      });
      toast.info("Category deleted");
      setDeleteConfirmId(null);
      await fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete category";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Categories Admin</h1>
          <p className="text-sm text-muted-foreground">
            Manage catalog taxonomy, Lucide iconography, and category routing slugs.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Icon</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-xs text-muted-foreground">
                      <Tags className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <CategoryIcon name={c.icon} className="h-4 w-4" />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{c.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.slug}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                        {c.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditModal(c)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(c._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
              className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {editingCategory ? "Edit Category" : "New Category"}
                </h3>
                <Button size="icon" variant="ghost" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category Name *</label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Garden & Outdoor"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Slug (optional)</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="garden-outdoor"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Lucide Icon</label>
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {ICON_OPTIONS.map((iconKey) => {
                      const isSelected = form.icon === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setForm({ ...form, icon: iconKey })}
                          className={cn(
                            "flex h-9 items-center justify-center rounded-lg border text-xs transition-colors",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                              : "border-border hover:bg-muted text-muted-foreground",
                          )}
                        >
                          <CategoryIcon name={iconKey} className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Outdoor setups and climate-adapted plants..."
                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save Category
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="text-lg font-bold">Delete Category?</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Products currently assigned to this category will have their category link unassigned.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteConfirmId)}>
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
