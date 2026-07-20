import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/portal/StatusBadge';
import type { Draft, DraftContent } from '@/types/portal';

type Props = {
    draft: Draft;
    index: number;
    onClick: (draft: Draft) => void;
};

function parseDraftContent(raw: string): DraftContent | null {
    try {
        return JSON.parse(raw) as DraftContent;
    } catch {
        return null;
    }
}

function getPreviewText(draft: Draft): string {
    if (draft.previewText) {
        return draft.previewText;
    }

    const parsed = parseDraftContent(draft.draftContent ?? '');

    if (!parsed) {
        return draft.draftContent || 'No content yet';
    }

    return parsed.post_text || parsed.hook || draft.draftContent || 'No content yet';
}

export function DraftCard({ draft, index, onClick }: Props) {
    const preview = getPreviewText(draft);

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.25,
                delay: index * 0.04,
                ease: 'easeOut',
            }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="group cursor-pointer overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
            onClick={() => onClick(draft)}
        >
            {draft.imageUrl && (
                <div className="aspect-video overflow-hidden bg-muted">
                    <img
                        src={draft.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}

            <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        LinkedIn
                    </span>
                    <StatusBadge status={draft.status} />
                </div>

                <h3 className="line-clamp-2 leading-snug font-semibold">
                    {draft.topic || 'Untitled draft'}
                </h3>

                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {preview}
                </p>

                <p className="text-xs text-muted-foreground">
                    {draft.createdAt
                        ? new Date(draft.createdAt).toLocaleString()
                        : 'Unknown date'}
                </p>
            </div>
        </motion.article>
    );
}
