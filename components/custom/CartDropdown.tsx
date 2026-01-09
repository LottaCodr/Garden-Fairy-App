"use client";

import Image from "next/image";
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
    const { items, count } = useCartStore();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {count > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
                            {count}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-72 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-lg p-4"
            >
                <p className="mb-3 text-sm font-medium">Your cart</p>

                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Your cart is empty
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover"
                                />
                                <div className="flex-1">
                                    <p className="text-sm leading-tight">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ₦{item.price.toLocaleString()} × {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <Link href="/cart">
                            <Button className="mt-2 w-full">View Cart</Button>
                        </Link>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
