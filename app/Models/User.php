<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [UserRole::SuperAdmin, UserRole::Admin], true);
    }

    public function canManageUsers(): bool
    {
        return $this->isAdmin();
    }

    public function canCreateContent(): bool
    {
        return in_array($this->role, [UserRole::SuperAdmin, UserRole::Admin, UserRole::Editor], true);
    }

    public function canReviewContent(): bool
    {
        return $this->canCreateContent();
    }

    public function canManageUser(User $user): bool
    {
        if (! $this->canManageUsers()) {
            return false;
        }

        if ($this->is($user)) {
            return false;
        }

        if ($user->isSuperAdmin() && ! $this->isSuperAdmin()) {
            return false;
        }

        return true;
    }

    /**
     * @return list<UserRole>
     */
    public function assignableRoles(): array
    {
        if ($this->isSuperAdmin()) {
            return UserRole::cases();
        }

        if ($this->role === UserRole::Admin) {
            return [UserRole::Admin, UserRole::Editor, UserRole::Viewer];
        }

        return [];
    }

    /**
     * @return list<string>
     */
    public function assignableRoleValues(): array
    {
        return array_map(
            fn (UserRole $role) => $role->value,
            $this->assignableRoles(),
        );
    }

    /**
     * @return array<string, bool>
     */
    public function abilities(): array
    {
        return [
            'manageUsers' => $this->canManageUsers(),
            'createContent' => $this->canCreateContent(),
            'reviewContent' => $this->canReviewContent(),
            'viewDashboard' => true,
            'viewLinkedIn' => true,
            'viewEmail' => true,
        ];
    }
}
