<?php

namespace App\Http\Controllers;

use App\Services\AirtableService;
use App\Services\N8nService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private AirtableService $airtable,
        private N8nService $n8n,
    ) {}

    public function index(): Response
    {
        $drafts = $this->airtable->listDraftSummaries();
        $emails = $this->airtable->listEmailSummaries();

        $n8nOk = Cache::remember('portal.n8n.status', 30, function () {
            $result = $this->n8n->healthCheck();

            return (bool) ($result['ok'] ?? false);
        });

        return Inertia::render('dashboard', [
            'initialDrafts' => array_slice($drafts, 0, 5),
            'initialEmails' => array_slice($emails, 0, 5),
            'stats' => [
                'totalDrafts' => count($drafts),
                'totalEmails' => count($emails),
                'approvedDrafts' => collect($drafts)->where('status', 'Approved')->count(),
                'publishedDrafts' => collect($drafts)->where('status', 'Published')->count(),
                'n8nOk' => $n8nOk,
            ],
        ]);
    }
}
