import { cn } from "@/lib/utils";


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost";
}


export function Button({ variant = "primary", className, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition",
                variant === "primary" && "bg-primary text-[#181811] hover:brightness-90",
                variant === "ghost" && "hover:bg-primary/20",
                className
            )}
            {...props}
        />
    );
}