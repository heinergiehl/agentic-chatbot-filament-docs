# Data Resources

The Agent offer describes each offered field once with its label, type, meaning,
roles and filter operators. It includes every allowed field rather than clipping
after sixteen fields or 2,000 characters. Field metadata labels allow 80 characters
and descriptions 240; overlength is rejected instead of silently shortened. Normal
deployment and request budgets still apply to the complete offer.

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

### Published filter evidence

Direct filters require source evidence as well as a valid type. A scalar
`value` can carry its exact visitor spelling in `source_value`; list predicates
use parallel `values` and `source_values`. Without a separate source spelling,
the proposed value itself must be grounded in the visitor message. Booleans
follow the same rule. The model cannot invent an enum, identifier, date or
boolean merely because it satisfies the schema.

Host-defined resources may publish `filter_input_policies` for allowed filter
fields. These policies become part of the resource contract hash and Agent
pin. No separate UI policy editor is added by this runtime change. For example:

```php
'filter_input_policies' => [
    'status' => ['aliases' => ['offene' => 'open', 'geschlossene' => 'closed']],
    'created_at' => [
        'date_formats' => ['d.m.Y'],
        'relative_dates' => [
            'timezone' => 'Europe/Berlin',
            'storage_timezone' => 'UTC',
            'expressions' => ['letzten Monat' => ['unit' => 'month', 'offset' => -1]],
        ],
    ],
],
```

The surrounding field metadata must declare compatible types and allowed enum
values. An alias maps only to such a published canonical value. Relative
calendar expressions use the immutable source turn's attested `received_at`
and the pinned timezone, including daylight-saving boundaries. A whole period
uses `period` with `between`; date-time periods compile to a lower-inclusive,
upper-exclusive range. Date-time relative phrases cannot be reduced to a
guessed scalar timestamp. Date-time policies require a storage timezone.

A later reply may explicitly reference a visitor source with
`visitor_reference: {message_id, quote}`. Only the active request's original
source or its latest recorded field correction is eligible. Admission verifies
the original committed turn, exact quote and unchanged authority scope again.
A correction invalidates the old field source, and current corrected values
must bind to that correction's quote. A relative date cited from an older
eligible visitor source keeps that source turn's time anchor.

A scalar filter may instead carry
`source_reference: {evidence_id, pointer}` for an explicitly published
[read dependency](AGENT_RUNTIME_ARCHITECTURE.md#published-read-dependencies).
It cannot combine this proof with another source form, an array predicate or a
calendar period. The canonical `value` must match the actual linked source
value after the field's type normalization. The adapter and execution gateway
resolve the same proof; rejected references execute no query.

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
- the row-authorization and registered Laravel model-policy implementations and their code hashes
- the write database connection, environment identity, and target fingerprint
- the same server-resolved ownership scope used by the resource

Every mutation requires an Agent mode that allows writes, an immutable Playbook deployment binding the exact resource contract, payload-specific confirmation, central gateway idempotency, a side-effect ledger claim, and validated result identity. The runtime rejects stale versions, zero or multiple update matches, missing ownership authority, unknown fields, invalid typed values, and contract drift before reporting success. Sensitive submitted values are scrubbed from persisted diagnostics.

Changing any mutation rule changes the resource contract hash. Republish the Playbook and then its owning Agent before the change may reach live traffic.

### Configure and use a write step

1. In **Approve information**, mark only the submitted business fields as **Can be written**. Mark every required create value and every exact update-identity field. Ownership columns, primary keys, creation timestamps, and the optimistic-lock column remain protected from submitted values.
2. In **Playbook writes**, explicitly enable **Create one scoped record**, **Update one scoped record**, or both. Updates need an integer or date-time version column with that exact field type. Approve the identity and version for reads when the Playbook must first retrieve a target.
3. In **Safety scope**, bind the ownership column to the trusted Agent, tenant, or actor. A visitor-supplied identity never replaces this scope. A missing required actor or tenant fails closed.
4. Give the Agent write permission and approve the resource. Add a `mutate_data_resource` Capability step to the Playbook, bound to that resource. Present the concrete create or update target and essential submitted values through the existing approval step before dispatch.
5. Run the exact candidate through the isolated staging procedure below. Each Data Resource write step needs its own signed successful test before Playbook publication. Include denied ownership, forbidden fields, changed payload, stale version, and replay in host regression tests.
6. Import the signed evidence, publish the unchanged Playbook, then publish its owning Agent. Ordinary Agent and release-candidate chat tests keep productive writes blocked. Saving a resource policy does not publish it or attest a successful write.

A create step supplies only the configured values; the server adds the ownership fields:

```json
{
  "resource_key": "customer_questions",
  "allowed_resource_keys": ["customer_questions"],
  "operation": "insert",
  "values": {
    "subject": "Delivery address",
    "message": "Please contact me about changing the address."
  }
}
```

An update step carries every configured identity field and the exact last-seen version from an approved read or previous mutation result:

```json
{
  "resource_key": "customer_questions",
  "allowed_resource_keys": ["customer_questions"],
  "operation": "update",
  "match": {"reference": "question-100"},
  "expected_version": 4,
  "values": {"subject": "Delivery address corrected"}
}
```

Both examples require the corresponding reviewed host resource fields and rules; they do not grant access by themselves. An integer version increases after a successful update. Date-time versions round-trip without losing stored fractional precision and advance by at least one second so timestamp columns with second precision cannot accept a stale same-second update. Use a dedicated integer version when the host also updates the same records. Every other host write must advance the same version column.

### Host authorization and transaction behavior

Registered Laravel model `create` and `update` policies apply in addition to the pinned resource row policy. They run inside the database transaction after the runtime has resolved the exact scoped target and before saving. Create policies may receive the unsaved model containing validated values and server ownership as their second argument; update policies receive the existing locked record. The mutation authorization context is available as the following optional argument. A host row authorizer also receives this exact record through `record`.

A registered model policy requires the current authenticated host actor to match the actor type and identifier in the server-attested chat authority. An unrelated panel administrator cannot supply this permission. A token-only, guest, or delayed continuation without that authenticated actor is blocked when a model policy exists. Hosts must supply the matching authenticated context for these writes; the package does not reconstruct a privileged actor from chat variables or use a policy-free fallback.

Enabling, replacing, or changing a registered model policy changes the write-enabled resource contract. This developmental change therefore requires republishing existing write-enabled Playbooks and their owning Agents. Read-only resources do not acquire new write permissions. Host policy behavior that depends on external configuration remains the host's responsibility to review and test.

Eloquent model events and global scopes remain active. An event that cancels a save cannot produce a successful mutation result; an exception during the transaction rolls back the database change. Database commits and the gateway ledger are separate durable boundaries: an interrupted process after a possible commit remains an unknown outcome and requires reconciliation before another write can run. A retained successful outcome can be returned without another mutation. An unknown outcome is not automatically retried; there is no cross-database exactly-once guarantee.

### Isolated staging evidence before publication

The current implementation adds a publication gate for every `mutate_data_resource` step. Each step must declare a literal resource key and `insert` or `update` operation. Evidence covers the complete compiled Playbook candidate, its Agent and Playbook IDs, the action and resource hashes, the reviewed payload and authority fingerprints, the declared production-to-staging database mapping, and a successful gateway ledger entry. It excludes the evidence itself from the candidate hash, so importing evidence does not change the candidate. Any candidate change requires a new test.

Run package migrations in both applications first. The additive `agentic_data_resource_write_test_evidence` table retains signed evidence; model updates/deletes and rollback over retained evidence are blocked. Configure these host values:

```php
// In the host's filament-agentic-chatbot config:
'data_resources' => [
    // Keep the resource, scope, and authorization configuration here.
    'write_testing' => [
        'environment_id' => env('AGENTIC_CHATBOT_DATA_RESOURCE_ENVIRONMENT'),
        'signing_key' => env('AGENTIC_CHATBOT_DATA_RESOURCE_WRITE_TEST_SIGNING_KEY'),
        'production_targets' => [], // Empty in production.
    ],
],
```

Use a nonempty environment identity that differs between production and staging. The signing key is a dedicated secret of at least 32 characters shared only by those two trusted applications. Keep it out of artifacts, chat, and browser input. The target fingerprint hashes the Eloquent driver's host, port, database, and socket; credentials are not exported.

**1. Export in the production application.** From an authorized administration context, pass the saved draft Playbook as `$playbook`. The export only reads and compiles configuration; it does not publish or run a business write.

```php
use Heiner\FilamentAgenticChatbot\Services\DataResources\Testing\DataResourceWriteTestRunner;

$runner = app(DataResourceWriteTestRunner::class);
$candidate = $runner->exportCandidate($playbook);
file_put_contents($candidatePath, json_encode($candidate, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
```

Treat the candidate export as privileged configuration: authoring mappings can contain literal business values. Transfer it through the host's controlled deployment process.

**2. Prepare an independent staging application.** Use `APP_ENV=staging` or `testing`, an isolated database with synthetic fixtures, separate credentials, and the same package/model/policy code. Clone the Agent, draft Playbook, resource policies, and required pinned dependencies with their original IDs. Isolate model observers, relationships, queues, and other host effects as part of that application. This facility never swaps a production Eloquent connection or binds an active production host to a test database.

In staging only, put each exported resource's `database_target` under `data_resources.write_testing.production_targets[resourceKey]`. The target is available on the relevant runtime node at `data.__dataResourceBindings[resourceKey].contract.mutation_policy.database_target`. Copy its `environment`, `connection`, and `target_hash` exactly. This mapping lets staging compile the identical production contract while its model continues using the staging application's actual connection. Both the environment identity and actual target fingerprint must differ from production. A relabelled copy of the same database is rejected. Production refuses target overrides.

**3. Review and explicitly execute in staging.** Authenticate the intended staging operator in the host guard, supply trusted tenant context when required, and load the cloned Playbook. The example fits an authorized interactive host command or Tinker session; `$candidatePath` and `$evidencePath` are operator-selected local artifact paths, and `$fixtureVariables`/`$tenant` come from the isolated host fixtures.

```php
$candidate = json_decode(file_get_contents($candidatePath), true, flags: JSON_THROW_ON_ERROR);
$runner = app(DataResourceWriteTestRunner::class);
$review = $runner->review($playbook, $candidate, 'rt_save_question', $fixtureVariables, $tenant);
dump($review->summary()); // Inspect operation, target, submitted values, scope, and expiry.
dump($review->reviewHash());
$confirmedHash = trim(readline('Enter the reviewed hash to perform this staging write: '));
$envelope = $runner->executeConfirmed($review, $confirmedHash);
file_put_contents($evidencePath, json_encode($envelope, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
```

Choose the actual compiled node ID from the export; `rt_save_question` is an example. For updates, seed the exact scoped fixture target and pass its current version through the Playbook's normal mapping. Repeat for each write step. Review expires after ten minutes. Changed input, actor, candidate, database target, or persisted run binding blocks execution. The review and its internal permit must stay in memory in this synchronous host process; they are not a browser, session, or queue transport format.

The runner uses the existing preview deployment, capability grants, payload-specific confirmation, `ActionExecutor`, gateway, result validation, and isolated ledger scope. It performs one selected action; it does not certify the complete Playbook graph, model routing quality, or a production database/provider. It never enables productive writes in ordinary preview, Agent live-test, or release-candidate conversations.

Only a succeeded first-attempt ledger result with the exact record identity can produce signed evidence. Failed, unknown, reconciled, and queued outcomes cannot. Repeating the same confirmed successful review returns its retained evidence without another write. If a separate operator-review policy queues the action, the runner stops with no evidence and does not serialize or bypass the staging permit. This synchronous diagnostic does not support completing that asynchronous review; keep that candidate blocked until a supported test path exists. Never disable a required production review to obtain evidence.

**4. Import and publish in production.** Import the JSON envelope under **Data Resources > Manage > Import signed write test**, or from the authorized host context:

```php
use Heiner\FilamentAgenticChatbot\Services\DataResources\Testing\DataResourceWriteEvidence;

$envelope = json_decode(file_get_contents($evidencePath), true, flags: JSON_THROW_ON_ERROR);
app(DataResourceWriteEvidence::class)->import($envelope, 'customer_questions');
```

Import verifies the signature and selected resource, retains the evidence idempotently, and performs no business write. Normal Playbook publication verifies all exact candidate bindings before creating a deployment. Publish that unchanged Playbook and then its owning Agent through the normal admin release flow. The deterministic package tests prove this path with isolated Testbench fixtures; they do not claim a completed independent host staging run or production database certification.

## Follow-up Queries

`query_data_resource` returns its validated result only to the invoking Agent or Playbook step. It does not write a second `last_result_set` state into the conversation and does not install a hidden query-patch protocol for the next turn.

The Agent can understand a conversational follow-up from normal chat history. If fresh data is required, it must make another explicit capability call with a complete typed query. The deployment-pinned Data Resource contract, server-attested scopes, and `CapabilityExecutionGateway` authorize that call exactly like the first one. This keeps conversational interpretation flexible while keeping database access explicit, deterministic, and fail closed.

The direct tool describes only query modes approved in that pinned contract;
its closed input schema carries the same mode enum. A rejected mode performs
no database read.

Within one active request, a successful bounded list can return an encrypted
`next_page_reference`. Supply it as the sole `page_reference` argument to read
the next verified page. Its receipt binds the complete pin, admitted query,
deployment, scope, turn and current request inputs, and expires within 900
seconds. The model cannot construct a cursor or alter filters alongside that
reference. Every continuation page remains incomplete evidence of the original
collection, including its final page; previous pages keep their own evidence.

An Agent may explicitly publish a Data Resource as either endpoint of a
read dependency. The source must return a complete `list` with exactly one
matching row, exposed as `/data/0/field`; a `first` result does not prove that
only one entity matched. The source field must be an approved select and the
target must be an approved scalar filter with the pinned type. Scope filters
cannot be dependency targets. Both capabilities belong to the same recorded
request, and the current source must have succeeded before the target query.
Several rows, partial pages, old evidence, Knowledge prose and undeclared
relationships cannot supply a key. This grant does not extend to Playbook
inputs or mutations.

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
