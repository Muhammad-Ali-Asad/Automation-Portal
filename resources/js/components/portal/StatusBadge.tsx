import { cn } from '@/lib/utils';

type StatusBadgeProps = {
    status: string;
    className?: string;
};

function getVariant(status: string): string {
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'approve') {
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    }
    if (s === 'rejected' || s === 'reject') {
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    }
    if (s === 'modified' || s === 'modify') {
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    }
    return 'bg-muted text-muted-foreground border-border';
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                getVariant(status),
                className,
            )}
        >
            {status || 'Draft'}
        </span>
    );
}
