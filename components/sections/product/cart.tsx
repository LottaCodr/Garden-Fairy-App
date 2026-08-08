"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart.store";
import { SafeImage } from "@/components/custom/SafeImage";
import { toast } from "@/store/toast.store";
import OrderSummary from "./order.summary";
import EmptyCart from "./empty.card";

export default function CartPageComponent() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const subTotal = useCartStore((s) => s.subTotal());

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-black tracking-tight">Your Cart</h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Cart Items */}
          <section className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <Card key={item.id || item.product}>
                <CardContent className="flex gap-4 p-4">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                    <SafeImage
                      src={item.image || "/images/plants/1.jpg"}
                      alt={item.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${item.product || item.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.size ? (
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size}
                        </p>
                      ) : null}
                      <p className="mt-1 font-medium">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center rounded-md border border-input">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => decrementItem(item.id || item.product)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="min-w-10 px-2 text-center text-sm font-medium">
                          {item.qty}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => addItem(item.product || item.id, 1, item.size)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">
                          ₦{(item.lineTotal || item.price * item.qty).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            void removeItem(item.id || item.product);
                            toast.info("Removed from cart", item.name);
                          }}
                          className="text-destructive hover:text-destructive"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue shopping
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  void clearCart();
                  toast.info("Cart cleared");
                }}
                className="text-destructive hover:text-destructive"
              >
                Clear cart
              </Button>
            </div>
          </section>

          {/* Summary */}
          <OrderSummary subtotal={subTotal} />
        </div>
      )}
    </main>
  );
}
