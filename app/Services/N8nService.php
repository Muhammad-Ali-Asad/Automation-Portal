<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class N8nService
{
    private string $webhookUrl;

    private string $emailFormUrl;

    private string $linkedinReviewWebhookUrl;

    public function __construct()
    {
        $this->webhookUrl = (string) (config('services.n8n.webhook_url') ?? '');
        $this->emailFormUrl = (string) (config('services.n8n.email_form_url') ?? '');
        $this->linkedinReviewWebhookUrl = (string) (config('services.n8n.linkedin_review_webhook_url') ?? '');
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
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

    /**
     * @param  array<string, string>  $contact
     * @return array<string, mixed>
     */
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

    /**
     * @return array<string, mixed>
     */
    public function resumeLinkedInReview(string $resumeUrl, bool $approved, string $finalText): array
    {
        if (! $resumeUrl) {
            throw new \RuntimeException('No n8n resume URL is available for this draft.');
        }

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post($resumeUrl, [
                'approved' => $approved,
                'final_text' => $finalText,
            ]);

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'body' => $response->json() ?? ['raw' => $response->body()],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function triggerLinkedInReviewFallback(string $recordId, bool $approved, string $finalText): array
    {
        if (! $this->linkedinReviewWebhookUrl) {
            throw new \RuntimeException('N8N_LINKEDIN_REVIEW_WEBHOOK_URL is not configured in .env');
        }

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post($this->linkedinReviewWebhookUrl, [
                'record_id' => $recordId,
                'approved' => $approved,
                'final_text' => $finalText,
            ]);

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'body' => $response->json() ?? ['raw' => $response->body()],
        ];
    }

    /**
     * @return array<string, mixed>
     */
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
