"use client";

import { Button } from "../custom/Button";

export function Hero() {
    return (
        <section
            aria-label="Hero section"
            className="relative isolate flex min-h-[360px] items-center justify-center bg-cover bg-center md:min-h-[440px] lg:min-h-[520px]"
            style={{
                backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEqkXZ-5CD-H-6ixzT8piHm1-xAxeMJoCkiIFWOlDSmkp3URwZ6dwVNSVBVZKBGnwg9BMfyPi5b3YbEnZN7_F_KhWwrhElqbPEV442UZMkQJPIE0BQHoSVUzv8CZhdRX39Zk1E2udu6gtExKDk2Whmw_25LQGWaMs_4Jm-ZEuKL6Xdl_ekMW4BvjLAFNOVVWULrXkB00dIQvcpYbPXkJ5QXvSW3ahPcm4jPox4oZu1ezzK3U4wADbn_dszLib0bMyKMHu2fM1rBPk')",
            }}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 -z-10 bg-black/50"
                aria-hidden="true"
            />

            {/* Content */}
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-14 text-center">
                {/* Heading */}
                <h1 className="mb-4 max-w-3xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                    Fresh Plants Delivered Nationwide
                </h1>

                {/* Subtext (optional but senior-level UX) */}
                <p className="mb-8 max-w-xl text-sm text-white/90 md:text-base">
                    Curated indoor and outdoor plants, delivered straight to your door.
                </p>

                {/* Search */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="mb-8 flex w-full max-w-md items-center gap-2"
                    role="search"
                >
                    <div className="flex w-full items-center gap-2 rounded-lg bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                        <SearchIcon />
                        <input
                            type="search"
                            placeholder="Search indoor, outdoor or any plant"
                            className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                        />
                    </div>

                    <Button type="submit" className="px-5 py-2">
                        Search
                    </Button>
                </form>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button variant="primary" className="shadow-md">
                        Shop Now
                    </Button>

                    <Button
                        variant="ghost"
                        className="border border-white text-white hover:bg-white/10"
                    >
                        Explore Collections
                    </Button>
                </div>
            </div>
        </section>
    );
}

/* ----------------------------- */
/* Icon (kept isolated + clean)  */
/* ----------------------------- */

function SearchIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
        >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
    );
}
