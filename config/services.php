<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'airtable' => [
        'token' => env('AIRTABLE_TOKEN', ''),
        'base_id' => env('AIRTABLE_BASE_ID', ''),
        'table_id' => env('AIRTABLE_TABLE_ID', ''),
        'email_token' => env('EMAIL_AIRTABLE_TOKEN', ''),
        'email_base_id' => env('EMAIL_AIRTABLE_BASE_ID', ''),
        'email_table_id' => env('EMAIL_AIRTABLE_TABLE_ID', ''),
    ],

    'n8n' => [
        'webhook_url' => env('N8N_WEBHOOK_URL', ''),
        'email_form_url' => env('N8N_EMAIL_FORM_URL', ''),
    ],

];
