export interface Draft {
    id: string;
    topic: string;
    channel: string;
    draftContent: string;
    status: string;
    imageUrl: string;
    createdAt: string | null;
}

export interface DraftContent {
    hook?: string;
    post_text?: string;
    cta?: string;
    hashtags?: string[];
}

export interface EmailRecord {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    painPoints: string;
    hook: string;
    finalEmail: string;
    decision: string;
    createdAt: string | null;
}
