# Data Resources

The Agent offer describes each offered field once with its label, type, meaning,
roles and filter operators. It includes every allowed field rather than clipping
after sixteen fields or 2,000 characters. Field metadata labels allow 80 characters
and descriptions 240; overlength is rejected instead of silently shortened. Normal
deployment and request budgets still apply to the complete offer.

Data Resources define which live application records an Agent may read through a direct tool or a governed Playbook `query_data_resource` step. When the resource has an explicit write policy, an assigned Agent with write permission also gets one direct tool per enabled operation (`create_<key>`, `update_<key>`) that creates or updates one scoped record after the visitor confirms it (ADR 0038), and a published Playbook may do the same through `mutate_data_resource`.

The Agent sees each approved Data Resource as one tool. The model decides from the conversation when to call it and supplies the arguments; the Gateway validates them against the frozen schema, applies the server-bound scope, field policy and limits, and rejects anything else. Meta questions such as "what data can you access?" are answered by the model from its tool descriptions; they do not run a query and expose no table names, model classes, hidden scope values or sensitive fields. The model can select only the modes, fields, filters, sort argument, and limits frozen into the immutable Agent deployment; runtime upgrades do not silently rename an older deployment's pinned tool arguments. An identical repeated call within one turn returns the earlier result instead of querying again.

They are different from Knowledge Sources:

| Concept | Use It For | Managed In |
| --- | --- | --- |
| Knowledge Sources | Documents, URLs, text, and API snapshots that should be ingested, embedded, and searched semantically | **Sources** |
| Data Resources | Live database records where an Agent or Playbook needs exact filters, sorting, limits, and selected columns | **Data Resources** |

## Recommended Setup

1. Open **Agentic Chatbot > Connect > Data** and choose **New Data Resource**.
2. Pick the **Model**. The screen proposes a name, a key and one row per column with its label, type and switches:
   - **Show**: the Agent may return the field. **Filter** and **Sort** let it narrow and order records. **Search** adds the field to the `search` argument (text fields). **Total** allows `sum`, `avg`, `min` and `max` (numeric fields; dates: earliest and latest). **Group** allows one count or total per value (short strings, choices, booleans, dates). **Linked record** returns a column of a `belongsTo` record next to its key, for example the customer name.
   - Secret columns never appear: secret-like names (password, token, secret, API or private key, credential), hidden attributes and encrypted casts. Untick **Show** for anything else the Agent should not see.
   - Proposed defaults: every other column is shown and filterable (text and JSON only through search), numbers, dates and strings are sortable, numbers (not keys or foreign keys) and dates can be totalled, choices, booleans, dates, short or category-like strings and linked keys can be grouped, and a `*_id` column is linked when the model declares the relation with a `BelongsTo` return type and the related model has a label column such as `name` or `title`.
3. Under **Records**, choose whose rows the Agent reads: **The visitor's rows** (signed-in user, optionally with the user type column, or the conversation), **This Agent's rows** (Agent ID or public ID), **The tenant's rows**, **All rows** (requires the confirmation) or **Custom** scope filters for several bindings or host-defined sources. A table with a `bot_id` column starts with **This Agent's rows**.
4. Fill in **When to use**: Agent publication needs it to tell this tool apart from the others. Leave **Writes** closed unless the Agent must create or update records. Choose **Create records** or **Update records** and tick **Write** on the fields the visitor may set. Updates need a **Record key** (the primary key by default) and a **Version column** (an integer version or `updated_at`).
5. **Limits** (collapsed) holds the result styles, default order, row limits, statement timeout and estimated-row budget with safe defaults.
6. **Preview** shows what the Agent gets from the current, unsaved settings: a sample of up to three records and the exact tools (name, description and argument schema).
7. Open the target Agent and approve only the Data Resources that Agent may use. Narrow returned, filterable or sortable fields on the Agent only when it needs stricter rules than the global resource.

The global Data Resource is the maximum policy. Bot-level settings can only select or narrow it.

## What The Guardrails Do

The screen offers only discovered Eloquent models and their columns; admins never type model classes or column names. On save, every field must be a column of the chosen model, at least one field must be shown, a global resource needs the confirmation, and writes need an owner scope, a writable field and, for updates, a record key and a version column. Model and key cannot change after creation, because Agent approvals and Playbooks bind them.

Saving a resource without changes keeps its contract hash. Field settings the screen does not show (descriptions, aliases, explicit operator lists and fields marked sensitive, as written by **Sync from config**) stay as they are, and so do the stored field order and, while no update is enabled, the record key, version column and **Write** marks. A column left completely off is not stored. Changing a field's **Filter** or **Search** switch replaces its explicit operator list. A field that is shown again or hidden is returned by default exactly when shown.

Marking a field sensitive (config) is a hard exclusion, not a presentation hint: contract compilation removes it from returns, filters, search and ranking, and it never reaches direct Agent tools or Playbook query results.

The preview needs an Agent for a per-Agent resource: it uses the Agent you came from, else the first active Agent you may manage that approves the resource. Visitor and tenant scopes have no value outside a chat, so the preview shows their tools but no sample; try them in the widget.

Filter values use one shared semantic normalizer at model binding and deterministic query validation. Integer, number, boolean, date, date-time, URL, email, JSON, enum, string, and text declarations therefore cannot silently degrade into an arbitrary scalar comparison. Invalid formats fail before SQL compilation.

### Direct Agent queries

Each approved resource is one tool, `query_data_<key>`. Its arguments come from the pinned contract and appear only when the resource allows them:

| Argument | Meaning |
| --- | --- |
| `mode` | `list`, `first`, `count` as allowed, and `aggregate` when the resource has a field marked **Total** or **Group** |
| `filters` | typed conditions on filterable fields; all must match |
| `search` | up to five words (100 characters) matched case-insensitively against the **Search** fields that hold text (not numbers, dates, booleans or JSON); every word must occur in at least one of them; counts as one filter clause |
| `aggregate` | `count` (default), `sum`, `avg`, `min`, `max`; `sum` and `avg` need a numeric field, `min` and `max` a numeric or date field |
| `aggregate_field` | the field for `sum`, `avg`, `min`, `max` |
| `group_by` | one **Group** field; one result per value |
| `group_by_period` | `day`, `week`, `month` or `year` for a date `group_by` field (default `day`) |
| `select`, `sort_by`, `sort_direction`, `limit`, `cursor` | rows to return, order, page size and next page |

A grouped result returns at most `max_groups` groups (default 50, at most 100) and says `has_more` when there are more. Groups are ordered by their value, largest first (`sort_direction: asc` for the smallest), with NULL values last and the group key as tie-breaker; date buckets are ordered oldest first (`desc` for the newest). Date buckets are computed from the stored value (usually UTC; PostgreSQL `timestamp with time zone` columns in the connection's session time zone) with database functions on MySQL, MariaDB, PostgreSQL and SQLite: `YYYY-MM-DD` for a day, the Monday of a week, `YYYY-MM` and `YYYY`. A `select` or `sort_by` together with an aggregate is rejected, not ignored.

Aggregates, groups and linked labels are limited to returnable fields that are not sensitive: they never reveal a value the resource would not return as a row. Scope filters, field filters and search apply before aggregation, and the same cost guard and statement budget run on the aggregate query.

A field with **Linked record** returns the configured column of the related record under the relation's name (`customer_id` and `customer`). Listed and first records always carry such a key with its label, even when `select` leaves the key out, so the Agent never has to guess which record a row belongs to; a grouped result on the key carries the label per group. Only a `belongsTo` relation of the model whose foreign key is that field qualifies, and only a method declared with a `BelongsTo` return type is inspected: a method is never guessed from a column name or called without that declaration. The column must be visible on the related model: hidden attributes, encrypted casts and secret-like names (password, token, key) are refused, and an invalid setting shows no label rather than a value. Labels are loaded with one key lookup per query through the related model's own query, so its global scopes apply; that lookup is bounded by the returned keys, runs inside the statement timeout (also when the related model uses another connection) and does not run through the cost guard.

A `sum` beyond PHP's integer range is returned as an exact decimal string instead of being capped.

The result names what was applied: `query` echoes mode, limit, selected fields, sort, filter fields and operators, searched fields and the aggregate, without filter values or search words. Rows come with `count`, `has_more`, `next_cursor` and, when the last page is reached, `total`; an aggregate returns `value` and `matched`, a grouped aggregate `groups` (`group`, the linked label, `value`, and `count` for functions other than count). An invalid argument returns a short correctable error naming the allowed values; nothing is queried.

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

`contains` is LIKE-escaped and exists in a pinned contract only for fields explicitly opted into **Search**, listed in `contains_scan_fields`, or given an explicit `filter_operators` policy. This keeps broad scans opt-in.

The default `DataQueryCostGuard` runs `EXPLAIN` without `ANALYZE` and rejects PostgreSQL, MySQL, and MariaDB plans above the resource's pinned estimated-row budget before the visitor query executes. The same boundary applies the pinned positive statement timeout with PostgreSQL transaction-local settings, MySQL `max_execution_time`, or MariaDB `max_statement_time`, restoring prior settings when the surrounding database session can outlive the query. UI-managed resources cannot disable this timeout. SQLite keeps its lightweight behavior only in local/testing; production Data Resource queries fail closed on SQLite, and Doctor inventories active resource connections before launch. Hosts may still replace the public `DataQueryCostGuard` contract with a stricter implementation; direct code-reviewed resource configuration remains the expert boundary that may explicitly set a zero timeout.

Changing text-search permission, aggregate, group or linked-record settings, the statement timeout, or the estimated-row budget changes the Data Resource contract hash. Republish every Playbook bound to that resource, then publish a new Agent deployment to grant the reviewed versions. A live direct Agent tool keeps its immutable published snapshot until the Agent is deliberately republished. Existing installations must run the package migrations to add the nullable `query_safety` column used by UI-managed resources. Doctor reports the missing column and inventories active deployments whose pinned action or resource contract is stale; resolve that blocking list in the upgrade maintenance window before reopening chat traffic.

This keeps the editor simple while preserving the safety boundary configured in Filament.

Publishing an Agent copies each approved direct Data Resource definition and contract into the immutable Agent deployment. Publishing a Playbook pins every data Capability step to its exact resource keys and contract hashes. Both contracts record the model/repository identity, safe selectable/default/answer-ready fields, filters and operators, sortable and sensitive fields, scope definitions, and limit/cost policy.

For direct Agent tools, publishing also freezes custom scope-source paths and code-reviewed static scope values. Mutable host or Bot scope configuration cannot retarget a live deployment; actor, tenant, token, and conversation values are still resolved freshly from server-attested request authority and fail closed when unavailable.

Access is deny-by-default. A direct query requires the exact verified Agent deployment pin and resolvable server-attested row scopes. A Playbook query additionally requires the immutable Playbook deployment to bind that resource and contract. An Agent approval never implicitly grants a Playbook access, and a Playbook cannot expand the Agent's outer permission boundary.

Playbook authors see the approved resource labels, friendly field names, limits, and runtime scope summary. They do not need to know the database table shape to build a safe lookup.

## Governed Mutations

A write supports one scoped `insert` or one optimistic `update`; arbitrary SQL, bulk changes and deletes are not available. Enabling a resource for reads does not enable writes.

### Direct Agent writes

An Agent with write permission that has the resource assigned gets one tool per enabled operation. The tool schema contains only the visitor-writable fields; the ownership scope and the version column are set by the server. An update names the record by its identity fields, which it cannot change, and passes the version from a previous read. A direct update reaches only records the current visitor owns: its ownership scope must bind a server-attested identity of one visitor (`conversation.id`, or `actor.id` together with `actor.type`, or `widget_context.actor.id` together with `widget_context.actor.type`, because an actor id is unique only per actor type). `conversation.owner_id` is the access token owner in token and channel conversations, and signed tenant or attribute values can be shared by many visitors, so they do not count. For a resource scoped only to the Agent, a tenant, a token owner, a signed attribute or a static value, the update tool is not published unless the admin turns on **Allow updating any record** for that update in the Agent editor; such an update always asks the visitor to confirm, whatever the confirmation switch says. Inserts are not restricted. Execution checks the pinned reach again and refuses an update whose pin does not satisfy this rule. The call only proposes: the widget shows every value in full on a card (a payload with more than 24 values or a value over 2,000 characters is refused) and the write runs once when the visitor presses **Confirm** (or at once if the Agent's **Ask visitor to confirm** switch is off). It uses the same pinned contract, scope, host model policy, transaction, optimistic lock and side-effect ledger as a Playbook step. Republish the Agent after changing the write policy.

### Playbook mutations

`mutate_data_resource` is the Playbook form of the same write.

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

1. In **Writes**, choose **Create records**, **Update records** or both, and tick **Write** on the submitted business fields only. Required-on-create follows the column (not nullable, no default). Ownership columns, primary keys, timestamps and the version column stay protected from submitted values.
2. For updates, keep the **Record key** (the exact identity fields) and choose an integer or date-time **Version column**. Show the key and version when the Playbook must first read the target.
3. Under **Records**, bind the owner column to the trusted visitor, Agent or tenant. A visitor-supplied identity never replaces this scope. A missing required actor or tenant fails closed.
4. Give the Agent write permission and approve the resource. Add a `mutate_data_resource` Capability step to the Playbook, bound to that resource. Present the concrete create or update target and essential submitted values through the existing approval step before dispatch.
5. Run the exact candidate through the isolated staging procedure below. Each Data Resource write step needs its own signed successful test before Playbook publication. Include denied ownership, forbidden fields, changed payload, stale version, and replay in host regression tests.
6. Import the signed evidence, publish the unchanged Playbook, then publish its owning Agent. The Agent editor's test chat and Agent tests simulate writes and never write. Saving a resource policy does not publish it or attest a successful write.

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

The Agent may propose a conversational follow-up from native chat context.
Unresolved inputs live in a source-bound, revisioned draft; an intervening
question or reload does not authorize values from a different visitor turn.
If fresh data is required, a new explicit capability call must pass the
deployment-pinned query contract, server-attested scope and
`CapabilityExecutionGateway` before any database read. A missing, rejected or
ambiguous value causes no query. Results from an earlier successful turn are
historical evidence, not new query arguments or execution authority.

The direct tool describes only query modes approved in that pinned contract;
its closed input schema carries the same mode enum. A rejected mode performs
no database read.

A bounded list that has more rows returns `next_cursor`; the model passes it as `cursor` with the same arguments to read the next page. The cursor only carries an offset within the pinned `max_cursor_offset`; scope and filters are applied again on every page.

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

- Enable write operations only for resources an Agent or Playbook must change, and keep **Ask visitor to confirm** on unless a write is harmless.
- Expose the smallest useful column set.
- Untick **Show** on every field the Agent does not need; in config, mark fields sensitive that must be excluded from results, filters, text search and ranking.
- Keep result limits chat-sized.
- Set filter field types and explicitly opt fields into `contains_scan_fields` only when the backing query can safely support that scan.
- Mark fields as aggregatable or groupable only when totals per value are meant to be visible; grouping a large table needs an index that keeps it within the estimated-row budget.
- Keep the default estimated-row budget and statement timeout unless measurements justify a reviewed exception; prefer adding an index or narrowing filters before raising them.
- Keep direct Agent filters few and typed so the model can fill them from the conversation; use explicit typed query fields in Playbook action mappings.
- Configure `field_roles` for latest, active, and published semantics instead of relying on inferred field names.
- For latest published data, configure `published_at` as filterable and sortable so NULL draft rows cannot outrank published records.
- Choose **The visitor's rows**, **This Agent's rows** or **The tenant's rows** whenever records belong to someone. Choose **All rows** only when every approved record may be visible to every Agent that receives the resource.
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
