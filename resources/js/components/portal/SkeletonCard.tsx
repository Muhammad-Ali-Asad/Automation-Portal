import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border bg-card">
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-3 p-4">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        </div>
    );
}

export function SkeletonRow() {
    return (
        <div className="flex items-start gap-4 rounded-xl border bg-card p-4">
            <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-md" />
                </div>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
        </div>
    );
}
