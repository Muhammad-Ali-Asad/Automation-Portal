<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DraftController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\N8nController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Pages
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/linkedin', [DraftController::class, 'index'])->name('linkedin');
    Route::get('/email', [EmailController::class, 'index'])->name('email');

    // LinkedIn drafts API
    Route::get('/api/drafts', [DraftController::class, 'list'])->name('api.drafts');
    Route::get('/api/drafts/{id}', [DraftController::class, 'show'])->name('api.drafts.show');
    Route::get('/api/health', [DraftController::class, 'health'])->name('api.health');

    Route::middleware('role:super_admin,admin,editor')->group(function () {
        Route::patch('/api/drafts/{id}', [DraftController::class, 'update'])->name('api.drafts.update');
        Route::post('/api/drafts/{id}/review', [DraftController::class, 'review'])->name('api.drafts.review');
    });

    // Email outreach API
    Route::get('/api/emails', [EmailController::class, 'list'])->name('api.emails');
    Route::get('/api/emails/{id}', [EmailController::class, 'show'])->name('api.emails.show');

    // n8n read-only status
    Route::get('/api/n8n-status', [N8nController::class, 'status'])->name('api.n8n-status');

    // n8n triggers — editors and above only
    Route::middleware('role:super_admin,admin,editor')->group(function () {
        Route::post('/api/content-request', [N8nController::class, 'contentRequest'])->name('api.content-request');
        Route::post('/api/email-request', [N8nController::class, 'emailRequest'])->name('api.email-request');
    });

    // Admin user management
    Route::middleware('can.manage.users')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');
    });
});

require __DIR__.'/settings.php';
