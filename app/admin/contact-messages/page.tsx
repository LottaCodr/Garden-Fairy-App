"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, MessageSquare, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast.store";
import { api, ApiError } from "@/lib/api";
import type { ContactMessage, Paged } from "@/types/api";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: ("NEW" | "REPLIED" | "CLOSED")[] = ["NEW", "REPLIED", "CLOSED"];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  REPLIED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CLOSED: "bg-muted text-muted-foreground",
};

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState<"all" | "NEW" | "REPLIED" | "CLOSED">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await api<Paged<ContactMessage>>(`/admin/contact-messages?${params.toString()}`);
      if (res && Array.isArray(res.data)) {
        setMessages(res.data);
        setTotal(res.total ?? res.data.length);
        setTotalPages(res.pages || 1);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const handleUpdateStatus = async (id: string, newStatus: "NEW" | "REPLIED" | "CLOSED") => {
    try {
      await api(`/admin/contact-messages/${id}`, {
        method: "PATCH",
        json: { status: newStatus },
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m)),
      );
      toast.success("Message status updated", `Marked as ${newStatus}`);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to update status";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Contact Messages Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Customer questions, inquiries and support emails submitted from the storefront.
        </p>
      </div>

      {/* Filter Tabs */}
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
          All Messages
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              statusFilter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-xs text-muted-foreground">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              No messages found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((m) => {
                const isExpanded = expandedId === m._id;
                return (
                  <div
                    key={m._id}
                    className="p-4 transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : m._id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex-1 min-w-[200px] px-2">
                        <p className="font-medium text-xs text-foreground truncate">{m.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                      </div>

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>

                        <select
                          value={m.status}
                          onChange={(e) =>
                            handleUpdateStatus(m._id, e.target.value as "NEW" | "REPLIED" | "CLOSED")
                          }
                          className={cn(
                            "h-7 rounded border px-2 text-[10px] font-semibold uppercase focus:outline-none",
                            STATUS_STYLES[m.status],
                          )}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-border/50 text-xs space-y-2 bg-muted/20 p-3 rounded-lg">
                        <p className="font-semibold text-foreground">Subject: {m.subject}</p>
                        <p className="whitespace-pre-line text-foreground/90 leading-relaxed">
                          {m.message}
                        </p>
                        <div className="pt-2 flex items-center gap-2">
                          <a
                            href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Reply via email ({m.email})
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
            Page {page} of {totalPages} ({total} messages)
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
    </div>
  );
}
