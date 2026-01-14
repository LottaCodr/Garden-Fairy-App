import { Button } from "@/components/custom/Button";
import Link from "next/link";

export default function EmptyCart() {
    return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
                Looks like you haven’t added anything yet.
            </p>
            <Link href="/shop">
                <Button>Browse products</Button>
            </Link>
        </div>
    );
}