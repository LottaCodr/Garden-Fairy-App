import { testimonials } from "@/lib/data/testimonials";


export function Testimonials() {
    return (
        <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
            <div className="flex gap-6 overflow-x-auto px-4">
                {testimonials.map((t) => (
                    <div key={t.id} className="min-w-[300px] p-6 rounded-lg bg-background-light shadow">
                        <p>"{t.quote}"</p>
                        <p className="mt-4 font-bold">- {t.role}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}