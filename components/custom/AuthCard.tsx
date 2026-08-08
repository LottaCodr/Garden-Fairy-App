"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AuthCard({
    title,
    description,
    children,
    footer,
    className,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn("w-full", className)}
        >
            <Card className="border-border/60 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">{children}</CardContent>
                {footer ? (
                    <div className="border-t border-border/60 px-6 py-4 text-center text-sm text-muted-foreground">
                        {footer}
                    </div>
                ) : null}
            </Card>
        </motion.div>
    );
}
