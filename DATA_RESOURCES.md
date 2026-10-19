# App data tools

The panel calls them **App data tools**. In code, configuration (`filament-agentic-chatbot.data_resources`), migrations and the public API the same objects are called Data Resources. Both names mean the same thing.

After adding a Tool in the Agent editor slide-over, press **Save draft** on the Agent to keep the assignment. Configure the host actor resolver before creating a visitor-bound Tool. A single configured actor type is pinned automatically; with several types, choose one explicitly.

The Agent offer describes each offered field once with its label, type, meaning,
roles and filter operators. It includes every allowed field rather than clipping
after sixteen fields or 2,000 characters. Field metadata labels allow 80 characters
and descriptions 240; overlength is rejected instead of silently shortened. Normal
deployment and request budgets still apply to the complete offer.

App data tools define which live application records an Agent may read through a direct tool or a governed Workflow `query_data_resource` step. When the resource has an explicit write policy, an Agent that has the resource explicitly assigned also gets one direct tool per enabled operation (`create_<key>`, `update_<key>`) that creates or updates one scoped record after the visitor confirms it (ADR 0038), unless that write is turned off for the Agent with its **Allow** switch in **Tools** (ADR 0054). A published Workflow may do the same through `mutate_data_resource`. There is no Agent permission mode: the assigned tools are the Agent's authority.

The Agent sees each approved app data tool as one tool. The model decides from the conversation when to call it and supplies the arguments; the Gateway validates them against the frozen schema, applies the server-bound scope, field policy and limits, and rejects anything else. Meta questions such as "what data can you access?" are answered by the model from its tool descriptions; they do not run a query and expose no table names, model classes, hidden scope values or sensitive fields. The model can select only the modes, fields, filters, sort argument, and limits frozen into the immutable Agent deployment; runtime upgrades do not silently rename an older deployment's pinned tool arguments. An identical repeated call within one turn returns the earlier result instead of querying again.

They are different from Knowledge Sources:

| Concept | Use It For | Managed In |
| --- | --- | --- |
| Knowledge Sources | Documents, URLs, text, and API snapshots that should be ingested, embedded, and searched semantically | **Sources** |
| App data tools | Live database records where an Agent or Workflow needs exact filters, sorting, limits, and selected columns | **App data tools** |

## Allowed models

The model picker discovers the host's `app/Models` and models named in
`filament-agentic-chatbot.data_resources.resources`. Every class in
`Heiner\FilamentAgenticChatbot\` or `Heiner\AgentGraph\`, and every subclass of
such a class (including host subclasses), is excluded unless its exact class is
in `filament-agentic-chatbot.data_resources.package_model_allowlist`. The default
is `[Heiner\FilamentAgenticChatbot\Models\BotSubmission::class]`. An allowlisted
package class is offered even when it is outside the host's model directory.
Allowlisting a base class does not allow its subclasses. Classes with unresolved
ancestry are refused as well. The same model rule applies to `belongsTo` label
targets; forbidden related models yield no label.

The built-in `bots` and `agent_workflows` resource definitions were removed in
1.0. `bot_submissions` remains. Registry discovery excludes forbidden host config
definitions. **Sync from config** saves permitted entries and names skipped keys
in its notification. Empty or unresolvable model classes are listed separately as
"model class not found". Existing Agents with removed keys report missing tools at
publication; published pins still fail closed at runtime.

A Workflow step using **Let AI choose** is refused in full when any of its
pinned app data tool bindings targets a forbidden model, even if the selected
resource is allowed. Remove the forbidden binding from the step and publish
again, or explicitly allowlist the model after reviewing its data exposure.

This is an explicit host opt-in to exposing package data, not an access grant:
field restrictions, Agent assignment, visitor/tenant scope, write policies and
confirmation still apply. An existing forbidden definition may be saved with its
model unchanged while inactive, so an operator can disable it. Creating it, changing its model to a
forbidden target or activating it is rejected with a validation
error on **Model**, including direct model saves and forged form submissions.
Removing an opt-in immediately blocks new runtime reads and writes, including tools
pinned in older published Agent Versions and Workflows. They return
`data_resource_model_not_allowed`; publishing or manually re-enabling a database
row cannot override the current host restriction. Restore an opt-in only after
reviewing that model and its data exposure. An already dispatched write retains
its ledger outcome on resumed delivery: completed writes replay, and uncertain
writes remain unknown without another dispatch. Policy changes cannot turn an
unknown external result into a failed write.

The 1.0 migration deactivates forbidden saved app data tools and prints each key
as `Deactivated App data tool: <key>`. See [Upgrading to 1.0](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md).

## Optional host policy checks for reads

In the app data tool form, **Advanced > Check host policies for reads** is off by
default. Enabling it adds Laravel host policies to every existing visitor,
Agent and tenant scope; it never replaces those scopes. The stored switch is
`query_safety.check_host_policies_for_reads`; config-defined resources use
`check_host_policies_for_reads: true`. No database migration is required.

Register a Laravel policy for the model before saving or publishing. An
administrator can still switch off **Available to Agents** for a tool whose
policy has since been removed; the check applies only to an active tool with
the option on. Publication pins `read_policy.enabled`, `owner: host`, the policy
class FQCN, a SHA-256 source fingerprint and the abilities `viewAny` and `view`.
Runtime
uses `Gate::forUser($actor)` with the current policy, inside the W5.6 resolver's
bounded context. The actor comes only from `HostActorResolver` (ADR 0057), never
the panel user, ambient guard, token owner or an administrator. Configure the
allowed actor types and execution-time account and tenant checks as described
below. A guest or expired identity returns `policy_actor_missing`; revoked or
foreign-tenant actors return `host_actor_denied`; unsupported types return
`host_actor_unsupported`.

Lists, counts and aggregates require `viewAny`; every candidate record must
also pass `view`. A single-record `first` read requires `view`. Only allowed
output fields are serialized, even though policies receive full model snapshots.
Related-record display labels are always suppressed with this option: the
contract has no pin for the policies of related models. Setup previews cannot use a panel
account as the visitor and display the missing-account diagnostic instead.

`filament-agentic-chatbot.data_resources.policy_candidate_limit` is a supported
host setting, default **200** (positive integer). Lists fetch normally ordered,
scoped and filtered candidates in chunks of at most 50. A list stops when its
page is full or the candidate budget is exhausted. When the budget ends before
the page fills, `policy_filtered_incomplete: true` and a model-facing notice
explicitly prohibit completeness claims. Policy lists never return `total` or
`has_more`. Their continuation cursor counts authorized rows only, and does not
promise another match. Each page rescans from the beginning within the same
budget, so pagination cannot bypass the candidate bound or expose denied-row
offsets. Narrow the filters to reach records beyond that bound.

Counts and aggregates must fit the whole candidate set within the limit. One
bounded query snapshots at most the limit plus one row, with the extra row used
solely to establish whether the set exceeds the bound. Exact operations never
mix candidate snapshots from several queries. Larger sets return
`policy_count_unavailable` with instructions to narrow the filters; no partial
aggregate or unfiltered count is returned. `first` is a bounded list of one: it
returns the first authorized row in order, even when more candidates exist, and
returns `policy_count_unavailable` only when none of the candidates within the
bound is authorized and more remain, because "no record" cannot then be told
apart from "not checked". Aggregates use the exact authorized snapshots and never requery them.
There is no separate record-export read path. Consumers collecting list pages
must treat the incomplete marker as incomplete data, never as a complete export.
There are no separate `exists` or `export` query modes; those unsupported modes
are rejected. Workflow `query_data_resource` steps use the same reader.

The source fingerprint covers the policy class file, the files of its parent
classes and of every trait used by the class, its parents and those traits,
and the abilities. Files under `base_path('vendor')` are not covered, because
package code is pinned by version. Files are identified by their path relative
to the application base path, so the same code at a different absolute path has
the same fingerprint; a file outside the base path is keyed by its class name
instead. It does not cover `Gate::before` or
`Gate::after` callbacks, services the policy calls, or vendor code. The
fingerprint only triggers review: the current policy is always invoked, and it
is not a security boundary.

A policy removed after publication returns `policy_missing`. A changed class or
fingerprint returns `policy_changed_requires_review`: review the policy and
publish the affected Workflow and Agent again. Existing artifact bytes are
never rewritten. Account revocation and current policy decisions still apply
on every execution even when source files match. Host policy exceptions become
`policy_read_failed` without record contents or exception text in results or
logs. Database query, deadlock and lost-connection failures during a policy read
become `policy_read_unavailable` instead: the model is told the read is
temporarily unavailable, not that the policy needs checking. Tools with this option off retain their previous contract and behavior.

## Recommended Setup

There are two ways in, and both open the same form. In the Agent editor, open **Tools** and choose **Add app data tool**: the form opens in a slide-over, and saving creates the tool and adds it to the Agent's draft only. **Save draft** keeps the assignment and **Publish** makes it live; the live Agent does not change before that. It needs the ability to create app data tools and to edit that Agent. **Connect > Data** stays the library of all app data tools (**New app data tool** there creates one without assigning it).

1. **Simple** is always visible:
   - Pick the **Model**. The form proposes a **Name** and one field per column; the key is generated from the name.
   - **When the Agent should use this** is the description the model reads to tell this tool apart from the others. Agent publication needs it.
   - **Fields to show** lists the fields the Agent may read and mention. Secret columns never appear: secret-like names (password, token, secret, API or private key, credential), hidden attributes and encrypted casts. Untick anything else the Agent should not see. **Searchable fields** adds text fields to the `search` argument.
   - **Whose records?** is a required choice with no default: **Only the signed-in visitor's records** or **All records**. A table with a `bot_id` column no longer starts with the Agent's rows.
     - The visitor choice asks **Which field holds the visitor's ID?** and shows two copyable snippets that tell the widget who is signed in: the Blade component for pages of the Laravel app behind its login, and the SDK call with a context endpoint for an external site (see [Chat Widget](CHAT_WIDGET.md#signed-customer-and-tenant-context)). A personal tool asks the visitor to sign in when no trusted identity is attested.
     - **All records** needs the confirmation "Every visitor may read every record", so a public tool over all rows is a deliberate choice.
   - **Allow changes** is off by default. When on, choose **Create records** and **Update records**, the **Fields the Agent may set**, and **Ask visitor to confirm**. Visitor-bound writes always ask for confirmation: the chooser and settings writer lock this policy, the compiler ignores stored opt-outs, and the Gateway refuses legacy published `confirmation: none` pins at proposal and execution until the Agent is republished. Tenant and access-token bindings keep the per-Agent opt-out (ADR 0038); turning it off needs the write policy authority of ADR 0054. Visitor-ID-scoped writes require the actor type pair and fail validation without it.

2. **Advanced** (collapsed) holds what a database administrator would tune:
   - **Check host policies for reads**, off by default, adds the host policy to the required scopes (see above).
   - The **Key** (editable until the first save, then fixed because Agents and Workflows refer to it) and **Available to Agents**.
   - The **Record rule**: the visitor, **This Agent's rows** (Agent ID or public ID), **The tenant's rows**, **All rows** or **Custom** scope filters for several bindings or host-defined sources. A tool saved with the Agent, tenant or Custom rule opens with **Whose records?** showing **Custom (see Advanced)** and Advanced expanded; opening and saving it without edits changes nothing.
   - The **Record key** and **Version column** for updates (an integer version or `updated_at`).
   - **Pinned visitor type** shows the saved actor type when the visitor ID field has no companion type field. Saving unchanged settings, renaming or disabling the tool keeps that type even after the host changes `context.host_actors.types`. **Change visitor type** offers the currently configured valid types when several are configured or the pinned type is no longer configured. Choosing one explicitly retargets the Draft tool; publish affected Agents to use the new binding. A new visitor tool without a type field needs exactly one valid configured type or an explicit choice in Advanced.
   - **Field details**: **Filter** and **Sort** let the Agent narrow and order records, **Total** allows `sum`, `avg`, `min` and `max` (numeric fields; dates: earliest and latest), **Group** allows one count or total per value (short strings, choices, booleans, dates), **Linked record** returns a column of a `belongsTo` record next to its key, for example the customer name.
   - **Limits**: result styles, default order, row limits, statement timeout and estimated-row budget with safe defaults.
   - Proposed defaults: every other column is shown and filterable (text and JSON only through search), numbers, dates and strings are sortable, numbers (not keys or foreign keys) and dates can be totalled, choices, booleans, dates, short or category-like strings and linked keys can be grouped, and a `*_id` column is linked when the model declares the relation with a `BelongsTo` return type and the related model has a label column such as `name` or `title`.
3. On SQLite outside the `local` and `testing` environments the form shows "App data tools need MySQL, MariaDB or PostgreSQL in production" and refuses to save an active tool, on both pages and in the slide-over. Query timeouts and plan budgets need one of those databases.
4. **Preview** shows what the Agent gets from the current, unsaved settings: a sample of up to three records and the exact tools (name, description and argument schema).
5. Narrow returned, filterable or sortable fields on the Agent only when it needs stricter rules than the global tool.

The global app data tool is the maximum policy. Bot-level settings can only select or narrow it.

The signed-in visitor choice binds both the actor ID and actor type. A matching
`*_type` field is used automatically, or another type field can be selected in
Advanced. Without a type field, saving requires exactly one valid host actor type
in `context.host_actors.types`; that type is pinned alongside the ID binding and
checked before every read or write. Another type with the same ID, including a
Filament user in the admin playground, cannot access the customer's rows.

## What The Guardrails Do

The screen offers only discovered Eloquent models and their columns; admins never type model classes or column names. On save, every field must be a column of the chosen model, at least one field must be shown, whose records must be chosen, a global resource needs the confirmation, and changes need an owner rule, a field the Agent may set and, for updates, a record key and a version column. Model and key cannot change after creation, because Agent approvals and Workflows bind them.

Saving a resource without changes keeps its contract hash. Field settings the screen does not show (descriptions, aliases, explicit operator lists and fields marked sensitive, as written by **Sync from config**) stay as they are, and so do the stored field order and, while no update is enabled, the record key, version column and **Write** marks. A column left completely off is not stored. Changing a field's **Filter** or **Search** switch replaces its explicit operator list. A field that is shown again or hidden is returned by default exactly when shown.

Marking a field sensitive (config) is a hard exclusion, not a presentation hint: contract compilation removes it from returns, filters, search and ranking, and it never reaches direct Agent tools or Workflow query results.

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

Safety scope filters are always applied by the runtime and hidden from both the Agent model and Workflow authors. They do not need to be exposed as normal visitor filters, so ownership columns such as `bot_id` can stay out of tool schemas and the Workflow editor while still protecting rows.

Each database column may appear in the scope-filter list only once. Duplicate
scope columns are rejected during normalization/publication and again at
runtime instead of allowing one source to overwrite another.

Query result frames do not expose scope enforcement metadata. The concrete applied-scope map is not copied into tool results, workflow state, result-set memory, traces, or model-facing answer context. A scope field appears in a returned record only when the host separately approves it as a returnable field.

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

### Signed-in customers and personal tools

Configure `context.host_actors.types` in the published package configuration,
for example `['customer' => App\Models\Customer::class]`. The class must exist,
extend Eloquent `Model`, implement `Authenticatable` and be concrete. Package
models and their subclasses are forbidden. Aliases must match
`[a-z][a-z0-9_-]{0,63}` exactly, without whitespace or control characters.
Each class may appear only once, including alternate casing or a leading
backslash. A list of distinct model classes supports class-name identity types
from same-origin guards (ADR 0057); do not mix list entries and aliases.
Explicitly map a shared host `User` model only when it is your intended customer
identity model and the host ability restricts it accordingly. Panel membership
never supplies an implicit actor mapping.
Setup validates the whole map and the default resolver's Gate ability. This mapping is supported at boot and in
cached configuration. It needs no runtime `config()` workaround.
Malformed maps are refused by Setup and personal tools, including when no host
model policy is configured. Setup reports **Blocked**, and execution refuses
the entire map before resolving an actor or calling its Gate. No alias is
silently overwritten and no partial map becomes scope-only authority.

When a request contains both signed context and a host session user, the signed
alias must map to that user's exact class and the authentication IDs must match.
The runtime keeps the signed alias for `actor.type` and queued scope bindings.
An unmapped or different session identity is refused with
`403 widget_context_invalid`; absence of a session user does not invalidate
otherwise valid signed context. Keep session context enabled when both are used;
it provides an additional identity consistency check.
Exactly one valid mapping must name the session model. Zero or multiple mappings
return `403 widget_context_invalid`, even when a model-issued token signs the
raw class name; there is no raw class-name fallback.
A tenant-only token does not exempt an accompanying session from this check.

Before an update confirmation card is created, the Gateway resolves exactly one
record inside the pinned ownership scope, checks its version and applies the
row and host policies. A foreign or missing record returns the same
`agent_write_target_unavailable` refusal, with no card and no write claim. A
failed lookup also fails closed. Confirm repeats these checks under the write
transaction's lock, so a card cannot authorize a later ownership or version change.

An app data tool is personal when its pinned scope binds an identity (`actor.*`, `tenant.*`, `widget_context.*`, `token.*`, `conversation.owner_id` or `conversation.owner_type`) or when its write pins a registered host model policy (ADR 0057). The same rule applies to the direct Agent tools and to every Workflow `query_data_resource` and `mutate_data_resource` step. Before such a tool or step reads, shows a confirmation card or starts a new write, the Gateway checks, in this order:

1. every bound identity value is attested (otherwise `sign_in_required`);
2. the signed context behind it has not expired and the Agent's context token version was not rotated since it was issued (otherwise `sign_in_required`);
3. the attested actor through the host actor resolver, when its type is allowed in `context.host_actors.types` or a model policy must be evaluated (`host_actor_denied` for a removed, disabled or refused account, `host_actor_unsupported` for a setup that cannot resolve it).

When `context.host_actors.types` lists at least one type, a personal tool refuses every other attested type with `host_actor_unsupported`, so an administrator whose user ID equals a customer ID cannot reach that customer's rows even through a scope that binds `actor.id` alone. Without any listed type, a personal tool is bound by its attested scope values alone; always bind `actor.type` together with `actor.id`.

A refused tool runs no query, creates no card and claims no ledger entry; the Agent asks the visitor to sign in and the widget links to `widget.sign_in_route` ([Chat Widget](CHAT_WIDGET.md#sign-in-for-personal-tools)). Identity never comes from a name, email address, order number or model output, and tool arguments cannot contain scope fields. Tools without an identity scope, such as public catalogues, are not affected.

Identity only refuses a new dispatch. A write whose exactly bound ledger outcome already exists (succeeded, failed, unknown, or verified by an operator) is recovered first, also after the customer was revoked: a completed write is never reported as failed and an unknown write stays unknown without a second dispatch.

A delayed continuation, an API connection completion and an approved Human Review re-attest the customer from their continuation token and are refused when the Agent's context token version was rotated (`context_token_rotated`) or the host no longer allows the account (`identity_revoked`). After mere expiry of the signed context they resume with the expiry attached: steps without identity scope continue, personal steps and policy writes refuse with `sign_in_required`.

The context is transient: AgentGraph checkpoints and workflow-run variable persistence remove it. Every resumed chat turn receives a newly attested context from the current authenticated request. Delayed continuations preserve the exact authority snapshot inside their encrypted, run-bound continuation token. Static `data_resources.scope_values` may still define code-reviewed custom scope constants, but the reserved bot, actor, tenant, widget-context, token, and conversation namespaces are ignored there. Likewise, host-defined `data_resources.scope_sources` cannot replace the package-owned paths or labels for those authority namespaces.

Returned records are serialized from the exact resolved `select` allow-list. Eloquent `$appends`, hidden relations, and other fields added by `toArray()` are never included implicitly.

## Workflow Editor Relationship

Workflow authors do not redefine table schemas. A Tool step chooses from the app data tools already approved for the linked Agent.

At publish time and runtime, `query_data_resource` validates:

- an explicit, non-empty Workflow allowlist (`allowed_resource_keys`); missing or empty means no access
- the resource key against both that Workflow allowlist and the linked Agent policy
- the deployment-pinned, versioned app data tool contract hash against the current bot-effective contract
- selected fields
- filters
- sort column, direction, and optional NULL ordering
- default and maximum limits
- runtime scope filters

The runtime query boundary is a typed `DataQuery` AST. An AI Task may produce the complete AST from supplied context, or a fixed Tool step may declare it literally:

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

The action accepts either the fixed Tool mapping or its explicit nested `query` object, but compilation and execution receive only the validated AST. Invalid fields, operators, types, limits, clauses, or list sizes fail closed; the runtime does not drop, clamp, merge, or repair them. `count` is available only when the resource contract explicitly allows it. List queries return a bounded opaque `next_cursor` when another page exists.

`contains` is LIKE-escaped and exists in a pinned contract only for fields explicitly opted into **Search**, listed in `contains_scan_fields`, or given an explicit `filter_operators` policy. This keeps broad scans opt-in.

The default `DataQueryCostGuard` runs `EXPLAIN` without `ANALYZE` and rejects PostgreSQL, MySQL, and MariaDB plans above the resource's pinned estimated-row budget before the visitor query executes. The same boundary applies the pinned positive statement timeout with PostgreSQL transaction-local settings, MySQL `max_execution_time`, or MariaDB `max_statement_time`, restoring prior settings when the surrounding database session can outlive the query. UI-managed resources cannot disable this timeout. SQLite keeps its lightweight behavior only in local/testing; production app data tool queries fail closed on SQLite, and Doctor inventories active resource connections before launch. Hosts may still replace the public `DataQueryCostGuard` contract with a stricter implementation; direct code-reviewed resource configuration remains the expert boundary that may explicitly set a zero timeout.

Changing text-search permission, aggregate, group or linked-record settings, the statement timeout, or the estimated-row budget changes the app data tool contract hash. Republish every Workflow bound to that resource, then publish a new Agent deployment to grant the reviewed versions. A live direct Agent tool keeps its immutable published snapshot until the Agent is deliberately republished. Existing installations must run the package migrations to add the nullable `query_safety` column used by UI-managed resources. Doctor reports the missing column and inventories active deployments whose pinned action or resource contract is stale; resolve that blocking list in the upgrade maintenance window before reopening chat traffic.

This keeps the editor simple while preserving the safety boundary configured in Filament.

Publishing an Agent copies each approved direct app data tool definition and contract into the immutable Agent deployment. Publishing a Workflow pins every data Tool step to its exact resource keys and contract hashes. Both contracts record the model/repository identity, safe selectable/default/answer-ready fields, filters and operators, sortable and sensitive fields, scope definitions, and limit/cost policy.

For direct Agent tools, publishing also freezes custom scope-source paths and code-reviewed static scope values. Mutable host or Bot scope configuration cannot retarget a live deployment; actor, tenant, token, and conversation values are still resolved freshly from server-attested request authority and fail closed when unavailable.

Access is deny-by-default. A direct query requires the exact verified Agent deployment pin and resolvable server-attested row scopes. A Workflow query additionally requires the immutable Workflow deployment to bind that resource and contract. An Agent approval never implicitly grants a Workflow access, and a Workflow reaches only the resources and contracts its published version binds.

Workflow authors see the approved resource labels, friendly field names, limits, and runtime scope summary. They do not need to know the database table shape to build a safe lookup.

## Governed Mutations

A write supports one scoped `insert` or one optimistic `update`; arbitrary SQL, bulk changes and deletes are not available. Enabling a resource for reads does not enable writes.

### Direct Agent writes

An Agent that has the resource explicitly assigned gets one tool per enabled operation; an implicit "all resources" read never grants a write, and the **Allow** switch next to a write turns it off while the read tool stays. Turning a write back on is write policy (`agents.write_policy`). The tool schema contains only the visitor-writable fields; the ownership scope and the version column are set by the server. An update supplies only `record` (the immutable identity fields) and `changes`. The tool captures `expected_version` from the scoped, authorized record when it proposes the change; the model and visitor never supply that internal value. The captured version is bound into the confirmation payload and checked again under the execution lock, so a change between proposal and Confirm is refused. A direct update reaches only records the current visitor owns: its ownership scope must bind a server-attested identity of one visitor (`conversation.id`, or `actor.id` together with `actor.type`, or `widget_context.actor.id` together with `widget_context.actor.type`, because an actor id is unique only per actor type). `conversation.owner_id` is the access token owner in token and channel conversations, and signed tenant or attribute values can be shared by many visitors, so they do not count. For a resource scoped only to the Agent, a tenant, a token owner, a signed attribute or a static value, the update tool is not published unless the admin turns on **Allow updating any record** for that update in the Agent editor; such an update always asks the visitor to confirm, whatever the confirmation switch says. Inserts are not restricted. Execution checks the pinned reach again and refuses an update whose pin does not satisfy this rule. The call only proposes: the widget shows every value in full on a card (a payload with more than 24 values or a value over 2,000 characters is refused) and the write runs once when the visitor presses **Confirm** (or at once if the Agent's **Ask visitor to confirm** switch is off). It uses the same pinned contract, scope, host model policy, transaction, optimistic lock and side-effect ledger as a Workflow step. Republish the Agent after changing the write policy.

### Workflow mutations

`mutate_data_resource` is the Workflow form of the same write.

The published resource contract pins:

- the exact allowed operation set (`insert` and/or `update`)
- writable and required-on-create fields
- the complete exact-identity field set used to select one update target
- field types, nullability, enum allowlists, and optional maximum lengths
- an integer or date-time optimistic-lock field for updates
- the row-authorization and registered Laravel model-policy implementations and their code hashes
- the write database connection, environment identity, and target fingerprint
- the same server-resolved ownership scope used by the resource

Every mutation requires an immutable Workflow deployment binding the exact resource contract, pinned by the Agent's live version, payload-specific confirmation, central gateway idempotency, a side-effect ledger claim, and validated result identity. The runtime rejects stale versions, zero or multiple update matches, missing ownership authority, unknown fields, invalid typed values, and contract drift before reporting success. Sensitive submitted values are scrubbed from persisted diagnostics.

Changing any mutation rule changes the resource contract hash. Republish the Workflow and then its owning Agent before the change may reach live traffic.

### Configure and use a write step

1. In **Writes**, choose **Create records**, **Update records** or both, and tick **Write** on the submitted business fields only. Required-on-create follows the column (not nullable, no default). Ownership columns, primary keys, timestamps and the version column stay protected from submitted values.
2. For updates, keep the **Record key** (the exact identity fields) and choose an integer or date-time **Version column**. Show the key and version when the Workflow must first read the target.
3. Under **Records**, bind the owner column to the trusted visitor, Agent or tenant. A visitor-supplied identity never replaces this scope. A missing required actor or tenant fails closed.
4. Approve the resource for the Agent. Add a `mutate_data_resource` Tool step to the Workflow, bound to that resource. Present the concrete create or update target and essential submitted values through the existing approval step before dispatch.
5. Run the exact candidate through the isolated staging procedure below. Each app data tool write step needs its own signed successful test before Workflow publication. Include denied ownership, forbidden fields, changed payload, stale version, and replay in host regression tests.
6. Import the signed evidence, publish the unchanged Workflow, then publish its owning Agent. The Agent editor's test chat and Agent tests simulate writes and never write. Saving a resource policy does not publish it or attest a successful write.

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

A registered model policy is evaluated for the customer attested in the conversation, resolved through the host actor resolver (ADR 0057), also in a queue worker. It never reads the current auth guard. Configure it once:

```php
// config/filament-agentic-chatbot.php
'context' => [
    'host_actors' => [
        // attested actor type => Eloquent Authenticatable model
        'types' => [
            'customer' => App\Models\Customer::class, // signed context type "customer"
            App\Models\User::class,                   // same-origin guard users of this class
        ],
    ],
],

// AppServiceProvider::boot()
Gate::define('filament-agentic-chatbot.serve-customer', function (Customer $customer, HostActorReference $reference): bool {
    return $customer->is_active
        && ($reference->tenantId() === null || $customer->stores()->whereKey($reference->tenantId())->exists());
});
```

The package maps the attested type to the allowed class itself and never instantiates a class named by chat, model, browser or queued data. The default resolver loads that model by its key through the model's own query, then asks the ability above (configurable as `context.host_actors.ability`, environment variable `AGENTIC_CHATBOT_CONTEXT_HOST_ACTOR_ABILITY`). The ability is the host hook that rechecks account status, tenant membership and access at every execution. The package then evaluates the policy as `Gate::forUser($customer)`. A missing customer returns `sign_in_required`; an actor the setup cannot resolve (type not allowed, invalid class, ability not defined) returns `host_actor_unsupported`; a removed, disabled or refused customer returns `host_actor_denied`. All three are denials. Nothing falls back to an access token owner, an operator, a panel administrator or a guard user, and a following queue job cannot inherit the previous job's customer. Policy context that depends on host state, such as a tenancy package or a global scope that reads the current tenant, is established only in `HostActorResolver::within()` of your own resolver ([Public API](PUBLIC_API.md#host-actor-resolution)). The Setup page and Doctor check **Host actor resolution** name an unsupported setup.

An isolated staging write test attests the authenticated operator's own class and key using its unique type in the validated `context.host_actors.types` map. For `['customer' => Customer::class]`, an authenticated, persisted `Customer` is attested as `customer`; a class-name list retains the class-name type. Invalid or ambiguous maps and unlisted classes refuse the review. An empty map preserves scope-only diagnostics, but cannot satisfy a registered host model policy. Panel membership never supplies customer identity, and an administrator with the same key cannot borrow a customer's mapping. The Gateway resolves that same account again through the configured or custom host resolver, with the trusted tenant context and current account and model policy checks. A queued same-origin chat turn rechecks its guard user through the user provider of the guard that authenticated it; a deleted or soft-deleted user refuses the turn. A guard without a configured user provider cannot be rechecked, so its users act for personal tools only through an allowed type; the Setup check warns about such guards.

Enabling, replacing, or changing a registered model policy changes the write-enabled resource contract. This developmental change therefore requires republishing existing write-enabled Workflows and their owning Agents. Read-only resources do not acquire new write permissions. Host policy behavior that depends on external configuration remains the host's responsibility to review and test.

Eloquent model events and global scopes remain active. An event that cancels a save cannot produce a successful mutation result; an exception during the transaction rolls back the database change. Database commits and the gateway ledger are separate durable boundaries: an interrupted process after a possible commit remains an unverified action and requires reconciliation before another write can run. A retained successful outcome can be returned without another mutation. An unverified action is not automatically retried; there is no cross-database exactly-once guarantee.

### Isolated staging evidence before publication

The current implementation adds a publication gate for every `mutate_data_resource` step. Each step must declare a literal resource key and `insert` or `update` operation. Evidence covers the complete compiled Workflow candidate, its Agent and Workflow IDs, the action and resource hashes, the reviewed payload and authority fingerprints, the declared production-to-staging database mapping, and a successful gateway ledger entry. It excludes the evidence itself from the candidate hash, so importing evidence does not change the candidate. Any candidate change requires a new test.

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

**1. Export in the production application.** From an authorized administration context, pass the saved draft Workflow as `$playbook`. The export only reads and compiles configuration; it does not publish or run a business write.

```php
use Heiner\FilamentAgenticChatbot\Services\DataResources\Testing\DataResourceWriteTestRunner;

$runner = app(DataResourceWriteTestRunner::class);
$candidate = $runner->exportCandidate($playbook);
file_put_contents($candidatePath, json_encode($candidate, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
```

Treat the candidate export as privileged configuration: authoring mappings can contain literal business values. Transfer it through the host's controlled deployment process.

**2. Prepare an independent staging application.** Use `APP_ENV=staging` or `testing`, an isolated database with synthetic fixtures, separate credentials, and the same package/model/policy code. Clone the Agent, draft Workflow, resource policies, and required pinned dependencies with their original IDs. Isolate model observers, relationships, queues, and other host effects as part of that application. This facility never swaps a production Eloquent connection or binds an active production host to a test database.

In staging only, put each exported resource's `database_target` under `data_resources.write_testing.production_targets[resourceKey]`. The target is available on the relevant runtime node at `data.__dataResourceBindings[resourceKey].contract.mutation_policy.database_target`. Copy its `environment`, `connection`, and `target_hash` exactly. This mapping lets staging compile the identical production contract while its model continues using the staging application's actual connection. Both the environment identity and actual target fingerprint must differ from production. A relabelled copy of the same database is rejected. Production refuses target overrides.

**3. Review and explicitly execute in staging.** Authenticate the intended staging operator in the host guard, supply trusted tenant context when required, and load the cloned Workflow. The example fits an authorized interactive host command or Tinker session; `$candidatePath` and `$evidencePath` are operator-selected local artifact paths, and `$fixtureVariables`/`$tenant` come from the isolated host fixtures.

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

Choose the actual compiled node ID from the export; `rt_save_question` is an example. For updates, seed the exact scoped fixture target and pass its current version through the Workflow's normal mapping. Repeat for each write step. Review expires after ten minutes. Changed input, actor, candidate, database target, or persisted run binding blocks execution. The readonly in-memory permit pins the original operator class, key and canonical type, plus a hash of the complete validated host actor type map. These bindings appear in `summary()` and `reviewHash()`; changing ordinary Workflow variables cannot replace them. Confirmation also requires current `workflows.publish` authorization, independently of customer authorization. Fixture variables cannot choose the actor or replace runtime authority. The review and its internal permit must stay in memory in this synchronous host process; they are not a browser, session, or queue transport format.

The Gateway and mutation action carry that permit constraint through actual host resolution and policy evaluation. The current operator and type map must still match before and after resolver and policy callbacks, including callbacks after the ledger claim. The resolved actor must have the pinned class and key. The action checks again inside the database transaction before saving and before commit, so a late configuration or operator change rolls back the diagnostic write and yields no successful evidence. A changed type map requires a fresh review, even when the original alias still exists. Current account, tenant, row policy and model policy checks remain mandatory. Interrupted writes retain their unknown ledger history and cannot be replayed to obtain evidence.

The runner uses the existing preview deployment, tool grants, payload-specific confirmation, `ActionExecutor`, gateway, result validation, and isolated ledger scope. It performs one selected action; it does not certify the complete Workflow graph, model routing quality, or a production database/provider. It never enables productive writes in ordinary preview, Agent live-test, or release-candidate conversations.

Only a succeeded first-attempt ledger result with the exact record identity can produce signed evidence. Failed, unknown, reconciled, and queued outcomes cannot. Repeating the same confirmed successful review returns its retained evidence without another write. If a separate operator-review policy queues the action, the runner stops with no evidence and does not serialize or bypass the staging permit. This synchronous diagnostic does not support completing that asynchronous review; keep that candidate blocked until a supported test path exists. Never disable a required production review to obtain evidence.

**4. Import and publish in production.** Import the JSON envelope under **App data tools > Manage > Import signed write test**, or from the authorized host context:

```php
use Heiner\FilamentAgenticChatbot\Services\DataResources\Testing\DataResourceWriteEvidence;

$envelope = json_decode(file_get_contents($evidencePath), true, flags: JSON_THROW_ON_ERROR);
app(DataResourceWriteEvidence::class)->import($envelope, 'customer_questions');
```

Import verifies the signature and selected resource, retains the evidence idempotently, and performs no business write. Normal Workflow publication verifies all exact candidate bindings before creating a deployment. Publish that unchanged Workflow and then its owning Agent through the normal admin release flow. The deterministic package tests prove this path with isolated Testbench fixtures; they do not claim a completed independent host staging run or production database certification.

## Follow-up Queries

`query_data_resource` returns its validated result only to the invoking Agent or Workflow step. It does not write a second `last_result_set` state into the conversation and does not install a hidden query-patch protocol for the next turn.

The Agent may propose a conversational follow-up from native chat context.
Unresolved inputs live in a source-bound, revisioned draft; an intervening
question or reload does not authorize values from a different visitor turn.
If fresh data is required, a new explicit tool call must pass the
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

Use **Sync from config** in **App data tools** when you intentionally want to create or overwrite UI-managed resources from config.

`data_resources.resources`, `data_resources.scope_sources`, and
`data_resources.scope_values` are supported host configuration keys and survive
the package's supported-configuration partitioning. Keep custom scope values
secret-free and code-reviewed.

For day-to-day admin changes, prefer the Filament UI. Treat config as install-time defaults, repeatable demo setup, or code-reviewed production policy.

A changed app data tool definition (synced or edited) reaches a live Agent version only through that Agent's **Publish**: the live version keeps the field policies, scope bindings and contract hash it pinned. **Publish affected Agents** (ADR 0055) covers API tools and Workflows only, because a changed app data tool contract usually changes what the Agent may read or write; review each Agent and publish it.

## Admin Authorization

App data tools need `filament-agentic-chatbot.configure` (drafts) in the
abilities mode of new installations ([Security and Privacy](SECURITY_AND_PRIVACY.md#administration-abilities)).
In the `strict` mode of upgraded installations they stay hidden in every
environment until the host registers explicit Laravel Gates:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-data-resources', fn ($user) => $user->canReviewDataResources());
Gate::define('filament-agentic-chatbot.manage-data-resources', fn ($user) => $user->canManageDataResources());
```

The view Gate grants navigation and read access. The manage Gate grants create, edit, delete, and sync actions, and also grants read access. `AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES` defaults to `true` in every environment.

`php artisan filament-agentic-chatbot:doctor` fails in production if this surface is relaxed without a registered Gate.

## Side Effect Integrity Conflict Checks

App data tools can be used by Side Effect Integrity as read-only duplicate checks before an unsafe write runs. For example, a CRM lead create operation can query an approved `crm_leads` resource by email and block the write if a matching record already exists.

That conflict-check operation remains read-only even when the same resource also has a separate mutation policy:

- it runs through `query_data_resource`
- it uses the bot-approved resource policy
- it applies runtime scope filters
- it only reads approved fields and filters
- it never writes or mutates records

Use this when the host application has a reliable read model for duplicate detection. Keep the final correctness guarantee in the write target as well, such as a unique index or external provider idempotency key.

## Production Checklist

- Enable write operations only for resources an Agent or Workflow must change, and keep **Ask visitor to confirm** on unless a write is harmless.
- Expose the smallest useful column set.
- Untick **Show** on every field the Agent does not need; in config, mark fields sensitive that must be excluded from results, filters, text search and ranking.
- Keep result limits chat-sized.
- Set filter field types and explicitly opt fields into `contains_scan_fields` only when the backing query can safely support that scan.
- Mark fields as aggregatable or groupable only when totals per value are meant to be visible; grouping a large table needs an index that keeps it within the estimated-row budget.
- Keep the default estimated-row budget and statement timeout unless measurements justify a reviewed exception; prefer adding an index or narrowing filters before raising them.
- Keep direct Agent filters few and typed so the model can fill them from the conversation; use explicit typed query fields in Workflow action mappings.
- Configure `field_roles` for latest, active, and published semantics instead of relying on inferred field names.
- For latest published data, configure `published_at` as filterable and sortable so NULL draft rows cannot outrank published records.
- Choose **The visitor's rows**, **This Agent's rows** or **The tenant's rows** whenever records belong to someone. Choose **All rows** only when every approved record may be visible to every Agent that receives the resource.
- Populate tenant authority from trusted host middleware; never copy tenant, actor, token, or conversation identity from chat/model variables.
- Bind personal tools to `actor.id` and `actor.type`, set a sign-in route, and allow the customer model in `context.host_actors.types` with the ability `filament-agentic-chatbot.serve-customer` when writes use model policies or a disabled account must be refused at once.
- Keep ownership scope fields hidden from normal filters unless visitors should explicitly filter by them.
- Approve resources per bot instead of enabling every global resource everywhere.
- Bind every data Tool step to one or more explicit resources; never treat an empty allowlist as a wildcard.
- For mutations, require a server-resolved ownership scope, the minimum writable fields, closed enum/type rules, exact update identity, and an integer or date-time optimistic-lock column. Leave delete unsupported.
- Exercise create, update, stale-version, duplicate-target, replay, confirmation, and tenant-boundary cases before production use.
- Republish Workflows and their owning Agents intentionally after changing a bound resource or its Agent-level field/limit policy.
- Register app data tool Gates before production launch; strict Gate mode is the production default.
- Re-run migrations before opening the app data tools page after package upgrades.

### Workflow steps with mixed identity requirements

A Workflow data step checks every resource binding allowed by its published
contract before execution. If a step allows both a public resource and a
personal resource, guests cannot use that step, even when selecting the public
resource. Keep public and personal resources in separate steps to expose public
reads anonymously. This conservative check fails closed across all allowed bindings.


## Import from a Filament Resource

Choose **Import from Filament Resource** beside **Add app data tool** in the
Agent editor, or on the app data tools list. Discovery is limited to the Resources of the
current panel and its current tenant. Another panel's guard, tenancy and tenant
cannot be authorized from the current request, so its Resources are never listed. To
import from another panel, open the app data tool form in that panel. Discovery
requires the same configure ability as
creating an app data tool, including a model-specific check against an unsaved
`DataResourceDefinition`. Package Resources (including host Resources that extend them)
and forbidden package models are excluded.
Missing or non-Eloquent models appear as unavailable. An existing tool on the
same model is indicated within the operator's scope; a second tool needs its own
unique key under the normal rules.

Import reads static model, singular/plural label, record-title and global-search
metadata plus the existing model field proposal. It never calls the Resource's
query, table or form. Relation search paths and unavailable or sensitive search
attributes are named as skipped. Secret fields remain excluded; email, phone and
other sensitive fields start with all access switches off.

The existing Simple form opens as an unsaved Draft. Review the fields, choose
whose records are allowed, and explicitly choose the tenant scope. Tenanted panels
require a tenant column bound to the runtime tenant. Visitor bindings still use
the actor type and ID together. No panel privileges or tenant IDs are copied.
Selection and Save recheck authorization; a changed operator, panel, tenant or
model invalidates the proposal. Cancel saves nothing. Save uses the existing form
writer and only changes the Agent draft; Publish is separate.

The stored `source_resource` class name is display-only metadata. Runtime never
scans or calls Filament Resources and uses only the tool's explicit record scope.

## Related Docs

- [Side Effect Integrity](SIDE_EFFECT_INTEGRITY.md) - duplicate protection and read-only conflict checks for unsafe writes.
