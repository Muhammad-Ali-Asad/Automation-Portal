<?php

namespace App\Services;

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
        $this->token = config('services.airtable.token', '');
        $this->baseId = config('services.airtable.base_id', '');
        $this->tableId = config('services.airtable.table_id', '');
        $this->emailToken = config('services.airtable.email_token') ?: $this->token;
        $this->emailBaseId = config('services.airtable.email_base_id', '');
        $this->emailTableId = config('services.airtable.email_table_id', '');
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
            'createdAt' => $fields['Created At'] ?? $record['createdTime'] ?? null,
        ];
    }

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

    public function listDrafts(): array
    {
        return $this->paginate($this->baseId, $this->tableId, $this->token, [$this, 'mapDraft']);
    }

    public function getDraft(string $id): array
    {
        $response = Http::withToken($this->token)
            ->get("https://api.airtable.com/v0/{$this->baseId}/{$this->tableId}/{$id}");

        if (! $response->successful()) {
            throw new \RuntimeException("Airtable error ({$response->status()}): {$response->body()}");
        }

        return $this->mapDraft($response->json());
    }

    public function listEmails(): array
    {
        return $this->paginate($this->emailBaseId, $this->emailTableId, $this->emailToken, [$this, 'mapEmail']);
    }

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
