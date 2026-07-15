// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

type Props = {
    status?: string;
    resetUrl?: string | null;
    mailDriver?: string;
};

export default function ForgotPassword({ status, resetUrl, mailDriver }: Props) {
    const usingLogMailer = mailDriver === 'log';

    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 space-y-3 text-center text-sm font-medium text-green-600">
                    <p>{status}</p>
                    {usingLogMailer && (
                        <p className="text-xs font-normal text-muted-foreground">
                            Local mailer is set to <code className="rounded bg-muted px-1">log</code>, so nothing is
                            delivered to Gmail. Use the link below, or switch <code className="rounded bg-muted px-1">MAIL_MAILER</code> to
                            SMTP in <code className="rounded bg-muted px-1">.env</code>.
                        </p>
                    )}
                    {resetUrl && (
                        <p className="text-left text-xs font-normal break-all text-foreground">
                            <a href={resetUrl} className="underline underline-offset-4">
                                Open password reset link
                            </a>
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={login()}>log in</TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
