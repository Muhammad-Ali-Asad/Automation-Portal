<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canReviewContent() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in(['approved', 'rejected'])],
            'hook' => ['nullable', 'string', 'max:5000'],
            'post_text' => ['required', 'string', 'max:15000'],
            'cta' => ['nullable', 'string', 'max:2000'],
            'hashtags' => ['nullable', 'array'],
            'hashtags.*' => ['string', 'max:100'],
        ];
    }
}
