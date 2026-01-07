import Link from "next/link";


export function Header() {
    return (
        <header className="flex items-center justify-between border-b px-6 py-4">
            <h1 className="font-bold text-lg">The Garden Fairy</h1>
            <nav className="hidden md:flex gap-6">
                <Link href="#">Shop</Link>
                <Link href="#">About</Link>
                <Link href="#">Contact</Link>
            </nav>
        </header>
    );
}