"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, type ToastKind } from "@/store/toast.store";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<ToastKind, { icon: typeof CheckCircle2; ring: string; iconColor: string }> = {
    success: {
        icon: CheckCircle2,
        ring: "border-primary/25",
        iconColor: "text-primary",
    },
    error: {
        icon: AlertCircle,
        ring: "border-destructive/30",
        iconColor: "text-destructive",
    },
    info: {
        icon: Info,
        ring: "border-border",
        iconColor: "text-foreground",
    },
};

export function Toaster() {
    const toasts = useToastStore((s) => s.toasts);
    const dismiss = useToastStore((s) => s.dismiss);

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-2 px-4"
        >
            <AnimatePresence>
                {toasts.map((t) => {
                    const styles = KIND_STYLES[t.kind];
                    const Icon = styles.icon;
                    return (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, y: -16, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className={cn(
                                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg shadow-black/5",
                                styles.ring
                            )}
                        >
                            <Icon className={cn("mt-0.5 h-4.5 w-4.5 shrink-0", styles.iconColor)} />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                                {t.description ? (
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {t.description}
                                    </p>
                                ) : null}
                            </div>
                            <button
                                onClick={() => dismiss(t.id)}
                                aria-label="Dismiss notification"
                                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
