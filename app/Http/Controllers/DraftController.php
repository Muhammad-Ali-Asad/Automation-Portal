<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewDraftRequest;
use App\Http\Requests\UpdateDraftRequest;
use App\Services\AirtableService;
use App\Services\N8nService;
use App\Support\DraftContent;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class DraftController extends Controller
{
    public function __construct(
        private AirtableService $airtable,
        private N8nService $n8n,
    ) {}

    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('linkedin', [
            'canCreateContent' => $user?->canCreateContent() ?? false,
            'canReviewContent' => $user?->canReviewContent() ?? false,
            'initialDrafts' => $this->airtable->listDraftSummaries(),
        ]);
    }

    public function list(): JsonResponse
    {
        try {
            return response()->json(['drafts' => $this->airtable->listDraftSummaries()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            return response()->json(['draft' => $this->airtable->getDraft($id)]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(UpdateDraftRequest $request, string $id): JsonResponse
    {
        try {
            $existing = $this->airtable->getDraft($id);

            if (strcasecmp((string) $existing['status'], 'Draft') !== 0) {
                return response()->json(['error' => 'Only draft posts can be edited.'], 422);
            }

            $draftContent = DraftContent::merge($existing['draftContent'], $request->validated());

            $draft = $this->airtable->updateDraft($id, [
                'Draft Content' => $draftContent,
            ]);

            return response()->json(['draft' => $draft]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function review(ReviewDraftRequest $request, string $id): JsonResponse
    {
        try {
            $existing = $this->airtable->getDraft($id);

            if (strcasecmp((string) $existing['status'], 'Draft') !== 0) {
                return response()->json(['error' => 'This post has already been reviewed.'], 422);
            }

            $validated = $request->validated();
            $approved = $validated['decision'] === 'approved';
            $draftContent = DraftContent::merge($existing['draftContent'], $validated);
            $parsed = DraftContent::parse($draftContent);
            $finalText = DraftContent::composeFinalText($parsed);

            $this->airtable->updateDraft($id, [
                'Draft Content' => $draftContent,
            ]);

            $resumeUrl = trim((string) ($existing['resumeUrl'] ?? ''));

            if ($resumeUrl !== '') {
                $result = $this->n8n->resumeLinkedInReview($resumeUrl, $approved, $finalText);

                if (! $result['ok']) {
                    return response()->json([
                        'error' => 'Saved your edits, but n8n could not process the review decision.',
                        'details' => $result,
                    ], 502);
                }
            } else {
                $this->airtable->updateDraft($id, [
                    'Status' => $approved ? 'Approved' : 'Rejected',
                ]);

                if ($approved) {
                    try {
                        $this->n8n->triggerLinkedInReviewFallback($id, true, $finalText);
                    } catch (\Throwable) {
                        // Status is already updated locally when no resume URL exists.
                    }
                }
            }

            $draft = $this->airtable->getDraft($id);

            return response()->json([
                'draft' => $draft,
                'message' => $approved
                    ? 'Post approved. Publishing workflow has been notified.'
                    : 'Post rejected.',
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function health(): JsonResponse
    {
        $result = $this->airtable->checkHealth();

        return response()->json($result, $result['ok'] ? 200 : 500);
    }
}
