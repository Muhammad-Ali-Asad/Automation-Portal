<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $target = $this->route('user');

        if (! $user instanceof User || ! $target instanceof User) {
            return false;
        }

        return $user->canManageUser($target);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User $actor */
        $actor = $this->user();

        return [
            'role' => [
                'required',
                Rule::in($actor->assignableRoleValues()),
            ],
        ];
    }
}
