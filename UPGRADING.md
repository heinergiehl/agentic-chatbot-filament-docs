# Upgrading

This document covers required steps when upgrading between public releases.

## Existing conversations after runtime upgrades

A compatible live Agent does not make an older conversation-bound deployment
compatible. When an open Playbook is bound to an unsupported Agent runtime
contract, the chat now commits clear, non-retryable advice before any model
dispatch. It does not cancel, rebind, migrate, delete, or replay that old work.
Operators must review unfinished work under the existing reconciliation and
cutover procedures. Starting a new conversation is appropriate for new requests,
not proof that a previous external action failed or can be repeated.

This change adds no database migration. Compatible published Playbooks need no
rebuild solely because of the new conversation error handling. Structured widget
and operator waitpoints keep their existing authorized controls while no longer
offering an unusable textual continuation to the model.

## Durable Connector jobs and mixed Playbook answers

Run these three additive migrations before restarting the application and
queue workers:

- `2026_08_30_000007_add_durable_connector_continuations.php`
- `2026_08_30_000008_create_connector_completion_events.php`
- `2026_08_30_000009_add_chat_turn_presentation_receipts.php`

Quiesce writers, take and verify a restorable schema/data backup, and preserve
the matching package, host configuration and encryption key first. The
migrations classify existing continuation rows as `inline`, add durable job
correlation and notification indexes, and add encrypted mixed-turn presentation
receipts. They do not rewrite Connector revisions, Agent deployment hashes, or
existing messages. An unchanged operation form also preserves its saved
completion policy without injecting new defaults into the contract.

This release changes the hash-bound core authentication and continuation
implementations. Operations pinned to those previous implementations must be
tested and published again, and their dependent Agent/Playbook deployments must
be rebuilt and tested before traffic resumes. This also applies to ordinary
read operations: unchanged business settings do not authorize changed runtime
code. Do not rewrite old hashes or weaken the strategy verification. Finish
in-flight work on its matching release, or reconcile it before the cutover.

Durable completion is opt-in through a newly published operation and pinned
Playbook deployment. Existing HTTP operations do not acquire webhook or
background-job semantics automatically. Configure persistent queues, supervised
workers, Scheduler, a public HTTPS callback origin and encrypted signing
credentials as described in [Durable Connectors](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DURABLE_CONNECTORS.md).
Run Doctor and verify representative read/write pending, completion, failure,
cancellation and JSON/SSE replay behavior before reopening traffic.

The public chat result may now retain independent verified reads in
`read_answer` alongside a terminal Playbook error. Custom clients must preserve
that error's retry lock and display its status even when read results exist.
The bundled widget does so. See [Public API](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PUBLIC_API.md).

Do not use a code-only rollback or discard active job/receipt state.
Continuation rollback refuses any durable rows, callback rollback refuses
active events, and receipt rollback is intentionally blocked. Restore the
verified database backup and matching package/configuration/key as a unit;
first reconcile any external writes accepted after that backup.

## Historical references to displayed records

This addition uses the existing encrypted `presentation_receipts` column; it
does not require another migration, change deployment hashes, or rewrite old
messages. `chat_turn_presentation_receipts.v1` has optional private
`scope_fingerprint`, `source_question_sha256` and `answer_presentation` members.
The nested proof uses `agent_answer_presentation.v1` and is finalized only at
the normal canonical outcome commit. `chat_turn_execution_evidence.v5` has
optional bounded `historical_sources` diagnostics and historical decision codes.
Public JSON/SSE message shapes and external capability contracts are unchanged.

Existing receipts remain readable for their original recovery purpose. Without
the new displayed-record proof and scope fingerprint they cannot ground a new
historical factual answer. The original question is usable as source metadata
only when its new hash matches. No upgrade job reconstructs facts or ordering
from old prose, summaries, traces or current API results.

Deploy matching readers and writers together. Older package readers may reject
these additional private fields; do not perform a code-only rollback across
unfinished turns with new receipts. Finish or reconcile those turns on the
matching version, and follow the existing verified database/package/config/key
restore procedure when a rollback is necessary. Do not delete or backfill
receipt fields to make an older runtime accept them. Completed canonical
responses remain replayable without rerunning historical selection.

## Curated Connector answers

Connector operations now publish `response.agent_output` (`mapped` or
`response`) and optional `presentation` metadata on their existing
`response.output_mapping` fields. New forms and imported drafts start in mapped
mode. Removing every selected field shares no result values; it does not enable
raw response access. Hidden fields are excluded before the model, repair and
delivered-evidence boundary, including semantic role aliases. Workflow values
remain available under the workflow contract.

No database migration or rewrite of existing revisions is required. Absent
mode/metadata is interpreted without changing the signed payload: an existing
nonempty mapping is curated with summary fields; an empty mapping retains its
previous selected-response exposure. Read-only review can identify that latter
case with `response.output_mapping` empty and `response.agent_output` missing
or `response`. Review those operations before enabling sensitive APIs.

Configure labels, units, standard/detail/hidden visibility and required context
in the operation's Mapping tab, then test and publish a new operation revision.
Publish, test and activate a replacement Agent candidate to use those new pins.
Do not edit historical revisions, rewrite deployment hashes or mutate stored
chat answers. Retain the previous deployment and reviewed draft/export for
rollback through the normal tested release process.

Nonempty mappings that produce no approved values no longer fall back to full
provider data. Explicit null, empty string/list and zero values remain distinct;
mapping no longer silently clips long strings or lists. Oversized model results
use the existing incomplete-evidence boundary. A role alias cannot populate a
different declared mapping field when its own provider path is absent. Invalid
colliding keys, unknown presentation fields and missing/hidden context targets
are rejected rather than interpreted ambiguously.

Positive answer fixtures may use `fields: ["field_key"]` or `detail: "all"` in a
section. Curated scalar selections retain only their declared context rather
than every sibling. Labels, units and localized numeric formatting are server-rendered;
update assertions that expected technical field paths, without weakening value,
identity, permission, source or replay checks. Programmatic callers of the
internal form mapper must use its row-based form state, not the removed
`output_mapping` textarea state; the published JSON contract keeps
`response.output_mapping`.

### Per-operation answer presentation

Mapped Connector operations may now publish the optional, versioned
`response.answer_presentation` policy and exact localized `value_labels` on
visible output fields. Omission keeps the existing automatic behavior without
rewriting the signed contract. The policy can bind a subject, list record title,
layout, localized intro or closing, and bounded allowlisted templates to the
same verified input and output selectors. It cannot be combined with
`agent_output: "response"` because full response mode has no closed semantic
field boundary for those references.

No database migration or historical-revision rewrite is required. To enable a
policy, save and publish a new immutable operation revision, then publish and
test a replacement Agent deployment that pins its exact revision and hash.
Existing revisions without the field remain readable. The literal admitted
visitor input is now included, redacted, in new direct-read evidence identities
so an alias such as a localized product name can be presented while the
canonical value is sent to the API. Existing evidence and presentation receipts
without that optional member remain verifiable; do not backfill them.

This addition changes the closed Connector v3 schema definition. A runtime that
predates this policy can reject a newly published revision even though it can
still read older revisions. Do not perform a code-only downgrade after activating
new pins. Roll back by activating the retained, tested Agent deployment whose
operation revisions match the older package, or restore the verified package,
database, configuration, and encryption key together under the normal rollback
procedure.

## Direct-read answer rendering and source-scoped continuation

Direct-read answers now use a closed evidence-selection document:
`{"language":"de","layout":"auto","sections":[{"evidence_id":"exact-call-evidence-id","pointer":"/data"}]}`.
This is ordinary model JSON; no native structured-output capability or new
provider is required. Only actual delivered `/data` references are accepted;
the optional closed layout enum changes presentation only when the visitor asks.
Knowledge mixed with direct reads may select `/context`. The server renders
verified values with readable labels and record context instead
of accepting factual model prose through word-distance or number heuristics.
No `records`/`items` naming convention is required. Visitor input and public
chat transport remain unchanged. Update positive model test fixtures to select
ledger IDs also present in their execution trace; do not change failing quality
assertions to accept `safe_evidence_fallback`.

An invalid selection permits one output-only repair on the same immutable
Agent deployment, provider, and model. It has no tools, conversation history,
or attachments, a 20-second timeout, and usage stage `agent_answer_repair`.
Failure or a usage-budget refusal preserves the bounded evidence fallback and
available sources, without another API call or a visitor understanding
question. Entire rendered answers include markup and provenance in their
UTF-8 byte budget: `short` 3,000, `balanced` 8,000, `detailed` 16,000, with
visible truncation. Pure conversation and Knowledge answers remain prose;
source identity is not proof of semantic truth. Committed evidence remains
v5 with additive, allowlisted `evidence_guard`/`answer_repair` diagnostics and
no raw model/provider payloads.

The required migration is
`2026_08_30_000006_scope_direct_read_continuations_to_source_messages.php`.
Treat it as an authority change, not a schema change to run under live writers:

1. Quiesce public chat, channel/webhook ingress, Scheduler, and production
   workers; drain or reconcile in-flight work. Take and verify a restorable
   database backup, including schema and data. Preserve the matching package,
   host lockfile/config, and application encryption key.
2. Install the matching package and run `php artisan migrate --force` while
   writers remain stopped. The migration adds `binding_version` with default
   `1`, creates the unique source-message scope, and removes the old broader
   uniqueness constraint. It does not rewrite ciphertext or modify Agent
   deployments.
3. Verify migration status and controlled read/follow-up conversations before
   reopening traffic. New bindings use `binding_version: 2` and include
   `source_message_id` in the conversation/deployment/capability scope. A read
   in the current turn must preserve the prior turn's binding. Different
   targets for the same capability and source create a sticky empty `[]`
   binding; later reads must not select the last target automatically.
4. Run the relevant routing/quality checks and canonical JSON/SSE replay check.
   Require complete expected task coverage and an `answer` decision; a safe
   fallback is not passing release evidence. Resume workers/Scheduler and
   traffic only after the applicable checks pass.

Existing version-1 rows are intentionally not executable: they may have lost
earlier targets under the old uniqueness scope. They remain encrypted and
unchanged until normal TTL cleanup; do not re-sign, convert, or infer missing
targets from them. Fresh successful reads create version-2 authority under
their own source message. Deployment snapshots are not automatically rebuilt;
any intentional changes to published input or response contracts still use the
normal candidate/test/activation path.

There is no automatic `down()` for this migration. Do not collapse source rows,
drop the version column, or use `migrate:rollback` to reintroduce last-target
selection. Rollback requires restoring the verified pre-migration database
schema **and data** together with the matching package release, host config,
and encryption key. Code-only rollback is not a supported recovery procedure.

## Guardrail, result, and channel-delivery hardening

Run the pending package migrations before restarting workers. The additive
`2026_08_30_000005_add_channel_delivery_progress.php` migration adds durable
reply-handoff and Telegram chunk journals to channel delivery events. Reply
snapshots are encrypted; preserve the application key while deliveries are
pending. The migration does not infer receipts for historical sends. A possibly
dispatched message without trustworthy
progress remains unknown and must be reconciled with the provider, not resent
blindly. Provider acceptance is not a delivery/read receipt.

Do not drop the new column to roll back after recording delivery progress:
the down migration refuses to discard that evidence. Restore a verified
pre-migration backup when rollback is necessary. Use an asynchronous production
queue; a synchronous queue returns retryable webhook backpressure when work
must wait instead of acknowledging a retry it cannot schedule.

Guardrail records now require explicit input/output assignment on the Agent.
Publish, test, and activate a replacement Agent release to enable or change
them. Existing unassigned releases retain baseline safety; enabling a policy in
the catalog does not silently apply it globally. Disabling/deleting a policy
does not change already-pinned live releases. Move legacy Rules JSON into the
supported structured checks before publishing an assigned policy.

New Playbook runs capture signed result-field evidence. Result templates select
canonical capability fields rather than exposing literal internal prose; old
checkpoints without evidence retain the safe status fallback. Unknown costs
remain unpriced, not zero. Complete the manual candidate/live, channel retry,
and appearance checks described in the public guides before customer rollout.

## Agent-first runtime cutover

Every chat now requires exactly one hash-verified live Agent deployment.
Ordinary conversation and approved knowledge access need no Playbook. Optional
Playbooks are deployment-pinned process tools and never own the top-level turn.
Former workflow-first routing, live-workflow pointers, runtime modes, starter
workflows, and request-time fallback paths are removed.

The supported release baseline is `v0.16.1`; rehearse this procedure on a
restored copy before the production maintenance window. Keep public chat,
channel/webhook ingress, Scheduler and production queue workers stopped until
the final checks pass. Drain or explicitly reconcile outstanding work before
the backup. Retain restricted operator access for the release steps below.

1. Take and verify a restorable database backup, preserve the matching old
   package and host lockfile/config, and retain any externally stored Knowledge
   files. Inventory unresolved runs and all legacy
   `active_workflow_deployment_id` values, including inactive or soft-deleted
   Agents. No migration decides which customer data or old live behavior may be
   discarded.
2. Install the new package and its required dependencies, merge the config/API
   changes below, and run `php artisan migrate --force` in the closed maintenance
   window **before** trying to publish a candidate. Laravel commits completed
   migrations individually. Earlier cutover checks still apply; resolve any
   earlier failure before proceeding, without marking migrations as completed
   or ignoring their guards.
3. If legacy live pointers remain, the cutover migration,
   `2026_08_30_000004_remove_legacy_workflow_runtime_state.php`, deliberately
   stops with **Agent-first cutover blocked**. This is a safe checkpoint, not a
   completed upgrade. The preceding migrations have already installed the
   candidate pointer, Agent deployment/ChatTurn bindings, immutable Knowledge
   generation fields and signed candidate-quality evidence fields. Confirm
   those preceding entries are completed with `php artisan migrate:status`.
   Keep traffic and production workers closed. If no legacy pointer remains,
   this cutover migration completes on the first run; continue with Agent release
   verification anyway.
4. Rebuild Knowledge sources whose former indexes have no immutable generation
   identity, and review the migrated capability/Playbook contracts. Open each
   Agent that will serve traffic, assign only approved Knowledge, capabilities
   and optional published Playbooks, then choose **Publish candidate**. Run
   **Test release candidate** with representative paths; it uses the persistent
   runtime while blocking productive writes. Run any required candidate-quality
   comparisons again; unsigned historical runs are not passing release evidence.
5. Use **Make candidate live** only after the exact deployment hash, current
   authoring fingerprint and required capability/quality coverage pass the
   existing release gates. Verify a controlled live conversation and its
   run/trace while ingress remains closed. For each old pointer, record the
   verified replacement and only then clear that exact Agent's legacy pointer
   using the host's reviewed data-change procedure. Do not bulk-clear pointers
   or fabricate test evidence to unblock the migration. For inactive/deleted
   Agents, explicitly review restoration or retirement under the host's data
   policy before clearing their pointers.
6. Run `php artisan migrate --force` again. The final cutover now removes the
   retired pointer column, obsolete workflow `is_active` flag, old
   entry-clarification/work-event tables and continuation-clarification rows.
   The subsequent channel-delivery progress and source-scoped direct-read
   continuation migrations then complete normally.
   Verify migration status, then run
   `php artisan filament-agentic-chatbot:doctor` and
   `php artisan agent-graph:doctor`. Reopen traffic and resume workers/Scheduler
   only after all required checks pass.

The retained legacy column during this checkpoint is data awaiting an operator
decision, **not a productive legacy runtime or fallback**. The new runtime still
requires a verified Agent deployment. A stop at any point keeps traffic closed;
rollback means restoring the verified pre-cutover database, matching old package
and host configuration together, not `migrate:rollback`. The final destructive
migration explicitly refuses an in-place `down()`.

The final cutover was moved from its unreleased `2026_08_24_000001_...` filename
so it cannot run ahead of its own candidate-release prerequisites. That old file
was not present in `v0.16.1` or `v0.17.0-rc.1`/`rc.2`. If testing an intermediate
unreleased checkout, inspect host-published migration copies as well: back up
and remove only an obsolete, **unapplied** copy of that package migration before
running the new release. Do not rewrite completed migration history. A database
that already completed the old cutover needs no recreated legacy state.

Public-widget selection now has one stored key: `runtime_config.public_widget.entrypoint`. The irreversible `2026_08_23_000001_cut_over_public_widget_entrypoint.php` migration moves the former `widget.public_entrypoint` flag and removes that alias before productive code starts. Conflicting old and canonical values block the migration instead of choosing one silently.

### Supported-upgrade smoke and recovery evidence

`scripts/smoke/smoke-upgrade.sh` provisions the exact `v0.16.1` baseline using
that local tag's own installer (`vendor:publish`, `migrate`, Doctor). It pins the
tag commit and checks the installed baseline reference; it does not call the
current package installer against a version that never had that command. Keep
the local baseline tag available. Another baseline needs an explicitly reviewed
version-specific contract, not an arbitrary Composer range.

For artifact mode, the requested version must match the metadata of the selected
ZIP. The existing release verifier checks that ZIP and its sidecar first. The
smoke then copies only those verified bytes into a private single-archive
repository; other ZIPs beside the caller's file are never offered to Composer.
SHA256 checks bind both upgrade attempts to that copy. Before application hooks
or migrations, the installed package must match its expected version, exact
local dist URL/SHA1 in both Composer lock and installed metadata, and the full
archive file inventory. Changed, missing or additional installed files block
the smoke. Artifact installation initially disables Composer scripts; discovery
runs only after this verification. Checkout mode does not claim this immutable
release-artifact proof.

The smoke requires PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`,
`createdb`) in addition to PHP, Composer and Git. It backs up its newly created
baseline database and copies the matching baseline app/package before the
upgrade. Recovery restores that dump into a separately named **new** throwaway
database, verifies a synthetic data marker and exact migration history, binds
the copied baseline app to that database, and runs Doctor before re-applying
the same release artifact. An existing database is never cleaned or dropped;
backup/restore or verification errors stop the smoke immediately.

The pinned baseline installer protects its initial PostgreSQL target by issuing
an unconditional `CREATE DATABASE` and stopping on failure before package
migrations. The wrapper's later database-name check protects backup/restore
selection; it is not a pre-installation guard. The offline fixture separately
checks an already-existing baseline target and post-install configuration drift.

Keep the private run directory private: its app copies include generated config
and database connection settings. `--cleanup-on-success` removes only that run's
apps/backups; both generated databases are retained and named in the output.
This gate covers baseline schema installation, forward upgrade and synthetic
backup recovery. Customer-specific live pointers, unresolved work, external
Knowledge files and live providers still need the staging rehearsal above.
An offline process-contract test does not replace the real PostgreSQL/exact-
artifact release job.

## Public API cutover

- `FilamentAgenticChatbotPlugin::contentExtractor()`, `textChunker()`, and
  `sourceUrlResolver()` were removed. Bind `ExtractsContent`, `ChunksText`, and
  `ResolvesSourceUrls` in the host application's service provider.
- Capability discovery classes and custom workflow actions now use one
  `CapabilityProvider` implementation tagged with `CapabilityProvider::class`.
  The former registry tag, `capabilities.discovery.providers`, and
  `workflow.actions` extension paths are not public.
- Every `CapabilityActionDefinition` must now provide a non-empty
  `resultSchema` in addition to `requestSchema`. Add a schema matching the
  handler's exact return value; registration fails before chat traffic when
  either contract is missing.
- The legacy `/filament-agentic-chatbot/widget.js` and canonical route aliases
  were removed. Use the named `filament-agentic-chatbot.widget.script` route.
- The complete supported host surface is listed in `docs/PUBLIC_API.md`.

## Configuration cutover

Republish `config/filament-agentic-chatbot.php` and carry forward only the
`config_keys` allowlisted in `docs/PUBLIC_API.md`. Runtime schemas,
dictionaries, planner topology, Eloquent model aliases, `workflow.actions`,
and `workflow.action_schemas` are internal or removed; values copied from an
older published file are ignored. Run
`php artisan filament-agentic-chatbot:doctor` after the update—Doctor fails and
prints an exact instruction for every removed key it detects.

Rename every `AGENTIC_WORKFLOW_GENERATION_*` variable to the matching
`AGENTIC_CHATBOT_WORKFLOW_GENERATION_*` name. Remove the old workflow-turn
planner and write-safety relaxation variables; turn-planner topology and the
write confirmation/schema/integrity baseline are no longer configurable.

Production now defaults Data Resource administration and Filament side-effect reconciliation to strict Gate mode. Register `filament-agentic-chatbot.view-data-resources`, `filament-agentic-chatbot.manage-data-resources`, and `filament-agentic-chatbot.reconcile-side-effects` before operators use those screens. Local and testing environments retain the authenticated-panel-user setup path. Doctor fails production when either surface is relaxed without a registered Gate.

The installer no longer accepts the ambiguous `--force` option. Use
`--force-config` only when you intentionally want to overwrite the host's
published package config, and use `--force-migrations` only when a production
deployment is authorized to run pending migrations. Automated production
installers that previously passed `--force` must choose one or both explicit
options; the legacy flag now exits before setup performs any work.

The built-in `query_data_resource` capability result contract is version 2. It removes the concrete `scope_filters_applied` object without adding replacement scope metadata. Republish workflows that use Data Resources so their immutable capability binding pins version 2; do not add a compatibility field carrying scope names or values. Treat this as a maintenance-window cutover: Doctor fails and inventories active deployments that still pin an obsolete action contract.

Data Resource query contracts are now version 3 and pin an estimated-row budget plus a cross-driver statement timeout. Run the package migrations to add `agentic_data_resources.query_safety`, review **Allow text search** and **Database query budget** for every UI-managed resource, then republish workflows that bind those resources. Doctor fails when the migration is missing, an active deployment still pins a stale Data Resource hash, or an active production resource uses a database without supported plan/timeout budgets, so run it before reopening chat traffic. The runtime now rejects PostgreSQL/MySQL/MariaDB plans above that budget before execution; SQLite is limited to local/testing Data Resource queries.

## AgentGraph 0.16.2 stable runtime

Current source builds require the exact stable `heiner/agent-graph:0.16.2` release:

```bash
composer update heiner/agent-graph heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

Run all pending package and AgentGraph migrations before reopening traffic. Resume acceptance is recoverable across process loss, queued frontiers can be redriven after dispatch loss, and SDK cancellation atomically resolves a pending interrupt. Remove any application-level best-effort interrupt cleanup performed after `AgentGraphManager::cancel()`; duplicate resolution is no longer part of the integration contract.

The package pins AgentGraph `0.16.2`. Artifacts compiled against another AgentGraph release remain inspectable but are not executable under the current stable contract. Recompile and republish affected Playbooks, then publish and verify replacement Agent deployments before reopening traffic. The plugin Doctor treats `AgentGraphManager::recover()` as required SDK surface.

## Current release status

The current Commercial Early Access target is **`v0.18.0`**. **Release status:** Approved. Only the local exact-source and exact-artifact release authority may publish its buyer-visible artifact.

The public line still starts at `v0.9.0-beta.1`. No stable `v1.0` release exists yet. Read [CHANGELOG.md](CHANGELOG.md) and this `UPGRADING.md` before upgrading.

> The git tag `v0.12.0` points to an early preview commit. The `v0.17.0`, `v0.17.1`, and `v0.17.3` source tags were not promoted to buyer-visible releases. Continue installing `^0.17` until the locally verified `v0.18.0` release is published.

When upgrading, always:

1. Read the [CHANGELOG.md](CHANGELOG.md) for breaking changes.
2. Follow the backup and maintenance procedure above before changing the package
   or database; preserve the old package/configuration for recovery.
3. Run `php artisan migrate` and resolve its documented checkpoints, then run
   `php artisan filament-agentic-chatbot:doctor` to verify the upgraded environment.
4. Clear caches: `php artisan config:clear && php artisan view:clear && php artisan route:clear`.
5. Re-publish config if needed: `php artisan vendor:publish --tag=filament-agentic-chatbot-config`.

---

## Upgrading to v0.18.0

Version 0.18.0 adds structured Widget conversation starters, a permission-checked read-only Playbook viewer, and responsive Widget and Playbook Builder improvements. It does not add a database migration, change Composer dependencies, or change the productive Agent or Playbook deployment ABI.

Existing Bot settings that still contain `quick_prompts` are normalized in memory and remain usable. The next administrator save persists the structured representation. Custom widget clients must read `conversation_starters` instead of `quick_prompts`. Each starter contains a short `label`, the exact `prompt` submitted as the visitor message, and an optional safe `icon` key.

Host-defined Solution Kits must replace string prompts:

```php
'conversation_starters' => [
    [
        'label' => 'Track an order',
        'prompt' => 'Where is my order?',
        'icon' => 'search',
    ],
],
```

The built-in Customer Support and Human Handoff Kit advances from `1.0.0` to `1.1.0`. Existing installed authoring state is not modified automatically. Review the Kit upgrade plan before applying the newer definition.

No new Agent or Playbook is required solely for this upgrade. After installation, clear caches, refresh Filament assets, run both Doctor commands, and verify the public Widget plus the Playbook viewer in the real host application.

```bash
composer update heiner/filament-agentic-chatbot:^0.18 --with-all-dependencies
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan filament:assets
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

---

## Upgrading to v0.17.5

Version 0.17.5 has no database migration, configuration key, dependency change, or Playbook republish requirement. It deterministically resumes short, unambiguous whole-message answers to active text and choice waitpoints before model dispatch. Questions, cancellation, conditions, uncertainty, quoted or multiline input, mixed statements, approvals, forms, and operator reviews retain their existing guarded paths.

Run both Doctor commands and repeat saved candidate tests for each live Playbook waitpoint path before activation. An admitted standalone answer no longer requires a provider call, but the complete Playbook still requires its normal capability, policy, and failure-path verification.

```bash
composer update heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

---

## Unreleased: scheduled quality and Knowledge Operations

Run `php artisan migrate` before enabling scheduled quality operations. The
`2026_08_29_000002_build_quality_operations.php` migration adds automation
claims and cadence to saved quality scenarios plus encrypted knowledge-gap and
immutable occurrence ledgers. Existing scenarios remain manual; old
conversations are not guessed into gaps.

Republish or merge the `quality_operations` config. Production must run Laravel
Scheduler and an asynchronous queue worker. Automation deliberately reuses the
existing Agent/provider credential chain; do not create a second API key for
the scheduler. Start with both commands in `--dry-run`, enable cadence on one
non-blocking Published Agent regression, and verify its persisted run before
enabling more scenarios. See [Quality Operations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUALITY_OPERATIONS.md).

---

## Unreleased: evidence-backed conversation outcomes

Run `php artisan migrate` before deploying this build. The
`2026_08_28_000001_create_bot_conversation_outcomes_table.php` migration adds an
idempotent business-outcome ledger with encrypted evidence references and
immutable Agent/Playbook attribution.

Existing conversations are intentionally not backfilled or classified by an
LLM. Analytics starts empty and becomes authoritative as verified events arrive.
New human-handoff requests record a handoff outcome automatically. Hosts may
record CRM, commerce, scheduling, ticketing, or other verified results through
the public `RecordsConversationOutcomes` contract documented in
[Public API](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PUBLIC_API.md#evidence-backed-business-outcomes). Use a stable
source idempotency key and never pass visitor- or model-authored success claims
through that trusted boundary.

After migration, verify one automatic handoff, one operator-recorded outcome,
and one idempotent host retry in staging. Conversation-history deletion may
retain and detach these business records under the host retention policy; its
disclosure now includes the `business_outcomes` category.

---

## Unreleased: app-aware Solution Kits

Run `php artisan migrate` before operators use **Use Solution Kit**. The
`2026_08_28_000002_create_agent_solution_kit_installations_table.php` migration
adds immutable, actor-attributed installation evidence and one-to-one Agent
ownership.

No existing Agent is modified or backfilled. A Kit installation creates a new
inactive Agent, unpublished Playbook drafts, and saved quality scenarios in one
transaction. It does not publish or activate deployments. After installation,
follow the Kit release path in Agent Overview and retain the existing **Publish
candidate**, **Test release candidate**, and **Make candidate live** separation.

Hosts that register custom Kits must implement and tag the public
`SolutionKitProvider` contract. Definitions are strict: every Playbook needs an
active blocking current-draft test, write-capable Kits require explicit
installation approval, credentials are forbidden, and full workflow validation
runs before mutation. See [Solution Kits](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SOLUTION_KITS.md).

---

## Unreleased: Integration Studio

Run `php artisan migrate` before operators use **Import integration**. The
`2026_08_28_000003_create_integration_studio_installations.php` migration adds
optional synthetic test-input suggestions to operation drafts and creates the
immutable, actor-attributed Integration Studio installation ledger.

No existing Connector or Operation is modified or backfilled. Importing
OpenAPI, Postman, or cURL creates only inactive, untested, unpublished drafts in
one transaction and does not contact the external service. Review each draft,
complete write-integrity/result-identity policy, run the governed test path,
and publish an immutable revision explicitly.

The optional metadata assistant uses an already configured central AI provider
key; do not add a second wizard-specific secret store. The imported service's
credential remains a separate encrypted Connector value. See [Integration
Studio](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/INTEGRATION_STUDIO.md).

---

## Unreleased: production Handoff Desk

Run `php artisan migrate` before reopening chat traffic. The
`2026_08_29_000001_build_production_handoff_desk.php` migration maps legacy
`pending` requests to `waiting_operator`, adds public IDs, teams, optimistic
state versions, business-hour SLA timestamps, and the immutable encrypted
activity ledger. It also enforces one active handoff per conversation at the
database layer. If old data contains competing active requests, migration stops
and lists the affected conversation IDs; resolve that data deliberately rather
than deleting or merging it automatically.

Republish the package config and review `bot_handoff_requests.desk`: default
team, timezone, staffed hours, priority SLAs, optional team overrides, widget
poll interval, and optional default assignee. Keep provider/API secrets in their
existing central configuration; the desk adds no AI key.

Before rollout, register the handoff view/manage Gates, verify their SQL scope
for tenant-aware hosts, and exercise this sequence in staging: create, claim,
internal note, customer-visible reply, customer follow-up, stale-version
conflict, exact retry, resolve, and explicit return-to-Agent. For Telegram or
Slack, also verify the existing channel-thread binding and queued delivery.
Active handoffs now block conversation-history deletion; include completed
handoff activity in the host support/audit retention decision.

---

## Unreleased: fail-closed channel availability

Telegram remains available by default. Slack has completed its real-provider
acceptance but remains an explicit deployment opt-in. WhatsApp Cloud API,
Mailtrap Email, and Mailgun Email are absent from the Filament setup wizard and
rejected at the runtime and webhook boundaries unless their provider-specific
flags are enabled:

```env
AGENTIC_CHATBOT_CHANNELS_SLACK_ENABLED=false
AGENTIC_CHATBOT_CHANNELS_WHATSAPP_ENABLED=false
AGENTIC_CHATBOT_CHANNELS_MAILTRAP_ENABLED=false
AGENTIC_CHATBOT_CHANNELS_MAILGUN_ENABLED=false
```

Merge the new `channels.slack.enabled`, `channels.whatsapp.enabled`,
`channels.email.providers.mailtrap.enabled`, and
`channels.email.providers.mailgun.enabled` keys into published configuration.
The old broad `AGENTIC_CHATBOT_CHANNELS_EMAIL_ENABLED` switch is removed so one
email provider cannot accidentally expose the other. Existing connection records
are retained, but a disabled provider cannot be diagnosed, test-sent, activated,
or executed. Enable an unaccepted provider only in its dedicated acceptance
environment; mocked provider tests do not constitute live-provider evidence.

---

## Unreleased: secure multimodal channels

Run `php artisan migrate` before enabling attachments. The
`2026_08_29_000003_create_bot_message_attachments.php` migration creates the
canonical private Chat Turn attachment ledger. The follow-up
`2026_08_29_000004_create_channel_inbound_attachments.php` migration creates a
short-lived durable ingress ledger so Mailtrap downloads and Mailgun multipart
uploads survive queue dispatch without placing bytes, disk names, or storage
paths in the job payload.
Existing channel connections, conversations, and messages are not backfilled.

Republish or merge the `channels.whatsapp`, `channels.email.providers`, and attachment
retention settings. The existing Agent/provider AI key remains authoritative;
do not create a channel-specific AI key. WhatsApp, Mailtrap, and Mailgun require
their own encrypted delivery-provider credentials. For every file-enabled
channel, verify that `AGENTIC_CHATBOT_ATTACHMENTS_DISK` is private and writable
by both web and queue workers, keep Laravel Scheduler running, and exercise the
`filament-agentic-chatbot:prune-channel-inbound-attachments --dry-run` probe.

Telegram photos/documents, Slack files, WhatsApp images/documents, Mailtrap
downloads, and Mailgun attachments now cross the canonical chat-attachment validation, model-capability,
durable-turn, storage, and budget path. Re-run **Diagnostics** and test one real
file through each enabled provider. WhatsApp uses Meta App Secret signatures and
a separate Verify Token. Mailtrap uses two provider-issued webhook signing
secrets; Mailgun uses its Webhook Signing Key, not its API key.
See [Channel Integrations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHANNELS.md).

---

## Upgrading to v0.17.4

Version 0.17.4 has no database migration or dependency change. It makes each Data Resource tool state the exact argument names from its immutable deployment, including `sort_by` for current deployments and `sort_field` for compatible older pins. An undeclared alias remains blocked before execution; the model may correct only the same proposal using the exact published schema.

Run both Doctor commands and repeat the saved candidate tests that exercise Data Resources. Existing live deployments remain immutable and do not need to be republished solely for this patch.

```bash
composer update heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

The `v0.17.3` source tag was not promoted to an immutable GitHub release because its protected native Gemini routing gate correctly blocked an undeclared sort alias. Install `^0.17` to select the latest verified patch.

## Upgrading to v0.17.3

Version 0.17.3 requires Laravel AI `^0.11.2` and AgentGraph `0.16.2`. It fixes Gemini multi-step tool completion by preserving provider continuation state, including thought signatures, while keeping Connector recovery exact and fail closed. It adds no plugin database migration.

Treat the dependency update as a maintenance-window cutover because productive Playbook artifacts pin the exact AgentGraph release. Stop queue workers and schedulers, back up the package and AgentGraph stores, update both packages together, run migrations and both Doctor commands, then recompile and republish every live Playbook and its Agent candidate before reopening traffic. Candidate tests must exercise the exact Knowledge, Data Resource, Connector, and Playbook routes that the Agent exposes.

```bash
composer update heiner/filament-agentic-chatbot heiner/agent-graph laravel/ai --with-all-dependencies
php artisan migrate --force
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

Laravel AI's own tool-approval continuation is not a productive authorization path in this plugin. Do not replace AgentGraph approval interrupts or capability-gateway confirmation with SDK approval decisions.

## Upgrading to v0.17.2

Version 0.17.2 has no database, configuration, or productive runtime behavior delta from the 0.17.1 source tag. It corrects the protected live-provider gate so the documented deterministic evidence fallback is accepted only when every expected read succeeded, the evidence guard reports a repairable response-contract failure, and the single tool-free repair attempt was rejected. It also recognizes one exact fail-closed Data Resource grounding rejection without treating it as an executed read, and counts only successful executions when validating contextual follow-up inputs. Replays remain separately bounded to unique successful same-turn evidence. Partial evidence, unexpected productive capabilities, repeated proposal or replay loops, unsafe fallback reasons, and incomplete rendered answers remain release failures.

If you installed a 0.17.0 or 0.17.1 source tag, update to `^0.17`, run both Doctor commands, and then continue with the complete v0.17.0 cutover guide below.

```bash
composer update heiner/filament-agentic-chatbot heiner/agent-graph --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

## Upgrading to v0.17.1

Version 0.17.1 has no database, configuration, or runtime behavior delta from the 0.17.0 source tag. It corrects the protected live-provider assurance contract so one immutable replay is accepted for each distinct successful fanout item. Repeated replay loops remain a release failure.

The `v0.17.1` source tag was not promoted to an immutable GitHub release. Install `^0.17` to receive the latest verified patch, run both Doctor commands, and then continue with the complete v0.17.0 cutover guide below.

```bash
composer update heiner/filament-agentic-chatbot heiner/agent-graph --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

## Upgrading to v0.17.0

### Tokenless browser widget bootstrap

Republish or recopy every browser embed snippet. The loader no longer reads `data-token`; a static token in markup would expire and make a long-lived page fail. Current snippets contain only the public bot and presentation configuration. At runtime the loader calls the origin-checked widget bootstrap endpoint, holds its short-lived token in memory, and renews it before expiration.

Before reopening public widget traffic:

1. add every intended production browser host to each bot's Allowed Domains (an empty production allowlist now blocks bootstrap);
2. set a dedicated `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`;
3. remove `data-token` from custom snippets and SDK mount options;
4. allow `POST /api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap` through proxies/WAFs; and
5. monitor its independent rate limits and `429` responses.

The browser automatically retries only GET-based config, history, and exact-turn reads after renewal. It never automatically repeats chat sends or other writes.

### Authorized Turn Plan and API Connector v3 cutover

This cutover is irreversible and removes the productive Compound Request
subsystem. Back up the database and use a maintenance window:

```bash
php artisan down
php artisan migrate
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

`2026_07_28_000002_cut_over_authorized_turn_plans_and_connector_v3.php`:

- upgrades every non-empty API operation draft to connector contract version 3;
- creates a new immutable v3 revision for each published operation and moves
  the operation's published pointer to it;
- derives a closed literal/enum admission policy per public input, preserves
  declared result identity, and converts legacy batch metadata to bounded
  `batch_mode`;
- clears live pointers to deployments containing removed `compoundRequest`,
  `apiConnector`, or `loop` runtime nodes and cancels their active runs;
- removes `runtime_config.compound_requests`; and
- drops Compound Request tables and the obsolete side-effect foreign key.

Before reopening traffic, inspect every retired workflow, replace `loop` with
`batchMap`, bind API steps to exact published v3 revisions, test the draft, and
republish the workflow. Do not reintroduce an adapter for the old node or
connector contract. Database rollback requires restoring the pre-upgrade
database and application together.

Connector input aliases, normalization, ambiguity rules, and result-identity
checks now belong in the published operation contract. API-specific planner
branches are unsupported. An Agent may satisfy several independent read
objectives with separate calls from its closed deployment tool manifest. Each
call is authorized and bounded independently. Ordered, dependent,
interruptible, or write-bearing work belongs in an explicitly published
Playbook.

### Breaking runtime cleanup

This is a deliberately breaking cleanup. Before deploying it, back up the database, rotate every active Bot Access Token created before HMAC hash version 2 from **Connect > Bot Access Tokens**, and verify the replacement token in each server integration. Plaintext tokens are not recoverable from old hashes, so the migration revokes any still-active token whose `token_hash_version` is missing or not `2`.

Use a maintenance window and deploy in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

The irreversible `2026_07_15_000002_migrate_breaking_runtime_cleanup_data.php` migration performs the durable-data cleanup before old readers disappear. It moves conversation-local workflow memory into `workflow_memories`, moves historical run snapshots into `workflow_runs.workflow_snapshot`, revokes unsupported token hashes, and cancels non-executable legacy planning records. If any prerequisite table or column is missing, the migration fails with an explicit ordering error.

Public configuration and API changes:

| Before | After |
| --- | --- |
| `RAG_*` environment aliases | matching `AGENTIC_CHATBOT_*` variables only |
| runtime-mode environment variables and Bot `product_mode` values | removed; one Agent-first runtime with optional Playbooks |
| fine-grained runtime enable/engine switches | removed; the verified deployment contract owns executable behavior |
| AgentGraph `workflow_node_id` / `workflow_node_type` metadata | SDK `nodeMeta` only |
| SHA-256 Bot Access Token lookup | HMAC-SHA256 hash version 2 only; rotate before upgrade or the migration revokes it |
| conversation-meta workflow memory | canonical `workflow_memories` rows |
| `WorkflowRun.meta.__workflow_snapshot` | `workflow_runs.workflow_snapshot` |
| workflow-first planning/interpreter configuration | removed; the Agent interprets the turn and may invoke only deployment-pinned Playbooks and capabilities |

Prompt-JSON structured output remains available only for provider profiles that declare that transport capability. It is an external provider-format adapter and never grants routing, policy, or execution authority. The local release matrix continues to test native structured tools, prompt-JSON tools, and restricted no-tools profiles.

After migration, clear cached configuration and run the Doctor again. Old environment names, per-bot modes, and engine switches are ignored rather than translated at request time. An Agent without one verified live deployment fails closed.

### Canonical API Connector operation cutover

The unreleased API Connector architecture is deliberately breaking. Back up the database, confirm the production `APP_KEY`, and rehearse the complete migration on a production-shaped staging copy before the maintenance window. The cutover has no `down()` implementation; rollback means restoring both the pre-upgrade application and database.

Run the release in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

`2026_07_15_000003_cut_over_api_connector_operation_contracts.php` builds the one `filament-agentic-chatbot.connector-operation` version `2` draft, creates immutable published revisions where needed, assigns published pointers, upgrades compatible API-operation conflict checks to exact revision/hash references, verifies hashes, and drops legacy operation/revision fields. It aborts on invalid JSON or shape, missing or mismatched parents, ambiguous/unresolvable conflict operations, and incompatible scopes. It does not silently select a target or leave a supported lossy contract. Fix the pre-cutover source data and retry the rehearsed migration.

The version-2 contract now closes every server-owned nested object, not only the document root and `auth`. Unknown request/response/effect/execution, retry, metadata/capability, or write-integrity fields are invalid. Request/response payload schemas are closed to the constraints the runtime enforces; provider templates, mappings, and registered strategy policy objects remain extensible. Static credentials in serialized bodies, schema value keywords or annotations, capability presentation, or extensible policies block draft persistence, publication, and cutover. Capability metadata is reconstructed from the operation record, so remove any application code that stored custom or credential-bearing values below `metadata`; keep secrets in encrypted connector authentication configuration instead.

Base URLs must now be absolute HTTP(S) URLs without userinfo, query, fragment, or surrounding whitespace before the model can save. Move fixed query values into operation `query_params`/`query_pairs`; keep provider credentials in encrypted connector authentication. The cutover aborts on structurally unsafe legacy base URLs without echoing their value. Custom authentication can no longer replace a server-generated provider idempotency header: unsafe write retries and continuation requests require the exact server-attested header/key pair after authentication.

The follow-up migrations are also required:

- `2026_07_15_000004_create_api_connector_continuations_table.php` creates the encrypted, leased, bounded continuation journal. It is not a queue or scheduler; polling and pagination remain inside the owning connector invocation, while AgentGraph retains workflow wait/resume authority.
- `2026_07_15_000005_create_api_connector_operation_test_runs_table.php` stores bounded draft/published test evidence without making a draft productively executable.
- `2026_07_15_000006_harden_side_effect_execution_journal.php` encrypts side-effect request, result, and metadata payloads, clears the legacy plaintext JSON columns, and adds hashed lease-token fencing.

Public contract and configuration changes:

| Before | After |
| --- | --- |
| Mutable operation columns or a V1 adapter | one canonical draft plus immutable version-2 revisions |
| Workflow/deployment operation snapshot | exact `apiOperationRevisionId` + `apiOperationContractHash` + `apiOperationInputSchemaHash` + server-generated `environmentBinding`; runtime re-resolves and materializes the revision at every dispatch |
| planner/tool metadata at `metadata.label`, `description`, or `intent_examples` | `metadata.capability.label`, `.description`, and `.intent_examples` |
| provider JSON or legacy success/error projection | one `filament-agentic-chatbot.connector-result` version `2` envelope for every consumer |
| raw `compound_requests.api_connectors.capabilities` definitions | removed; publish connector v3 input/capability metadata and bind the exact revision in a workflow |
| `AGENTIC_CHATBOT_GOOGLE_CALENDAR_COMPOUND_CAPABILITY_ENABLED` | no replacement flag; publish the operation and allow its generated `api_operation_<operation-id>` key |
| owner identity from input, model output, workflow variables, or persisted plans | transient server-attested runtime authority only; missing/mismatched authority fails closed |

Legacy workflow nodes and immutable deployments are not silently rewritten. For every affected node, select the published operation revision and republish the workflow. The node stores the exact revision ID, full contract hash, closed input-schema hash, server-generated environment binding, and flow-owned input mapping/output/failure settings. HTTP method, executable URL, headers, credentials, retry, response mapping, and write policy come only from the verified revision. Old `__operationSnapshot` data and executable node overrides are not authority.

The API Connector edit page now inventories these persisted references without compiling workflows. Legacy `connectorId` nodes are listed as **Migration required** instead of breaking connector administration, but they are never executed or treated as valid pins. Create or publish the intended operation, select its immutable revision in each listed workflow, test the draft, and republish. The read-only legacy diagnostic is removed only after the upgrade inventory reaches zero unpinned references.

Every write operation must require confirmation and declare an explicit integrity mode, scope, and typed canonical `input.*` business identity when duplicates are not allowed. Unknown or expired writes are never automatically reclaimed or retried. Verify the provider outcome out of band, then use `php artisan filament-agentic-chatbot:reconcile-side-effect <id> --outcome=succeeded|failed --force --reason="..." --operator="..."`; reconciliation records the result and never dispatches the write.

For the supported Google Calendar example, provide OAuth values through `AGENTIC_CHATBOT_GOOGLE_CALENDAR_CLIENT_ID`, `AGENTIC_CHATBOT_GOOGLE_CALENDAR_CLIENT_SECRET`, and `AGENTIC_CHATBOT_GOOGLE_CALENDAR_REFRESH_TOKEN` (or the optional access-token variable), then run:

```bash
php artisan filament-agentic-chatbot:setup-google-calendar-connector \
  --bot=<bot-public-id> \
  --calendar=primary \
  --prompt-secrets
```

The command creates or updates the OAuth connector and publishes the canonical confirmation-required `create_google_calendar_event` operation. Before customer traffic, verify a read success, confirmed write, provider error, partial result, owner-scope denial, stale pin, `unknown` write, and operator reconciliation path in staging. See [API Connectors](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md).

### Calibrated retrieval strategy and versioned indexes

Retrieval now uses one explicit `vector`, `hybrid`, or `lexical_only` strategy and returns typed evidence/status contracts. The old `vector.chroma.allow_threshold_bypass` and `retrieval.hybrid.lexical_strategy` compatibility settings are removed. Merge the new `retrieval` config block, run migrations to create the PostgreSQL lexical GIN index, and re-ingest all sources so chunks receive the active `retrieval.index_version` plus embedding provider/model/dimensions. Unstamped or incompatible chunks fail closed by design.

Production defaults use vector-only retrieval. Hybrid and lexical-only installs must select a named calibration profile and run:

```bash
composer eval:retrieval-quality
```

The shipped `de_en_v1` profile is tied to `evals/retrieval/de_en_v1.php`; do not reuse its thresholds as universal lexical weights for a different corpus. PostgreSQL FTS has a candidate limit, transaction-local statement timeout, and required index. `simple_like` now requires an explicit index declaration or bounded small-dataset opt-in. The optional reranker is disabled until a provider/model with verified reranking capability and explicit candidate/input-token budgets is configured.

Retrieval context now consumes the G19 token budget, not a character limit. Traces record only a query fingerprint plus strategy/index/stage metadata. If retrieval is attempted but evidence is insufficient, the assistant and response composer abstain instead of presenting a model-generated answer as grounded.

### Token-aware pure context compilation

Runtime V2 context budgets now use model-relevant tokens instead of characters. If the host publishes the package config or sets context-budget environment variables, replace `RUNTIME_V2_CONTEXT_*_CHARACTERS` with the corresponding `RUNTIME_V2_CONTEXT_*_TOKENS` values and merge the new `runtime.v2.context_pack.total_tokens` / `lane_tokens` config. The old character keys are not a second fallback budget path.

### API connector auth and policy services

`ApiConnector` no longer exposes runtime authentication, HTTP, header/URL policy, or credential-form helpers. Replace direct model helper calls with `ConnectorCredentialService`, or with `ConnectorAccessPolicy` plus `ConnectorDefinition::fromConnector($connector)`. Use `ConnectorCredentials::fromConnector($connector)` only when an integration explicitly needs credential values; its debug and serialized forms are redacted.

This is a PHP API migration only; no database migration is required. OAuth refresh now uses a per-connector/owner single-flight lock, compares the current credential fingerprint before write, and stores access-token plus refresh-token rotation atomically. Automatic OAuth refresh does not advance the environment binding. Operator changes to authentication configuration/credentials or default headers do advance the binding version; with the default `requires_republish` policy, republish affected workflows. Even under `allow_without_republish`, the new secret-free binding hash/version changes the request-authority fingerprint, so an earlier confirmation or side-effect grant cannot authorize the changed environment.

Update connector request configuration through eventful model/service writes. Those writes use an optimistic binding-version compare-and-set and reject stale editors. Direct query-builder updates and `saveQuietly()` are unsupported for connector configuration; the internally row-locked automatic OAuth token refresh is the sole intentional quiet credential write.

Multipart request artifact references now require a valid `sha256` value. Existing integrations that supplied only `disk` and `path` must calculate and include the digest before planning; dispatch rechecks the exact bytes and fails closed if they changed.

### Deployment-only workflow runtime cutover

Published workflows now execute only from an immutable `AgentWorkflowDeployment`. The runtime no longer compiles `agent_workflows.workflow_data`, selects the latest deployment implicitly, writes new snapshots into run metadata, or resumes a snapshotless historical run against the current live graph.

Use a maintenance window and run the cutover in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan up
```

The materialization command is the only compatibility bridge. It creates immutable artifacts for existing workflow versions and sets each published workflow's concrete `active_deployment_id`. The dry run performs the same contract validation inside a rolled-back transaction, and the real cutover is atomic: one invalid legacy version reports its workflow/version context and leaves no partial upgrade state. The command is never invoked by a chat request. Active workflows with a missing pointer, missing artifact, corrupt hash, or incomplete `workflow_runs` deployment columns fail closed with an operator-facing diagnostic.

New workflow runs persist `agent_workflow_deployment_id`, `deployment_hash`, `runtime_schema_version`, and `workflow_snapshot`. Rollback selects the exact existing historical deployment hash atomically; it does not recompile the old authoring payload. Editor draft tests and trace replays use separately identified immutable `editor_preview` deployments and never change the live deployment pointer.

Sub-workflow nodes are also deployment-bound after `2026_07_12_000002_pin_subworkflow_deployments.php`. Republish or rerun the materialization command after migrating: each parent artifact records the exact direct and transitive child deployment IDs/hashes, includes the sorted closure in its own hash, and protects referenced child artifacts from deletion. Runtime compilation never resolves a newer child workflow implicitly.

`2026_07_12_000003_add_subworkflow_dependency_contracts.php` completes that boundary with hashed input/output schemas and mappings. Parent manifests aggregate namespaced child capabilities, write effects, confirmation requirements, and policy metadata; Runtime V2 grants identify both the parent and effective child deployment. Child state is isolated by default and only declared output mappings cross back into the parent. Parent publication fails if a transitive child write has no complete payload schema. Run the materialization command again after this migration so existing parent deployments receive the complete contract closure.

Playbook execution remains deployment-only, but fresh chat turns enter the
Agent deployment rather than a Playbook. No request-time setting can enable a
deploymentless answer, a mutable draft, a global tool, or an unpinned Playbook.
The Agent interprets conversation; deterministic contracts authorize tools and
AgentGraph owns any invoked Playbook run.

The workflow runtime now validates `date` inputs and `date` validation rules as canonical `YYYY-MM-DD` only. If a workflow currently expects natural-language dates such as "tomorrow", "next Friday", or locale-specific date strings, normalize them with semantic extraction or a transform step before they reach deterministic validation.

Money validation is available as a validation rule (`money`, `money:EUR`, `money:USD`, `money:GBP`) rather than as a separate `inputType`.

Data Resource identity scopes are now fail-closed and request-attested. Remove `actor`, `tenant`, `token`, and `conversation` values from `data_resources.scope_values` and bot `runtime_config.data_resources.scope_values`; those reserved namespaces are intentionally ignored. Authenticated actor and Bot Access Token context is attached automatically. Tenant-aware hosts must set `RuntimeAuthorityContextFactory::TENANT_REQUEST_ATTRIBUTE` from trusted Laravel middleware on every chat/resume request. Do not copy tenant or identity values from request input, model output, workflow variables, or checkpoints. Also verify any custom Eloquent `$appends` assumptions: Data Resource results now contain only fields in the resolved select allow-list.

A new migration is required. `2026_07_09_000001_create_bot_chat_turns_table.php` adds the durable chat-turn ledger used for per-conversation serialization, workflow/deployment pinning, request idempotency, unknown-outcome protection, and exact JSON/SSE response replay. Run `php artisan migrate` before directing chat traffic to the upgraded application; the new runtime intentionally fails rather than silently executing without its ledger.

The follow-up migration `2026_07_09_000002_add_reconciliation_to_bot_chat_turns_table.php` adds explicit operator reconciliation fields for installations that already ran an earlier development build of the ledger migration. If the doctor reports an unknown or expired chat turn, verify its external outcome first, then use `php artisan filament-agentic-chatbot:reconcile-chat-turn <id> --force --reason="..." --operator="..."`. The command only abandons and unlocks the turn; it never retries it. See [Operations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md#durable-chat-turn-reconciliation).

`2026_07_09_000003_encrypt_api_connector_default_headers.php` encrypts existing API Connector default headers with the Laravel `APP_KEY`; back up the database and confirm the production key before migrating. Its earlier named-operation snapshot behavior is superseded by the canonical operation cutover above: current productive execution uses exact immutable revision, full-contract, input-schema, and environment pins and re-resolves the revision at dispatch. Republish a workflow intentionally after publishing a replacement operation revision; connector credentials and other connector-level secrets remain live encrypted configuration.

`2026_07_09_000004_add_reconciliation_to_bot_side_effect_executions_table.php` adds the audited outcome fields required for ambiguous external writes. When doctor reports an unknown side effect, verify the provider result out of band and run `php artisan filament-agentic-chatbot:reconcile-side-effect <id> --outcome=succeeded|failed --force --reason="..." --operator="..."`. This records the verified outcome and never dispatches the write again.

Top-level compound execution has been removed. Express multi-step work through published workflow steps and their explicit capability contracts.

API clients should send a stable `client_turn_id` in the JSON body or an `Idempotency-Key` header and reuse it only when retrying the same request. The server generates an ID when omitted, but a caller cannot receive retry deduplication unless it reuses the returned `X-Chat-Turn-Id`. Telegram, Slack, WhatsApp, and Email channel deliveries derive this ID automatically from their provider message identity. Existing conversation history is not backfilled; durable tracking begins with the first turn after migration.

---

## Upgrading to v0.16.1

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.16.1` constraint, or install the exact marketplace version you receive.

This patch release keeps the v0.16 runtime and database contracts unchanged. It fixes default `sendMessage` workflow nodes after internal action/tool steps so an inherited `internal` visibility flag cannot hide the final user-facing workflow response.

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Smoke-test one active workflow that sends a default/plain `sendMessage` after an internal action, tool, or AgentGraph-backed step.

No new migration is required when upgrading from `v0.16.0`.

---

## Upgrading to v0.16.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.16.0` constraint, or install the exact marketplace version you receive.

This release adds structured Compound Request planning/execution, workflow turn-understanding hardening, schema-v2 structured form preservation, and additional database constraints for pending conversation state. The default compound engine is `structured`; use `shadow` to audit generated structured plans before enabling execution for a cautious production rollout.

The mode and shadow settings in this historical v0.16.0 procedure were removed by the current Agent-first cutover. Do not carry them into the current published config; follow [Agent-first runtime cutover](#agent-first-runtime-cutover) instead.

After deployment:

1. Run `php artisan migrate`.
2. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
3. Run `php artisan filament-agentic-chatbot:doctor`.
4. Re-publish and merge the then-current config if you maintain an installation that remains on v0.16.0.
5. Run the v0.16.0 workflow-turn and multi-item evaluation scripts with provider credentials in staging.
6. Verify one pending workflow input, one interruption/replacement turn, one read-only multi-item workflow node, and one write-confirmation workflow path before public rollout.

MySQL/MariaDB installs receive generated-column unique guards for one pending interaction/request per conversation. PostgreSQL and SQLite keep the existing partial unique indexes.

---

## Upgrading to v0.15.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.15.0` constraint, or install the exact marketplace version you receive.

This release focuses on guided Data Resource administration, safer live database-answer defaults, complete readiness/localization coverage, and stricter release gates. No special destructive migration step is required, but run migrations normally and verify live data-answer policies in staging.

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Review **Connect > Data Resources** and confirm returned fields, filters, sorting, limits, and runtime safety scopes.
4. Open each production bot and approve only the Data Resources it should use.
5. Verify one workflow `query_data_resource` path and one normal widget/API answer.
6. Run channel diagnostics again if Telegram or Slack channels are part of the rollout.

If you need explicit production role separation for Data Resource administration, enable strict Gate mode with `AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true` and define the Data Resource view/manage Gates before opening the panel to operators.

---

## Upgrading to v0.14.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.14.0` constraint, or install the exact marketplace version you receive.

Run migrations after updating. This release adds the Quality Loop, handoff, assistant profile, Bot Access Token hardening, API connector hardening, and legacy RAG database-object normalization migrations. The migration set is intended to preserve compatibility, but it touches old RAG-era names, indexes, and workflow variables, so take a production database backup and verify the upgrade in staging first.

If Filament assets are cached in deployment, run:

```bash
php artisan filament:assets
```

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Verify one normal knowledge answer and one widget/API request.
4. Verify one workflow draft, publish, and test run.
5. Verify one saved quality scenario and review any generated fix suggestions.
6. Verify one handoff review path if operators will use human escalation.
7. Review Bot Access Token scopes, pricing entries for cost budgets, widget signing posture, domain allowlists, workflow trace privacy, and API connector safety warnings.

The workflow editor assets were rebuilt around shadcn-style primitives and Tailwind `fac` prefixing. Host apps with aggressive asset caches should publish fresh assets and clear browser/CDN caches for the Filament panel.

---

## Commercial hardening compatibility window

This line adds stricter production controls without breaking older embeds by default. If you published the config file, merge these keys:

- `widget.signing.allow_query_tokens`
- `widget.signing.allow_body_tokens`
- `widget.allow_all_domains`
- `ingestion.max_fetch_bytes`
- `ingestion.max_redirects`
- `ingestion.allowed_content_types`
- `bot_access_tokens.last_used_throttle_minutes`
- `bot_access_tokens.accept_authorization_bearer`
- `bot_access_tokens.bearer_prefix_required`
- `bot_access_tokens.invalid_attempts_per_minute`
- `bot_access_tokens.allow_unscoped_legacy_conversations`
- `bot_access_tokens.hash_key`
- `data_resources.authorization.require_gates`

Recommended production posture:

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES=5242880
AGENTIC_CHATBOT_INGESTION_MAX_REDIRECTS=3
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_LAST_USED_THROTTLE_MINUTES=5
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_BEARER_PREFIX_REQUIRED=true
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_INVALID_ATTEMPTS_PER_MINUTE=10
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_ALLOW_UNSCOPED_LEGACY_CONVERSATIONS=false
```

Notes:

- Widget query/body token support and empty domain allowlists are compatibility bridges. Move browser embeds to the `X-filament-agentic-chatbot-Token` header and configure exact bot domains.
- `AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` is now enforced before materialization and cumulatively across a URL redirect chain or all pages of one API-source fetch. Raise it deliberately if a trusted source legitimately needs a larger total response budget.
- `/api/filament-agentic-chatbot/chat/{botPublicId}/config` now includes additive `bot.knowledge_health`. Existing keys are unchanged.
- The built-in `bots` data resource is scoped to the current bot by default. Override it in the host app only if a global bot catalog is intentional.
- Data Resource admin now supports optional strict Gate mode through `AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true`. Define `filament-agentic-chatbot.view-data-resources` and `filament-agentic-chatbot.manage-data-resources` Gates when you need production role separation.
- UI-managed Data Resources no longer fall back to every returnable field when no default field is selected. They use answer-ready fields first, then one safe returnable field. Runtime safety scope filters can protect ownership columns without exposing those columns as normal workflow filters.
- URL ingestion now rejects oversized responses, unsupported content types, unsafe redirects, and private/reserved IP targets by default.
- Chroma threshold bypass was off by default in this historical compatibility window and is removed by the current G21 retrieval contract.

Run `php artisan filament-agentic-chatbot:doctor` after deploying. New warnings identify production posture issues before these compatibility defaults become stricter in a future release.

---

## Bot Access Token hardening

Releases that include Bot Access Token hardening keep the Filament admin usable by default: authenticated panel users can view and manage Bot Access Tokens unless you opt into stricter authorization. For production role separation, define Gates for panel users that may view or manage tokens:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-bot-access-tokens', fn ($user) => $user->canReviewIntegrations());
Gate::define('filament-agentic-chatbot.manage-bot-access-tokens', fn ($user) => $user->canManageIntegrations());
```

Once a Bot Access Token Gate is defined, token administration becomes explicitly gated: the view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/rotate/revoke/delete actions. The ability names can be changed in `filament-agentic-chatbot.bot_access_tokens.authorization`.

If you want the resource to deny access until Gates exist, set:

```env
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_AUTHORIZATION_REQUIRE_GATES=true
```

Disabling the authorization block is supported for legacy apps, but production hosts should keep it enabled and use Gates or strict gate mode where admin role separation matters.

Run migrations after updating. Budget columns are widened for large UI values, a new reservation table is added for hard monthly budget checks, conversations gain Bot Access Token owner/channel scope columns, and tokens gain a hash-version column for HMAC-SHA256. Cost budgets now require matching `usage.pricing` entries for the resolved provider/model; missing pricing blocks the request with `ai_cost_budget_pricing_missing` instead of allowing an unenforceable cost budget.

At the time of the original token-hardening release, SHA-256 token hashes remained valid until rotation. The current G25 breaking cleanup supersedes that window: rotate them before upgrading or the cutover migration revokes them. Existing unscoped conversations are not readable by Bot Access Tokens by default; temporarily enable `AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_ALLOW_UNSCOPED_LEGACY_CONVERSATIONS=true` only if you need a short persistence-migration window for active sessions.

---

## Data Resource hardening

Releases that include Data Resource hardening keep the Filament admin usable by default: authenticated panel users can view and manage Data Resources unless you opt into stricter authorization. For production role separation, define Gates for panel users that may view or manage approved live data access:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-data-resources', fn ($user) => $user->canReviewDataResources());
Gate::define('filament-agentic-chatbot.manage-data-resources', fn ($user) => $user->canManageDataResources());
```

Once either Data Resource Gate is defined, administration becomes explicitly gated: the view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/delete/sync actions. The ability names can be changed in `filament-agentic-chatbot.data_resources.authorization`.

If you want the resource to deny access until Gates exist, set:

```env
AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true
```

Review UI-managed resources after updating. Resources without an explicit default returned field now expose only one safe default field instead of every returnable field, and runtime safety scope filters remain active even when their ownership columns are not visitor-filterable fields.

---

## Upgrading to v0.13.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` so Composer also installs `heiner/agent-graph`. Do not add a custom root `repositories` entry for AgentGraph in production.

Run migrations after updating. This release adds an **irreversible cutover migration** that cancels in-flight legacy workflow runs (`running`, `halted`, `delayed`) that never started on AgentGraph. Plan a short maintenance window if you depend on long-lived paused workflows.

If you already published the config file, merge or re-publish these keys:

- `chat.assistant_graph`
- `workflow.turn_planner`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`
- `data_resources.smart_queries`

The legacy `chat.parent_agent.*` config tree and `PARENT_AGENT_*` environment fallbacks have been removed. Move any local overrides to `chat.assistant_graph.*` / `AGENTIC_CHATBOT_ASSISTANT_GRAPH_*`.

After deployment:

1. Run `php artisan filament:assets` if your deploy process caches Filament package assets.
2. Clear caches.
3. Run `php artisan filament-agentic-chatbot:doctor`.
4. Test one normal knowledge answer, one halted Collect Input / Confirmation workflow, and any Smart Data Query workflow you rely on.

For marketplace production hosts with `AGENTIC_CHATBOT_COMMERCIAL_MODE=true`, also set `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`, `AGENTIC_CHATBOT_ANYSTACK_ID`, `AGENTIC_CHATBOT_DOCS_URL`, and `AGENTIC_CHATBOT_SUPPORT_EMAIL` before launch.

---

## Upgrading to v0.12.0

Do **not** target `v0.12.0` for new installs. Use [Upgrading to v0.16.1](#upgrading-to-v0161) instead.

The `v0.12.0` documentation below is kept for historical context on features that shipped in the `0.13.0` line:

Run migrations after updating. The planned `0.12.0` line extended the workflow run status vocabulary with `cancelled` and introduced agent-first chat configuration keys.

If you already published the config file, merge the `chat.assistant_graph`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`, and `data_resources.smart_queries` keys or re-publish the package config and apply your local overrides again.

---

## Upgrading to v0.11.1

v0.11.1 is a patch release on top of v0.11.0. It does not add new migrations.

Upgrade for workflow editor UI polish, clearer workflow release-status copy, workflow-list default filter behavior, and refreshed release documentation. If Filament assets are cached in your deployment process, run `php artisan filament:assets` after updating.

---

## Upgrading to v0.11.0

Run migrations after updating. v0.11.0 adds package-owned Telegram/Slack channel tables and workflow memory storage.

If you plan to use Telegram or Slack channels, create one Bot Access Token per channel, create a Channel connection for the bot, configure provider credentials, set a public HTTPS webhook URL, and run channel diagnostics before sending production traffic. Production installs should run a real queue worker for inbound webhook processing and channel activity indicators.

If you already published the config file, merge the new `channels` and workflow image transport configuration keys or re-publish the package config and apply your local overrides again.

---

## Upgrading to v0.10.0

Run migrations after updating. v0.10.0 adds optional Bot Access Token ownership and channel columns used for admin filtering and AI usage reporting.

If you already published the config file, add the new `bot_access_tokens` config block manually or re-publish the package config and merge your local changes. Configure `owner_types` only when your app wants token ownership assignment in the admin UI; the package does not create users, teams, or tenants.

---

## Migration note for users who installed before v0.9.4 release

Three migration files were renamed to fix duplicate sequence-number prefixes:

| Old filename                                                           | New filename                                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `2026_04_02_000004_ensure_workflow_runs_has_workflow_snapshot.php`     | `2026_04_02_000005_ensure_workflow_runs_has_workflow_snapshot.php`     |
| `2026_04_02_000005_add_findings_to_workflow_generation_runs_table.php` | `2026_04_02_000006_add_findings_to_workflow_generation_runs_table.php` |
| `2026_04_02_000005_add_node_traces_to_workflow_runs_table.php`         | `2026_04_02_000007_add_node_traces_to_workflow_runs_table.php`         |

If you installed an earlier build, running `php artisan migrate` after upgrading may attempt to re-run these three migrations under their new filenames. All three are fully idempotent (they use `hasColumn`/`hasTable` guards) so re-running them is safe and causes no data changes. You can verify the current migration status with `php artisan migrate:status`.
