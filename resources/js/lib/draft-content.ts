import type { DraftContent } from '@/types/portal';

export function parseDraftContent(raw: string): DraftContent | null {
    try {
        return JSON.parse(raw) as DraftContent;
    } catch {
        return null;
    }
}

export function getDraftEditorState(raw: string): Required<DraftContent> {
    const parsed = parseDraftContent(raw);

    return {
        hook: parsed?.hook ?? '',
        post_text: parsed?.post_text ?? raw,
        cta: parsed?.cta ?? '',
        hashtags: Array.isArray(parsed?.hashtags) ? parsed.hashtags : [],
    };
}

export function getDraftCopyText(raw: string): string {
    const parsed = getDraftEditorState(raw);
    const hashtags = parsed.hashtags.join(' ');

    return [parsed.hook, parsed.post_text, parsed.cta, hashtags]
        .filter(Boolean)
        .join('\n\n');
}

export function hashtagsToString(hashtags: string[]): string {
    return hashtags.join(' ');
}

export function hashtagsFromString(value: string): string[] {
    return value
        .split(/[\s,]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
}

export function isDraftReviewable(draft: {
    status: string;
    imageUrl?: string;
}): boolean {
    return draft.status.toLowerCase() === 'draft' && Boolean(draft.imageUrl);
}
