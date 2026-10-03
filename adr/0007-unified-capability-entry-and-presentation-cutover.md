# ADR 0007: Unified capability, entry, and presentation cutover

- Status: Accepted
- Date: 2026-08-21
- Decision scope: Published workflow contracts, idle-turn admission, capability invocation, and user-facing workflow messages
- Extends: ADR 0001, ADR 0002, ADR 0003, ADR 0005, and ADR 0006; it does not weaken their authority, durability, or side-effect invariants

## Context

The production runtime already has the correct safety owners: immutable workflow
deployments, one application-turn boundary, deterministic authorization,
AgentGraph state authority, and `CapabilityExecutionGateway` as the only
productive external-execution boundary. Connector contract v3 also proves that
provider-specific conversational code is unnecessary when input admission,
normalization, batch behavior, and result identity are declarative.

The remaining implementation does not express that model through one contract
and one path. Workflow routes, workflow slots, host actions, API operations,
Data Resources, batch policy, public metadata, and result presentation are
projected into several overlapping arrays and runtime views. Entry admission can
reject a supported route because one optional model-proposed value is invalid,
or can authorize a partial interpretation when one item from a list-shaped turn
was omitted. Capability payloads may be materialized independently for
confirmation and execution. User-facing protocol and workflow messages may be
rendered through different language and metadata paths. Internal workflow names
and descriptions can therefore become public copy.

API-, language-, and demo-specific conditions are not a scalable correction.
The package is pre-1.0 and the product owner has authorized breaking changes in
favor of the smallest coherent runtime. Persisted execution meaning, historical
inspection, side-effect ledgers, unknown-outcome reconciliation, and AgentGraph
authority still cannot be discarded or weakened.

## Decision

### 1. One immutable published workflow contract

Every productive deployment contains exactly one canonical
`published_workflow_contract.v1`. It is compiled after all workflow,
subworkflow, action, connector, Data Resource, behavior, and presentation
dependencies have been resolved and pinned. The deployment hash covers the
complete contract and its transitive dependency closure.

The contract contains four closed sections:

1. **Routes**: stable route identity, public label and description, examples and
   aliases, exact reachable target, and the capability bindings reachable from
   that route.
2. **Inputs**: stable field identity, JSON type/schema, requiredness,
   cardinality, allowed evidence sources, exact-source policy, semantic/entity
   type, normalization, aliases, ambiguity behavior, contextual value policy,
   and the workflow waitpoint that collects a missing value.
3. **Capabilities**: stable kind/key/version/hash, request and result schemas,
   read/write effect, confirmation and idempotency policy, batch mode and item
   bound, optional result-identity policy, response intents, deployment
   authority, and output/result role.
4. **Presentation**: public workflow identity, release-bound behavior profile,
   supported response languages, deterministic message intents, response
   format, result-formatting policy, citation/source policy, and output frames.

Actions, connector operations, Data Resource queries, memory operations, and
other package-owned capability kinds use the same capability descriptor. A
kind-specific immutable payload may be referenced by hash, but it cannot create
a second admission, authorization, batch, confirmation, or presentation
contract. Model-facing route and tool descriptions, execution manifests, and
admin diagnostics are bounded projections of this one contract. They are not
independent authority and do not re-derive policy from workflow-node arrays.

Adding a configured capability with new route, input, operation, and result
names requires contract data or an allowlisted capability driver, not a change
to entry planning, AgentGraph dispatch, the gateway pipeline, or presentation
code.

### 2. One entry-admission kernel and one direct authorized command

Idle-turn understanding produces one bounded, exhaustive semantic proposal
against the public projection of the verified published contract. The proposal
has no execution authority. One deterministic entry-admission kernel performs
all route binding, source-span coverage, input admission, entity resolution,
cardinality, independence, read-only, batch, and release-hash checks.

The kernel follows these rules:

- A safely matched supported route is not rejected merely because an optional
  proposed input is missing, invented, stale, or invalid. That candidate is
  discarded; the workflow starts and its declared waitpoint collects what is
  still required.
- A value is executable only when its literal, enum, deterministic contextual,
  or declared entity-resolution provenance is admitted by the published input
  contract.
- Every meaningful executable span in a multi-act or list-shaped message must
  be represented exactly once. Omitted, overlapping, reordered, unsupported,
  dependent, mixed read/write, or ambiguous work clarifies before execution.
  The apparently valid subset is never dispatched.
- Repeated values become ordered items only when every reachable capability
  declares compatible `fanout_safe` behavior and the smallest published item
  bound is respected. `single_only` and `native_batch` never imply fan-out.
- A clarification answer may select only one published route. It cannot restore
  a previously rejected value, task-frame reference, or capability argument.
- No provider, API, entity, language, city, product, or demo name is recognized
  by productive hard-coded keyword or regular-expression policy.

On success the kernel emits the exact typed `StartWorkflowCommand`, including a
single-item transition or Authorized Entry Turn Plan v2. There is no productive
post-admission mapper, second planner, task-frame router, capability classifier,
or inner reclassification. On failure it emits one typed protocol command or
durable route clarification and no workflow run.

### 3. One prepared invocation and one gateway pipeline

Every capability execution begins with one typed
`PreparedCapabilityInvocation`. It is deterministically materialized from the
verified deployment contract, current AgentGraph-owned workflow state,
server-attested turn/actor/tenant authority, and admitted inputs. It contains
the exact capability and node identities, deployment and contract hashes,
materialized payload and schema hash, effect, confirmation binding,
idempotency identity, execution mode, and result contract.

The same prepared invocation identity is used for confirmation and execution.
If an interrupt or process boundary requires reconstruction, the runtime
re-materializes from authoritative state and requires the same hash; it does not
persist credentials or trust a caller-supplied invocation. Payload, environment,
contract, or authority drift fails closed and requires a fresh authorized turn.

`CapabilityExecutionGateway` remains the sole public productive boundary and
applies one ordered pipeline:

```text
verify deployment and immutable contract
-> verify prepared payload and closed schemas
-> verify runtime authority and policy
-> verify confirmation binding when required
-> claim idempotency or write ledger
-> dispatch through the declared typed driver
-> validate result schema and optional result identity
-> finalize the durable ledger and typed outcome
```

Capability drivers own only kind-specific immutable-contract resolution and
dispatch. They cannot authorize themselves, alter the prepared payload, bypass
the gateway, own a second idempotency lifecycle, or render visitor messages.
Raw HTTP is not a second productive authority: it is either removed or compiled
at publish time into the same immutable connector/capability contract and
executed by the same driver boundary.

### 4. One turn locale and one message renderer

The application turn resolves one `TurnLocale` from server-attested channel,
bot, release, and user-language evidence. The locale is carried through the
authorized command and canonical outcome; downstream nodes do not independently
choose a response language.

All greetings, clarifications, waitpoint prompts, progress, confirmations,
capability errors, partial-result summaries, units, and final result frames are
typed message intents rendered by one message renderer from the immutable
presentation contract. Internal workflow names, migration notes, schema
versions, node keys, raw provider errors, and developer descriptions are never
public presentation defaults.

A release-bound model composer may improve natural wording only from the typed
intent, admitted facts, canonical capability results, locale, and behavior
profile. It cannot select a route, add or change an argument, claim an
unverified result, authorize a capability, or mutate workflow state. Invalid,
unavailable, unsafe, or schema-incompatible composition falls back to the same
deterministic renderer. Rendering remains downstream of canonical outcome
commit and never gains domain-transition authority.

### 5. Existing safety and durability owners remain unchanged

- AgentGraph remains authoritative for graph runs, checkpoints, interrupts,
  resume, delay, task/item cursors, structured concurrency, and cancellation.
- One multi-item turn remains one workflow run. Item baselines are isolated and
  final coverage is exact and ordered.
- `WorkflowRun`, pending interactions, and delivery ledgers remain operational
  projections and indexes, not alternate state authority.
- Writes retain exact deployment grants, confirmation, payload binding,
  idempotency, encrypted ledgers, redaction, unknown-outcome handling, and
  operator reconciliation. Unknown writes are never automatically retried.
- Canonical outcomes and visible messages are committed before JSON, SSE, or
  channel rendering.
- Subworkflows remain pinned in the parent deployment closure and cannot resolve
  newer capabilities at runtime.

## Non-goals

- This decision does not make model output execution authority.
- It does not introduce host-defined workflow node kinds, a generic command
  bus, a second checkpoint engine, microservices, or an event-sourced rewrite.
- It does not authorize dependent multi-act execution, compound writes,
  distributed transactions, compensation, or partial write success.
- It does not promise that every network protocol is expressible as a built-in
  declarative HTTP connector. An exotic protocol may require an explicitly
  allowlisted trusted driver, but it still uses the same published capability
  contract and gateway pipeline.
- It does not make drafts, mutable connector configuration, mutable bot
  presentation, or current provider catalogs productive runtime authority.
- It does not preserve pre-cutover PHP APIs, configuration keys, serialized
  runtime shapes, or productive aliases merely for compatibility.

## Migration and cutover

The cutover is fail-closed and occurs in a maintenance window.

1. **Characterize first.** Add deterministic characterization for deployment
   hashing, route/input admission, route clarification, multi-item coverage,
   capability confirmation, write unknown outcomes, AgentGraph resume/delay,
   result identity, locale, and canonical message commit before changing an
   owner boundary.
2. **Build non-productively.** Implement the new contract compiler, admission
   kernel, prepared invocation, gateway pipeline, and renderer behind compiler
   and test entrypoints. They do not run alongside the old productive path.
3. **Inventory and dry-run.** Produce a stable report for every draft, live and
   historical deployment, active run, pending interaction, entry clarification,
   task frame, delayed delivery, side-effect ledger, and connector/Data Resource
   dependency. Classify each as exactly convertible, requires republish,
   historical-only, or blocking. Ambiguous data blocks.
4. **Back up and verify restore.** Create an authenticated encrypted backup and
   test exact restore against a production-shaped database before mutation.
5. **Retire old productive eligibility.** Existing deployment artifacts do not
   gain the new contract through a runtime adapter. Live pointers to an old
   contract are retired. Incompatible active runs, pending interactions,
   clarification claims, task frames, and delayed deliveries are safely closed
   or quarantined with audit evidence; completed history and side-effect ledgers
   remain inspectable.
6. **Republish deliberately.** Compile, review, publish, hash-verify, and make
   live a new deployment for every workflow. A route, input, capability,
   presentation, environment, or dependency that cannot be represented exactly
   prevents publication. There is no lossy default, inferred public copy, or
   automatic selection of a replacement capability.
7. **Switch once.** Productive bindings are changed atomically to the new
   compiler, admission kernel, command, gateway pipeline, and renderer. A
   release cannot contain selectable old and new productive runtimes.
8. **Remove bridges in the same release.** Delete the old classes, configuration,
   persisted productive shapes, container bindings, and compatibility tests;
   then run forbidden-path and dead-code gates. Migration readers may remain
   only when isolated, read-only, and absent from application/runtime service
   providers.
9. **Verify the external host.** Republish the host workflows and verify the
   public widget/API path against the exact live deployment. Missing required
   providers or credentials make the corresponding integration claim blocked,
   never passed.

Rollback after the destructive mutation means restoring the verified backup
and the pre-cutover package release. It is not a down-migration that recreates a
productive compatibility runtime.

## Physical deletion requirements

The cutover is incomplete until all of the following are physically absent from
productive code:

- the parallel capability-discovery responder, keyword/pattern execution
  detector, catalog matcher, and any API- or demo-specific routing heuristic;
- independently authoritative workflow capability, route, batch, input, and
  public-presentation projections that re-derive policy from node arrays;
- post-admission route/target/command mappers or task-frame classifiers that can
  replace the direct authorized start command;
- per-capability batch normalization and string-key special cases in generic
  planners, publishers, executors, or renderers;
- separate confirmation-time and execution-time payload materializers,
  idempotency-key builders, or mutable request representations;
- direct capability dispatch outside `CapabilityExecutionGateway`, including a
  separate productive raw-HTTP authorization pipeline;
- per-executor visitor-message rendering, hard-coded language branches, and
  fallback to internal workflow metadata as public copy;
- productive readers for old deployment, entry, invocation, connector, or
  presentation contracts, plus aliases that can re-enable them;
- service-locator calls inside the changed runtime, workflow, capability, and
  presentation boundaries.

Historical DTOs and presenters may remain only when they are explicitly
read-only, allowlisted for inspection, and cannot be resolved by productive
chat, workflow, resume, or capability execution.

## Verification matrix

| Boundary | Required evidence |
| --- | --- |
| Published contract | Golden and mutation tests prove deterministic compilation, complete hash coverage, closed fields, transitive pins, and one canonical batch/input/presentation policy for actions, connector operations, and Data Resources. |
| Generic extension | Fixtures with previously unseen route, field, capability, provider, and result names execute without edits to entry, AgentGraph, gateway, or renderer code. At least one host action, one HTTP connector, and one Data Resource are covered. |
| Entry admission | Regression tests cover missing required input, rejected invented optional input, route clarification, contextual values, entity resolution, multilingual wording, complete list coverage, omitted-list-item repair, duplicates, mixed/dependent acts, and all-or-nothing rejection. |
| Batch policy | Tests prove `single_only` rejection, bounded `fanout_safe` ordering and isolation, `native_batch` non-fan-out, the smallest transitive bound, and no implicit fan-out for a capability without an explicit policy. |
| Direct command | Architecture and behavior tests prove that successful admission creates exactly one typed start command/plan, inner classifiers are not invoked, and clarification or rejection creates no run. |
| Prepared invocation | Confirmation and dispatch use the same invocation hash. Payload, schema, environment, authority, deployment, and contract mutation all fail before dispatch. No credential is persisted in the invocation or checkpoint. |
| Gateway safety | Fault-injection tests cover exact grant binding, idempotent replay, result-schema and identity mismatch, transport failure before/after dispatch, unknown writes, ledger fence loss, operator reconciliation, and one gateway crossing per external call. |
| AgentGraph durability | Existing checkpoint, interrupt, resume, delay, cancellation race, structured-concurrency, multi-item cursor, item-isolation, terminal recovery, and canonical outcome tests remain green without a second state owner. |
| Presentation | Locale tests cover every supported language, deterministic fallback, typed waitpoint/error/partial-result copy, unit formatting, source/citation policy, no internal metadata leakage, and a model composer that cannot alter facts, authority, or state. |
| Migration | Dry-run, backup/restore, exact classification, ambiguous-data blocking, old-live-pointer retirement, active-state quarantine, deliberate republish, historical inspection, and irreversible cutover tests are required. |
| Architecture removal | Forbidden-symbol/config/container-binding tests, dependency-boundary tests, public-API allowlist checks, and dead-code analysis prove that no productive bridge or service-locator fallback remains. |
| External host | The real host verifies greeting, missing-input collection, route clarification, multiple independent requests, repeated items, localized results, typed capability failure, confirmed write, and a newly configured capability through widget/API and the pinned live deployment. |

## Consequences

The runtime becomes smaller in authority count, not weaker in safety. New APIs,
databases, and host resources share one declarative admission and execution
model; differences remain in their immutable contracts and drivers rather than
in conversation code. Some formerly accepted deployments and active
interactions intentionally stop working until reviewed and republished. That is
the authorized pre-1.0 cost of removing silent partial execution, stale
contracts, internal-copy leakage, and permanent compatibility architecture.
