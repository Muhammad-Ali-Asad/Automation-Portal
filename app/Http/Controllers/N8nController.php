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
        $topic = trim((string) $request->input('topic', ''));
        if (! $topic) {
            return response()->json(['error' => 'Topic is required.'], 400);
        }

        try {
            $result = $this->n8n->triggerLinkedIn($topic);

            if (! $result['ok']) {
                $msg = "n8n webhook failed ({$result['status']})";
                if ($result['status'] === 404) {
                    $msg = 'n8n webhook not found (404). Re-publish the workflow in n8n.';
                }
                return response()->json(['error' => $msg, 'details' => $result['body']], $result['status']);
            }

            return response()->json([
                'ok'      => true,
                'message' => 'Request sent to n8n. Check n8n → Executions for the new run.',
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 502);
        }
    }

    public function emailRequest(Request $request): JsonResponse
    {
        $required = ['firstName', 'lastName', 'email', 'companyName', 'phone'];
        $contact  = [];

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
                'ok'      => true,
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
