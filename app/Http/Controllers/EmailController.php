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
        return Inertia::render('email');
    }

    public function list(): JsonResponse
    {
        try {
            return response()->json(['emails' => $this->airtable->listEmails()]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
