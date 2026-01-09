"use client";

import Link from "next/link";
import { Twitter, Instagram, Facebook } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
    const currentYear = new Date().getFullYear();

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <motion.footer
            className="bg-foreground text-background py-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Top: Navigation + Social Links */}
                <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 mb-8">
                    {/* Shop Links */}
                    <motion.div variants={fadeUp}>
                        <h4 className="text-sm font-semibold text-background/70 mb-4">
                            Shop
                        </h4>
                        <ul className="space-y-2 text-sm">
                            {["Plants", "Collections", "About Us", "Contact"].map((link) => (
                                <li key={link}>
                                    <Link
                                        href={`/${link.toLowerCase().replace(/ /g, "-")}`}
                                        className="hover:text-primary transition"
                                    >
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Support */}
                    <motion.div variants={fadeUp} transition={{ delay: 0.1 }}>
                        <h4 className="text-sm font-semibold text-background/70 mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2 text-sm">
                            {["FAQ", "Shipping & Returns", "Privacy Policy", "Terms of Service"].map(
                                (link) => (
                                    <li key={link}>
                                        <Link
                                            href={`/${link.toLowerCase().replace(/ /g, "-")}`}
                                            className="hover:text-primary transition"
                                        >
                                            {link}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </motion.div>

                    {/* Social */}
                    <motion.div variants={fadeUp} transition={{ delay: 0.2 }}>
                        <h4 className="text-sm font-semibold text-background/70 mb-4">
                            Follow Us
                        </h4>
                        <div className="flex gap-4">
                            {[{ Icon: Twitter, label: "Twitter" }, { Icon: Instagram, label: "Instagram" }, { Icon: Facebook, label: "Facebook" }].map(
                                ({ Icon, label }) => (
                                    <Link
                                        key={label}
                                        href="#"
                                        className="hover:text-primary transition"
                                        aria-label={label}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                )
                            )}
                        </div>
                    </motion.div>

                    {/* Newsletter */}
                    <motion.div variants={fadeUp} transition={{ delay: 0.3 }}>
                        <h4 className="text-sm font-semibold text-background/70 mb-4">
                            Newsletter
                        </h4>
                        <p className="text-sm text-background/70">
                            Subscribe for updates on new arrivals and promotions.
                        </p>
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 rounded-md border border-background/50 bg-foreground/10 px-3 py-2 text-sm text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-90 transition">
                                Subscribe
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom */}
                <motion.div
                    className="border-t border-background/50 pt-6 text-center text-xs text-background/60"
                    variants={fadeUp}
                    transition={{ delay: 0.4 }}
                >
                    © {currentYear} The Garden Fairy. All rights reserved.
                </motion.div>
            </div>
        </motion.footer>
    );
}
