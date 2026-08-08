import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-[calc(100vh-160px)] bg-gradient-to-br from-primary/5 via-background to-accent/10">
            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-7xl items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <Link
                        href="/"
                        className="mb-8 block text-center text-sm font-semibold tracking-tight"
                    >
                        The Garden Fairy
                    </Link>
                    {children}
                    <p className="mt-8 text-center text-xs text-muted-foreground">
                        Demo accounts &mdash; admin@gardenfairy.com / admin123 &middot; user@gardenfairy.com / user123
                    </p>
                </div>
            </div>
        </div>
    );
}
