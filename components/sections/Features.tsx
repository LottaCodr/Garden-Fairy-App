import { IconCircle } from "../custom/IconCircle";


const features = [
    { icon: "local_shipping", title: "Fast Delivery", text: "Quick nationwide delivery." },
    { icon: "spa", title: "Healthy Plants", text: "Grown with care." },
    { icon: "public", title: "Nationwide", text: "All states covered." },
    { icon: "lock", title: "Secure Payment", text: "Safe checkout." },
];


export function Features() {
    return (
        <section className="py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {features.map((f) => (
                <div key={f.title}>
                    <IconCircle icon={f.icon} />
                    <h3 className="mt-4 font-semibold">{f.title}</h3>
                    <p className="text-gray-500">{f.text}</p>
                </div>
            ))}
        </section>
    );
}