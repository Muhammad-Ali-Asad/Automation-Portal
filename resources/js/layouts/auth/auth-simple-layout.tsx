import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#07070d] p-6 md:p-10">
            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
                <div className="h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
                                <span className="text-sm font-bold text-white">M</span>
                            </div>
                            <span className="sr-only">Mezz Portal</span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-xl font-semibold text-white">{title}</h1>
                            <p className="text-center text-sm text-gray-500">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
