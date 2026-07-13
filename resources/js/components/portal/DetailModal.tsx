import { motion } from 'framer-motion';
import { useState } from 'react';
import { StatusBadge } from '@/components/portal/StatusBadge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Draft, DraftContent, EmailRecord } from '@/types/portal';

type Props = {
    item: Draft | EmailRecord | null;
    type: 'draft' | 'email';
    airtableBaseId: string;
    onClose: () => void;
};

function parseDraftContent(raw: string): DraftContent | null {
    try {
        return JSON.parse(raw) as DraftContent;
    } catch {
        return null;
    }
}

function getDraftCopyText(draft: Draft): string {
    const parsed = parseDraftContent(draft.draftContent);

    if (!parsed) {
        return draft.draftContent;
    }

    const hashtags = Array.isArray(parsed.hashtags)
        ? parsed.hashtags.join(' ')
        : '';

    return [parsed.hook, parsed.post_text, parsed.cta, hashtags]
        .filter(Boolean)
        .join('\n\n');
}

export function DetailModal({ item, type, airtableBaseId, onClose }: Props) {
    const [copied, setCopied] = useState(false);

    if (!item) {
        return null;
    }

    const isDraft = type === 'draft';
    const draft = isDraft ? (item as Draft) : null;
    const email = !isDraft ? (item as EmailRecord) : null;

    const copyText =
        isDraft && draft ? getDraftCopyText(draft) : (email?.finalEmail ?? '');
    const title = isDraft
        ? draft?.topic || 'Untitled draft'
        : `${email?.firstName ?? ''} ${email?.lastName ?? ''}`.trim() ||
          'Unknown contact';
    const eyebrow = isDraft ? 'LinkedIn post' : 'Outreach email';
    const status = isDraft
        ? (draft?.status ?? 'Draft')
        : (email?.decision ?? 'Pending');

    const airtableLink = `https://airtable.com/${airtableBaseId}/${item.id}`;

    async function handleCopy() {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    function renderDraftBody() {
        if (!draft) {
            return null;
        }

        const parsed = parseDraftContent(draft.draftContent);

        if (!parsed) {
            return (
                <ContentBox
                    label="Content"
                    text={draft.draftContent || 'No content'}
                />
            );
        }

        const hashtags = Array.isArray(parsed.hashtags)
            ? parsed.hashtags.join(' ')
            : '';

        return (
            <>
                {parsed.hook && <ContentBox label="Hook" text={parsed.hook} />}
                {parsed.post_text && (
                    <ContentBox label="Post" text={parsed.post_text} />
                )}
                {parsed.cta && (
                    <ContentBox label="Call to action" text={parsed.cta} />
                )}
                {hashtags && <ContentBox label="Hashtags" text={hashtags} />}
            </>
        );
    }

    function renderEmailBody() {
        if (!email) {
            return null;
        }

        return (
            <>
                <ContentBox
                    label="Contact"
                    text={[email.email, email.phone, email.companyName]
                        .filter(Boolean)
                        .join(' · ')}
                />
                {email.painPoints && (
                    <ContentBox label="Pain points" text={email.painPoints} />
                )}
                {email.hook && (
                    <ContentBox
                        label="Personalisation hook"
                        text={email.hook}
                    />
                )}
                <ContentBox
                    label="Email sent"
                    text={email.finalEmail || 'No email body'}
                />
            </>
        );
    }

    return (
        <Dialog
            open={!!item}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <DialogHeader className="border-b px-6 py-5">
                        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                            {eyebrow}
                        </p>
                        <DialogTitle className="text-xl leading-snug">
                            {title}
                        </DialogTitle>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {isDraft ? 'LinkedIn' : 'Email'}
                            </span>
                            <StatusBadge status={status} />
                            <span className="text-xs text-muted-foreground">
                                {item.createdAt
                                    ? new Date(item.createdAt).toLocaleString()
                                    : 'Unknown date'}
                            </span>
                        </div>
                    </DialogHeader>

                    {/* Scrollable body */}
                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                        {/* Image (drafts only) */}
                        {isDraft && draft?.imageUrl && (
                            <div className="overflow-hidden rounded-lg">
                                <img
                                    src={draft.imageUrl}
                                    alt="Draft cover"
                                    className="w-full object-cover"
                                />
                            </div>
                        )}

                        {isDraft ? renderDraftBody() : renderEmailBody()}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t px-6 py-4">
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={airtableLink}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Open in Airtable
                            </a>
                        </Button>
                        <Button size="sm" onClick={handleCopy}>
                            {copied ? 'Copied!' : 'Copy content'}
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

function ContentBox({ label, text }: { label: string; text: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {label}
            </p>
            <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed whitespace-pre-wrap">
                {text}
            </p>
        </div>
    );
}
