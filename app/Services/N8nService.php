<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class N8nService
{
    private string $webhookUrl;

    private string $emailFormUrl;

    public function __construct()
    {
        $this->webhookUrl = config('services.n8n.webhook_url', '');
        $this->emailFormUrl = config('services.n8n.email_form_url', '');
    }

    public function triggerLinkedIn(array $payload): array
    {
        if (! $this->webhookUrl) {
            throw new \RuntimeException('N8N_WEBHOOK_URL is not configured in .env');
        }

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post($this->webhookUrl, $payload);

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'body' => $response->json() ?? ['raw' => $response->body()],
        ];
    }

    public function triggerEmail(array $contact): array
    {
        if (! $this->emailFormUrl) {
            throw new \RuntimeException('N8N_EMAIL_FORM_URL is not configured in .env');
        }

        // n8n's form trigger expects multipart/form-data with positional keys
        // matching the order fields were defined: First Name, Last Name, Email, Company Name, Phone
        $response = Http::withHeaders(['ngrok-skip-browser-warning' => 'true'])
            ->asMultipart()
            ->post($this->emailFormUrl, [
                ['name' => 'field-0', 'contents' => $contact['firstName']],
                ['name' => 'field-1', 'contents' => $contact['lastName']],
                ['name' => 'field-2', 'contents' => $contact['email']],
                ['name' => 'field-3', 'contents' => $contact['companyName']],
                ['name' => 'field-4', 'contents' => $contact['phone']],
            ]);

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'body' => $response->body(),
        ];
    }

    public function healthCheck(): array
    {
        if (! $this->webhookUrl) {
            return ['ok' => false, 'configured' => false, 'error' => 'N8N_WEBHOOK_URL not set'];
        }

        try {
            $parsed = parse_url($this->webhookUrl);
            $origin = ($parsed['scheme'] ?? 'http').'://'.($parsed['host'] ?? 'localhost');
            if (! empty($parsed['port'])) {
                $origin .= ':'.$parsed['port'];
            }

            $response = Http::timeout(5)->get("{$origin}/healthz");

            return [
                'ok' => $response->successful(),
                'configured' => true,
                'n8nRunning' => $response->successful(),
                'webhookUrl' => $this->webhookUrl,
                'emailFormUrl' => $this->emailFormUrl ?: null,
                'n8nOrigin' => $origin,
            ];
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'configured' => true,
                'n8nRunning' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
