import { Card } from "../custom/Card";
import { Button } from "../custom/Button";
import { products } from "@/lib/data/products";



export function BestSellers() {
    return (
        <section className="py-12 px-4">
            <h2 className="text-2xl font-bold mb-6">Our Bestsellers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                    <Card key={p.id}>
                        <div className="h-56 bg-cover" style={{ backgroundImage: `url(${p.image})` }} />
                        <div className="p-4">
                            <h3 className="font-bold">{p.name}</h3>
                            <p className="text-sm text-gray-500">{p.description}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="font-bold">₦{p.isPremium}</span>
                                <Button>Add to Cart</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}