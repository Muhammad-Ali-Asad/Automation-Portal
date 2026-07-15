<?php

namespace Tests\Unit;

use App\Services\AirtableService;
use Tests\TestCase;

class AirtableServiceTest extends TestCase
{
    public function test_service_can_be_resolved_when_airtable_env_is_missing(): void
    {
        config([
            'services.airtable.token' => null,
            'services.airtable.base_id' => null,
            'services.airtable.table_id' => null,
            'services.airtable.email_token' => null,
            'services.airtable.email_base_id' => null,
            'services.airtable.email_table_id' => null,
        ]);

        $service = $this->app->make(AirtableService::class);

        $this->assertInstanceOf(AirtableService::class, $service);
        $this->assertSame(['ok' => false, 'airtable' => 'missing_token'], $service->checkHealth());
    }

    public function test_list_drafts_fails_clearly_when_unconfigured(): void
    {
        config([
            'services.airtable.token' => '',
            'services.airtable.base_id' => '',
            'services.airtable.table_id' => '',
        ]);

        $service = $this->app->make(AirtableService::class);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Airtable is not configured');

        $service->listDrafts();
    }
}
