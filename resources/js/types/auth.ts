export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export type UserAbilities = {
    manageUsers: boolean;
    createContent: boolean;
    reviewContent: boolean;
    viewDashboard: boolean;
    viewLinkedIn: boolean;
    viewEmail: boolean;
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    roleLabel: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
    abilities: UserAbilities;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
