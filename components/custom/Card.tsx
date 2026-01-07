interface CardProps {
    children: React.ReactNode;
}


export function Card({ children }: CardProps) {
    return (
        <div className="bg-white dark:bg-background-dark/50 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition">
            {children}
        </div>
    );
}