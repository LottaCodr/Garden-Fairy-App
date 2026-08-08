"use client";

import Link from "next/link";
import { Twitter, Instagram, Facebook, Leaf, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const footerLinks = {
  Shop: [
    { label: "Plants", href: "/shop" },
    { label: "Collections", href: "/shop?category=premium" },
    { label: "Gift Cards", href: "/shop?category=gifts" },
    { label: "Sale", href: "/shop?sort=premium" },
  ],
  Support: [
    { label: "FAQ", href: "/contact" },
    { label: "Shipping", href: "/contact" },
    { label: "Returns", href: "/contact" },
    { label: "Contact Us", href: "/contact" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/about" },
    { label: "Blog", href: "/about" },
    { label: "Press", href: "/about" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="bg-foreground text-background"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
    >
      {/* Main Footer Content */}
      <div className="container-2xl py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand Column */}
          <motion.div
            className="lg:col-span-2"
            variants={fadeUp}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary text-lg">
                <Leaf className="h-5 w-5" />
              </span>
              The Garden Fairy
            </Link>
            <p className="mt-4 text-sm text-background/70 max-w-xs leading-relaxed">
              Bringing nature to your doorstep with handpicked plants, expert
              care guidance, and sustainable packaging.
            </p>

            {/* Contact Info */}
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <a
                href="mailto:hello@gardenfairy.com"
                className="inline-flex items-center gap-2 text-background/70 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                hello@gardenfairy.com
              </a>
              <a
                href="tel:+2341234567890"
                className="inline-flex items-center gap-2 text-background/70 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                +234 123 456 7890
              </a>
              <div className="inline-flex items-center gap-2 text-background/70">
                <MapPin className="h-4 w-4" />
                Lagos, Nigeria
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 text-background/70 hover:border-primary hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            variants={fadeUp}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-sm font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.Shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <span className="tabular-nums">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            variants={fadeUp}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.Support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <span className="tabular-nums">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            variants={fadeUp}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.Company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/70 hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <span className="tabular-nums">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-background/10">
        <div className="container-2xl py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-white mb-1">
                Stay in the Loop
              </h3>
              <p className="text-sm text-background/70">
                Get notified about new arrivals, care tips, and exclusive offers.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 max-w-md w-full md:w-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/50" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-background/20 bg-background/10 text-sm text-white placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-2xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/50">
            © {currentYear} The Garden Fairy. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-background/50">
            <Link href="/about" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
