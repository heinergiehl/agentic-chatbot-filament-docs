# Incident Management Blueprint

This blueprint shows how to use the plugin for large operational datasets such as earthquake history, historical incident records, rescuer directories, rescue stations, and live operational APIs.

The goal is not to turn the package into a full incident-management platform. The better shape is to keep Filament Agentic Chatbot as the AI access layer on top of an existing operational system:

- indexed knowledge for stable reference material
- live workflows for current operational data
- package-owned channel integrations for Telegram/Slack, or scoped API access for internal portals and other clients
- token and cost controls per bot access token

For a runnable app-side example with migrations, seed data, Eloquent models, data-resource definitions, and a workflow JSON file, see [docs/examples/incident-management](examples/incident-management/README.md).

## Recommended Architecture

Use two retrieval paths intentionally:

| Data type | Recommended path | Why |
| --------- | ---------------- | --- |
| SOPs, manuals, response protocols, training content | RAG sources | Stable text benefits from embeddings and citations |
| Historical incidents and earthquake archives | API knowledge sources when mostly analytical; data resources when filtered live answers matter | Indexed data is fast for broad questions; live queries are better for exact counts and filters |
| Active incidents, staff status, station availability | Workflows with data resources or API connectors | These records change too often to trust a stale vector index |
| Actions such as creating reports or sending notifications | Workflow actions or API connector write calls | Writes need explicit capability and audit boundaries |

A strong production setup usually has one bot per operational audience:

| Bot | Area | Capability mode | Example use |
| --- | ---- | --------------- | ----------- |
| Manager Operations Bot | `manager` | `query_and_write` | incident summaries, station checks, escalation drafts |
| Public Information Bot | `public` | `query_only` | public safety guidance and published incident FAQs |
| Field Team Bot | `field` | `query_only` or `query_and_write` | station details, equipment availability, short status capture |
| Analyst Bot | `analyst` | `query_only` | historical incident and earthquake analysis |

Then create separate Bot Access Tokens for each external channel. For example, Telegram and Slack each get their own token with only the areas and abilities they need.

## Data Modeling

Expose live database tables through `data_resources` instead of letting the model query arbitrary tables. Each resource should define allowed filters, selects, sorting, and limits.

Example config:

```php
'data_resources' => [
    'require_explicit_bot_allow_list' => true,
    'resources' => [
        'incidents' => [
            'label' => 'Incidents',
            'description' => 'Read-only incident records for operational summaries.',
            'query_guidance' => 'Use this for current incident status, historical counts, severity filtering, and location-based summaries. Do not expose private notes unless explicitly selected.',
            'model' => App\Models\Incident::class,
            'allowed_modes' => ['list', 'first'],
            'allowed_filters' => ['status', 'type', 'severity', 'province', 'occurred_on'],
            'allowed_selects' => ['id', 'type', 'status', 'severity', 'province', 'occurred_at', 'closed_at'],
            'sortable_fields' => ['occurred_at', 'severity', 'id'],
            'default_select' => ['id', 'type', 'status', 'severity', 'province', 'occurred_at'],
            'default_sort' => ['column' => 'occurred_at', 'direction' => 'desc'],
            'default_limit' => 10,
            'max_limit' => 100,
        ],
        'rescue_stations' => [
            'label' => 'Rescue Stations',
            'description' => 'Station directory and operational readiness.',
            'query_guidance' => 'Use this to find nearby stations, readiness state, coverage region, and public contact information.',
            'model' => App\Models\RescueStation::class,
            'allowed_modes' => ['list', 'first'],
            'allowed_filters' => ['region', 'status', 'station_type'],
            'allowed_selects' => ['id', 'name', 'region', 'status', 'station_type', 'phone'],
            'sortable_fields' => ['name', 'region', 'status'],
            'default_select' => ['id', 'name', 'region', 'status', 'station_type'],
            'default_limit' => 10,
            'max_limit' => 50,
        ],
    ],
],
```

Enable only the required resources on each bot via `rag_config.data_resources.allowed_keys`. That keeps a public bot from reading manager-only operational tables.

## Knowledge Sources

Index stable materials as RAG sources:

- response protocols and SOPs
- public safety guidance
- station capability descriptions
- incident category definitions
- historical reports that do not change often

Use API knowledge sources for large external JSON datasets that are useful as searchable background context. Good examples are earthquake archives, public historical incident datasets, or station catalogs that sync nightly.

Do not use indexed RAG as the source of truth for active incidents. Active incident status should come from a workflow call to a data resource or API connector.

## Workflow Patterns

Start with a small set of workflow templates:

| Workflow | Nodes | Purpose |
| -------- | ----- | ------- |
| Current Incident Summary | Trigger, Entity Extractor, Data Retrieval, Context Builder, Answer | Answer "What is happening now in region X?" from live incident records |
| Historical Incident Analysis | Trigger, Query Rewrite, Knowledge Base, Data Retrieval, Answer | Combine indexed reports with exact live counts |
| Nearest Station Lookup | Trigger, Collect Input, API Connector or Data Retrieval, Answer | Return station options for a location or region |
| Staff Availability Check | Trigger, Data Retrieval, Confidence Check, Answer | Summarize available rescuer/staff data without exposing unnecessary personal fields |
| Escalation Draft | Trigger, Data Retrieval, AI Agent, Confirmation, Action | Draft an escalation message and require confirmation before writing or sending |

For manager-facing workflows, prefer a final Answer node that says which records were used and what is still unknown. For write workflows, always include a Confirmation node before the Action/API Connector write step.

## External Channels

For Telegram and Slack, prefer the package-owned channel integrations in [Channel Integrations](CHANNELS.md). They handle provider webhooks, channel threads, diagnostics, delivery events, retries, activity indicators, and native image delivery while still using Bot Access Tokens for governance.

For custom bot platforms, internal portals, or backend jobs, use the JSON complete endpoint with a Bot Access Token:

```bash
curl -X POST "https://your-app.test/api/filament-agentic-chatbot/chat/{botPublicId}/complete" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer fac_..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show active road incidents in Tehran",
    "session_id": "telegram-user-12345",
    "area": "manager"
  }'
```

The response contains normalized JSON content, rendered HTML, message metadata, workflow status, and conversation IDs. Use one stable `session_id` per external user or channel conversation.

## Access And Cost Controls

Use Bot Access Tokens as the integration boundary:

| Control | Recommendation |
| ------- | -------------- |
| Areas | Give each token only the areas it needs, such as `manager` or `public` |
| Abilities | For external chat clients, usually allow only `chat` and optionally `config`; reserve `history.delete`, `feedback`, or `*` for trusted integrations |
| Rate limit | Set a per-minute limit per token, especially for public or Telegram channels |
| Input/output tokens | Set max input and output token limits for predictable answer size |
| Monthly token budget | Use this for hard usage ceilings per integration |
| Monthly cost budget | Configure provider pricing and set cost ceilings where model spend must be controlled |
| Expiration | Give temporary integrations an expiration date |

Keep sensitive fields out of `allowed_selects` unless the bot genuinely needs them. Staff phone numbers, private notes, medical details, exact home addresses, and national IDs should not be exposed by default.

## Rollout Checklist

1. Create manager, public, field, and analyst bots only where the audiences truly differ.
2. Add RAG sources for stable manuals, protocols, and public knowledge.
3. Create API connectors for external incident APIs and test each connector from Filament.
4. Register data resources for live Eloquent data with strict allow-lists.
5. Enable only the required data resources per bot.
6. Build one workflow per high-value question pattern instead of one huge all-purpose workflow.
7. Create a Bot Access Token for each external client, with area, ability, rate, and budget limits.
8. Test with real operational questions and check workflow traces for wrong filters or overexposed fields.
9. Add monitoring around failed workflow runs, provider errors, token budget denials, and connector failures.

## Safety Boundary

The chatbot should support operational awareness and information retrieval. It should not be the sole authority for emergency dispatch, legal decisions, medical triage, or life-safety commands. Keep high-impact writes behind confirmation steps, audit logs, and your existing incident-management permissions.
