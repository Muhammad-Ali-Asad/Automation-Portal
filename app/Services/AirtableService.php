<?php

namespace App\Services;

use App\Support\DraftContent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class AirtableService
{
    private string $token;

    private string $baseId;

    private string $tableId;

    private string $emailToken;

    private string $emailBaseId;

    private string $emailTableId;

    public function __construct()
    {
        // Coalesce nulls: config defaults don't replace an existing null from env()
        $this->token = (string) (config('services.airtable.token') ?? '');
        $this->baseId = (string) (config('services.airtable.base_id') ?? '');
        $this->tableId = (string) (config('services.airtable.table_id') ?? '');
        $this->emailToken = (string) (config('services.airtable.email_token') ?: $this->token);
        $this->emailBaseId = (string) (config('services.airtable.email_base_id') ?? '');
        $this->emailTableId = (string) (config('services.airtable.email_table_id') ?? '');
    }

    private function cacheTtl(): int
    {
        return max(15, (int) (config('services.portal.cache_ttl', 60)));
    }

    public function clearDraftsCache(): void
    {
        Cache::forget('portal.airtable.drafts');
        Cache::forget('portal.airtable.drafts.full');
    }

    public function clearEmailsCache(): void
    {
        Cache::forget('portal.airtable.emails');
        Cache::forget('portal.airtable.emails.full');
    }

    private function normalizeImageUrl(?string $url): string
    {
        $value = trim($url ?? '');
        if (! $value) {
            return '';
        }

        if (str_contains($value, 'drive.google.com')) {
            if (preg_match('/\/file\/d\/([\w-]+)/', $value, $m) ||
                preg_match('/[?&]id=([\w-]+)/', $value, $m)) {
                return "https://drive.google.com/thumbnail?id={$m[1]}&sz=w1200";
            }
        }

        return $value;
    }

    /**
     * @param  callable(array<string, mixed>): array<string, mixed>  $mapper
     * @return list<array<string, mixed>>
     */
    private function paginate(string $baseId, string $tableId, string $token, callable $mapper): array
    {
        $records = [];
        $offset = null;

        do {
            $params = ['pageSize' => 100];
            if ($offset) {
                $params['offset'] = $offset;
            }

            $response = Http::withToken($token)
                ->timeout(15)
                ->connectTimeout(5)
                ->get("https://api.airtable.com/v0/{$baseId}/{$tableId}", $params);

            if (! $response->successful()) {
                $status = $response->status();
                $body = $response->body();

                if ($status === 401) {
                    throw new \RuntimeException('Airtable token rejected (401). Check your AIRTABLE_TOKEN in .env.');
                }
                if ($status === 403 || $status === 404) {
                    throw new \RuntimeException("Airtable error ({$status}): token may not have access to base {$baseId}.");
                }

                throw new \RuntimeException("Airtable error ({$status}): {$body}");
            }

            $data = $response->json();
            foreach ($data['records'] ?? [] as $record) {
                $records[] = $mapper($record);
            }
            $offset = $data['offset'] ?? null;
        } while ($offset);

        usort($records, function ($a, $b) {
            return strtotime((string) ($b['createdAt'] ?? '1970-01-01')) -
                   strtotime((string) ($a['createdAt'] ?? '1970-01-01'));
        });

        return $records;
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function mapDraftSummary(array $record): array
    {
        $draft = $this->mapDraft($record);
        $parsed = DraftContent::parse((string) $draft['draftContent']);

        unset($draft['draftContent'], $draft['resumeUrl']);

        $draft['previewText'] = $parsed['post_text'] !== ''
            ? $parsed['post_text']
            : ($parsed['hook'] !== '' ? $parsed['hook'] : 'No content yet');

        return $draft;
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function mapEmailSummary(array $record): array
    {
        $email = $this->mapEmail($record);
        $preview = trim((string) $email['finalEmail']);
        $email['previewText'] = $preview !== ''
            ? mb_strimwidth($preview, 0, 180, '…')
            : '';

        unset($email['painPoints'], $email['hook'], $email['finalEmail']);

        return $email;
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function mapDraft(array $record): array
    {
        $fields = $record['fields'] ?? [];
        $channel = $fields['Channel '] ?? $fields['Channel'] ?? $fields['channel'] ?? '';
        $attachments = is_array($fields['Image'] ?? null) ? $fields['Image'] : [];
        $rawImageUrl = $attachments[0]['url'] ?? $fields['Image URL'] ?? '';

        return [
            'id' => $record['id'],
            'topic' => $fields['Topic'] ?? '',
            'channel' => strtolower((string) $channel),
            'draftContent' => $fields['Draft Content'] ?? '',
            'status' => $fields['Status'] ?? 'Draft',
            'imageUrl' => $this->normalizeImageUrl($rawImageUrl),
            'resumeUrl' => trim((string) ($fields['Resume URL'] ?? '')),
            'createdAt' => $fields['Created At'] ?? $record['createdTime'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    private function mapEmail(array $record): array
    {
        $fields = $record['fields'] ?? [];

        return [
            'id' => $record['id'],
            'firstName' => $fields['First Name'] ?? '',
            'lastName' => $fields['Last Name'] ?? '',
            'email' => $fields['Email'] ?? '',
            'phone' => $fields['Phone Number'] ?? '',
            'companyName' => $fields['Company Name'] ?? '',
            'painPoints' => $fields['Pain points'] ?? '',
            'hook' => $fields['Hook'] ?? '',
            'finalEmail' => $fields['Final Email'] ?? '',
            'decision' => $fields['Decision'] ?? '',
            'createdAt' => $fields['Time Stamp'] ?? $record['createdTime'] ?? null,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listDraftSummaries(): array
    {
        $this->ensureConfigured($this->token, $this->baseId, $this->tableId, 'AIRTABLE_TOKEN / AIRTABLE_BASE_ID / AIRTABLE_TABLE_ID');

        return Cache::remember('portal.airtable.drafts', $this->cacheTtl(), function () {
            return $this->paginate($this->baseId, $this->tableId, $this->token, [$this, 'mapDraftSummary']);
        });
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listDrafts(): array
    {
        $this->ensureConfigured($this->token, $this->baseId, $this->tableId, 'AIRTABLE_TOKEN / AIRTABLE_BASE_ID / AIRTABLE_TABLE_ID');

        return Cache::remember('portal.airtable.drafts.full', $this->cacheTtl(), function () {
            return $this->paginate($this->baseId, $this->tableId, $this->token, [$this, 'mapDraft']);
        });
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listEmailSummaries(): array
    {
        $this->ensureConfigured(
            $this->emailToken,
            $this->emailBaseId,
            $this->emailTableId,
            'EMAIL_AIRTABLE_TOKEN (or AIRTABLE_TOKEN) / EMAIL_AIRTABLE_BASE_ID / EMAIL_AIRTABLE_TABLE_ID'
        );

        return Cache::remember('portal.airtable.emails', $this->cacheTtl(), function () {
            return $this->paginate($this->emailBaseId, $this->emailTableId, $this->emailToken, [$this, 'mapEmailSummary']);
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function getDraft(string $id): array
    {
        $this->ensureConfigured($this->token, $this->baseId, $this->tableId, 'AIRTABLE_TOKEN / AIRTABLE_BASE_ID / AIRTABLE_TABLE_ID');

        $response = Http::withToken($this->token)
            ->timeout(15)
            ->connectTimeout(5)
            ->get("https://api.airtable.com/v0/{$this->baseId}/{$this->tableId}/{$id}");

        if (! $response->successful()) {
            throw new \RuntimeException("Airtable error ({$response->status()}): {$response->body()}");
        }

        return $this->mapDraft($response->json());
    }

    /**
     * @param  array<string, mixed>  $fields
     * @return array<string, mixed>
     */
    public function updateDraft(string $id, array $fields): array
    {
        $response = Http::withToken($this->token)
            ->timeout(15)
            ->connectTimeout(5)
            ->patch("https://api.airtable.com/v0/{$this->baseId}/{$this->tableId}/{$id}", [
                'fields' => $fields,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException("Airtable error ({$response->status()}): {$response->body()}");
        }

        $draft = $this->mapDraft($response->json());

        $this->clearDraftsCache();

        return $draft;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function listEmails(): array
    {
        $this->ensureConfigured(
            $this->emailToken,
            $this->emailBaseId,
            $this->emailTableId,
            'EMAIL_AIRTABLE_TOKEN (or AIRTABLE_TOKEN) / EMAIL_AIRTABLE_BASE_ID / EMAIL_AIRTABLE_TABLE_ID'
        );

        return Cache::remember('portal.airtable.emails.full', $this->cacheTtl(), function () {
            return $this->paginate($this->emailBaseId, $this->emailTableId, $this->emailToken, [$this, 'mapEmail']);
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function getEmail(string $id): array
    {
        $this->ensureConfigured(
            $this->emailToken,
            $this->emailBaseId,
            $this->emailTableId,
            'EMAIL_AIRTABLE_TOKEN (or AIRTABLE_TOKEN) / EMAIL_AIRTABLE_BASE_ID / EMAIL_AIRTABLE_TABLE_ID'
        );

        $response = Http::withToken($this->emailToken)
            ->timeout(15)
            ->connectTimeout(5)
            ->get("https://api.airtable.com/v0/{$this->emailBaseId}/{$this->emailTableId}/{$id}");

        if (! $response->successful()) {
            throw new \RuntimeException("Airtable error ({$response->status()}): {$response->body()}");
        }

        return $this->mapEmail($response->json());
    }

    private function ensureConfigured(string $token, string $baseId, string $tableId, string $keys): void
    {
        if ($token === '' || $baseId === '' || $tableId === '') {
            throw new \RuntimeException("Airtable is not configured. Set {$keys} in your .env file.");
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function checkHealth(): array
    {
        if (! $this->token) {
            return ['ok' => false, 'airtable' => 'missing_token'];
        }

        $response = Http::withToken($this->token)
            ->get("https://api.airtable.com/v0/{$this->baseId}/{$this->tableId}", ['pageSize' => 1]);

        if ($response->successful()) {
            return ['ok' => true, 'airtable' => 'connected'];
        }

        $airtable = $response->status() === 401 ? 'invalid_token' : "error_{$response->status()}";

        return ['ok' => false, 'airtable' => $airtable];
    }
}
