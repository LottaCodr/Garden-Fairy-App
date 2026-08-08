"use client";

import { motion } from "framer-motion";
import { Leaf, Sparkles, Heart, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Features } from "@/components/sections/Features";

const values = [
    {
        icon: Leaf,
        title: "Sustainability first",
        body: "We partner with growers who share our commitment to ethical, chemical-free cultivation.",
    },
    {
        icon: Sparkles,
        title: "AI that serves you",
        body: "Our smart planners help you make the most of what you already have — no waste, no excess.",
    },
    {
        icon: Heart,
        title: "Crafted with care",
        body: "Every order is hand-checked, hand-packed and hand-delivered to your door.",
    },
    {
        icon: Globe,
        title: "Nationwide reach",
        body: "From Lagos to Abuja, Calabar to Kano — we deliver to all 36 states.",
    },
];

const stats = [
    { value: "10,000+", label: "Happy customers" },
    { value: "36", label: "States covered" },
    { value: "4.9★", label: "Average rating" },
    { value: "98%", label: "On-time delivery" },
];

export default function AboutPage() {
    return (
        <main>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
                <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 text-xs font-medium uppercase tracking-wider text-primary"
                    >
                        Our story
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-balance text-4xl font-black tracking-tight md:text-5xl"
                    >
                        Bringing nature and smart design to every home
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground"
                    >
                        The Garden Fairy was born from a simple belief: your home should
                        work for you. Whether that means a thriving Monstera in the corner
                        or a perfectly re-arranged workspace, we&apos;re here to make it effortless.
                    </motion.p>
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-border bg-card/30">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="text-3xl font-black tracking-tight text-primary">
                                {s.value}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section className="mx-auto max-w-7xl px-4 py-20">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        What we stand for
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                        The values that guide every plant we grow and every planner we ship.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {values.map((v) => (
                        <Card key={v.title} className="border-muted">
                            <CardContent className="space-y-3 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                                    <v.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm font-semibold">{v.title}</h3>
                                <p className="text-xs text-muted-foreground">{v.body}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <Features />
        </main>
    );
}
