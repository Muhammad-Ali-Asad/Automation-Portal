import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { DetailModal } from '@/components/portal/DetailModal';
import { EmailCard } from '@/components/portal/EmailCard';
import { SkeletonRow } from '@/components/portal/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EmailRecord } from '@/types/portal';

const AIRTABLE_BASE_ID = 'appiK3HsUMuDvDn2v';

const FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Approved', value: 'Approve' },
    { label: 'Modified', value: 'Modify' },
    { label: 'Rejected', value: 'Reject' },
];

interface ContactForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
}

const EMPTY_FORM: ContactForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
};

async function fetchEmails(): Promise<EmailRecord[]> {
    const res = await fetch('/api/emails');
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Failed to load emails');
    }

    return data.emails ?? [];
}

export default function Email() {
    const [emails, setEmails] = useState<EmailRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(
        null,
    );

    const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const loadEmails = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
        }

        try {
            setEmails(await fetchEmails());
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Unknown error';

            if (!silent) {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            try {
                const records = await fetchEmails();

                if (!cancelled) {
                    setEmails(records);
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    const message =
                        err instanceof Error ? err.message : 'Unknown error';

                    toast.error(message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    function setField(field: keyof ContactForm) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/email-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Request failed');
            }

            toast.success(
                data.message ||
                    'Contact submitted. Approve the draft in Slack — the sent email will appear here after approval.',
            );
            setForm(EMPTY_FORM);
            // Emails only appear after Slack approval; poll a few times
            [30000, 90000, 180000].forEach((delay) =>
                setTimeout(() => loadEmails(true), delay),
            );
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Request failed';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    const visible =
        filter === 'all'
            ? emails
            : emails.filter(
                  (e) => e.decision.toLowerCase() === filter.toLowerCase(),
              );

    return (
        <>
            <Head title="Email Outreach" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Request form */}
                <section className="rounded-xl border bg-card p-5 shadow-sm">
                    <h2 className="mb-1 text-lg font-semibold">
                        New outreach email
                    </h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                        The agent researches the company, drafts a personalised
                        cold email, and asks for approval in Slack before
                        sending.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="firstName">First name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="e.g. Sarah"
                                    value={form.firstName}
                                    onChange={setField('firstName')}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lastName">Last name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="e.g. Chen"
                                    value={form.lastName}
                                    onChange={setField('lastName')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="emailField">Email</Label>
                                <Input
                                    id="emailField"
                                    type="email"
                                    placeholder="e.g. sarah@company.com"
                                    value={form.email}
                                    onChange={setField('email')}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    placeholder="e.g. +1 555 0100"
                                    value={form.phone}
                                    onChange={setField('phone')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="companyName">Company name</Label>
                            <Input
                                id="companyName"
                                placeholder="e.g. Acme Robotics"
                                value={form.companyName}
                                onChange={setField('companyName')}
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={submitting}>
                                {submitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {submitting
                                    ? 'Sending…'
                                    : 'Draft outreach email'}
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
                            {loading
                                ? 'Loading…'
                                : `${visible.length} email${visible.length !== 1 ? 's' : ''}`}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadEmails()}
                            disabled={loading}
                        >
                            <RefreshCw
                                className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonRow key={i} />
                        ))}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                        <p className="font-semibold text-muted-foreground">
                            {emails.length === 0
                                ? 'No emails yet'
                                : 'No emails match this filter'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {emails.length === 0
                                ? 'Submit a contact above. Sent emails are logged here after Slack approval.'
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
                            className="space-y-3"
                        >
                            {visible.map((email, i) => (
                                <EmailCard
                                    key={email.id}
                                    email={email}
                                    index={i}
                                    onClick={setSelectedEmail}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            <DetailModal
                item={selectedEmail}
                type="email"
                airtableBaseId={AIRTABLE_BASE_ID}
                onClose={() => setSelectedEmail(null)}
            />
        </>
    );
}

Email.layout = {
    breadcrumbs: [{ title: 'Email Outreach', href: '/email' }],
};
