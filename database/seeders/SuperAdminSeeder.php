<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed the application's super admin account.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'maliasad615@gmail.com')->first();

        if ($user) {
            $user->update([
                'role' => UserRole::SuperAdmin,
                'password' => '11223344',
            ]);

            return;
        }

        User::query()->create([
            'name' => 'Super Admin',
            'email' => 'maliasad615@gmail.com',
            'password' => '11223344',
            'role' => UserRole::SuperAdmin,
            'email_verified_at' => now(),
        ]);
    }
}
