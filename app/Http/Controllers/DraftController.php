<?php

namespace App\Http\Controllers;

use App\Services\AirtableService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class DraftController extends Controller
{
    public function __construct(private AirtableService $airtable) {}

    public function index(): Response
    {
        return Inertia::render('linkedin');
    }

    public function list(): JsonResponse
    {
        try {
            return response()->json(['drafts' => $this->airtable->listDrafts()]);
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

    public function health(): JsonResponse
    {
        $result = $this->airtable->checkHealth();
        return response()->json($result, $result['ok'] ? 200 : 500);
    }
}
