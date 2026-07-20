import { Form, Head, usePage } from '@inertiajs/react';
import { ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Auth, UserRole } from '@/types';

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    roleLabel: string;
    emailVerified: boolean;
    createdAt: string | null;
    canManage: boolean;
};

type RoleOption = {
    value: UserRole;
    label: string;
    description: string;
};

type PageProps = {
    auth: Auth;
    users: ManagedUser[];
    assignableRoles: RoleOption[];
    roleLabels: Record<UserRole, string>;
};

function roleBadgeVariant(role: UserRole): 'default' | 'secondary' | 'outline' {
    switch (role) {
        case 'super_admin':
            return 'default';
        case 'admin':
            return 'secondary';
        default:
            return 'outline';
    }
}

export default function AdminUsers({
    users,
    assignableRoles,
    roleLabels,
}: Omit<PageProps, 'auth'>) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="User Management" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-primary">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="text-sm font-medium">
                                Admin area
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            User Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor portal users and assign roles. Your role:{' '}
                            <span className="font-medium text-foreground">
                                {auth.user?.roleLabel}
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{users.length}</span>
                        <span className="text-muted-foreground">
                            total users
                        </span>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="hidden gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium tracking-wide text-muted-foreground uppercase lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_140px_120px_220px]">
                        <span>User</span>
                        <span>Email</span>
                        <span>Status</span>
                        <span>Role</span>
                        <span>Assign role</span>
                    </div>

                    <div className="divide-y">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_140px_120px_220px] lg:items-center"
                            >
                                <div>
                                    <p className="font-medium text-foreground">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Joined{' '}
                                        {user.createdAt
                                            ? new Date(
                                                  user.createdAt,
                                              ).toLocaleDateString()
                                            : '—'}
                                    </p>
                                </div>

                                <p className="truncate text-sm text-muted-foreground">
                                    {user.email}
                                </p>

                                <div>
                                    <Badge
                                        variant={
                                            user.emailVerified
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                    >
                                        {user.emailVerified
                                            ? 'Verified'
                                            : 'Pending'}
                                    </Badge>
                                </div>

                                <div>
                                    <Badge
                                        variant={roleBadgeVariant(user.role)}
                                    >
                                        {roleLabels[user.role] ??
                                            user.roleLabel}
                                    </Badge>
                                </div>

                                <div>
                                    {user.canManage ? (
                                        <Form
                                            action={`/admin/users/${user.id}/role`}
                                            method="patch"
                                            options={{ preserveScroll: true }}
                                            onSuccess={() =>
                                                toast.success(
                                                    `Updated role for ${user.name}.`,
                                                )
                                            }
                                            onError={() =>
                                                toast.error(
                                                    'Could not update user role.',
                                                )
                                            }
                                            className="flex items-center gap-2"
                                        >
                                            {({ processing }) => (
                                                <>
                                                    <select
                                                        name="role"
                                                        defaultValue={user.role}
                                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                                    >
                                                        {assignableRoles.map(
                                                            (role) => (
                                                                <option
                                                                    key={
                                                                        role.value
                                                                    }
                                                                    value={
                                                                        role.value
                                                                    }
                                                                >
                                                                    {role.label}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <Button
                                                        type="submit"
                                                        size="sm"
                                                        disabled={processing}
                                                    >
                                                        Save
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {user.id === auth.user?.id
                                                ? 'This is you'
                                                : 'Protected account'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-5">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Role guide
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {assignableRoles.map((role) => (
                            <div
                                key={role.value}
                                className="rounded-lg border bg-card p-4"
                            >
                                <p className="font-medium text-foreground">
                                    {role.label}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {role.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
