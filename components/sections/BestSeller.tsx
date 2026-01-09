import { products } from "@/lib/data/products";
import { ProductCard } from "../custom/ProductCard";

export function BestSellers() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-14">
            <header className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight">
                    Our Bestsellers
                </h2>
                <p className="text-sm text-muted-foreground">
                    Plants our customers love the most
                </p>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
