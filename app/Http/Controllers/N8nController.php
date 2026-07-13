<?php

namespace App\Http\Controllers;

use App\Services\N8nService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class N8nController extends Controller
{
    public function __construct(private N8nService $n8n) {}

    public function contentRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic' => ['required', 'string', 'max:500'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'tone' => ['nullable', 'string', 'in:professional,conversational,inspirational,educational'],
            'postLength' => ['nullable', 'string', 'in:short,medium,long'],
            'targetAudience' => ['nullable', 'string', 'max:200'],
            'ctaType' => ['nullable', 'string', 'in:comment,share,connect,visit_link,none'],
            'includeHashtags' => ['nullable', 'boolean'],
            'additionalNotes' => ['nullable', 'string', 'max:1000'],
        ]);

        $topic = trim($validated['topic']);
        $keywordsRaw = trim((string) ($validated['keywords'] ?? ''));
        $keywordsList = array_values(array_filter(array_map(
            'trim',
            preg_split('/[,;\n]+/', $keywordsRaw) ?: []
        )));

        $payload = [
            'topic' => $topic,
            'channel' => 'linkedin',
            'keywords' => $keywordsRaw,
            'keywords_list' => $keywordsList,
            'tone' => $validated['tone'] ?? 'professional',
            'post_length' => $validated['postLength'] ?? 'medium',
            'target_audience' => trim((string) ($validated['targetAudience'] ?? '')),
            'cta_type' => $validated['ctaType'] ?? 'comment',
            'include_hashtags' => (bool) ($validated['includeHashtags'] ?? true),
            'additional_notes' => trim((string) ($validated['additionalNotes'] ?? '')),
        ];

        try {
            $result = $this->n8n->triggerLinkedIn($payload);

            if (! $result['ok']) {
                $msg = "n8n webhook failed ({$result['status']})";
                if ($result['status'] === 404) {
                    $msg = 'n8n webhook not found (404). Re-publish the workflow in n8n.';
                }

                return response()->json(['error' => $msg, 'details' => $result['body']], $result['status']);
            }

            return response()->json([
                'ok' => true,
                'message' => 'Request sent to n8n. Check n8n → Executions for the new run.',
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 502);
        }
    }

    public function emailRequest(Request $request): JsonResponse
    {
        $required = ['firstName', 'lastName', 'email', 'companyName', 'phone'];
        $contact = [];

        foreach ($required as $field) {
            $val = trim((string) $request->input($field, ''));
            if (! $val) {
                return response()->json(['error' => "Field '{$field}' is required."], 400);
            }
            $contact[$field] = $val;
        }

        try {
            $result = $this->n8n->triggerEmail($contact);

            if (! $result['ok']) {
                $msg = "n8n email workflow failed ({$result['status']})";
                if ($result['status'] === 404) {
                    $msg = 'n8n form not found (404). Publish the Email Automation workflow and check N8N_EMAIL_FORM_URL.';
                }

                return response()->json(['error' => $msg], $result['status']);
            }

            return response()->json([
                'ok' => true,
                'message' => 'Contact submitted. The workflow drafts the email and waits for Slack approval before sending.',
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 502);
        }
    }

    public function status(): JsonResponse
    {
        $result = $this->n8n->healthCheck();

        return response()->json($result, $result['ok'] ? 200 : 502);
    }
}
