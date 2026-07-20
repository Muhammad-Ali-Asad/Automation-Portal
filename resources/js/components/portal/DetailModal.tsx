import { motion } from 'framer-motion';
import { Check, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/portal/StatusBadge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    getDraftCopyText,
    getDraftEditorState,
    hashtagsFromString,
    hashtagsToString,
    isDraftReviewable,
    parseDraftContent,
} from '@/lib/draft-content';
import type { Draft, EmailRecord } from '@/types/portal';

type Props = {
    item: Draft | EmailRecord | null;
    type: 'draft' | 'email';
    airtableBaseId: string;
    canReview?: boolean;
    onClose: () => void;
    onDraftUpdated?: (draft: Draft) => void;
};

type EditorState = {
    hook: string;
    post_text: string;
    cta: string;
    hashtags: string;
};

function toEditorState(raw: string): EditorState {
    const parsed = getDraftEditorState(raw);

    return {
        hook: parsed.hook,
        post_text: parsed.post_text,
        cta: parsed.cta,
        hashtags: hashtagsToString(parsed.hashtags),
    };
}

type DraftReviewPanelProps = {
    draft: Draft;
    canReview: boolean;
    airtableBaseId: string;
    onClose: () => void;
    onDraftUpdated?: (draft: Draft) => void;
};

function DraftReviewPanel({
    draft,
    canReview,
    airtableBaseId,
    onClose,
    onDraftUpdated,
}: DraftReviewPanelProps) {
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [reviewing, setReviewing] = useState<'approved' | 'rejected' | null>(
        null,
    );
    const [editor, setEditor] = useState<EditorState>(() =>
        toEditorState(draft.draftContent ?? ''),
    );

    const reviewable = canReview && isDraftReviewable(draft);
    const copyText = getDraftCopyText(draft.draftContent ?? '');
    const airtableLink = `https://airtable.com/${airtableBaseId}/${draft.id}`;

    function buildPayload() {
        return {
            hook: editor.hook.trim(),
            post_text: editor.post_text.trim(),
            cta: editor.cta.trim(),
            hashtags: hashtagsFromString(editor.hashtags),
        };
    }

    async function handleSave() {
        if (!editor.post_text.trim()) {
            toast.error('Post text is required.');

            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`/api/drafts/${draft.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(buildPayload()),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save draft');
            }

            onDraftUpdated?.(data.draft);
            toast.success('Draft saved.');
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to save draft',
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleReview(decision: 'approved' | 'rejected') {
        if (!editor.post_text.trim()) {
            toast.error('Post text is required.');

            return;
        }

        setReviewing(decision);

        try {
            const res = await fetch(`/api/drafts/${draft.id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    decision,
                    ...buildPayload(),
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            onDraftUpdated?.(data.draft);
            toast.success(data.message || 'Review submitted.');
            onClose();
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to submit review',
            );
        } finally {
            setReviewing(null);
        }
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    function renderDraftBody() {
        if (reviewable) {
            return (
                <div className="space-y-4">
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                        This post is ready for review. Edit the copy below, then
                        approve or reject it from the portal.
                    </p>

                    <div className="space-y-1.5">
                        <Label htmlFor="draft-hook">Hook</Label>
                        <Textarea
                            id="draft-hook"
                            rows={2}
                            value={editor.hook}
                            onChange={(e) =>
                                setEditor((prev) => ({
                                    ...prev,
                                    hook: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="draft-post">Post *</Label>
                        <Textarea
                            id="draft-post"
                            rows={8}
                            value={editor.post_text}
                            onChange={(e) =>
                                setEditor((prev) => ({
                                    ...prev,
                                    post_text: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="draft-cta">Call to action</Label>
                        <Textarea
                            id="draft-cta"
                            rows={2}
                            value={editor.cta}
                            onChange={(e) =>
                                setEditor((prev) => ({
                                    ...prev,
                                    cta: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="draft-hashtags">Hashtags</Label>
                        <Textarea
                            id="draft-hashtags"
                            rows={2}
                            placeholder="#AI #SoftwareDevelopment"
                            value={editor.hashtags}
                            onChange={(e) =>
                                setEditor((prev) => ({
                                    ...prev,
                                    hashtags: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>
            );
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

    return (
        <>
            <DialogHeader className="border-b px-6 py-5">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                    LinkedIn post
                </p>
                <DialogTitle className="text-xl leading-snug">
                    {draft.topic || 'Untitled draft'}
                </DialogTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        LinkedIn
                    </span>
                    <StatusBadge status={draft.status} />
                    <span className="text-xs text-muted-foreground">
                        {draft.createdAt
                            ? new Date(draft.createdAt).toLocaleString()
                            : 'Unknown date'}
                    </span>
                </div>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {draft.imageUrl && (
                    <div className="overflow-hidden rounded-lg">
                        <img
                            src={draft.imageUrl}
                            alt="Draft cover"
                            className="w-full object-cover"
                        />
                    </div>
                )}

                {renderDraftBody()}
            </div>

            <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" size="sm" asChild>
                    <a href={airtableLink} target="_blank" rel="noreferrer">
                        Open in Airtable
                    </a>
                </Button>

                <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? 'Copied!' : 'Copy content'}
                    </Button>

                    {reviewable && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSave}
                                disabled={saving || reviewing !== null}
                            >
                                {saving && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save edits
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReview('rejected')}
                                disabled={saving || reviewing !== null}
                            >
                                {reviewing === 'rejected' && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                <X className="mr-1 h-4 w-4" />
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleReview('approved')}
                                disabled={saving || reviewing !== null}
                            >
                                {reviewing === 'approved' && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                <Check className="mr-1 h-4 w-4" />
                                Approve
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function needsFullRecord(
    item: Draft | EmailRecord,
    type: 'draft' | 'email',
): boolean {
    if (type === 'draft') {
        return !item.draftContent;
    }

    const email = item as EmailRecord;

    return email.finalEmail === undefined && Boolean(email.previewText);
}

export function DetailModal({
    item,
    type,
    airtableBaseId,
    canReview = false,
    onClose,
    onDraftUpdated,
}: Props) {
    const [fullItem, setFullItem] = useState<Draft | EmailRecord | null>(null);
    const itemId = item?.id ?? null;
    const needsFetch = item ? needsFullRecord(item, type) : false;

    useEffect(() => {
        if (!itemId || !needsFetch) {
            return;
        }

        let cancelled = false;

        const endpoint =
            type === 'draft'
                ? `/api/drafts/${itemId}`
                : `/api/emails/${itemId}`;

        void fetch(endpoint, {
            headers: { Accept: 'application/json' },
        })
            .then(async (res) => {
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to load details');
                }

                return type === 'draft' ? data.draft : data.email;
            })
            .then((full) => {
                if (!cancelled && full) {
                    setFullItem(full);
                }
            })
            .catch(() => {
                // Keep summary data visible if the detail request fails.
            });

        return () => {
            cancelled = true;
        };
    }, [itemId, needsFetch, type]);

    function handleDraftUpdated(draft: Draft) {
        setFullItem(draft);
        onDraftUpdated?.(draft);
    }

    if (!item) {
        return null;
    }

    const cachedFull =
        fullItem && fullItem.id === item.id ? fullItem : null;
    const displayItem = cachedFull ?? item;
    const isDraft = type === 'draft';
    const draft = isDraft ? (displayItem as Draft) : null;
    const email = !isDraft ? (displayItem as EmailRecord) : null;
    const showLoader =
        needsFetch &&
        (!cachedFull ||
            (isDraft
                ? !(cachedFull as Draft).draftContent
                : (cachedFull as EmailRecord).finalEmail === undefined));

    const title = isDraft
        ? draft?.topic || 'Untitled draft'
        : `${email?.firstName ?? ''} ${email?.lastName ?? ''}`.trim() ||
          'Unknown contact';
    const eyebrow = isDraft ? 'LinkedIn post' : 'Outreach email';
    const status = isDraft
        ? (draft?.status ?? 'Draft')
        : (email?.decision ?? 'Pending');
    const airtableLink = `https://airtable.com/${airtableBaseId}/${displayItem.id}`;

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
                    {showLoader ? (
                        <div className="flex flex-1 items-center justify-center px-6 py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : isDraft && draft ? (
                        <DraftReviewPanel
                            key={`${draft.id}-${draft.draftContent ?? ''}`}
                            draft={draft}
                            canReview={canReview}
                            airtableBaseId={airtableBaseId}
                            onClose={onClose}
                            onDraftUpdated={handleDraftUpdated}
                        />
                    ) : (
                        <>
                            <DialogHeader className="border-b px-6 py-5">
                                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                    {eyebrow}
                                </p>
                                <DialogTitle className="text-xl leading-snug">
                                    {title}
                                </DialogTitle>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        Email
                                    </span>
                                    <StatusBadge status={status} />
                                    <span className="text-xs text-muted-foreground">
                                        {displayItem.createdAt
                                            ? new Date(
                                                  displayItem.createdAt,
                                              ).toLocaleString()
                                            : 'Unknown date'}
                                    </span>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                                {email && (
                                    <>
                                        <ContentBox
                                            label="Contact"
                                            text={[
                                                email.email,
                                                email.phone,
                                                email.companyName,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        />
                                        {email.painPoints && (
                                            <ContentBox
                                                label="Pain points"
                                                text={email.painPoints}
                                            />
                                        )}
                                        {email.hook && (
                                            <ContentBox
                                                label="Personalisation hook"
                                                text={email.hook}
                                            />
                                        )}
                                        <ContentBox
                                            label="Email sent"
                                            text={
                                                email.finalEmail ||
                                                'No email body'
                                            }
                                        />
                                    </>
                                )}
                            </div>

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
                            </div>
                        </>
                    )}
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
