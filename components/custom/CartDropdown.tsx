"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

export function CartDropdown() {
    const items = useCartStore((s) => s.items);
    const count = useCartStore((s) => s.count());

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="relative" aria-label="Open cart">
                    <ShoppingCart className="h-5 w-5" />
                    {count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
                            {count}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-lg p-4"
            >
                <p className="mb-3 text-sm font-semibold">Your cart</p>

                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Your cart is empty</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.slice(0, 4).map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-tight truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ₦{item.price.toLocaleString()} × {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {items.length > 4 ? (
                            <p className="text-xs text-muted-foreground">
                                +{items.length - 4} more in cart
                            </p>
                        ) : null}

                        <Link href="/cart">
                            <Button className="mt-2 w-full">View Cart</Button>
                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
