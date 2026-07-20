<?php

namespace App\Http\Controllers;

use App\Services\AirtableService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmailController extends Controller
{
    public function __construct(private AirtableService $airtable) {}

    public function index(): Response
    {
        return Inertia::render('email', [
            'canCreateContent' => auth()->user()?->canCreateContent() ?? false,
            'initialEmails' => $this->airtable->listEmailSummaries(),
        ]);
    }

    public function list(): JsonResponse
    {
        try {
            return response()->json(['emails' => $this->airtable->listEmailSummaries()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            return response()->json(['email' => $this->airtable->getEmail($id)]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
