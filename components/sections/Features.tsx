"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { features } from "@/lib/data/features"

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
}

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
}

export function Features() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mx-auto mb-14 max-w-2xl text-center"
            >
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-primary">
                    Why choose us
                </p>

                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Thoughtfully grown. Carefully delivered.
                </h2>

                <p className="mt-4 text-sm text-muted-foreground">
                    We make plant shopping simple, reliable, and enjoyable — from nursery
                    to your doorstep.
                </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
                {features.map(({ icon: Icon, title, description }) => (
                    <motion.div key={title} variants={itemVariants as any}>
                        <Card className="border-muted text-center transition-shadow hover:shadow-md">
                            <CardContent className="flex flex-col items-center gap-3 p-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                                    <Icon className="h-6 w-6" />
                                </div>

                                <h3 className="text-sm font-semibold">
                                    {title}
                                </h3>

                                <p className="text-xs text-muted-foreground">
                                    {description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    )
}
