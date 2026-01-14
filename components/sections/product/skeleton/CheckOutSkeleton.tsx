import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckOutSkeleton() {
    return (
        <main className="mx-auto max-w-3xl px-4 py-10">
            <Skeleton className="mb-6 h-8 w-48" /> {/* for title */}
            <Card>
                <CardContent className="space-y-4 p-6">
                    <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-px w-full" />
                    <div className="flex justify-between font-semibold">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-full" />
                </CardContent>
            </Card>
        </main>
    );
}