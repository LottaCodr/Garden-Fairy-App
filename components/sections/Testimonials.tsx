"use client";

import { testimonials } from "@/lib/data/testimonials";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  // Auto-scroll logic (pauses while the user is hovering or dragging)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollAmount = 0;
    let direction = 1;
    let animationFrame: number;

    const step = () => {
      if (!container) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      if (!pausedRef.current) {
        scrollAmount += direction * 0.8;

        if (scrollAmount >= maxScroll) direction = -1;
        if (scrollAmount <= 0) direction = 1;

        container.scrollTo({ left: scrollAmount, behavior: "smooth" });
      }

      animationFrame = requestAnimationFrame(step);
    };

    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };

    container.addEventListener("pointerenter", pause);
    container.addEventListener("pointerleave", resume);
    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume, { passive: true });

    animationFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrame);
      container.removeEventListener("pointerenter", pause);
      container.removeEventListener("pointerleave", resume);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
    };
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent-foreground mb-4">
            <Star className="h-3.5 w-3.5 fill-current" />
            Testimonials
          </span>
          <h2
            style={{ fontFamily: "var(--font-serif)" }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            What Our Customers Say
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join thousands of happy plant parents who trust The Garden Fairy.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

          <div
            ref={containerRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none px-4 pb-4"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.id}
                className="min-w-[300px] sm:min-w-[340px] snap-start flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border border-border h-full shadow-sm hover:shadow-md transition-shadow group">
                  <CardContent className="p-6 flex flex-col gap-4">
                    {/* Stars */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 5
                              ? "fill-accent text-accent-foreground"
                              : "fill-muted text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-sm leading-relaxed text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>

                    {/* Author */}
                    <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
