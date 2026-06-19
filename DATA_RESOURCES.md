# Data Resources

Data Resources define which live application records a bot may read through `query_data_resource`.

They are different from Knowledge Sources:

| Concept | Use It For | Managed In |
| --- | --- | --- |
| Knowledge Sources | Documents, URLs, text, and API snapshots that should be ingested, embedded, and searched semantically | **Sources** |
| Data Resources | Live database tables where workflows need exact filters, sorting, limits, and selected columns | **Data Resources** |

## Recommended Workflow

1. Open **Agentic Chatbot > Connect > Data Resources**.
2. Follow the guided setup flow:
   - **Choose records**: name the resource and select the Laravel model.
   - **Approve information**: choose the smallest set of fields bots may see, filter, or rank.
   - **Results and ranking**: keep default and maximum result counts chat-sized.
   - **Safety scope**: add always-on ownership filters such as `bot_id = current bot`.
3. Open the target bot and approve only the Data Resources that bot may use.
4. Narrow returned, filterable, or sortable fields on the bot only when that bot needs stricter rules than the global resource.

The global Data Resource is the maximum policy. Bot-level settings can only select or narrow it.

## What The Guardrails Do

The form reads available Eloquent models and database columns, then presents them as searchable dropdowns. Admins should not type model classes or column names by hand during normal setup. This avoids spelling mistakes and keeps the allowed query policy aligned with the real database schema.

Validation still runs on save. If a model cannot be inspected or a column no longer exists, the form rejects the invalid value instead of creating a broken workflow policy.

If no field is marked **Returned by default**, the runtime does not fall back to every returnable field. It returns only the first safe returnable field by default, or an explicit answer-ready field if one exists. This keeps newly created resources conservative until an admin intentionally broadens the answer.

Safety scope filters are always applied by the runtime and are hidden from workflow authors. They do not need to be exposed as normal visitor filters, so ownership columns such as `bot_id` can stay out of the workflow editor while still protecting rows.

## Workflow Editor Relationship

Workflow editors should not redefine table schemas. They choose from the Data Resources already approved for the linked bot.

At publish time and runtime, `query_data_resource` validates:

- resource key
- selected fields
- filters
- sort column, direction, and optional NULL ordering
- default and maximum limits
- runtime scope filters

This keeps the editor simple while preserving the safety boundary configured in Filament.

Workflow authors see the approved resource labels, friendly field names, limits, and runtime scope summary. They do not need to know the database table shape to build a safe lookup.

## Result Follow-Up Context

After a successful `query_data_resource` call, the runtime stores a sanitized snapshot on `bot_conversations.meta`:

- `last_data_resource_query`: resource key, mode, limit, selected fields, filters, filter clauses, and sort.
- `last_result_set`: resource key, label, total count, limit, a capped list of returned scalar records, and `remembered_at`.
- `last_result_set_frame`: the structured continuation frame used by the follow-up resolver.

This is controlled application state, not a reconstruction from assistant prose. It lets the next turn safely resolve follow-ups such as `latest one`, `only the first`, `that one`, `details`, `active`, `published`, `altesten`, `nur aktive`, and `details zum zweiten` against the previous database result.

The follow-up resolver runs before the LLM continuation planner. It is intentionally conservative: requests such as `handoff pls`, `weather in new york`, `cancel`, or a clearly different resource do not reuse the last result set.

Result-set follow-ups are contract operations. They are configured under `data_resources.result_set_operations` and resolved through the closed-vocabulary matcher. Keep operator synonyms in this catalog, not inside resolver business logic.

Fuzzy matching is safe only for closed operator vocabularies. It may clarify a typo in an operator such as `alte4sten`, but it must not silently change open values such as locations, customers, products, email addresses, database search terms, or API values.

## Intent Refinement

`query_data_resource` can apply deterministic modifiers when the input mapping sets:

```json
{
  "allow_intent_refinement": true,
  "intent_text": "{{input}}"
}
```

Generated Data Answer and smart data query workflows set these fields by default. The action still validates the final query against the resource allow-list.

Direct intent refinement and completed result-set follow-ups use the same operation catalog. Supported operation types include:

- `extreme`: latest/newest or oldest/earliest using a sortable field role.
- `limit`: single-result requests such as only one or first one.
- `filter`: active/inactive style boolean filters using a filterable field role.
- `filter_clause`: published/not-null style filters.
- `select`: details requests using answer-ready fields.
- `ordinal`: first/second/third/last displayed record by remembered record id.

For latest published records, do not rely on database default NULL ordering. Use `published_at desc nulls last` plus `published_at not null` when the user explicitly asks for published records.

## Field Roles

Operations map to resource fields through explicit or inferred roles:

```php
'field_roles' => [
    'latest' => 'published_at',
    'active' => 'is_active',
    'published' => 'published_at',
],
```

Prefer explicit roles on production resources. Backward-compatible inference exists for common fields such as `published_at` and `is_active`, but explicit roles make authoring and diagnostics clearer.

Use `field_sets.answer_ready` for the fields that are safe and useful when users ask for details. This prevents a details follow-up from returning every allowed column.

## Authoring Diagnostics

Manual `query_data_resource` action nodes that list records should enable:

```json
{
  "allow_intent_refinement": true,
  "intent_text": "{{input}}"
}
```

Without this, direct natural questions such as `show me the newest workflow` can repeat a broad list because the action never receives deterministic refinement input. The validator emits a non-blocking warning, and `filament-agentic-chatbot:doctor` reports active workflows with list queries that omit this contract.

## Config Sync

The package config can still seed reviewed defaults:

```php
'data_resources' => [
    'resources' => [
        'products' => [
            'label' => 'Products',
            'model' => App\Models\Product::class,
            // ...
        ],
    ],
],
```

Use **Sync from config** in **Data Resources** when you intentionally want to create or overwrite UI-managed resources from config.

For day-to-day admin changes, prefer the Filament UI. Treat config as install-time defaults, repeatable demo setup, or code-reviewed production policy.

## Admin Authorization

Authenticated Filament panel users can access Data Resources by default so first installs stay usable. Production panels that separate admin roles should define Laravel Gates:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-data-resources', fn ($user) => $user->canReviewDataResources());
Gate::define('filament-agentic-chatbot.manage-data-resources', fn ($user) => $user->canManageDataResources());
```

The view Gate grants navigation and read access. The manage Gate grants create, edit, delete, and sync actions, and also grants read access. To hide Data Resources until those Gates exist, enable strict mode:

```env
AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true
```

## Production Checklist

- Use read-only intent: Data Resources are for safe query workflows, not writes.
- Expose the smallest useful column set.
- Mark sensitive fields and avoid returning them by default.
- Keep result limits chat-sized.
- Use `allow_intent_refinement` for generic natural-language data workflows so latest/first/details modifiers are handled deterministically.
- Configure `field_roles` for latest, active, and published semantics instead of relying on inferred field names.
- Keep result-set operator synonyms in `data_resources.result_set_operations`.
- For latest published data, configure `published_at` as filterable and sortable so NULL draft rows cannot outrank published records.
- Scope bot-owned records with runtime filters when records are tenant- or bot-specific.
- Keep ownership scope fields hidden from normal filters unless visitors should explicitly filter by them.
- Approve resources per bot instead of enabling every global resource everywhere.
- Use Data Resource Gates or strict Gate mode for production role separation.
- Re-run migrations before opening the Data Resources page after package upgrades.
