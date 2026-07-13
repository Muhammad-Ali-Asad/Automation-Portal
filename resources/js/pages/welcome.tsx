import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

const services = [
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                />
            </svg>
        ),
        title: 'AI Content Generation',
        description:
            'Trigger n8n workflows to generate LinkedIn content drafts automatically with AI — tailored to your brand voice.',
    },
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                />
            </svg>
        ),
        title: 'LinkedIn Draft Management',
        description:
            'Browse, review, and manage all your LinkedIn content drafts pulled live from Airtable in one clean interface.',
    },
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
            </svg>
        ),
        title: 'Email Outreach',
        description:
            'Track and manage your email outreach campaigns sourced from Airtable with real-time status updates.',
    },
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                />
            </svg>
        ),
        title: 'Workflow Automation',
        description:
            'Seamlessly connect to n8n workflows for email and content automation without writing a single line of code.',
    },
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                />
            </svg>
        ),
        title: 'Airtable Integration',
        description:
            'A live two-way sync with Airtable keeps your data fresh — no manual imports or CSV uploads needed.',
    },
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
            </svg>
        ),
        title: 'Secure & Role-Protected',
        description:
            'Full authentication with 2FA and passkey (WebAuthn) support — your automation data stays private.',
    },
];

const stats = [
    { value: '13+', label: 'Years Experience' },
    { value: '200+', label: 'Projects Completed' },
    { value: '95%', label: 'Client Retention' },
    { value: 'Active', label: 'Development' },
];

const reasons = [
    {
        title: 'Technical Expertise',
        description:
            'Built with Laravel 13, React 19, and Inertia.js — the latest battle-tested stack for modern web applications.',
    },
    {
        title: 'Tailored Solutions',
        description:
            'Every feature is purpose-built for your LinkedIn and email automation workflow — no bloat, no compromise.',
    },
    {
        title: 'Transparent Process',
        description:
            'Real-time data from Airtable means you always see the latest state of your content and outreach pipelines.',
    },
    {
        title: 'Long-term Partnership',
        description:
            'Soft Pyramid stands behind every product we ship, with ongoing support as your business scales.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome to SP Automation Portal" />
            <div className="min-h-screen bg-[#07070d] text-white antialiased">
                {/* ── Navbar ── */}
                <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070d]/80 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
                                <span className="text-xs font-bold text-white">
                                    SP
                                </span>
                            </div>
                            <span className="text-base font-semibold tracking-tight text-white">
                                SP Automation Portal
                            </span>
                        </div>
                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-95"
                                >
                                    Dashboard →
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:opacity-90 active:scale-95"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
                    {/* Background glow */}
                    <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
                        <div className="mt-10 h-[600px] w-[900px] rounded-full bg-blue-600/10 blur-[120px]" />
                    </div>
                    <div className="relative mx-auto max-w-4xl">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                            <span className="text-xs font-medium tracking-widest text-blue-300 uppercase">
                                Powered by Soft Pyramid
                            </span>
                        </div>
                        <h1 className="mb-6 text-5xl leading-tight font-extrabold tracking-tight lg:text-7xl">
                            <span className="bg-gradient-to-br from-white via-blue-100 to-violet-200 bg-clip-text text-transparent">
                                Your Automation
                            </span>
                            <br />
                            <span className="bg-gradient-to-br from-blue-400 to-violet-500 bg-clip-text text-transparent">
                                Command Center
                            </span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400">
                            Manage LinkedIn content drafts and email outreach
                            workflows in one place — powered by Airtable data
                            and n8n automation pipelines.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href={auth.user ? dashboard() : register()}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:opacity-90 active:scale-95"
                            >
                                {auth.user
                                    ? 'Go to Dashboard'
                                    : "Get Started — It's Free"}
                                <svg
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="h-4 w-4"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </Link>
                            <Link
                                href={login()}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-gray-300 backdrop-blur transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                            >
                                Log in to your account
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Stats ── */}
                <section className="border-y border-white/[0.06] bg-white/[0.02] py-14">
                    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="mb-1 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-4xl font-extrabold text-transparent">
                                    {s.value}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Services / Features ── */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-14 text-center">
                            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                                Everything You Need
                            </h2>
                            <p className="mx-auto max-w-xl text-gray-500">
                                A unified portal built to streamline your
                                LinkedIn content pipeline and email outreach —
                                end to end.
                            </p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => (
                                <div
                                    key={service.title}
                                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur transition hover:border-blue-500/30 hover:bg-white/[0.05]"
                                >
                                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 text-blue-400 ring-1 ring-white/10 transition group-hover:from-blue-600/30 group-hover:to-violet-600/30 group-hover:text-blue-300">
                                        {service.icon}
                                    </div>
                                    <h3 className="mb-2 text-base font-semibold text-white">
                                        {service.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-500">
                                        {service.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Why Choose ── */}
                <section className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-24">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-14 text-center">
                            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                                Why Choose Soft Pyramid?
                            </h2>
                            <p className="mx-auto max-w-xl text-gray-500">
                                We combine technical expertise with a deep
                                understanding of business needs to deliver
                                solutions that drive real results.
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {reasons.map((r, i) => (
                                <div
                                    key={r.title}
                                    className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6"
                                >
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <h3 className="mb-2 text-sm font-semibold text-white">
                                        {r.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-500">
                                        {r.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="px-6 py-24 text-center">
                    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-12 backdrop-blur">
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="h-64 w-96 rounded-full bg-blue-600/10 blur-[80px]" />
                        </div>
                        <div className="relative">
                            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                                Ready to Get Started?
                            </h2>
                            <p className="mb-8 text-gray-400">
                                Join SP Automation Portal and put your content
                                and outreach on autopilot.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:opacity-90 active:scale-95"
                                >
                                    {auth.user
                                        ? 'Go to Dashboard'
                                        : 'Create an Account'}
                                </Link>
                                <a
                                    href="https://softpyramid.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition hover:text-white"
                                >
                                    Learn about Soft Pyramid
                                    <svg
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
                                            clipRule="evenodd"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-white/[0.06] px-6 py-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-600 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-600">
                                <span className="text-[9px] font-bold text-white">
                                    SP
                                </span>
                            </div>
                            <span>SP Automation Portal</span>
                            <span className="text-gray-700">·</span>
                            <span>Built by</span>
                            <a
                                href="https://softpyramid.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 transition hover:text-white"
                            >
                                Soft Pyramid
                            </a>
                        </div>
                        <div className="flex items-center gap-6">
                            <a
                                href="https://softpyramid.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="transition hover:text-gray-400"
                            >
                                softpyramid.com
                            </a>
                            <span>
                                © {new Date().getFullYear()} Soft Pyramid LLC
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
