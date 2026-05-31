# Incident Management Example

This example shows how to model a large operational incident system with:

- indexed knowledge sources for procedures and historical narrative reports
- live database retrieval through `query_data_resource`
- a workflow that combines active incidents, rescue stations, staff, and earthquake records
- Bot Access Tokens for Telegram, dispatch tools, and other server-side integrations
- per-token rate limits and budgets

The files in this directory are app-side examples. Put them in a host Laravel app, run the migration and seeder, register the data resources, then import the workflow JSON into Filament Agentic Chatbot.

## Files

| File | Purpose |
| --- | --- |
| `database/migrations/2026_01_01_000000_create_incident_demo_tables.php` | Creates demo operational tables. |
| `database/seeders/IncidentDemoSeeder.php` | Seeds realistic demo rows. |
| `app/Models/*.php` | Eloquent models for the demo tables. |
| `app/Support/IncidentManagementDataResources.php` | Safe read-only `query_data_resource` definitions. |
| `workflows/incident-manager-live-status.json` | Workflow that retrieves live records and writes an operator-facing answer. |

## 1. Register Data Resources

In `config/filament-agentic-chatbot.php`, merge the example resources into `data_resources.resources`:

```php
use App\Support\IncidentManagementDataResources;

'data_resources' => [
    'require_explicit_bot_allow_list' => true,
    'resources' => [
        ...IncidentManagementDataResources::resources(),
    ],
],
```

## 2. Create The Bot

Recommended bot config:

```php
[
    'public_id' => 'incident-manager',
    'name' => 'Incident Manager',
    'model' => 'gemini-2.5-flash-lite',
    'runtime_config' => [
        'provider' => 'gemini',
        'capabilities' => [
            'mode' => 'query_only',
        ],
        'context' => [
            'default_area' => 'manager',
            'allowed_areas' => ['manager', 'dispatch'],
        ],
        'data_resources' => [
            'allowed_keys' => [
                'incidents',
                'rescue_stations',
                'rescuers',
                'earthquake_records',
            ],
        ],
        'usage' => [
            'monthly_token_budget' => 2_000_000,
            'monthly_cost_budget_cents' => 5000,
        ],
    ],
    'allowed_domains' => ['ops.example.com'],
    'is_active' => true,
]
```

## 3. Add Knowledge Sources

Use knowledge sources for documents that are better indexed than queried live:

- emergency response SOPs
- escalation policy
- regional rescue manuals
- post-incident reports
- safety checklists
- radio/dispatch glossary

Use live data resources for fast-changing operational data:

- open incidents
- current staff/rescuer availability
- rescue station status
- recent earthquake records

## 4. Import Workflow

Import `workflows/incident-manager-live-status.json` into a workflow linked to the `incident-manager` bot.

The workflow:

1. receives the manager question
2. retrieves open incidents
3. retrieves active rescue stations
4. retrieves active rescue staff
5. retrieves recent earthquake records
6. asks the model to produce a concise operational answer

## 5. Create API Token

Create a Bot Access Token:

| Setting | Value |
| --- | --- |
| Bot | `Incident Manager` |
| Channel | `Telegram`, `Slack`, or `API` |
| Channel Label | `Operations Telegram Bot` |
| Owner | Optional app user, team, tenant, or department if owner types are configured |
| Abilities | `chat` |
| Allowed Areas | `manager`, `dispatch` |
| Rate Limit | `60` per minute |
| Monthly Token Budget | `500000` |
| Monthly Cost Budget | `1500` cents |

Use that token from Telegram, Slack, dispatch dashboards, or other trusted server-side API clients through the JSON complete endpoint documented in [API Integrations](../../API_INTEGRATIONS.md).

## 6. Smoke Test

```bash
php artisan filament-agentic-chatbot:qa-enterprise-smoke --host=ops.example.com --area=manager
```

Then open **Agentic Chatbot > AI Usage** to confirm usage events and budget tracking.
