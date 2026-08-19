# Data Resources

Data Resources define which live application records a bot may read through `query_data_resource`.

The chat engine can also answer safe meta questions such as "what data resources can you access?" without running a database query. That answer comes from the generic capability catalog and uses the same bot-approved Data Resource policy described here. It lists approved resources and safe fields, but it does not expose table names, model classes, hidden scope values, or sensitive fields.

They are different from Knowledge Sources:

| Concept | Use It For | Managed In |
| --- | --- | --- |
| Knowledge Sources | Documents, URLs, text, and API snapshots that should be ingested, embedded, and searched semantically | **Sources** |
| Data Resources | Live database tables where workflows need exact filters, sorting, limits, and selected columns | **Data Resources** |

## Recommended Workflow

1. Open **Agentic Chatbot > Connect > Data Resources**.
2. Follow the guided setup flow:
   - **Choose records**: name the resource and select the Laravel model.
   - **Approve information**: choose the smallest set of fields bots may see, filter, or rank. Opt into text search only for fields whose table size and indexing can support it.
   - **Results and ranking**: keep default and maximum result counts chat-sized, and review the database query budget under its collapsed advanced section.
   - **Safety scope**: add always-on ownership filters such as `bot_id = current bot`.
3. Open the target bot and approve only the Data Resources that bot may use.
4. Narrow returned, filterable, or sortable fields on the bot only when that bot needs stricter rules than the global resource.

The global Data Resource is the maximum policy. Bot-level settings can only select or narrow it.

## What The Guardrails Do

The form reads available Eloquent models and database columns, then presents them as searchable dropdowns. Admins should not type model classes or column names by hand during normal setup. This avoids spelling mistakes and keeps the allowed query policy aligned with the real database schema.

Validation still runs on save. If a model cannot be inspected or a column no longer exists, the form rejects the invalid value instead of creating a broken workflow policy.

If no field is marked **Returned by default**, the runtime does not fall back to every returnable field. It returns only the first safe returnable field by default, or an explicit answer-ready field if one exists. This keeps newly created resources conservative until an admin intentionally broadens the answer.

Safety scope filters are always applied by the runtime and are hidden from workflow authors. They do not need to be exposed as normal visitor filters, so ownership columns such as `bot_id` can stay out of the workflow editor while still protecting rows.

Query result frames do not expose scope enforcement metadata. The concrete applied-scope map is not copied into capability results, workflow state, result-set memory, traces, or model-facing answer context. A scope field appears in a returned record only when the host separately approves it as a returnable field.

### Trusted actor and tenant scope

`actor.*`, `tenant.*`, `token.*`, and `conversation.*` scope sources are resolved only from a server-attested runtime authority context. Chat input, model-generated `variables_json`, workflow variables, checkpoints, and public aliases with those names cannot create or override this context. A required authority scope without an attested value fails closed before the query executes.

Authenticated actors and Bot Access Tokens are attested automatically. Host applications that use tenant scopes must set the tenant on the Laravel request from trusted middleware, never from request input:

```php
use Heiner\FilamentAgenticChatbot\Services\Runtime\Authority\RuntimeAuthorityContextFactory;

$request->attributes->set(
    RuntimeAuthorityContextFactory::TENANT_REQUEST_ATTRIBUTE,
    ['id' => $trustedTenant->getKey()],
);
```

The context is transient: AgentGraph checkpoints and workflow-run variable persistence remove it. Every resumed chat turn receives a newly attested context from the current authenticated request. Static `data_resources.scope_values` may still define code-reviewed custom scope constants, but the reserved actor, tenant, token, and conversation namespaces are ignored there.

Returned records are serialized from the exact resolved `select` allow-list. Eloquent `$appends`, hidden relations, and other fields added by `toArray()` are never included implicitly.

## Workflow Editor Relationship

Workflow editors should not redefine table schemas. They choose from the Data Resources already approved for the linked bot.

At publish time and runtime, `query_data_resource` validates:

- an explicit, non-empty workflow allowlist (`allowed_resource_keys`); missing or empty means no access
- the resource key against both that workflow allowlist and the linked bot policy
- the deployment-pinned, versioned Data Resource contract hash against the current bot-effective contract
- selected fields
- filters
- sort column, direction, and optional NULL ordering
- default and maximum limits
- runtime scope filters

The runtime query boundary is a typed `DataQuery` AST. A structured-understanding step may produce the complete AST, or a fixed Data Answer step may declare it literally:

```json
{
  "resource": "orders",
  "mode": "list",
  "select": ["id", "status"],
  "filters": [{"field": "status", "operator": "equals", "value": "open"}],
  "sort": [{"field": "created_at", "direction": "desc", "nulls": "last"}],
  "limit": 10,
  "cursor": null
}
```

The action converts legacy fixed mappings at its input boundary for compatibility, but compilation and execution receive only the validated AST. Invalid fields, operators, types, limits, clauses, or list sizes fail closed; the runtime does not drop, clamp, merge, or repair them. `count` is available only when the resource contract explicitly allows it. List queries return a bounded opaque `next_cursor` when another page exists.

`contains` is LIKE-escaped and exists in a pinned contract only for fields explicitly opted into **Allow text search**, listed in `contains_scan_fields`, or given an explicit `filter_operators` policy. This keeps broad scans opt-in.

The default `DataQueryCostGuard` runs `EXPLAIN` without `ANALYZE` and rejects PostgreSQL, MySQL, and MariaDB plans above the resource's pinned estimated-row budget before the visitor query executes. The same boundary applies the pinned positive statement timeout with PostgreSQL transaction-local settings, MySQL `max_execution_time`, or MariaDB `max_statement_time`, restoring prior settings when the surrounding database session can outlive the query. UI-managed resources cannot disable this timeout. SQLite keeps its lightweight behavior only in local/testing; production Data Resource queries fail closed on SQLite, and Doctor inventories active resource connections before launch. Hosts may still replace the public `DataQueryCostGuard` contract with a stricter implementation; direct code-reviewed resource configuration remains the expert boundary that may explicitly set a zero timeout.

Changing text-search permission, the statement timeout, or the estimated-row budget changes the Data Resource contract hash. Republish every workflow bound to that resource after the reviewed policy change. Existing installations must run the package migrations to add the nullable `query_safety` column used by UI-managed resources. Doctor reports the missing column and inventories active deployments whose pinned action or resource contract is stale; resolve that blocking list in the upgrade maintenance window before reopening chat traffic.

This keeps the editor simple while preserving the safety boundary configured in Filament.

Publishing pins each Data Retrieval node to its exact resource keys and Data Resource contracts. The contract records the model/repository identity, safe selectable/default/answer-ready fields, filters and operators, sortable and sensitive fields, scope definitions, and limit/cost policy. Changing any of those global or bot-level policies invalidates the published binding. Republish the workflow deliberately before it can query the changed contract.

Access is deny-by-default and requires all three independent gates: the bot must approve the resource, the immutable deployment must bind the resource and current contract hash, and required row scopes must resolve from server-attested authority. A bot approval never implicitly grants a workflow access, and publish never copies all bot resources into a workflow.

Workflow authors see the approved resource labels, friendly field names, limits, and runtime scope summary. They do not need to know the database table shape to build a safe lookup.

## Result Follow-Up Context

After a successful `query_data_resource` call, the runtime stores a sanitized snapshot on `bot_conversations.meta`:

- `last_data_resource_query`: resource key, mode, limit, selected fields, value-free filter/operator metadata, and sort.
- `last_result_set`: resource key, label, total count, limit, a capped list of returned scalar records, and `remembered_at`.
- `last_result_set_frame`: the structured continuation frame used by the follow-up resolver.

This is controlled application state, not a reconstruction from assistant prose. It lets the next turn validate a semantically interpreted result-set operation against the previous database result without retaining filter values in the query summary.

The one canonical workflow-entry understanding contract (v8) may propose only a declared result-set operation key and an explicit `result_set_reference`. The deterministic follow-up resolver then checks frame freshness, resource field roles, confidence thresholds, and the exact query patch. Requests such as `handoff pls`, `weather in new york`, `cancel`, a bare acknowledgement, or a clearly different resource do not reuse the last result set.

Result-set follow-ups are contract operations. The canonical turn-understanding output supplies machine-readable operation keys and values; `data_resources.result_set_operations` defines the deterministic policy for those keys.

The action and resolver never infer an operation from user-language aliases or fuzzy matching. An authorized patch is attached to the selected workflow-start step, applied exactly once to the first matching `query_data_resource` node, and validated again by the deployment-pinned DataQuery contract before execution. A static data action cannot refine an incompatible resource and receives a clarification instead. Open values such as locations, customers, products, email addresses, database search terms, and API values are preserved exactly and validated by their declared contracts.

Supported structured operation types include:

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

Production defaults to strict authorization: Data Resources stay hidden until the host registers explicit Laravel Gates. Local and testing environments keep the low-friction default in which authenticated Filament panel users can configure a first resource without defining Gates.

Define these Gates before opening a production panel:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-data-resources', fn ($user) => $user->canReviewDataResources());
Gate::define('filament-agentic-chatbot.manage-data-resources', fn ($user) => $user->canManageDataResources());
```

The view Gate grants navigation and read access. The manage Gate grants create, edit, delete, and sync actions, and also grants read access. Strict mode is enabled by default when `APP_ENV=production`; set it explicitly when environment-independent deployment configuration is preferred:

```env
AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true
```

`php artisan filament-agentic-chatbot:doctor` fails in production if this surface is relaxed without a registered Gate. In local/testing it reports the intentional low-friction posture as non-blocking.

## Side Effect Integrity Conflict Checks

Data Resources can be used by Side Effect Integrity as read-only duplicate checks before an unsafe write runs. For example, a CRM lead create operation can query an approved `crm_leads` resource by email and block the write if a matching record already exists.

The Data Resource remains read-only:

- it runs through `query_data_resource`
- it uses the bot-approved resource policy
- it applies runtime scope filters
- it only reads approved fields and filters
- it never writes or mutates records

Use this when the host application has a reliable read model for duplicate detection. Keep the final correctness guarantee in the write target as well, such as a unique index or external provider idempotency key.

## Production Checklist

- Use read-only intent: Data Resources are for safe query workflows, not writes.
- Expose the smallest useful column set.
- Mark sensitive fields and avoid returning them by default.
- Keep result limits chat-sized.
- Set filter field types and explicitly opt fields into `contains_scan_fields` only when the backing query can safely support that scan.
- Keep the default estimated-row budget and statement timeout unless measurements justify a reviewed exception; prefer adding an index or narrowing filters before raising them.
- Supply explicit typed query fields in workflow action mappings; natural-language meaning is resolved before action execution.
- Configure `field_roles` for latest, active, and published semantics instead of relying on inferred field names.
- Keep result-set operation keys and policies in `data_resources.result_set_operations`; do not add user-language synonym routing to the action.
- For latest published data, configure `published_at` as filterable and sortable so NULL draft rows cannot outrank published records.
- Scope bot-owned records with runtime filters when records are tenant- or bot-specific.
- Populate tenant authority from trusted host middleware; never copy tenant, actor, token, or conversation identity from chat/model variables.
- Keep ownership scope fields hidden from normal filters unless visitors should explicitly filter by them.
- Approve resources per bot instead of enabling every global resource everywhere.
- Bind every Data Retrieval node to one or more explicit resources; never treat an empty allowlist as a wildcard.
- Republish workflows intentionally after changing a bound resource or its bot-level field/limit policy.
- Register Data Resource Gates before production launch; strict Gate mode is the production default.
- Re-run migrations before opening the Data Resources page after package upgrades.

## Related Docs

- [Side Effect Integrity](SIDE_EFFECT_INTEGRITY.md) - duplicate protection and read-only conflict checks for unsafe writes.
