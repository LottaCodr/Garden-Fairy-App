"use client"

import Link from "next/link";
import { useState } from "react";

export function Header() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <header className="w-full sticky top-0 z-50 backdrop-blur border-b border-[var(--border)] bg-[var(--background-light)]/90 dark:bg-[var(--background-dark)]/90 transition-colors">
            <nav className="max-w-full mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-4 relative">
                {/* Logo / Home */}
                <Link
                    href="/"
                    className="font-black text-2xl md:text-3xl tracking-tight text-primary hover:text-primary-dark dark:text-primary dark:hover:text-primary-dark transition-colors flex items-center gap-2"
                    style={{ fontFamily: "var(--font-sans)" }}
                    aria-label="The Garden Fairy homepage"
                >
                    <span className="inline-flex items-center -ml-1">
                        <svg width="26" height="26" viewBox="0 0 32 32" className="mr-1" aria-hidden="true">
                            <circle cx="16" cy="16" r="6" fill="var(--accent)" />
                            <ellipse cx="16" cy="6" rx="2.5" ry="6" fill="var(--primary)"/>
                            <ellipse cx="26" cy="16" rx="6" ry="2.5" fill="var(--primary-dark)" transform="rotate(45 26 16)"/>
                            <ellipse cx="16" cy="26" rx="2.5" ry="6" fill="var(--primary)"/>
                            <ellipse cx="6" cy="16" rx="6" ry="2.5" fill="var(--primary-dark)" transform="rotate(-45 6 16)"/>
                        </svg>
                        <span className="drop-shadow text-shadow-lg">The Garden Fairy</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex flex-1 justify-center">
                    <ul className="flex gap-6 text-base">
                        <li>
                            <Link
                                href="#"
                                className="text-[var(--foreground)] font-medium px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:bg-[var(--muted)]/80 hover:text-[var(--primary)] transition"
                            >
                                Shop
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="#"
                                className="text-[var(--foreground)] font-medium px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:bg-[var(--muted)]/80 hover:text-[var(--primary)] transition"
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="#"
                                className="text-[var(--foreground)] font-medium px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:bg-[var(--muted)]/80 hover:text-[var(--primary)] transition"
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Actions: Simple Cart & Mobile Hamburger */}
                <div className="flex items-center gap-1 sm:gap-3">
                    {/* Simple Cart Button */}
                    <Link
                        href="#"
                        aria-label="View Shopping Cart"
                        className="relative flex items-center px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:bg-[var(--accent)]/90 transition"
                        tabIndex={0}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="var(--accent-foreground)"
                            className="w-5 h-5 mr-2"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 6h15l-1.5 9.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.5L5 6z"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <circle cx="9.5" cy="20.5" r="1" fill="var(--accent-foreground)" />
                            <circle cx="17.5" cy="20.5" r="1" fill="var(--accent-foreground)" />
                        </svg>
                        Cart
                        <span className="ml-2 bg-[var(--accent-foreground)] text-[var(--accent)] px-2 py-0.5 rounded-full text-xs font-bold shadow">
                            2
                        </span>
                    </Link>
                    {/* Mobile Hamburger */}
                    <button
                        type="button"
                        aria-label={mobileNavOpen ? "Close main menu" : "Open main menu"}
                        aria-expanded={mobileNavOpen}
                        aria-controls="mobile-nav-menu"
                        onClick={() => setMobileNavOpen((o) => !o)}
                        className="flex md:hidden items-center px-2 py-2 rounded-lg hover:bg-[var(--muted)]/50 transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="var(--foreground)" viewBox="0 0 24 24">
                            {mobileNavOpen ? (
                                <g>
                                    <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="6" y1="18" x2="18" y2="6" strokeWidth="2" strokeLinecap="round"/>
                                </g>
                            ) : (
                                <g>
                                    <line x1="4" y1="7" x2="20" y2="7" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="4" y1="17" x2="20" y2="17" strokeWidth="2" strokeLinecap="round"/>
                                </g>
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Nav Menu Overlay */}
                <div
                    id="mobile-nav-menu"
                    className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} md:hidden`}
                    aria-hidden={!mobileNavOpen}
                    onClick={() => setMobileNavOpen(false)}
                ></div>
                <aside
                    className={`fixed top-0 right-0 z-50 h-full w-64 bg-[var(--background-light)] dark:bg-[var(--background-dark)] shadow-xl transform transition-transform duration-200 md:hidden ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile menu"
                    tabIndex={-1}
                >
                    <button
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close mobile navigation"
                        className="absolute top-3 right-3 rounded-full p-2 hover:bg-[var(--muted)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="var(--foreground)" viewBox="0 0 24 24">
                            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="6" y1="18" x2="18" y2="6" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <ul className="flex flex-col mt-16 gap-4 px-7 text-lg">
                        <li>
                            <Link
                                href="#"
                                className="block w-full text-[var(--foreground)] font-semibold py-2 px-2 rounded-lg hover:bg-[var(--muted)]/70 hover:text-[var(--primary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                onClick={() => setMobileNavOpen(false)}
                            >
                                Shop
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="#"
                                className="block w-full text-[var(--foreground)] font-semibold py-2 px-2 rounded-lg hover:bg-[var(--muted)]/70 hover:text-[var(--primary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                onClick={() => setMobileNavOpen(false)}
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="#"
                                className="block w-full text-[var(--foreground)] font-semibold py-2 px-2 rounded-lg hover:bg-[var(--muted)]/70 hover:text-[var(--primary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                onClick={() => setMobileNavOpen(false)}
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>
                </aside>
            </nav>
        </header>
    );
}