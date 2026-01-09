"use client";

import Link from "next/link";
import { Twitter, Instagram, Facebook } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-foreground text-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Top: Navigation + Social Links */}
                <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 mb-8">
                    {/* Navigation */}
                    <div>
                        <h4 className="text-sm font-semibold text-background/70 mb-4">
                            Shop
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/shop" className="hover:text-primary transition">
                                    Plants
                                </Link>
                            </li>
                            <li>
                                <Link href="/collections" className="hover:text-primary transition">
                                    Collections
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-primary transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-primary transition">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-sm font-semibold text-background/70 mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/faq" className="hover:text-primary transition">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="hover:text-primary transition">
                                    Shipping & Returns
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-primary transition">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-primary transition">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social / Follow */}
                    <div>
                        <h4 className="text-sm font-semibold text-background/70 mb-4">
                            Follow Us
                        </h4>
                        <div className="flex gap-4">
                            <Link href="#" className="hover:text-primary transition" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="hover:text-primary transition" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="hover:text-primary transition" aria-label="Facebook">
                                <Facebook className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Newsletter / Info */}
                    <div>
                        <h4 className="text-sm font-semibold text-background/70 mb-4">
                            Newsletter
                        </h4>
                        <p className="text-sm text-background/70">
                            Subscribe for updates on new arrivals and promotions.
                        </p>
                        <div className="mt-3 flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 rounded-md border border-background/50 bg-foreground/10 px-3 py-2 text-sm text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-90 transition">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom: Copyright */}
                <div className="border-t border-background/50 pt-6 text-center text-xs text-background/60">
                    © {currentYear} The Garden Fairy. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
