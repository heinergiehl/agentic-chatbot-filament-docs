# Upgrading

This document covers required steps when upgrading between public releases.

The current runtime-convergence work remains an unreleased local candidate on
Agent runtime ABI v32 and compiler ABI v17. The older ABI steps below record
earlier cutovers and do not enable old artifacts under this candidate. Current
offline evidence uses the locked Laravel AI 0.11.2 graph; Laravel AI 1.0.0 is a
separate migration decision. Host and user acceptance remain outstanding.

The local Ollama thinking extension requires normal republication and candidate
verification before activation. An optional strict boolean
`runtime_config.agent.ollama_think` is frozen as `model.ollama_think`; omission
preserves the SDK/server default. Only Ollama accepts the option. ABI v32 and
compiler v17 prevent previous implementations from silently ignoring an explicit
pin. Existing contracts, hashes and active pointers are not rewritten. This is
an unreleased configuration extension, not a package version change.

Runtime Recovery v3 K1 through K7 require fresh Agent runtime ABI v31 candidates,
with compiler ABI v16 unchanged. K2 writes only private Observation v4 snapshots
with deduplicated, content-bound source references. Historical v1/v2/v3 receipts
remain readable; existing artifacts and open drafts are not rewritten or
transferred to another deployment hash. K3 replaces duplicate-only native history
reduction with whole-turn removal that protects current draft sources, conditions,
delivered offers and the latest complete turn. Offered visitor provenance reflects
only retained history; bounded memory cannot replace original source proof. A true
minimum overflow commits a technical answer without accepting an unapplied
correction, resetting recovery limits or repeating an external operation. The next
normal turn remains admissible under the same budget and source protections.
K4A allocates direct-read results and whole Knowledge chunks against the next
actual native request after removable history. Evidence identities and minimal
outcomes remain even when optional data is omitted; the stored receipt is unchanged.
Projection limits are distinct from provider windows and stored-payload limits.
Result omission cannot establish absence. K4B replaces forced pending-schema
exposure in Lazy mode with explicit exact-name loading. Open drafts retain their
references and tool names in the compact context. Selected schemas appear only in
the next step; hidden calls in a loading batch remain rejected. Eager deployments
keep all schemas and their published limits. Loading and recovery preserve the
existing credits and shared deadline. Native projection v15 replaces v14.
The same candidate fixes checkpoint projection mutating canonical observation
sources and recycled native history IDs suppressing the current SDK message.
K5 replaces prose-derived historical references with individually verified stored
results. Only attested structured output grants a display ordinal; historical
prose grants no displayed order. Failed or input-needing siblings do not exclude a
valid completed read. General result references no longer expire after 30 minutes;
existing retention, bounded lookback and fresh scope checks still apply. Receipt
and presentation writers remain v1, with no backfill or migration.
K6 replaces the native HTTP/MCP and Data Resource control dialects with required
`input` and optional closed `request`, `conditions`, `evidence`. Domain field
`request` is safe inside `input`. Selected drafts patch closed object members,
replace whole arrays and retain exact sources. Invalid replacements and explicit
unresolved members prevent dispatch; cancel closes exactly one selected draft.
Result refresh/revise rechecks existing continuation authority and expiry.
Native projection advances to v16. Connector Context v6 writes bounded member
sources and unresolved pointers; compaction protects every member's original
message. Historical v3/v4/v5 readers remain, without artifact conversion.
K7 binds each historical revise/refresh selection and successful invocation to
its concrete turn-bound result handle. Multiple references, including two results
of one operation and reads from different retained turns, execute independently.
Refresh does not require an earlier replacement. A failed sibling does not roll
back a successful read; untouched verified siblings remain historical and are not
queried again. Published fanout, replay, scope and input continuation limits remain
unchanged. Exact receipts resolve multi-success selection ambiguity while input
transfer keeps its preceding-message and expiry limits, integrity checks and
original source binding. No operation-only default is inferred. Runtime ABI advances to v31; native projection advances to v17 for the protected
unresolved-pointer offer. Compiler v16,
Observation v4, Connector Context v6 and receipts v1 are unchanged.
Unresolved pointers retain the existing Needs-Visitor and sensitive-field guards.
Invalid controls and protected evidence leave drafts unchanged. A valid revision
with invalid domain replacement values instead blocks the old dispatch values and
keeps independently admitted sources inert, even beside an unresolved pointer.
Unknown Playbook arguments are rejected against the published native schema.
ABI v30 and older Agents fail productive admission. No K1 through K7 database
migration is required. Drain active work under its
supported old release before installing incompatible code in a linked host,
then publish and test fresh candidates through the regular flow. Installation,
activation and release acceptance are separate authorized steps.

## Runtime Recovery v3 maintenance and return procedure

This is an unreleased ABI v32/compiler v17 candidate, not an approved customer update.
K9 adds deterministic package integration and an indexed recovery matrix;
it does not activate a host or certify provider behavior. Host/artifact acceptance
remains outstanding; the internal K9 host acceptance order tracks that work
separately from this customer maintenance procedure.
The existing release helper's required old upgrade baseline is `0.18.0`.
That rehearsal has not been rerun for this candidate. Preserve the exact old
host commit, package artifact and Composer lock; do not infer support for an
arbitrary older installation from a successful Composer install.

1. Before installing, inventory affected Agents, their deployment ABI/hash,
   queued/active turns, open drafts, Graph waits and unknown external effects.
   ABI v30 and older Agents cannot execute under this candidate. Their
   immutable artifacts and historical receipts remain readable. Report which
   operations, dependent Playbooks and Agents need regular republication.
2. Close entry to affected new turns for a maintenance window. Complete or
   reconcile active external work using the exact supported old release before
   stopping its workers and scheduler. Do not delete queued jobs, resume a job
   with different code, or replay an unknown write to drain the queue. Unaffected
   host functions need no new locking architecture. A symlinked checkout is
   already a code cutover: inspect active turns/jobs before editing it.
3. Record and back up the package and host versions, lockgraph, both package
   and AgentGraph databases, configuration and encryption key together. Keep
   side-effect ledgers and status/receipt identities. Record how the old
   environment was verified and how it can be restarted.
4. Install the exact candidate artifact into the rehearsal copy, then run
   migrations and both Doctor checks. K1 through K9 add no database migration;
   an older host can still require earlier package migrations. Republish changed
   operations, dependent Playbooks and the consuming Agent through their normal
   publishers. Never rewrite a deployment, receipt, source hash or live pointer
   in SQL to make it compatible.
5. Keep the new candidate inactive. Test it through the persistent host turn
   and queue path, including the widget, reconnect, limits, confirmation and
   unknown/reconciliation cases. Bind evidence to the package commit, ZIP
   digest, host commit/lock, deployment hashes and published operations. Activate
   through the existing release flow and reopen entry only after all required
   evidence passes and activation is separately authorized.
6. Before activation and before any new external effect, return to the verified
   old bundle if the rehearsal fails. After a new external effect, preserve its
   ledger and reconcile the actual effect first. A blind database restore can
   erase idempotency evidence and repeat a write; a backup alone is not a safe
   rollback. Do not use a code-only return or destructive down-migration across
   retained receipts or unknown outcomes.
7. Keep old completed conversations readable as historical data. Mark open old
   drafts as not transferred. A conversation under a new deployment does not
   inherit old confirmations, private sources or pending authority. Original
   source retention and fresh authorization remain necessary for every result
   reference; result visibility does not grant permission to execute.

Operators should distinguish the published conservative input quota, a known
physical model window and its output reservation, stored payload bounds and
optional model projection. An omitted record is not evidence of no match.
Local preflight failures commit a localized technical answer and received input
without applying a rejected correction or dispatching a model. A successful
read survives a later answer failure; unknown writes require reconciliation.
Use the authorized turn diagnostic export v4, canonical receipt and deployment
identity to investigate. Public JSON/SSE/history are projections and cannot
repair a receipt or authorize retries. Never include raw prompts, private
payloads or credentials in an exported support report.

Runtime-generalization S1 adds explicit interpreted policies only for reviewed
public Connector domain fields; see [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).
The author preset is not runtime metadata. S1 publication required runtime
ABI v23/compiler ABI v16, without rewriting older artifacts or providing a legacy
executor. S2 shares the actual bounded native visitor history with admission and
introduced public draft handles, whose native envelope is superseded by K6. Original field references stay
in encrypted context v5, with v3/v4 retained as historical readers. No database
migration is needed for S1 through S4. S3 adds typed outcomes and one native Stop
repair within existing credits and budgets. Private observation snapshots advance
to v3 with historical v1/v2 readers; no public host API is added. Republish changed operation
revisions and consuming candidates normally; repin dependent Playbooks when
needed. Host installation, activation, live inference and S5 through S7 remain
separate work. Existing Graph waits and unknown effects retain their original
historical authority.

S4 adds explicit per-field public review and a compiled policy comparison in the
Operation workbench. Import preserves supported nested required/enum/nullability
constraints; unsupported input facets fail publication with their path. Optional
query/header/MCP arguments remain absent, including when older Playbook variables
share their names. Optional whole request bodies need an explicit omission
mapping and fail import. Native offers include visible mapped result fields and
fixed window limits; budget and dispatch use the same projection. Review, test
and republish selected operations normally to opt in. The profile alone grants
no interpretation and old revisions are not rewritten.

## Unreleased runtime-convergence host rehearsal

Rehearse in an isolated host application using the [host integration guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md).
This is a rehearsal order, not an automatic activation:

1. Record exact package commit, Composer lock, schema/migration status, Agent
   and Playbook deployment hashes, active drafts/waitpoints, queued turns and
   unreconciled effects. Back up package and AgentGraph data together with
   configuration and the encryption key. Stop entry traffic, queue workers and
   schedulers before changing schema or code.
2. Install the matching package and lock, run the normal `php artisan migrate`
   on the configured host connections, then both package and AgentGraph Doctor
   checks. Do not use `apps/sandbox` as host acceptance. Inspect incompatible
   deployments and changed published operations without mutating their
   historical artifacts.
3. Classify each retained state. Completed turns and presentation receipts are
   historical, read-only replay; source-bound open Connector drafts retain
   their source, scope and revision; Graph waitpoints resume only through their
   pinned Playbook; known effects reuse their original receipt; Unknown writes
   remain locked for operator reconciliation. If the old code/schema cannot
   safely resume an in-flight state, preserve it for explicit disposition
   rather than silently dispatching or deleting it.
4. Republish changed Connector operations and Data Resources, then dependent
   Playbooks and sub-Playbooks, then the consuming Agent. New Agent artifacts
   must pin `filament_agentic_chatbot.agent_runtime.v32` and
   `filament_agentic_chatbot.agent_deployment_compiler.v17`; Playbooks pin
   their v1 runtime/compiler contract and `heiner.agent_graph.public_api.v1`.
   Test the exact candidate with controlled reads, confirmation, delay and
   Unknown cases. Activate only through the existing tested-release flow
   after user acceptance.
5. Reopen traffic and workers only after no active conversation depends on an
   incompatible artifact or unresolved migration. If rehearsal fails, keep
   traffic stopped. Restore the matched pre-change code, Composer lock,
   database, AgentGraph state, config and encryption key as one bundle; do not
   attempt a code-only rollback or `migrate:rollback` across retained
   receipts or unknown effects.

Record actual host dialogue observations separately from deterministic package
checks, following the [shipping checklist](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SHIP_CHECKLIST.md).

## Unreleased development cutover: source-bound offers and Agent ABI v9

The coordinated conversation-reliability cutover uses Agent runtime/compiler
ABI v9. S2 supports `published_alias`, `user_literal` and explicitly published
`verified_resolver` offers; the remaining reliability slices are not
release-complete. There is no separate reliability
profile. Portable tool loading from v8 remains part of the contract. Publish
fresh candidates only for isolated testing; this change does not activate them.
Hash-valid v8 and earlier deployments are rejected without rewriting their
contracts, hashes or test evidence. Playbook and AgentGraph ABIs are unchanged.

S5 adds optional `agent.read_dependencies[].canonical: {max_age_seconds: 300}`
inside this unreleased ABI v9 candidate. It requires both endpoint identity
contracts and mandatory target proof, with freshness from the source turn.
The target schema accepts exactly one required identity input, checked with
exact response identity; additional inputs and composite targets are rejected.
Existing links remain optional and keep their
hashes/meaning. Publish new Connector revisions and an isolated Agent candidate
to opt in; old deployment artifacts and historical evidence gain no authority.
The Gateway boolean identity verdict now accompanies its execution receipt.
Record provider fixtures, verification limits and external-host integration
evidence separately from candidate publication.

Publication and persisted deterministic tests on a disabled external-host
candidate do not authorize activation. The synthetic location contract is
not a verified mapping for wttr.in or Open-Meteo. UI persistence and live model
quality remain separate acceptance gaps; no measured token or cost saving is
claimed from scripted model responses.

S8d adds opt-in bounded provider selection as a partial integration slice.
ABI v9 deployments without the new mode remain compatible. The additive
`read_dependencies[].offer.mode: bounded_selection_v1` requires new operation
and Agent publication; old runtimes reject this unknown policy. The bundled
Open-Meteo geocoding decoder is pinned by key/version/implementation hash, so
adapter changes require fresh Workbench evidence and new revisions/candidates.
Never rewrite an existing artifact. The shipped profile supports explicit
public location-ID selection and verification only. Forecast binding and
model/UI acceptance remain separate prerequisites for a public weather Agent.
See [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).

S8e adds opt-in `canonical.mode: request_tuple_v1` and an implementation-pinned
`request_binding` descriptor for complete required input tuples from one fresh
verified flat source record. The Open-Meteo forecast profile uses this mode for
location ID, latitude and longitude. It labels local request provenance
separately from the provider's forecast grid; it does not fabricate provider
identity. Existing scalar canonical links retain their stricter single-input
contract. New code, Workbench evidence, Connector revision and paused Agent
candidate are required; old artifacts are unchanged. This completes the local
provider chain, while model/UI acceptance and public activation remain open.
See [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).

S6 adds private `chat_turn_progress.v2` with bounded `agent_execution_event.v2`
observations in the existing `progress` column. No migration or backfill is
required. Old v1 stage progress and v1 activity remain readable; old terminal
outcomes replay unchanged. The model hides the stored progress column; use the explicit public
projection. Private presentation/execution receipt versions remain unchanged.
Reverting to an older candidate loses v2 activity presentation, not canonical
outcomes; never rewrite receipts or immutable deployments to restore a display.

Direct debugger-service callers now need the same authenticated conversation
and diagnostics authorization as the existing Filament page. A host with
record-aware gates must apply its tenant/ownership SQL scope for both
`bot_conversations.authorization` and
`bot_conversations.diagnostics.authorization`. Missing scope fails closed.
There is no browser or runtime argument-logging switch. S7 consumes the new
public progress/SSE contract; its widget presentation is not part of S6.
See [runtime diagnostics](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md).

The encrypted Connector context is now `chat_turn_connector_context.v3`, with
`connector_input_offer.v2` source, scope, deployment, expiry and delivery proof.
Canonical delivery advances the pending revision. Native callers must use the
next turn's actual revision, not the pre-commit revision. The structured answer
may propose an optional `questions[].offer_value`; the existing prose review
and independent source verification both apply. The native confirmation control
remains `{offer_id}` with the entire visitor reply bound by the server.

Resolver offers require a fresh candidate publication with an explicit
`agent.read_dependencies[].offer` policy, for example
`{"max_candidates":12,"max_age_seconds":300}`. Both endpoints must be pinned
Connector reads; the source requires result identity and the target a public
literal string. The link's source pointer selects the exact public value; a
single `/0/` segment may enumerate a bounded candidate collection for offers.
Other target fields, coordinates and opaque IDs receive no authority from a
label confirmation. Existing links without `offer` remain invocation-local.
Source evidence and its successful execution must be checkpointed in the offer's
own turn and preserved through canonical commit. Earlier historical receipts and
versioned host-resolver labels are not implicitly upgraded into this authority.

S3a/S3b project `agent_execution_context.v1` from existing committed receipts.
The same bounded snapshot now travels through response copies, checkpoints and
review; its optional versioned `execution_context` member is stored in the
existing private encrypted presentation receipt. Old receipts without that
member remain readable; no backfill or new task table is needed. Rollback to
code unaware of that member cannot restore expanded private receipts: preserve
canonical committed outcomes and drain isolated candidate work before rollback.

`agent_tool_projection.v7` uses the same frozen history and live status offers
for admission and dispatch. An `execution_status` claim selects only an exact
`receipt_ref` and `capability_key`; the server supplies status and the published
label. Historical output explicitly names the original source-turn completion
time. It does not assert a new observation or admit historical result facts.
`answer_review.v5` binds bounded execution receipts and pending metadata alongside
visitor sources. Zero current calls no longer bypass answer admission when
verified history, pending inputs or technical attempts exist. Invalid/unavailable
review preserves supported facts/status or the no-verified-current-result notice.
Ordinary context-free prose retains its deliberate semantic limit.

S4 adds one bounded native correction and two exact candidate assessments per
invocation. Assessment binding includes deployment/scope, turn/invocation, draft,
review input, evidence/status, pending/offer revisions and language. The final
response retains its invocation-local allowance for deterministic finalization;
there is no cross-turn cache or new durable task state. The shared projection
includes bounded source-bound feedback, and nested review respects the still-open
productive reservation. Existing immutable deployments are never rewritten.
This is still the same unreleased ABI v9 cutover, without a new profile or live
activation; remaining reliability slices are not release-complete.
Keep the coordinated candidate isolated until the remaining slices are verified.

No database schema migration or legacy-envelope converter is introduced. Before
switching workers, classify and drain or explicitly cancel/reclarify incompatible
open read contexts through their existing owner. Never convert an old question
into delivery/source proof. Preserve original outcomes for replay. Graph waits
and unknown external operations retain their exact deployment and block an
incompatible switch until resolved through the supported path. Never reset them
or mutate an old deployment to satisfy v9. S8 must test a final newly published
candidate before any separately authorized activation. See
[runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).

## Unreleased: coherent Connector proposals and Agent ABI v7

This earlier cutover introduced Agent runtime/compiler ABI v7, superseded by
the coordinated v9 development cutover above. Build and test fresh candidates before
coordinated activation; hash-valid v6 artifacts remain unchanged and fail closed.
Playbook and AgentGraph ABIs are unchanged. The reviewed runtime is integrated
on main; package checks do not establish host or release acceptance.

Connector calls accept sparse `__context` proposals for declared conditions;
omitted or null fields do not erase retained conditions.
The optional `__ambiguous_context` list names only declared null-valued fields.
The existing bounded assessment now verifies the whole proposal and returns
field feedback without replacement values or visitor questions. Negative and
unavailable reviews request local argument correction without changing pending
state. Exact pending selection and independent reads retain their contracts.
Optional `__rebind` now allows correction of an earlier field assignment within
one exact open pending revision using action `revise`. It requires an explicit
published `pending_source_rebinding: true` at each target API policy or context
field; existing operations remain disabled. Only public scalar visitor literals
are eligible. Original source identities, task age, dependencies and result
predicates remain enforced, including independent gateway checks. Enabling the
flag requires a newly published operation revision and Agent candidate. The
native input-policy toggle and context JSON retain this metadata without
rewriting an absent flag during an unchanged edit. See [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).

## Unreleased: natural dialogue and Agent ABI v6

This earlier cutover introduced Agent runtime and compiler ABI v6, superseded
by v7 above. Publish, test and activate
fresh compatible Agent candidates before routing live traffic through updated
workers. Do not modify stored v5 artifacts or relabel their test evidence.
Existing in-flight turns pinned to an incompatible runtime fail explicitly;
the widget no longer calls that condition a domain denial.

Natural questions now bind to exact pending IDs/revisions and share the existing
semantic answer review. Capability descriptions use the model's normal answer
step instead of the old automatic list. Exact facts and field labels remain
fallbacks. No new style setting or model-specific prompt tuning is required.
See [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).

Model context admission now uses the existing tokenizer/profile estimate.
Conservative monetary reservations and configured input quotas are unchanged.
This does not add automatic large-tool-catalogue search or lossy state compaction.

## Unreleased: complete capability metadata and native interactions

Recreate incompatible resources in this order: import and review Connector/MCP
operations, test and publish their revisions; review Data Resource fields/scopes
and Knowledge profiles; repin and publish optional Playbooks; then build and test
the exact new Agent candidate. Activate only after the host maintenance boundary
is explicitly approved. Old conversations/pending records are not converted into
the new interaction format. Resolve running and unknown external effects before
retiring their deployments, and restart affected workers while idle at cutover.

The existing Run operation inspector now exposes the pinned response schema and
output mapping, distinguishes MCP transport, and preserves a custom output variable
when replacing a revision. Review downstream field references against the replacement
schema. Rebuild/publish matching editor assets with the package PHP source.

That cutover introduced Agent runtime and deployment compiler ABI v5, superseded
by v6 above. Publish fresh Agent
deployments after reviewing the imported capability metadata; older ABI pins are
rejected, never rewritten. Playbook and AgentGraph ABIs are unchanged. No database
reset, automatic conversion, or live activation is part of this change. Preserve
and reconcile running or unknown external effects before a host cutover.

Published Connector semantics and admitted tool descriptions retain their complete
validated text. OpenAPI parameter/schema meanings and typed examples survive import;
examples are not execution defaults. Oversized annotations fail visibly. Full tool
schemas count toward routing and request budgets; an oversized offer is rejected
instead of shortened. The request projection version is `agent_tool_projection.v3`.

MCP drafts store a draft-only `import_basis`. Refresh preserves nonconflicting local
semantic edits, reports conflicting paths, and retains optimistic draft/environment
locks. Local execution edits require review. Old drafts without a basis remain
unchanged until the operator explicitly adopts a discovered definition. Re-test and
publish the resulting draft; existing published revisions remain immutable.

Knowledge profiles are optional public facts under `meta.knowledge_profile`.
Republish the Agent to pin edits. Capability Bridge can preview a manageable Agent's
live or candidate tool offer without model calls, business reads, or pending writes.
Its configuration token estimate excludes conversation state and provider framing;
normal runtime budget admission remains required.

## Unreleased: invocation evidence, pending inputs and answer synthesis

The Agent proposes partial domain arguments directly. The server binds the whole
current visitor message and captures typed tool outcomes before serialization.
The removed request update tool, request inventory, broad linguistic intent
ledger and forced direct-read defer/completion protocols have no compatibility
adapter. Repeated native call identities reuse their result; conflicting arguments
cannot dispatch again. Published schema, provenance, explicit read opt-out and
Gateway authorization still govern execution.

`chat_turn_connector_context.v2` owns open direct inputs, including exact revisions,
source bindings, expiry and current-turn claims. `__pending` selects continuation
or correction; omission starts a new proposal. Cancellation closes local input
collection only. `agent_observations.v1` stores current invocation evidence in the
existing private receipts, never a future request plan. Answer review context is
`answer_review.v3`; failed-read source receipts are `connector_failed_read_source.v2`
and encrypted database page payloads use version 2. Graph remains the sole owner
of Playbook waits, approval, recovery and uncertain external effects.

The source-answer schema carries language and claims, without request IDs or
open-items. The existing single semantic review and exact-fact fallback remain.
Rendering failure cannot execute another tool, restore a consumed pending or
clear Unknown. Displayed selection and order remain bound to committed content.

Before host cutover, drain workers and reconcile open Graph runs and unknown
effects. Resolve or deliberately retire incompatible direct pending interactions;
do not replay old checkpoints into this runtime. Recreate and test compatible
Agent candidates before activation. There is no historical request decoder,
automatic state conversion or database reset. Task B changes package contracts;
host integration and activation require the separate cutover work.

Explicitly selected JSON Data Resource columns with pinned `type: json`
metadata now expose bounded nested facts to answer presentation. No additional
columns are authorized. Existing MCP operations need a fresh import, normal
operation test and publication to obtain schema-derived nested output mappings;
then republish/test their dependent Agent candidates. Existing immutable
operation contracts are not rewritten and undeclared output fields remain
excluded.

Widget history now includes a top-level `collect_input` projection for the
currently open Playbook interaction. The shipped widget matches its pending
interaction, graph interrupt and payload hash before enabling existing controls,
including after a provider failure. A completed chat turn does not complete a
still-open approval. Deploy the updated widget view and clear cached views;
custom clients should use this authenticated projection instead of inferring
approval completion from the latest message. This field grants no new authority
and does not change server-side resolution checks.

The earlier durable-chat prerequisite remains AgentGraph **0.18.1**. Drain
active workers, back up the configured AgentGraph
store and run the SDK migration
`2026_09_12_000000_add_revision_to_agent_graph_runs` on that connection before
restarting workers. Its revision column deliberately survives rollback.
Republish and test Agents against this runtime before activation. Previously
published artifacts are not rewritten or silently treated as compatible.
The removed conversation checkpoint versions grant no continuation authority in
the new runtime. Reconcile outstanding work before switching runtimes.

When updating from AgentGraph 0.18.0, install the exact 0.18.1 dependency and
restart graph/chat workers after draining work. The patch adds no further
database migration or ABI bump. Republish affected Playbooks through the
normal release service, then publish and test new Agent candidates against
those artifacts before activation. Existing 0.18.0 artifacts retain their
original hashes and are intentionally rejected by the new exact SDK pin.
The duplicate plugin recovery checks have been removed only after the native
0.18.1 checks passed the same interrupted-resume and projection tests.

The streaming chat endpoint now accepts durable background work and emits
`turn_accepted` before closing its SSE response. Run the package migration
`2026_09_12_000001_add_queued_execution_to_chat_turns`, configure a persistent
queue connection with `CHAT_QUEUE_CONNECTION`, and start a worker for
`CHAT_QUEUE` (default `agentic-chat`). Database, Redis, SQS and Beanstalkd are
supported; synchronous and ephemeral drivers are rejected before admission.
The queue retry/visibility timeout must exceed the chat worker timeout
(`max(120, CHAT_MAX_EXECUTION_TIME)` seconds). A value of 360 seconds covers
the default 300-second turn lease. The connection also needs its normal
Laravel queue tables or broker setup.

Custom stream clients must handle `turn_accepted` and poll the authenticated
GET `/chat/{botPublicId}/turn` with the original session and client turn IDs.
HTTP 202 means pending; final JSON contains the committed projection. History
includes an authorized `pending_turn` for reconnect. The shipped widget handles
both. `/complete` stays synchronous and both transports replay the same
canonical result. Browser disconnects do not cancel accepted execution.

Native Connector partial proposals replace the separate clarification tool;
final prose cannot create pending input. Playbook text replies use a native
answer/approve/reject/defer decision against the current waitpoint. Explicit
widget and operator controls keep their existing authority. Old runtime
artifacts must be republished; no historical records are rewritten.

Current answers use one internal `claims`/`open_items` format. Mixed historical
answers add an optional pinned `historical` selection; the old mixed `sections`
format is removed. Source-backed prose and eligible failed-read questions share
the existing single review. Internal fixtures must include the actual current
conversation state rather than relying on historical selection-only examples.

Publication now rejects an explicitly selected Data Resource that the host has
not registered under the Agent's enabled query policy. Ensure the same resource
registration runs for web requests, CLI publication and queue workers before
publishing. Missing registration must not silently remove an Agent capability.
Restart persistent workers after upgrading code; local `queue:listen` can load a
fresh worker for each job. Review per-operation field descriptions and mappings,
then publish and test changed resources through the normal candidate lifecycle.

Review direct Connector schemas before republishing: explicit list bounds above
25 items and schema `default` annotations now fail direct Agent eligibility.
The runtime already limited these lists and did not apply these defaults. Use
published request constants for fixed values, or explicit visitor inputs.
Empty lists are accepted only when the schema permits them. Regular Connector
publication and Playbook mapping retain their own supported contracts.

The pagination implementation change also invalidates its older strategy
bindings, including `core/none`, which shares that implementation. Test and
republish affected Connector operations first, then publish and test their
consuming Agents or Playbooks. Do not edit historical strategy hashes or bypass
the mismatch; a fresh Agent alone cannot make a stale operation executable.

Bounded successful Connector searches can now support reviewed positive answers
with an explicit selection limitation. Their receipts remain partial; old
receipts are not backfilled with selection proof. See
[runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).

Connector context contracts may publish `input_dependencies`, a map from an
existing top-level operation input to the context fields on which it depends.
For example, `{"record_key":["tenant","namespace"]}` invalidates a retained
record key after an authorized change to either context field. A fresh visitor
value is required even if that input was originally optional. Equivalent context
values preserve the input. Republish the operation and consuming Agent to adopt
this metadata; existing pins without it do not infer dependencies from names.

Source-backed answer claims may omit `request_id` when their current verified
evidence identifies exactly one request. Explicit invalid references remain
invalid. Current requests with identical visitor source and quotes share only
semantic coverage review; their execution authority and evidence stay separate.
Successful empty database queries carry canonical outcome evidence. Neither
this evidence nor shared coverage bypasses the normal completion/release gate.

This is an internal runtime contract change. Custom code or test fixtures using
internal tool schemas, `AgentConnectorDialogue`, or selection-only model
responses must move to the current request and claim contract. The supported
host API remains the allowlist in `docs/PUBLIC_API.md`. Historical committed
answers remain records; the runtime does not infer new request or input
authority from their text. If an old unpublished resource, deployment or
conversation is incompatible, recreate it through normal publication and
candidate testing rather than editing immutable deployment rows or importing
unverified provenance.

Data Resource filter normalization is opt-in through published
`resource.filter_input_policies`: exact aliases, declared date formats and
relative-date expressions with explicit calendar and storage timezones.
Relative dates bind to the original attested visitor turn. Boolean filters
also require their visitor source or a published policy. Republish affected
Data Resources and their consuming Agents after changing these rules.
Arbitrary translated statuses, guessed dates and model-generated identifiers
are not accepted as their own evidence.

An Agent may publish up to sixteen acyclic `runtime_config.agent.read_dependencies`.
Each link names a pinned source and target read capability, result pointer,
target input, scalar type and entity domain. Both capabilities must belong to
the same recorded request. Only complete, verified current-turn evidence can
supply the target input. Selecting the first of several matches is not proof
of identity. These links cannot populate Playbook inputs or authorize writes.
Republish the Agent after adding or changing links. Model-facing pagination
uses opaque query-bound page references; individual later pages do not prove
a complete collection or total.

Source-backed answers contain request-linked claims and open items. Plain
conversation does not require a request inventory or a separate claim reviewer. Exact source
facts and supported sums are checked locally. One additional tool-free call
to the same deployed model assesses natural wording and complete request
coverage, within the existing turn deadline. Its result is a semantic
assessment, not deterministic proof. Usage is recorded under
`agent_answer_claim_review`, with a one-step, 4,096-output-token and 20-second
ceiling; lower published or configured output limits still apply. Its lossless
review payload permits up to 48,000 UTF-8 bytes and 24 claims. This accommodates
multi-record answers and whole-message coverage without another tool execution.
Review failure preserves permitted source
facts while leaving the request open. Include this call in candidate latency
and usage checks. Knowledge retrieval can use at most three distinct queries
per turn, at most two for one purpose; only a genuine empty result permits a
reformulation for that purpose. Provider failures do not trigger search retries.

See the [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md)
and current Data Resource and Connector documentation for the exact contracts.
Record passing software checks separately from local-model acceptance.

## Unreleased: source-bound Connector clarification context

Run `php artisan migrate` before directing chat traffic to the upgraded runtime.
The additive `2026_09_07_000001_add_chat_turn_connector_context.php` migration
adds nullable `bot_chat_turns.connector_context`. The Chat Turn model encrypts
this private envelope and hides it from ordinary serialization. It stores pending direct-read
inputs, declared conditions, original visitor-source bindings, and bounded
question progress separately from answer receipts. There is no backfill from
old questions, generated answers, or unverified history.

An executing turn can re-admit its own exact private checkpoint while correcting
a tool proposal. Its current user message and freshly attested scope remain
mandatory, and earlier values still need committed source turns. The next turn
cannot consume that checkpoint until canonical commit. This introduces no
permission, execution owner, or recovery scheduler.

This optional contract addition does not rewrite existing operation revisions
or Agent deployments. Operations without `metadata.context_contract` retain
their exact serialized pins and hashes. To add or change conditions, test and
republish the operation, then publish the consuming Agent. A previous generic
`string` input gains no automatic geographic or business-relation validation.
Use explicit published fields and input/result predicates for conditions the
provider can support. Nonempty context contracts are rejected on writes;
Playbooks continue to use their own validation and confirmation contracts.

Operations declaring context conditions add a focused model assessment before
recording their question or dispatching their lookup. It uses the exact deployed
model, ordinary governed usage under `agent_connector_context_assessment`, and
the shared turn deadline, with a one-step/1,024-token/20-second ceiling. No
assessment is called for operations without conditions. Include this additional
latency and usage in candidate acceptance. A failed assessment cannot silently
drop conditions or release a provider call. Every unresolved condition stays
pending until individually answered; null and unrelated value replies cannot
silently remove it.

The internal `agent_runtime.connector_context_ttl_minutes` policy defaults to
30 minutes, clamped to 1–1440; it is not a new host-tunable memory setting.
The original request creation time controls
expiry; another question does not renew it. This is an admission limit and
does not purge stored ciphertext. Existing Chat Turn retention remains in
effect. Keep the database and the matching application encryption key in the
host's verified backup and restoration procedure. Once context is unavailable,
a bare value reply requires a complete new request unless an immediately
adjacent successful lookup independently proves continuation.

The former adjacent-question operation limit is replaced by pending-request
state: a repeated unresolved state cannot ask again, while progress can ask
another field within a six-question ceiling. Runtime controls select, revise,
start, or cancel a local pending read; they are never API payload fields.
No additional worker or scheduler is introduced. Neither the new storage nor
source-quoted model proposals grant capability permission or prove provider
facts without the published checks.

The migration refuses `down()` rather than discarding pending context. Restore
a verified schema/data backup with its matching package release and encryption
key when rollback is required. See [Pending direct-read context](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md#pending-direct-read-context)
and the [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md)
for the authority and compatibility boundaries.

## Unreleased: private knowledge source uploads

Older published configurations may contain only `knowledge_sources.authorization`.
Missing upload settings now resolve to disk `local`, visibility `private`, and
directory `filament-agentic-chatbot/knowledge-sources`. This fallback applies only
to absent keys. Explicit null, blank, malformed, public, or unconfigured storage
settings remain invalid. Text, URL, and API source forms work independently;
invalid file setup shows repair guidance and blocks file-source submission.

Review the host's `local` disk and merge this block into the existing
`knowledge_sources` section of `config/filament-agentic-chatbot.php` to select a
different private disk or honor the upload environment variables:

```php
'uploads' => [
    'disk' => env('AGENTIC_CHATBOT_KNOWLEDGE_SOURCE_UPLOAD_DISK', 'local'),
    'visibility' => env('AGENTIC_CHATBOT_KNOWLEDGE_SOURCE_UPLOAD_VISIBILITY', 'private'),
    'directory' => env('AGENTIC_CHATBOT_KNOWLEDGE_SOURCE_UPLOAD_DIRECTORY', 'filament-agentic-chatbot/knowledge-sources'),
],
```

Keep the existing authorization settings. Uploads require a configured disk
other than `public`, private visibility, and a safe relative directory. Ensure
the host does not expose that directory through a public storage link or URL.
Rebuild the configuration cache and run `php artisan filament-agentic-chatbot:doctor`.
Its `Knowledge source uploads` check validates the effective configuration;
verify an actual upload to check storage permissions.

For pre-1.0 file sources that still use `meta.path` on the public disk, run package
migrations, configure private storage, and inspect the migration dry run:

```bash
php artisan filament-agentic-chatbot:migrate-knowledge-source-files
php artisan filament-agentic-chatbot:migrate-knowledge-source-files --source=123
```

Back up the source files and database before adding `--execute`. Execution copies
active legacy files to private source-owned storage, commits their ownership,
and removes the public originals. For soft-deleted sources it removes the legacy
public file. Ambiguous ownership or invalid paths fail without adopting the file.
Existing source-owned files are skipped when their private contract is valid.
See [Knowledge source file storage](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md#knowledge-source-file-storage)
for ongoing checks.

## Unreleased: concrete Playbook write approval

Explicit Approval steps now capture and show the exact downstream action before
waiting for the visitor. The prepared request stays immutable; a trusted input
correction or a confirmation older than ten minutes requires a new displayed
request and another confirmation. Pending approvals created by older code have
no captured request and cannot grant a write silently after the upgrade. The
existing engine confirmation at the write step obtains the required proof.
Custom button labels and cancellation retain their authored behavior.
## Unreleased: governed Data Resource writes

Run `php artisan migrate` to add the append-only Data Resource staging-evidence
table before importing evidence or publishing a write Playbook. Configure a
dedicated `AGENTIC_CHATBOT_DATA_RESOURCE_WRITE_TEST_SIGNING_KEY` with at least
32 characters in the trusted production and isolated staging applications.
Set distinct `AGENTIC_CHATBOT_DATA_RESOURCE_ENVIRONMENT` values. Existing host
configs need the `data_resources.write_testing` block documented in
[Data Resources](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DATA_RESOURCES.md).

Write-enabled Data Resource contracts now pin their database target and registered
model policy. Re-export the exact Playbook candidate, run each insert/update
step with concrete confirmation against a separate staging database, import
its signed evidence, and republish the Playbook and consuming Agent. Do not set
`production_targets` overrides in the production application. The test mapping
never switches a live Eloquent connection. Ordinary Agent and candidate tests
remain unable to perform writes.

Registered Eloquent create/update policies now run on the exact scoped record
inside the transaction. The authenticated host actor must match the runtime's
attested actor; an unrelated signed-in administrator cannot supply that identity.
Updates reject stale versions and preserve fractional timestamp precision.
Cancelled model saves fail and roll back instead of reporting success.
Read-only resource contracts gain no write permission. Prior deployments,
write ledgers, unknown outcomes and evidence remain retained. A rollback with
stored evidence requires restoring a verified backup; it cannot silently drop
that history. See [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).

## Unreleased: remote MCP connections

Run package migrations before opening Connector administration. The additive
MCP migration adds `api_connectors.transport` (existing rows default to `http`)
and an optional provider-profile key. MCP connections use encrypted credentials
and the existing operation/release tables; no provider accounts are connected
automatically. HTTP environment serialization remains unchanged, while MCP binds
the exact endpoint including its trailing slash and the selected transport.

This version changes shared Connector implementation bindings. Re-test and
republish affected Connector operations, their Playbooks and Agent candidates
through the normal release lifecycle before activation. Existing deployment
records are not rewritten or silently upgraded. The package continues to reject
stale implementation fingerprints.

MCP reads retain their separate read review. Synchronous create/update writes
now require `mcp_write_access_review.v1`, fixed targets, tenant/actor scope,
concrete confirmation, business-success and record-identity checks, and a
successful isolated staging test for the exact candidate before publication.
This optional operation contract field needs no MCP database migration. Existing
unreviewed MCP writes remain blocked; no migration converts a read review into
write permission. Preserve historical ledgers and reconcile prior unknown
outcomes before any new attempt. Direct Agent tools remain read-only. See
[reviewed MCP writes](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/MCP_CONNECTIONS.md#reviewed-playbook-writes).

Existing custom MCP reads must be explicitly reviewed again in **MCP data sources
> Review operations**, tested and republished before use. Their signed review
binds the exact server, definition and request scope; changing those values or
the application key requires another review. Curated GitHub reads require the
official endpoint, an approved read tool, and fixed owner/repository arguments.
Guided setup now offers image and screenshot links without a visitor-supplied
path. Add this function to the Agent draft and test the resulting candidate
before activation. Existing drafts and deployments are never silently expanded.

MCP operations may now publish compact `metadata.mcp_source` for the source name,
configured scope and optional HTTPS source link. This additive contract field
needs no database migration. Guided GitHub setup fills it from the bound
repository; other MCP imports and the operation workbench offer optional public
source fields. Existing operations keep their metadata until explicitly edited
and reviewed. Re-test and republish the operation and Agent to expose these facts
in chat. The runtime deduplicates source context and retains normal input budgets.
The configured model can answer source-link questions directly from this context;
verify its tool selection and follow-up answers in candidate tests. Source metadata
never grants access or changes the signed data-read review.

OAuth connections can now register a public client automatically when the MCP
server advertises RFC 7591 registration, S256 PKCE and token authentication
`none`. Save the connection and select **Connect account**. Existing client IDs
and connected accounts remain unchanged; providers requiring their own client
registration use **Manual OAuth settings**. This addition needs no database
migration and does not approve any read functions or change live Agent grants.

The MCP declaration, document projection and answer redaction fixes change the
pinned `core/mcp` implementation binding. Retest and republish existing MCP
operation drafts, then publish, test and activate their dependent Agent
candidates before using the updated implementation. Existing data scopes and
source metadata can remain unchanged; old implementation pins are never accepted
as the new implementation.

Rollback refuses to drop MCP transport columns while MCP connections exist.
Remove their deployment dependencies and connections first, or restore a verified
backup with its matching package version. See [MCP Data Sources](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/MCP_CONNECTIONS.md)
for setup, provider-specific prerequisites and the supported protocol subset.

## Unreleased: verifiable usage and configured token costs

New calls retain the exact tariff, provider/model identity, currency, unit scale
and integrity hash in `AiUsageCall.meta.pricing_snapshot` before dispatch.
Settlement uses this snapshot. Editing a tariff under the same version name
does not reprice an existing call. Missing or invalid input/output prices no
longer mean free usage. A zero rate must be explicit; an unconfigured reasoning
or cache rate makes the cost unknown when that category is reported.

Configure non-negative integer rates in micro-minor-units per million tokens.
Declare `currency_code` and `minor_units_per_unit` on each tariff when its
currency differs from the global setting. No currency conversion occurs. Fixed
bundled USD prices now retain their USD identity even if the display currency
changes. A hard cost reservation requires a known upper bound for every token
category that it may use; configure those rates before enabling a cost budget.

Dashboards and reports count all recorded calls, including pending, failed and
reconciliation-required calls. Full totals are nullable when usage or pricing
is incomplete; known subtotals are separately labelled. Consumers must handle
these nullable totals. Historical rows without a verifiable currency-bound
pricing snapshot retain their stored amounts, but those amounts are excluded
from current-currency totals. This change does not invent or backfill historical
tariffs. Unknown or incompatible historical costs in the current monthly budget
scope prevent new calls under a hard cost limit. New expiry transitions retain
the reservation in `awaiting_evidence`; legacy failed/released rows remain
explicitly reconcilable.

Package adapters now preserve complete native streaming receipts and account
for each model step through the same owner as synchronous calls. Unsupported
protocols, missing terminal events and zero-token embedding DTOs without presence
evidence remain unknown. A successful answer or positive partial counter alone
does not establish a complete receipt. Native SDK aggregates remain transport
data, not a source for reported token costs.

Run package migrations before enabling this version's AI transports. The new
`ai_provider_receipt_claims` and `ai_usage_reconciliations` tables enforce shared
native/operator request uniqueness and retain encrypted audit evidence. Enable
the explicit AI Usage management gate only for operators authorized to verify
provider receipts. The review action and existing reconciliation command can
settle verified missing usage without replaying a provider call.

Flat standard-text tariffs remain supported. Use V2 variants for context bands,
service tiers, modality-specific rates or cache-write lifetimes. Bundled Gemini
tariffs now declare input modalities and the distinct 2.5 audio-input/cache
rates. Complete previously frozen tariffs remain immutable; historical evidence
can supply missing tariffs or additive unpriced dimensions while preserving all
known rates. See [AI usage accounting](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AI_USAGE_ACCOUNTING.md).

Calculated token costs describe the
configured tariff applied to recorded plugin calls. They are not imported
provider invoices or a claim to include account credits, taxes, storage,
provider-hosted tool fees or other charges. See
[AI usage reconciliation](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md#ai-usage-reconciliation).

## Unreleased: explicit task context and model-step budgets

The runtime now supplies capability-specific instructions only when those tools
are available. Conversation summaries preserve their newest bounded turn records.
An output-only answer repair can receive the two newest complete admitted public
turns as a request-bound snapshot of at most 3,000 UTF-8 bytes. This is untrusted
task wording, not factual evidence, input values or execution authority; repair
still has no tools and does not reload history or attachments.

Review AI Tasks that implicitly depended on a preceding node's `context`,
`kb_context` or `knowledge_context`. The plain AI executor no longer imports
those variables automatically. Reference each required value explicitly in the
AI Task input template, or in an explicitly configured context source for a
supported custom node. Republish affected Playbooks and dependent Agents using
the normal candidate/test/activation path. Existing artifacts and hashes are not
rewritten. The editor continues to compile AI Tasks with conversation memory off.

Playbook text input admission now checks the complete utterance. A model cannot
save `Berlin` from “Bitte nicht Berlin.” Unsupported surrounding wording keeps
the question open. Exact valid values and explicit supported affirmative or
correction forms remain usable. Bound widget and approval controls retain their
existing authority.

Synchronous and supported streaming invocations reserve and settle usage per native SDK model
step. Consumers of operational usage rows must not assume one `AiUsageCall` per
whole tool loop; correlate step rows through `meta.invocation_id` and
`meta.model_step`, with the existing turn and deployment attribution. A rejected
follow-up step retains already delivered evidence and does not rerun tools.
Both paths preserve monthly reservation checks and conservative token admission.
Apply the receipt-claim migrations described above before enabling traffic.

These are local runtime changes, not a claim that the Gemini empty-completion
cause has been established or that provider routing quality has been certified.

## 0.19.0: Connector contracts and editor/runtime corrections

Version 0.19.0 changes the hash-bound authentication and pagination code and
adds request construction and parameter serialization to the request-codec
implementation binding. Every previously published Connector operation needs
a fresh test and publication, including operations using a custom request
codec. Old revisions remain immutable and fail implementation verification;
their hashes must not be rewritten to make them appear current.

Before switching traffic, finish or reconcile in-flight external operations on
their matching release. Install the matching package dependencies, then:

1. Open each used operation in the workbench, review its request and allowed
   output fields, and test the current draft. Publish the new revision.
2. Select the new operation revisions in dependent Playbooks, review and publish
   them, including parents of republished Sub-Playbooks.
3. Update Agent dependencies, publish and test each new candidate, then activate
   it. Existing conversation-bound deployments do not adopt these new pins.
4. Refresh the shipped Filament editor assets and start fresh test conversations
   before reopening traffic.

These corrections add no database migration. Existing compiled Playbooks retain
their saved input semantics; changing an authoring input type takes effect only
after republishing. Free text now needs an Agent interpretation before resolving
a text waitpoint. Typed and configured Choice answers keep their deterministic
shortcut, and approvals keep their existing bound controls. Terminal provider
completion errors remain errors even when accompanied by nonempty text.

OpenAPI imports now report unsupported parameter/schema forms explicitly. Review
those diagnostics instead of treating an imported operation as ready to run.
Input and response nullability with one non-null type is preserved. Ambiguous
unions still require an explicitly reviewed supported mapping; retained input
compositions fail publication with their field path.

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
5. Use **Select tested release** only after the exact deployment hash, current
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

## AgentGraph 0.16.3 stable runtime

Current source builds require the exact stable `heiner/agent-graph:0.16.3` release:

```bash
composer update heiner/agent-graph heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

Run all pending package and AgentGraph migrations before reopening traffic. Resume acceptance is recoverable across process loss, queued frontiers can be redriven after dispatch loss, and SDK cancellation atomically resolves a pending interrupt. Remove any application-level best-effort interrupt cleanup performed after `AgentGraphManager::cancel()`; duplicate resolution is no longer part of the integration contract.

The package pins AgentGraph `0.16.3`. Artifacts compiled against another AgentGraph release remain inspectable but are not executable under the current stable contract. Recompile and republish affected Playbooks, then publish and verify replacement Agent deployments before reopening traffic. The plugin Doctor treats `AgentGraphManager::recover()` as required SDK surface.

The 0.16.2 to 0.16.3 update adds no database migration or public method signature change. Stop long-lived workers while updating and restart them on the same installed dependency set. Resume now rejects expired, mismatched, or substituted interrupt responses and preserves complete checkpoint schedules and local Send inputs. Input already lost from an older wait checkpoint must be reconciled from trusted application records; republication cannot reconstruct it.

Native Laravel AI tool approvals now fail explicitly with `AgentApprovalRequiredException`. The plugin adapter does not convert that failure into a synchronous fallback or another model attempt. Use the existing graph approval interrupts; native Laravel AI approval resumption is not implemented by `AgentNode`. Memory writes return their receipt without counting as a read, including when the saved item has already expired.

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
candidate**, **Test release candidate**, and **Select tested release** separation.

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
