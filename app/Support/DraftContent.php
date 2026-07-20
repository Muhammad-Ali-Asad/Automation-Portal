<?php

namespace App\Support;

class DraftContent
{
    /**
     * @return array{hook: string, post_text: string, cta: string, hashtags: list<string>}
     */
    public static function parse(string $raw): array
    {
        $decoded = json_decode($raw, true);

        if (! is_array($decoded)) {
            return [
                'hook' => '',
                'post_text' => trim($raw),
                'cta' => '',
                'hashtags' => [],
            ];
        }

        $hashtags = $decoded['hashtags'] ?? [];
        if (! is_array($hashtags)) {
            $hashtags = [];
        }

        return [
            'hook' => trim((string) ($decoded['hook'] ?? '')),
            'post_text' => trim((string) ($decoded['post_text'] ?? '')),
            'cta' => trim((string) ($decoded['cta'] ?? '')),
            'hashtags' => array_values(array_filter(array_map(
                fn ($tag) => trim((string) $tag),
                $hashtags,
            ))),
        ];
    }

    /**
     * @param  array{hook?: string|null, post_text?: string|null, cta?: string|null, hashtags?: list<string>|null}  $parts
     */
    public static function merge(string $existingRaw, array $parts): string
    {
        $current = self::parse($existingRaw);

        $merged = [
            'hook' => trim((string) ($parts['hook'] ?? $current['hook'])),
            'post_text' => trim((string) ($parts['post_text'] ?? $current['post_text'])),
            'cta' => trim((string) ($parts['cta'] ?? $current['cta'])),
            'hashtags' => array_values(array_filter(array_map(
                'trim',
                $parts['hashtags'] ?? $current['hashtags'],
            ))),
        ];

        return json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';
    }

    /**
     * @param  array{hook?: string, post_text?: string, cta?: string, hashtags?: list<string>}  $parsed
     */
    public static function composeFinalText(array $parsed): string
    {
        $hashtags = implode(' ', $parsed['hashtags'] ?? []);

        return collect([$parsed['hook'] ?? '', $parsed['post_text'] ?? '', $parsed['cta'] ?? '', $hashtags])
            ->filter(fn (string $part) => $part !== '')
            ->implode("\n\n");
    }
}
