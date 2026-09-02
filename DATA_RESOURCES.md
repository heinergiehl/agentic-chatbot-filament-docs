# Data Resources

Data Resources define which live application records an Agent may read through a direct tool or a governed Playbook `query_data_resource` step. A published Playbook may additionally create or update one scoped record through `mutate_data_resource` only when the resource has an explicit write policy. Direct Agent tools never receive Data Resource write authority.

The chat engine can also answer safe meta questions such as "what data resources can you access?" without running a database query. That answer comes from the generic capability catalog and uses the same bot-approved Data Resource policy described here. It lists approved resources and safe fields, but it does not expose table names, model classes, hidden scope values, or sensitive fields.

A direct Agent query also has to match an exact purpose from the visitor's latest message. Generic words such as `name`, `status`, or `id` cannot authorize an unrelated default read, an explicit request not to use the named resource hides and blocks its tool, and a duplicate call for the same completed purpose reuses the already delivered evidence instead of querying again. The model can select only the modes, fields, filters, sort argument, and limits frozen into the immutable Agent deployment; runtime upgrades do not silently rename an older deployment's pinned tool arguments.

They are different from Knowledge Sources:

| Concept | Use It For | Managed In |
| --- | --- | --- |
| Knowledge Sources | Documents, URLs, text, and API snapshots that should be ingested, embedded, and searched semantically | **Sources** |
| Data Resources | Live database records where an Agent or Playbook needs exact filters, sorting, limits, and selected columns | **Data Resources** |

## Recommended Setup

1. Open **Agentic Chatbot > Connect > Data Resources**.
2. Follow the guided setup flow:
   - **Choose records**: name the resource and select the Laravel model.
   - **Approve information**: choose the smallest set of fields Agents may see, filter, or rank. Opt into text search only for fields whose table size and indexing can support it.
   - **Results and ranking**: keep default and maximum result counts chat-sized, and review the database query budget under its collapsed advanced section.
   - **Playbook writes**: leave write operations empty unless a published Playbook must create or update records. If enabled, mark the minimum writable, required-on-create, and exact-identity fields and configure an optimistic-lock column for updates.
   - **Safety scope**: explicitly choose Agent/tenant-scoped or intentionally global. Scoped resources require at least one always-on ownership filter such as `bot_id = current Agent`; global resources require an explicit confirmation.
3. Open the target Agent and approve only the Data Resources that Agent may use.
4. Narrow returned, filterable, or sortable fields on the Agent only when it needs stricter rules than the global resource.
5. On an existing resource, use **Preview safe records**. The preview selects an active Agent that already approves the resource and runs the real normalized contract, ownership scope, query compiler, cost guard, statement budget, and safe serializer. Request-bound actor or tenant scopes fail closed and direct the admin to the Agent live test instead of inventing an identity.

The global Data Resource is the maximum policy. Bot-level settings can only select or narrow it.

## What The Guardrails Do

The form reads available Eloquent models and database columns, then presents them as searchable dropdowns. Admins should not type model classes or column names by hand during normal setup. This avoids spelling mistakes and keeps the allowed query policy aligned with the real database schema.

Validation still runs on save. If a model cannot be inspected or a column no longer exists, the form rejects the invalid value instead of creating a broken Agent or Playbook policy.

If no field is marked **Returned by default**, the runtime does not fall back to every returnable field. It returns only the first safe returnable field by default, or an explicit answer-ready field if one exists. This keeps newly created resources conservative until an admin intentionally broadens the answer.

Marking a field **Sensitive** is a hard exclusion, not a presentation hint. The Filament form clears and disables return, answer, filter, text-search, and ranking options for that field, while contract compilation removes it again defensively. Sensitive fields never reach direct Agent tools or Playbook query results.

Filter values use one shared semantic normalizer at model binding and deterministic query validation. Integer, number, boolean, date, date-time, URL, email, JSON, enum, string, and text declarations therefore cannot silently degrade into an arbitrary scalar comparison. Invalid formats fail before SQL compilation.

Safety scope filters are always applied by the runtime and hidden from both the Agent model and Playbook authors. They do not need to be exposed as normal visitor filters, so ownership columns such as `bot_id` can stay out of tool schemas and the Playbook editor while still protecting rows.

Each database column may appear in the scope-filter list only once. Duplicate
scope columns are rejected during normalization/publication and again at
runtime instead of allowing one source to overwrite another.

Query result frames do not expose scope enforcement metadata. The concrete applied-scope map is not copied into capability results, workflow state, result-set memory, traces, or model-facing answer context. A scope field appears in a returned record only when the host separately approves it as a returnable field.

### Trusted actor and tenant scope

`actor.*`, `tenant.*`, `widget_context.*`, `token.*`, and `conversation.*` scope sources are resolved only from a server-attested runtime authority context. Chat input, model-generated `variables_json`, workflow variables, checkpoints, and public aliases with those names cannot create or override this context. A required authority scope without an attested value fails closed before the query executes.

Authenticated actors and Agent Access Tokens are attested automatically. Host applications that use tenant scopes must set the tenant on the Laravel request from trusted middleware, never from request input:

```php
use Heiner\FilamentAgenticChatbot\Services\Runtime\Authority\RuntimeAuthorityContextFactory;

$request->attributes->set(
    RuntimeAuthorityContextFactory::TENANT_REQUEST_ATTRIBUTE,
    ['id' => $trustedTenant->getKey()],
);
```

Cross-origin personalized widgets may instead use the short-lived server-issued contract in [Chat Widget](CHAT_WIDGET.md#signed-customer-and-tenant-context). Signed actor/tenant identity and bounded attributes then appear under `widget_context.*`, while actor/tenant ownership remains available through their normal scopes.

The context is transient: AgentGraph checkpoints and workflow-run variable persistence remove it. Every resumed chat turn receives a newly attested context from the current authenticated request. Delayed continuations preserve the exact authority snapshot inside their encrypted, run-bound continuation token. Static `data_resources.scope_values` may still define code-reviewed custom scope constants, but the reserved bot, actor, tenant, widget-context, token, and conversation namespaces are ignored there. Likewise, host-defined `data_resources.scope_sources` cannot replace the package-owned paths or labels for those authority namespaces.

Returned records are serialized from the exact resolved `select` allow-list. Eloquent `$appends`, hidden relations, and other fields added by `toArray()` are never included implicitly.

## Playbook Editor Relationship

Playbook authors do not redefine table schemas. A Capability step chooses from the Data Resources already approved for the linked Agent.

At publish time and runtime, `query_data_resource` validates:

- an explicit, non-empty Playbook allowlist (`allowed_resource_keys`); missing or empty means no access
- the resource key against both that Playbook allowlist and the linked Agent policy
- the deployment-pinned, versioned Data Resource contract hash against the current bot-effective contract
- selected fields
- filters
- sort column, direction, and optional NULL ordering
- default and maximum limits
- runtime scope filters

The runtime query boundary is a typed `DataQuery` AST. An AI Task may produce the complete AST from supplied context, or a fixed Capability step may declare it literally:

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

The action accepts either the fixed Capability mapping or its explicit nested `query` object, but compilation and execution receive only the validated AST. Invalid fields, operators, types, limits, clauses, or list sizes fail closed; the runtime does not drop, clamp, merge, or repair them. `count` is available only when the resource contract explicitly allows it. List queries return a bounded opaque `next_cursor` when another page exists.

`contains` is LIKE-escaped and exists in a pinned contract only for fields explicitly opted into **Allow text search**, listed in `contains_scan_fields`, or given an explicit `filter_operators` policy. This keeps broad scans opt-in.

The default `DataQueryCostGuard` runs `EXPLAIN` without `ANALYZE` and rejects PostgreSQL, MySQL, and MariaDB plans above the resource's pinned estimated-row budget before the visitor query executes. The same boundary applies the pinned positive statement timeout with PostgreSQL transaction-local settings, MySQL `max_execution_time`, or MariaDB `max_statement_time`, restoring prior settings when the surrounding database session can outlive the query. UI-managed resources cannot disable this timeout. SQLite keeps its lightweight behavior only in local/testing; production Data Resource queries fail closed on SQLite, and Doctor inventories active resource connections before launch. Hosts may still replace the public `DataQueryCostGuard` contract with a stricter implementation; direct code-reviewed resource configuration remains the expert boundary that may explicitly set a zero timeout.

Changing text-search permission, the statement timeout, or the estimated-row budget changes the Data Resource contract hash. Republish every Playbook bound to that resource, then publish a new Agent deployment to grant the reviewed versions. A live direct Agent tool keeps its immutable published snapshot until the Agent is deliberately republished. Existing installations must run the package migrations to add the nullable `query_safety` column used by UI-managed resources. Doctor reports the missing column and inventories active deployments whose pinned action or resource contract is stale; resolve that blocking list in the upgrade maintenance window before reopening chat traffic.

This keeps the editor simple while preserving the safety boundary configured in Filament.

Publishing an Agent copies each approved direct Data Resource definition and contract into the immutable Agent deployment. Publishing a Playbook pins every data Capability step to its exact resource keys and contract hashes. Both contracts record the model/repository identity, safe selectable/default/answer-ready fields, filters and operators, sortable and sensitive fields, scope definitions, and limit/cost policy.

For direct Agent tools, publishing also freezes custom scope-source paths and code-reviewed static scope values. Mutable host or Bot scope configuration cannot retarget a live deployment; actor, tenant, token, and conversation values are still resolved freshly from server-attested request authority and fail closed when unavailable.

Access is deny-by-default. A direct query requires the exact verified Agent deployment pin and resolvable server-attested row scopes. A Playbook query additionally requires the immutable Playbook deployment to bind that resource and contract. An Agent approval never implicitly grants a Playbook access, and a Playbook cannot expand the Agent's outer permission boundary.

Playbook authors see the approved resource labels, friendly field names, limits, and runtime scope summary. They do not need to know the database table shape to build a safe lookup.

## Governed Playbook Mutations

`mutate_data_resource` is a Playbook-only write capability. It supports one scoped `insert` or one optimistic `update`; arbitrary SQL, bulk changes, deletes, and direct model-selected writes are not available. Enabling a resource for reads does not enable writes.

The published resource contract pins:

- the exact allowed operation set (`insert` and/or `update`)
- writable and required-on-create fields
- the complete exact-identity field set used to select one update target
- field types, nullability, enum allowlists, and optional maximum lengths
- an integer or date-time optimistic-lock field for updates
- the row-authorization implementation and its code hash
- the same server-resolved ownership scope used by the resource

Every mutation requires an Agent mode that allows writes, an immutable Playbook deployment binding the exact resource contract, payload-specific confirmation, central gateway idempotency, a side-effect ledger claim, and validated result identity. The runtime rejects stale versions, zero or multiple update matches, missing ownership authority, unknown fields, invalid typed values, and contract drift before reporting success. Sensitive submitted values are scrubbed from persisted diagnostics.

Changing any mutation rule changes the resource contract hash. Republish the Playbook and then its owning Agent before the change may reach live traffic.

## Follow-up Queries

`query_data_resource` returns its validated result only to the invoking Agent or Playbook step. It does not write a second `last_result_set` state into the conversation and does not install a hidden query-patch protocol for the next turn.

The Agent can understand a conversational follow-up from normal chat history. If fresh data is required, it must make another explicit capability call with a complete typed query. The deployment-pinned Data Resource contract, server-attested scopes, and `CapabilityExecutionGateway` authorize that call exactly like the first one. This keeps conversational interpretation flexible while keeping database access explicit, deterministic, and fail closed.

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

`data_resources.resources`, `data_resources.scope_sources`, and
`data_resources.scope_values` are supported host configuration keys and survive
the package's supported-configuration partitioning. Keep custom scope values
secret-free and code-reviewed.

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

That conflict-check operation remains read-only even when the same resource also has a separate mutation policy:

- it runs through `query_data_resource`
- it uses the bot-approved resource policy
- it applies runtime scope filters
- it only reads approved fields and filters
- it never writes or mutates records

Use this when the host application has a reliable read model for duplicate detection. Keep the final correctness guarantee in the write target as well, such as a unique index or external provider idempotency key.

## Production Checklist

- Keep direct Agent access read-only. Enable `mutate_data_resource` only for an explicit published Playbook business step.
- Expose the smallest useful column set.
- Mark sensitive fields whenever they must be excluded from results, filters, text search, and ranking.
- Keep result limits chat-sized.
- Set filter field types and explicitly opt fields into `contains_scan_fields` only when the backing query can safely support that scan.
- Keep the default estimated-row budget and statement timeout unless measurements justify a reviewed exception; prefer adding an index or narrowing filters before raising them.
- Keep direct Agent filters grounded in the latest visitor message; use explicit typed query fields in Playbook action mappings.
- Configure `field_roles` for latest, active, and published semantics instead of relying on inferred field names.
- For latest published data, configure `published_at` as filterable and sortable so NULL draft rows cannot outrank published records.
- Choose **Agent or tenant scoped** and add runtime filters whenever records are tenant- or Agent-specific. Choose **Intentionally global** only when every approved record may be visible to every Agent that receives the resource.
- Populate tenant authority from trusted host middleware; never copy tenant, actor, token, or conversation identity from chat/model variables.
- Keep ownership scope fields hidden from normal filters unless visitors should explicitly filter by them.
- Approve resources per bot instead of enabling every global resource everywhere.
- Bind every data Capability step to one or more explicit resources; never treat an empty allowlist as a wildcard.
- For mutations, require a server-resolved ownership scope, the minimum writable fields, closed enum/type rules, exact update identity, and an integer or date-time optimistic-lock column. Leave delete unsupported.
- Exercise create, update, stale-version, duplicate-target, replay, confirmation, and tenant-boundary cases before production use.
- Republish Playbooks and their owning Agents intentionally after changing a bound resource or its Agent-level field/limit policy.
- Register Data Resource Gates before production launch; strict Gate mode is the production default.
- Re-run migrations before opening the Data Resources page after package upgrades.

## Related Docs

- [Side Effect Integrity](SIDE_EFFECT_INTEGRITY.md) - duplicate protection and read-only conflict checks for unsafe writes.
