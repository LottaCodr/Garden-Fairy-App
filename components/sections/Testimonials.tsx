"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { testimonials } from "@/lib/data/testimonials";
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();

    // Auto-scroll logic
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let scrollAmount = 0;
        let direction = 1;

        const step = () => {
            if (!container) return;

            const maxScroll = container.scrollWidth - container.clientWidth;

            scrollAmount += direction * 0.5; // speed

            if (scrollAmount >= maxScroll) direction = -1;
            if (scrollAmount <= 0) direction = 1;

            container.scrollTo({ left: scrollAmount, behavior: "smooth" });

            requestAnimationFrame(step);
        };

        const animationFrame = requestAnimationFrame(step);

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <section className="py-16 bg-background">
            <h2 className="text-3xl font-bold text-center mb-10">
                What Our Customers Say
            </h2>

            <motion.div
                ref={containerRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none px-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <AnimatePresence>
                    {testimonials.map((t) => (
                        <motion.div
                            key={t.id}
                            className="min-w-[280px]  sm:min-w-[320px] snap-start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="bg-card border border-border h-full shadow hover:shadow-lg transition">
                                <CardContent className="p-6 flex  flex-col gap-3">
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                        "{t.quote}"
                                    </p>
                                    <p className="mt-4 text-xs  font-bold text-muted-foreground">
                                        - {t.role}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </section>
    );
}
