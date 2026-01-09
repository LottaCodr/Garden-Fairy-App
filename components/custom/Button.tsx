import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost";
}

export function Button({
    variant = "primary",
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled}
            className={cn(
                "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:opacity-50 disabled:pointer-events-none",
                variant === "primary" &&
                "bg-primary text-primary-foreground hover:brightness-95 active:scale-[0.98]",
                variant === "ghost" &&
                "text-foreground hover:bg-primary/15",
                className
            )}
            {...props}
        />
    );
}
