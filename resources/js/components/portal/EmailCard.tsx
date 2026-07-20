import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/portal/StatusBadge';
import type { EmailRecord } from '@/types/portal';

type Props = {
    email: EmailRecord;
    index: number;
    onClick: (email: EmailRecord) => void;
};

export function EmailCard({ email, index, onClick }: Props) {
    const fullName =
        `${email.firstName} ${email.lastName}`.trim() || 'Unknown contact';

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.22,
                delay: index * 0.04,
                ease: 'easeOut',
            }}
            whileHover={{ y: -2, transition: { duration: 0.12 } }}
            className="group cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            onClick={() => onClick(email)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md border border-violet-200 bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
                            Email
                        </span>
                    </div>
                    <p className="truncate leading-snug font-semibold">
                        {fullName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                        {email.companyName && (
                            <span>{email.companyName} · </span>
                        )}
                        {email.email}
                    </p>
                    {(email.previewText || email.finalEmail) && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {email.previewText || email.finalEmail}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {email.createdAt
                            ? new Date(email.createdAt).toLocaleString()
                            : 'Unknown date'}
                    </p>
                </div>

                <div className="shrink-0">
                    <StatusBadge status={email.decision || 'Pending'} />
                </div>
            </div>
        </motion.article>
    );
}
