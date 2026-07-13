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

export type PostTone =
    'professional' | 'conversational' | 'inspirational' | 'educational';
export type PostLength = 'short' | 'medium' | 'long';
export type PostCtaType =
    'comment' | 'share' | 'connect' | 'visit_link' | 'none';

export interface ContentRequestPayload {
    topic: string;
    keywords: string;
    tone: PostTone;
    postLength: PostLength;
    targetAudience: string;
    ctaType: PostCtaType;
    includeHashtags: boolean;
    additionalNotes: string;
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
