import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DraftCard } from '@/components/portal/DraftCard';
import { DetailModal } from '@/components/portal/DetailModal';
import { SkeletonCard } from '@/components/portal/SkeletonCard';
import type { ContentRequestPayload } from '@/types/portal';
import type { Draft } from '@/types/portal';

const AIRTABLE_BASE_ID = 'appSo3isRscpSyhRP';

const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
];

const DEFAULT_FORM: ContentRequestPayload = {
    topic: '',
    keywords: '',
    tone: 'professional',
    postLength: 'medium',
    targetAudience: '',
    ctaType: 'comment',
    includeHashtags: true,
    additionalNotes: '',
};

export default function LinkedIn() {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

    const [form, setForm] = useState<ContentRequestPayload>(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);

    function updateForm<K extends keyof ContentRequestPayload>(
        key: K,
        value: ContentRequestPayload[K],
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    const loadDrafts = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch('/api/drafts');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load posts');
            setDrafts(data.drafts ?? []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            if (!silent) toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadDrafts(); }, [loadDrafts]);

    function pollForNewDraft(topicText: string) {
        [15000, 40000, 80000, 130000].forEach((delay) => {
            setTimeout(async () => {
                await loadDrafts(true);
                setDrafts((prev) => {
                    const found = prev.some(
                        (d) =>
                            d.topic.toLowerCase() === topicText.toLowerCase() &&
                            Date.now() - new Date(d.createdAt ?? 0).getTime() < 10 * 60 * 1000,
                    );
                    if (found) toast.success(`Draft ready for: "${topicText}"`);
                    return prev;
                });
            }, delay);
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.topic.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/content-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            toast.success(data.message || 'Request sent to n8n.');
            pollForNewDraft(form.topic.trim());
            setForm(DEFAULT_FORM);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Request failed';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    const visible = filter === 'all'
        ? drafts
        : drafts.filter((d) => d.status.toLowerCase() === filter.toLowerCase());

    return (
        <>
            <Head title="LinkedIn Posts" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Request form */}
                <section className="rounded-xl border bg-card p-5 shadow-sm">
                    <h2 className="mb-1 font-semibold text-lg">New LinkedIn post</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                        The agent researches the topic, writes a draft, briefs the designer, and waits for your approval before publishing.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="topic">Topic *</Label>
                            <Textarea
                                id="topic"
                                rows={3}
                                placeholder="e.g. How AI is transforming custom software development"
                                value={form.topic}
                                onChange={(e) => updateForm('topic', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="keywords">Keywords</Label>
                            <Input
                                id="keywords"
                                placeholder="e.g. AI automation, SaaS, Laravel, PCB design"
                                value={form.keywords}
                                onChange={(e) => updateForm('keywords', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Comma-separated words or phrases to weave into the post and hashtags.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1.5">
                                <Label>Tone</Label>
                                <Select
                                    value={form.tone}
                                    onValueChange={(value) =>
                                        updateForm('tone', value as ContentRequestPayload['tone'])
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="professional">Professional</SelectItem>
                                        <SelectItem value="conversational">Conversational</SelectItem>
                                        <SelectItem value="inspirational">Inspirational</SelectItem>
                                        <SelectItem value="educational">Educational</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Post length</Label>
                                <Select
                                    value={form.postLength}
                                    onValueChange={(value) =>
                                        updateForm('postLength', value as ContentRequestPayload['postLength'])
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select length" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="short">Short (~100 words)</SelectItem>
                                        <SelectItem value="medium">Medium (~200 words)</SelectItem>
                                        <SelectItem value="long">Long (~350 words)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Call to action</Label>
                                <Select
                                    value={form.ctaType}
                                    onValueChange={(value) =>
                                        updateForm('ctaType', value as ContentRequestPayload['ctaType'])
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select CTA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="comment">Ask for comments</SelectItem>
                                        <SelectItem value="share">Encourage shares</SelectItem>
                                        <SelectItem value="connect">Invite connections</SelectItem>
                                        <SelectItem value="visit_link">Drive to a link</SelectItem>
                                        <SelectItem value="none">No CTA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="targetAudience">Target audience</Label>
                                <Input
                                    id="targetAudience"
                                    placeholder="e.g. CTOs, startup founders"
                                    value={form.targetAudience}
                                    onChange={(e) => updateForm('targetAudience', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="additionalNotes">Additional context</Label>
                            <Textarea
                                id="additionalNotes"
                                rows={2}
                                placeholder="Optional: angle to take, stats to mention, things to avoid…"
                                value={form.additionalNotes}
                                onChange={(e) => updateForm('additionalNotes', e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="includeHashtags"
                                checked={form.includeHashtags}
                                onCheckedChange={(checked) =>
                                    updateForm('includeHashtags', checked === true)
                                }
                            />
                            <Label htmlFor="includeHashtags" className="cursor-pointer font-normal">
                                Include relevant hashtags in the draft
                            </Label>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {submitting ? 'Sending…' : 'Generate post'}
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                                    filter === f.value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-background text-foreground hover:bg-muted'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            {loading ? 'Loading…' : `${visible.length} post${visible.length !== 1 ? 's' : ''}`}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadDrafts()}
                            disabled={loading}
                        >
                            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                        <p className="font-semibold text-muted-foreground">
                            {drafts.length === 0 ? 'No posts yet' : 'No posts match this filter'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {drafts.length === 0
                                ? 'Submit a topic above — new drafts appear here once the workflow runs.'
                                : 'Try selecting a different filter.'}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={filter}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {visible.map((draft, i) => (
                                <DraftCard
                                    key={draft.id}
                                    draft={draft}
                                    index={i}
                                    onClick={setSelectedDraft}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <DetailModal
                item={selectedDraft}
                type="draft"
                airtableBaseId={AIRTABLE_BASE_ID}
                onClose={() => setSelectedDraft(null)}
            />
        </>
    );
}

LinkedIn.layout = {
    breadcrumbs: [{ title: 'LinkedIn Posts', href: '/linkedin' }],
};
