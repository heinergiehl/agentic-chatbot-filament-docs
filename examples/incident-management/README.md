# Incident Management Example

This example shows how to model a large operational incident system with:

- indexed knowledge sources for procedures and historical narrative reports
- live database retrieval through `query_data_resource`
- a bounded Playbook that combines active incidents, rescue stations, staff, and earthquake records
- Agent Access Tokens for Telegram, dispatch tools, and other server-side integrations
- per-token rate limits and budgets

The files in this directory are app-side examples. Put them in a host Laravel app, run the migration and seeder, sync the data resources into the Filament **Data Resources** page, then import the semantic Playbook JSON into Filament Agentic Chatbot.

## Files

| File | Purpose |
| --- | --- |
| `database/migrations/2026_01_01_000000_create_incident_demo_tables.php` | Creates demo operational tables. |
| `database/seeders/IncidentDemoSeeder.php` | Seeds realistic demo rows. |
| `app/Models/*.php` | Eloquent models for the demo tables. |
| `app/Support/IncidentManagementDataResources.php` | Safe read-only `query_data_resource` definitions. |
| `workflows/incident-manager-live-status.json` | Playbook that retrieves live records and returns a bounded result to the Agent. |

## 1. Register Data Resources

The recommended admin workflow is:

1. Run the demo migration and seeder in the host app.
2. Open **Agentic Chatbot > Connect > Data Resources**.
3. Create the `incidents`, `rescue_stations`, `rescuers`, and `earthquake_records` resources, choosing the matching Eloquent model and columns from the dropdowns.
4. Mark only the safe columns as returnable, filterable, and sortable.
5. Open the target bot and approve those resources under **Database Answers**.

For repeatable demo setup, you can still seed those global resources from config. In `config/filament-agentic-chatbot.php`, merge the example resources into `data_resources.resources`, run migrations, then use **Sync from config** in **Data Resources**:

```php
use App\Support\IncidentManagementDataResources;

'data_resources' => [
    'require_explicit_bot_allow_list' => true,
    'resources' => [
        ...IncidentManagementDataResources::resources(),
    ],
],
```

The UI-managed resource remains authoritative after sync. Further changes should normally happen in **Data Resources**, not by hand-editing column strings in config.

## 2. Create The Bot

Recommended bot config:

```php
[
    'public_id' => 'incident-manager',
    'name' => 'Incident Manager',
    'model' => 'gemini-3.7-flash',
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

## 4. Import Playbook

Import `workflows/incident-manager-live-status.json` into a Playbook assigned to the `incident-manager` Agent.

The Playbook:

1. receives the manager question
2. retrieves open incidents
3. retrieves active rescue stations
4. retrieves active rescue staff
5. retrieves recent earthquake records
6. asks a bounded AI Task to summarize only those records and returns the result to the Agent

## 5. Create API Token

Create an Agent Access Token:

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

Then open **Agentic Chatbot > Observe > AI Usage** to confirm usage events and budget tracking.
