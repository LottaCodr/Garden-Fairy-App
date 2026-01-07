export function IconCircle({ icon }: { icon: string }) {
    return (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20">
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
    );
}