import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function OrderSummary({ subtotal }: { subtotal: number }) {
    const deliveryFee = 3500;
    const total = subtotal + deliveryFee;

    return (
        <Card className="h-fit">
            <CardContent className="space-y-6 p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>₦{deliveryFee.toLocaleString()}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₦{total.toLocaleString()}</span>
                    </div>
                </div>

                <Link href="/checkout">
                    <Button size="lg" className="w-full">
                        Proceed to Checkout
                    </Button>
                </Link>

                <Link
                    href="/shop"
                    className="block text-center text-sm text-muted-foreground hover:text-primary"
                >
                    Continue shopping
                </Link>
            </CardContent>
        </Card>
    );
}
