import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { dashboard, linkedin, email } from '@/routes';
import { StatusBadge } from '@/components/portal/StatusBadge';
import type { Draft, EmailRecord } from '@/types/portal';

// ── types ────────────────────────────────────────────────────────────────────

interface N8nStatus {
    ok: boolean;
}

interface Stats {
    totalDrafts: number;
    totalEmails: number;
    approvedDrafts: number;
    publishedDrafts: number;
    n8nOk: boolean | null;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    sub,
    icon,
    loading,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    loading: boolean;
}) {
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {label}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
            </div>
            {loading ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
            ) : (
                <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
            {sub && (
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            )}
        </div>
    );
}

function QuickLink({
    href,
    title,
    description,
    icon,
    badge,
}: {
    href: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string | number;
}) {
    return (
        <Link
            href={href}
            className="group flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
        >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                    <span className="font-semibold text-foreground">{title}</span>
                    {badge !== undefined && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="truncate text-sm text-muted-foreground">{description}</p>
            </div>
            <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
            >
                <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                    clipRule="evenodd"
                />
            </svg>
        </Link>
    );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [emails, setEmails] = useState<EmailRecord[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalDrafts: 0,
        totalEmails: 0,
        approvedDrafts: 0,
        publishedDrafts: 0,
        n8nOk: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const [draftsRes, emailsRes, n8nRes] = await Promise.allSettled([
                    fetch('/api/drafts').then((r) => r.json()),
                    fetch('/api/emails').then((r) => r.json()),
                    fetch('/api/n8n-status').then((r) => r.json()),
                ]);

                if (cancelled) return;

                const draftList: Draft[] =
                    draftsRes.status === 'fulfilled' ? (draftsRes.value.drafts ?? []) : [];
                const emailList: EmailRecord[] =
                    emailsRes.status === 'fulfilled' ? (emailsRes.value.emails ?? []) : [];
                const n8nOk: boolean | null =
                    n8nRes.status === 'fulfilled' ? Boolean(n8nRes.value.ok) : null;

                setDrafts(draftList.slice(0, 5));
                setEmails(emailList.slice(0, 5));
                setStats({
                    totalDrafts: draftList.length,
                    totalEmails: emailList.length,
                    approvedDrafts: draftList.filter(
                        (d) => d.status?.toLowerCase() === 'approved',
                    ).length,
                    publishedDrafts: draftList.filter(
                        (d) => d.status?.toLowerCase() === 'published',
                    ).length,
                    n8nOk,
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    const now = new Date();
    const greeting =
        now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* ── Header ── */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-foreground">{greeting} 👋</h1>
                    <p className="text-sm text-muted-foreground">
                        Here's what's happening in SP Automation Portal today.
                    </p>
                </div>

                {/* ── Stats ── */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="LinkedIn Drafts"
                        value={stats.totalDrafts}
                        sub={`${stats.approvedDrafts} approved · ${stats.publishedDrafts} published`}
                        loading={loading}
                        icon={
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Email Contacts"
                        value={stats.totalEmails}
                        sub="Outreach records in Airtable"
                        loading={loading}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Approved Drafts"
                        value={stats.approvedDrafts}
                        sub="Ready for publishing"
                        loading={loading}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="n8n Automation"
                        value={
                            stats.n8nOk === null
                                ? '—'
                                : stats.n8nOk
                                  ? 'Online'
                                  : 'Offline'
                        }
                        sub={
                            stats.n8nOk === null
                                ? 'Checking status…'
                                : stats.n8nOk
                                  ? 'Webhooks reachable'
                                  : 'Check N8N_WEBHOOK_URL in .env'
                        }
                        loading={loading}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        }
                    />
                </div>

                {/* ── Quick Navigation ── */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Quick Access
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <QuickLink
                            href={linkedin()}
                            title="LinkedIn Drafts"
                            description="Browse, review, and trigger new content drafts from Airtable"
                            badge={loading ? '…' : stats.totalDrafts}
                            icon={
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            }
                        />
                        <QuickLink
                            href={email()}
                            title="Email Outreach"
                            description="Manage email contacts and trigger automated outreach via n8n"
                            badge={loading ? '…' : stats.totalEmails}
                            icon={
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                            }
                        />
                    </div>
                </div>

                {/* ── Recent Activity ── */}
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Recent Drafts */}
                    <div className="rounded-xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h2 className="text-sm font-semibold text-foreground">Recent LinkedIn Drafts</h2>
                            <Link
                                href={linkedin()}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                        <div className="divide-y">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-3 px-5 py-4">
                                        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                                            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                                        </div>
                                    </div>
                                ))
                            ) : drafts.length === 0 ? (
                                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                                    No drafts found in Airtable yet.
                                </div>
                            ) : (
                                drafts.map((draft) => (
                                    <Link
                                        key={draft.id}
                                        href={linkedin()}
                                        className="flex items-start gap-3 px-5 py-4 transition hover:bg-muted/40"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-600 dark:text-blue-400">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {draft.topic || 'Untitled draft'}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <StatusBadge status={draft.status} />
                                                <span className="text-xs text-muted-foreground">
                                                    {draft.createdAt
                                                        ? new Date(draft.createdAt).toLocaleDateString()
                                                        : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Emails */}
                    <div className="rounded-xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h2 className="text-sm font-semibold text-foreground">Recent Email Contacts</h2>
                            <Link
                                href={email()}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                        <div className="divide-y">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-3 px-5 py-4">
                                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                                            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                                        </div>
                                    </div>
                                ))
                            ) : emails.length === 0 ? (
                                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                                    No email contacts found in Airtable yet.
                                </div>
                            ) : (
                                emails.map((rec) => {
                                    const initials = `${rec.firstName?.[0] ?? ''}${rec.lastName?.[0] ?? ''}`.toUpperCase() || '?';
                                    return (
                                        <Link
                                            key={rec.id}
                                            href={email()}
                                            className="flex items-start gap-3 px-5 py-4 transition hover:bg-muted/40"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                {initials}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {rec.firstName} {rec.lastName}
                                                    {rec.companyName && (
                                                        <span className="ml-1 font-normal text-muted-foreground">
                                                            · {rec.companyName}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {rec.email}
                                                    {rec.decision && (
                                                        <span className="ml-2 font-medium capitalize text-foreground">
                                                            · {rec.decision}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
