<?php

use App\Http\Controllers\DraftController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\N8nController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Pages
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('/linkedin', [DraftController::class, 'index'])->name('linkedin');
    Route::get('/email', [EmailController::class, 'index'])->name('email');

    // LinkedIn drafts API
    Route::get('/api/drafts', [DraftController::class, 'list'])->name('api.drafts');
    Route::get('/api/drafts/{id}', [DraftController::class, 'show'])->name('api.drafts.show');
    Route::get('/api/health', [DraftController::class, 'health'])->name('api.health');

    // Email outreach API
    Route::get('/api/emails', [EmailController::class, 'list'])->name('api.emails');

    // n8n triggers + status
    Route::post('/api/content-request', [N8nController::class, 'contentRequest'])->name('api.content-request');
    Route::post('/api/email-request', [N8nController::class, 'emailRequest'])->name('api.email-request');
    Route::get('/api/n8n-status', [N8nController::class, 'status'])->name('api.n8n-status');
});

require __DIR__.'/settings.php';
