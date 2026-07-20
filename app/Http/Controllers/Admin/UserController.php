<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $actor = auth()->user();

        $users = User::query()
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'roleLabel' => $user->role->label(),
                'emailVerified' => $user->email_verified_at !== null,
                'createdAt' => $user->created_at?->toIso8601String(),
                'canManage' => $actor?->canManageUser($user) ?? false,
            ]);

        $assignableRoles = array_values(array_filter(
            UserRole::options(),
            fn (array $role) => in_array($role['value'], $actor?->assignableRoleValues() ?? [], true),
        ));

        return Inertia::render('admin/users', [
            'users' => $users,
            'assignableRoles' => $assignableRoles,
            'roleLabels' => collect(UserRole::cases())
                ->mapWithKeys(fn (UserRole $role) => [$role->value => $role->label()])
                ->all(),
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        $user->update([
            'role' => UserRole::from($request->validated('role')),
        ]);

        return back()->with('success', "Updated role for {$user->name}.");
    }
}
