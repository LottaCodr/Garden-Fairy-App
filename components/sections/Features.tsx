"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Shield, RefreshCw, Leaf } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const featureData = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on orders over ₦50,000. Healthy plants, safely packed.",
  },
  {
    icon: Shield,
    title: "7-Day Guarantee",
    description: "Not happy? Return within 7 days for a full refund, no questions asked.",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Simple return process with prepaid labels for your convenience.",
  },
  {
    icon: Leaf,
    title: "Expert Care Tips",
    description: "Every plant comes with personalized care instructions for success.",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-warm-gradient">
      <div className="container-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            Why Choose Us
          </span>
          <h2
            style={{ fontFamily: "var(--font-serif)" }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
          >
            Thoughtfully Grown.
            <br />
            Carefully Delivered.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            We make plant shopping simple, reliable, and enjoyable - from nursery
            to your doorstep.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featureData.map(({ icon: Icon, title, description }) => (
            <motion.div key={title} variants={itemVariants}>
              <Card className="group border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                <CardContent className="flex flex-col items-start gap-4 p-6">
                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
