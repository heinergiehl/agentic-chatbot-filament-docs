# Agent Runtime Architecture

This document describes the implemented production runtime for Filament Agentic Chatbot.

## One Productive Runtime

Every chat request is bound to exactly one verified live workflow deployment. A bot without that deployment is unavailable for widget, API, channel, and tool chat.

Simple Assistant and Knowledge Assistant are starter workflows. They use the same publish, activation, planning, execution, persistence, and inspection path as every custom workflow. There is no runtime selector, deploymentless answer path, global tool escape, or recursive workflow tool.

Starter migration readiness is derived from the production compiler output, not from UI labels or a legacy behavior presenter. The canonical node contracts declare typed semantic roles such as entry, user response, and knowledge. One runtime semantic profiler owns reachability and role evidence for migration checks, launch readiness, and workflow/knowledge presentation; those consumers do not reinterpret the graph. The signed migration plan binds the exact compiled runtime fingerprint and semantic profile; after publication, migration verifies the immutable deployment, dependency closure, runtime fingerprint, and semantic profile before making it live.

## Request To Response

```text
HTTP, widget, or channel adapter
-> ChatEndpointContextResolver
-> ChatTurnApplicationService::execute(context, Complete|Stream)
-> DurableChatTurnService acquisition and idempotency
-> ChatTurnRequestExecutor
-> RuntimeTurnPlanner
-> RuntimeTurnPlanCompiler and TurnPlanValidator
-> RuntimeTurnAuthorizer
-> TurnStateTransitionGuard
-> AuthorizedTurnCommandExecutor
-> WorkflowCommandHandler
-> WorkflowTurnExecutor and AgentGraphWorkflowRuntime
-> typed outcome committer
-> ChatTurnResponseRenderer
```

Transport adapters resolve identity, access, bot, conversation, area, and client-turn identity. They do not select a workflow transition, mutate graph state, or execute a capability.

`ChatTurnApplicationService` owns the application transaction sequence. It acquires the durable turn, verifies the exact release safety policy against the raw input before any user content is persisted, stores either the accepted message or a localized non-secret blocked placeholder, executes only accepted input, commits one typed outcome, and only then returns a protocol response. Replaying the same accepted client-turn identity returns the stored response without executing again.

## Deployment Selection

`WorkflowRuntimeArtifactRepository` resolves the bot's live deployment. Productive execution accepts only an immutable `AgentWorkflowDeployment` whose hash, workflow/version identity, runtime schema, manifests, and complete dependency closure verify.

Planning records that deployment as one typed authorization reference containing bot, workflow, deployment, and hash identity. Run reservation locks the conversation, bot, and workflow and verifies both live pointers against that same reference; it never reselects a newer deployment after the turn has been authorized. A concurrent release therefore produces a retryable turn-state conflict and no run.

Every live reservation, including direct `WorkflowRunner` use, crosses that typed boundary. The convenience entrypoint first resolves the current bot deployment and then repeats the exact bot, conversation, workflow, deployment, and hash checks under the reservation locks. Preview and quality execution are separate persisted modes and cannot enter this live fallback.

Drafts and authoring payloads never execute as live chat. Editor tests use separately identified preview artifacts. Rollback selects an existing verified historical deployment; it never recompiles historical authoring data.

The bot and workflow live pointers are projections managed by `WorkflowReleaseService`. Publish, make-live, stop-live, and rollback callers use that service rather than model helpers or editor-side pointer writes.

## Interpretation, Planning, And Policy

Contextual semantic interpreters may propose entry intent, slot meaning, waitpoint intent, clarification, or safe protocol text. A proposal has no execution authority.

At idle, one bounded primary Workflow Turn Understanding call classifies the current natural-language message against the verified deployment's public workflow and capability contract. Deterministic entry admission may request one constrained repair from that same interpreter for a repairable read-only contract-shape error; call count and repair reason are recorded. Only a clear `supported_request` may proceed to workflow start. Greetings, workflow or conversation-history questions, and unsupported requests return grounded protocol text; ambiguous or unavailable interpretation clarifies without creating a run. Explicit tool starts and exact typed workflow controls remain deterministic fast paths. This is the same canonical interpretation boundary used where active waitpoints need language understanding, not a second planner or execution authority; every result remains an untrusted proposal checked against the deployed contract and deterministic policy.

Entry understanding consumes a minimal public projection of every published start route, declared public slot schemas, and public capability descriptions and examples. It does not receive internal node inventories, stored slot values, keyword lists, or confirmation details. The same structured call may propose bounded initial slot candidates only when each value is backed by a literal span in the latest message; deterministic route binding, declared-slot validation, type validation, and provenance checks decide whether any candidate is admitted. Missing or rejected inputs do not block a supported request; the workflow starts and its own waitpoints collect and validate what remains.

When the release contract publishes semantically labelled entry intents, `supported_request` cannot start a run without one exact route binding above the calibrated route threshold. A missing or weak binding produces a targeted clarification and no fallback to an alternative classifier. A linear release whose structural start route has no labelled intents may start directly from one high-confidence supported interpretation.

Conversation-history recall is a read-only protocol branch of that same entry interpretation. A closed recall kind selects `ConversationRecallResponder`, which can read only the already compiled bounded context snapshot. Conversation summaries remain explicitly untrusted context, are never promoted to workflow variables, and cannot authorize a transition or capability.

Entry contract v8 is exhaustive rather than winner-takes-all. For a message with several acts, each act must cite an ordered literal source span and bind to one exact published route. Deterministic policy authorizes one `Authorized Entry Turn Plan` version 2 only when every executable act is an independent read and every reachable branch is read-only. The plan groups distinct objectives as tasks and repeated inputs for the same route as items, preserves user order, and binds both the workflow release-contract hash and capability-contract hash. Mixed, dependent, duplicate, unsupported, or incompletely covered turns clarify without partially executing the apparently safe subset.

The same entry contract is the sole semantic owner for result-set follow-ups. It may emit only declared operation keys plus an explicit result-set reference. Freshness, field-role authorization, patch construction, single-use binding, and pinned DataQuery validation are deterministic. There is no separate productive turn-act classifier or task-frame continuation router.

At a waitpoint, semantic understanding may propose only a closed side-question kind and the current turn language. A deterministic responder answers from the authoritative pending-input contract—purpose, format, choices, optionality, confirmation effect, or current step—and never from model-authored facts. Unknown questions state that limitation and repeat the pending question. Ambiguous input repeats the authoritative question and available choices without resolving the interrupt or mutating workflow state.

The deterministic runtime then:

1. compiles a bounded `TurnContextPack` and authoritative turn-state snapshot;
2. compiles and validates a candidate plan whose `candidate` steps still have no execution authority;
3. `RuntimeTurnAuthorizer` evaluates deterministic policy, selects exactly one step, binds authoritative workflow/run/waitpoint identity, pins the deployment, and issues any side-effect grants;
4. the authorizer discards alternative candidate steps and returns exactly one closed `AuthorizedTurnCommand` variant or one non-executing protocol command; its payload contains scalar identities, a bounded selected plan, and an optional typed `AuthorizedWorkflowTransition`, never Eloquent models or the mutable chat request;
5. `TurnStateTransitionGuard` compare-and-sets state versions only for the exact start, resume, cancel, or state-bearing hold command;
6. the exhaustive command executor applies the authorized transition without semantic interpretation, route selection, or command replacement.

Unsupported, ambiguous, stale, or unowned requests produce a bounded clarification or blocked response. Static meta/waitpoint text is a protocol result inside the workflow boundary; it cannot call a capability or replace the live workflow.

There is no productive Directive, Target, or post-authorization Mapper representation. When an authorized workflow start consumes route data from its candidate plan, the server-reserved command envelope attests the exact command type, plan ID, and step ID. Inner workflow nodes fail closed if that command-plan-step attestation is absent or mismatched.

Pre-workflow route clarification is durable but is not an AgentGraph interrupt. `bot_entry_clarifications` binds the original input, admitted entry acts, route options, source turn, bot, conversation, workflow deployment, and release-contract hash until the route answer is resolved. An unmatched greeting, meta/help/status question, or unsupported request preserves the active clarification; a clear new request supersedes it. A matched answer enters a compare-and-set claim lifecycle (`available`, `resolving`, `finalized` or `reconciliation_required`). The resolving claim and its concrete run ID are recorded in the same transaction as run reservation, safe pre-dispatch failures restore availability, and unknown post-dispatch outcomes require reconciliation. A route answer is control provenance only: it may select a published route but can never become a workflow slot or capability argument.

## Workflow Commands

The productive command set is closed:

- start the verified live workflow;
- resume its verified AgentGraph interrupt;
- cancel the current workflow task;
- hold the current run while returning a safe clarification;
- return a protocol response that performs no external work.

`WorkflowCommandHandler` is the workflow-transition entry. It receives transport data separately from the authorized command, resolves the pinned execution artifact, and passes only the selected bounded plan, authoritative turn state, effective input, and typed continuation transition to `WorkflowTurnExecutor`. Exact local state patches selected before authorization are applied idempotently; they cannot reinterpret input or change the command.

The internal workflow-turn requests expose no requested-mode, JSON variable,
or transport selector. Fresh starts enter only through an authorized
`StartWorkflowCommand`; resume, hold, cancel, and replacement behavior is
derived from the attested turn-state snapshot and its exact
`AuthorizedWorkflowTransition`.

## AgentGraph State Authority

AgentGraph owns graph-backed run, checkpoint, interrupt, resume, delay, task, and structured child-execution state.

When a workflow state carries AgentGraph context, AgentGraph is also the sole
runtime memory authority. Missing reads and empty searches are authoritative
results and never fall back to legacy `WorkflowMemory` rows. Legacy rows remain
available to the explicitly separate no-AgentGraph path and to lifecycle,
privacy, migration, and operator-correction surfaces.

`WorkflowRun` and `BotPendingInteraction` are operational projections. A projection write verifies the SDK run/thread/graph/deployment/checkpoint/interrupt identity and advances `WorkflowRun.state_version` with a one-step compare-and-set. Stale writers fail without rewriting AgentGraph.

Current-state projection is deliberately bounded: it reads only the AgentGraph run, current checkpoint, and pending interrupt. Checkpoint history, write history, traces, and timelines are diagnostic surfaces and are never loaded as part of a productive turn.

Resume is accepted only from the current SDK interrupt and a typed, policy-authorized resolution. Full Laravel state is never merged into a checkpoint. Missing projections may be rebuilt from the current SDK interrupt without replaying a side effect.

Resume, recovery, and cancellation attest the projected run ID against the SDK run, thread, graph, immutable deployment, hash, and runtime schema before any SDK transition. A foreign or unverifiable binding fails closed without mutating either run. Idempotent cancellation is recognized from a freshly attested SDK status, never from exception text. If completion or failure wins a cancellation race, the authoritative terminal checkpoint is projected and reported truthfully instead of being relabelled as cancelled; a version- and token-bound close claim prevents failure recovery from reopening that terminal projection.

Interrupt reads first attest the Laravel projection against the SDK run, thread, graph, and immutable deployment binding, before looking up or projecting an interrupt. They then have three explicit outcomes: `found`, `absent`, and `unavailable`. Only confirmed absence from a valid binding may close or stale an operational projection. A foreign or stale binding is invalid; an unavailable SDK store or run inspection preserves the pending state, returns a retryable result, and leaves queued delay delivery retryable. Neither case is presented as a missing pause.

Age is only an attestation trigger. A stale-looking running or delayed projection
is preserved while a resume delivery is active, while AgentGraph reports
running/interrupted progress, when authority is unavailable, or when dispatch
may have occurred before the first local graph projection. A verified terminal
SDK state may be projected and reconciled; `updated_at` alone never proves an
orphan and never authorizes cancellation.

Queued workflow delays carry an encrypted continuation authority issued from the server-attested turn context and bound to the exact run, conversation, bot, deployment hash, and schema version. Delivery re-attests those identities and the current conversation-bound access token before resuming. Revoked, expired, scope-drifted, or capability-reduced tokens fail closed; accepted continuations restore the trusted actor/tenant context and the fresh access-token model so AI limits, monthly budgets, and usage attribution remain identical to the originating channel.

Delayed delivery ownership is separate from `WorkflowRun` projection state. `workflow_resume_deliveries` binds one queue delivery to the exact AgentGraph run, checkpoint, interrupt, projection version, deployment hash, and encrypted continuation authority. A leased delivery marks SDK dispatch before calling resume; an expired pre-dispatch claim is safe to reclaim, while an expired dispatching or unknown delivery must inspect AgentGraph first. If the original interrupt still exists, the delivery may retry. If AgentGraph advanced, `recover()` projects its authoritative checkpoint without resending resume. A scheduled sweeper redispatches due, unknown, or lease-expired ledger rows, closing the database-to-queue crash window without creating a second workflow-state authority.

Once automatic attempts are exhausted, an expired claimed or dispatching delivery is moved to `unknown`, its lease is cleared, and reconciliation metadata is recorded. It cannot remain stranded in an unsupported in-flight state or be redispatched automatically; an audited operator action is required for one further inspection/recovery cycle.

Subworkflows are pinned in the parent deployment's transitive dependency closure. Structured concurrency owns child start, completion, failure, timeout, and cancellation propagation. A child cannot resolve a newer workflow or deployment at runtime.

An Authorized Entry Turn Plan remains one workflow run. AgentGraph owns its
task/item cursor and executes every already-bound item through explicit graph
transitions. The classifier consumes the authorized route embedded in the
current task; it does not classify again. Every item starts from the same
isolated variable baseline and records one typed outcome. A failed read cannot
suppress a later independent read. The final checkpoint contains exact coverage
metadata and one ordered combined output; intermediate branch outputs are not
committed as separate visitor-visible messages.

## Workflow Behavior Authority

User-facing answer style is release authority, not mutable bot state. Schema-v2
authoring stores a typed `policies.behavior` contract. `mode: inherit` copies the
linked bot's role, audience, tone, answer length, language list, fallback and
citation guidance, response format, source-display setting, and boundaries at
publish time. `mode: custom` stores only the closed workflow-owned fields for
tone, length, response language, uncertainty behavior, citations, response
format, role, audience, and boundaries. Runtime references and unknown fields
are rejected in both modes.

The resolved `workflow_behavior.v1` snapshot is written into the immutable
runtime policy and into each user-facing `answer` or `workflowAgent` node. It is
therefore covered by the deployment hash and revalidated before use. Later bot
edits cannot alter an active deployment; republishing creates a different
artifact. Internal AI processing such as query rewriting, summarization, and
structured extraction does not receive the user-facing persona, citations, or
format policy and cannot be destabilized by mutable bot presentation settings.

Behavior policy controls wording only. It never grants tools, data access,
writes, routing, handoff, confirmation, or workflow-state authority. Canvas
notes remain non-executable annotations and are never promoted into prompts,
permissions, or runtime behavior.

## Workflow Safety Boundary

Every published workflow carries one closed `workflow_safety.v1` policy. The
authoring modes are `standard`, `strict`, and `custom`, but the credential,
workflow-authority-override, and prompt-leak protections plus fixed input/output
size ceilings cannot be disabled. Strict and custom modes may only tighten the
baseline. Publication resolves the policy into the runtime snapshot and policy
manifest, so any change creates a different deployment hash and later draft or
bot edits cannot change an active release.

The live chat application inspects raw input before persisting its content and
before turn routing, semantic planning, AI execution, tools, or writes. Rejected
input is represented durably only by a localized placeholder plus a SHA-256
input fingerprint on the turn. The application inspects the complete finalized
result again before outcome selection, then protects each canonical assistant
message once more immediately before persistence. JSON and SSE are rendered
only from that committed safe outcome. Interactive prompts use an allowlisted
public payload so cards, choices, metadata, or run projections cannot
reintroduce rejected text. Editor Preview and Quality Lab execute the same
boundary against the exact preview deployment artifact before recording a
workflow path.

A rejected input produces a completed, localized recovery result without
dispatch. A rejected output is replaced rather than partially redacted, and
public evidence contains only stable category/direction metadata, never the
matched secret or blocked term. A missing, malformed, weakened, or unsupported
runtime policy fails closed. The optional `guardrail` workflow node remains for
domain-specific validation and explicit branching; it cannot replace or bypass
the global boundary.

## Capability Execution

`CapabilityExecutionGateway` is the only productive boundary for workflow actions, workflow-agent read tools, API Operations, raw HTTP, and memory writes. `CapabilityGrantAuthorizer` is an internal deterministic policy component invoked only by that gateway; it authorizes exact grants but never dispatches capabilities.

Live writes always require a non-empty payload schema, trusted payload provenance,
an exact Runtime V2 grant bound to the immutable deployment, and canonical
payload-bound engine confirmation. These requirements do not depend on the
Laravel environment and have no configuration switch. Reads remain free of
write grants and write confirmation; Preview and Quality modes cannot acquire
live-write authority.

The gateway performs, in order:

1. immutable contract and deployment-pin resolution;
2. exact payload materialization and closed-schema validation;
3. runtime-authority and policy verification;
4. confirmation binding when required;
5. idempotency claim;
6. dispatch;
7. typed result validation;
8. durable ledger finalization.

Memory, action, API Connector, and raw HTTP writes cannot reach handler or
transport dispatch without a positive lease-fenced ledger claim. This invariant
has no environment or configuration switch; reads remain ledger-free. Write
policies choose exactly one canonical identity: the hash-bound prepared
invocation, or typed business-key components derived only from authorized
payload and server-attested context. Retry, AgentGraph resume, and operator
review reuse the original claim; a separately confirmed invocation can receive
a new invocation-scoped claim.

The public execution boundary remains the gateway. Internally, deployment and
authority binding, write-context materialization, and closed outcome creation
are separate deterministic collaborators so the gateway retains one readable
pipeline without introducing capability-specific bypasses.

Published API operations use connector contract version 3. Their declarative
input policies define admissible literal or enum values, semantic/entity types,
normalization, aliases, and ambiguity handling for every provider rather than
encoding API-specific fixes in the planner. `batch_mode` and `max_items`
describe whether one operation may be safely fanned out or called natively in
batch. Optional result-identity evidence independently verifies that a
successful provider response belongs to the canonical requested entity.

Capability requests always declare their execution mode explicitly. Every live read or write requires a persisted `WorkflowRun`, the run-bound persisted bot and conversation, server-attested runtime authority, and exact deployment ID, hash, and runtime-schema identity verified from the immutable run artifact. A capability cannot gain live authority merely from a callable action or a caller-supplied state object; preview and quality execution remain isolated in their declared non-live modes. The connector operation workbench is a narrower non-live exception: it accepts reads only with an in-memory server permit bound to the exact operation and contract hash, which cannot be supplied by workflow JSON.

Every action contract declares both a non-empty request schema and a non-empty result schema. Missing result contracts fail during provider registration; handler results that violate the immutable hash-bound contract fail before they can become workflow state.

The ordinary AI task and answer nodes remain tool-free. Tool choice is available only through the dedicated `workflowAgent` runtime node, authored as the Expert-level `agentAnswer` semantic step. Publication resolves one to eight exact read-only `CapabilityActionDefinition` contracts, freezes their version, contract hash, request- and result-schema hashes, semantic profile, optional Data Resource bindings, and node budgets into the deployment, and rejects writes or mutable capability catalogs. Runtime re-resolves and compares every pin before constructing model-facing adapters. Those adapters are not execution authority: every call crosses the action path of `CapabilityExecutionGateway`, and the model cannot override server-supplied resource allowlists or binding evidence.

Workflow-agent v1 is deliberately sequential and read-only. Hash-bound limits cap model steps, total calls, identical repeats, per-result bytes, aggregate result bytes, and wall-clock time. Tool results enter the model only as bounded untrusted data. Durable traces contain capability identity, hashes, status, sizes, timing, and counters, but no raw arguments or results. Provider/model profiles must explicitly attest developer-instruction and tool support. Writes remain explicit workflow nodes behind the existing confirmation, idempotency, unknown-outcome, and reconciliation contracts; model-proposed writes are not part of this runtime version.

One canonical capability result is stored under the declared output variable. Trace output is a bounded preview, while answer composition resolves the canonical value only when needed. Per-variable and total serialized workflow-state budgets stop an oversized result with an explicit non-retryable outcome instead of allowing PHP or database serialization to exhaust the process.

Write handlers do not own a second idempotency lifecycle. A dispatched write with an unverifiable outcome is stored as `unknown` with reconciliation required and is never retried automatically. Operator reconciliation records the verified external outcome; it does not redispatch the write. The Filament recovery path re-scopes the selected ledger row to its `WorkflowRun`, re-authorizes the authenticated operator against that exact row on the server, requires audit evidence and explicit no-retry acknowledgement, and exposes no encrypted payload data. A privileged console path covers non-workflow ledgers.

Every productive write grant is bound to the authorized parent workflow deployment ID and hash. The capability-grant authorizer compares that identity with the pinned `WorkflowRun` before accepting the grant, so a grant cannot cross a release boundary even when node and operation identifiers remain unchanged.

## Knowledge And Evidence

Knowledge is a workflow capability. Attached sources are searched only by a reachable Knowledge step in the live deployment.

Retrieval produces typed evidence with source identity, score, and citation metadata. Answerability uses per-source scores; a minimum evidence count is satisfied only when that many allowed sources clear the threshold. When citations are required, only valid `[n]` references to allowed evidence count, and invalid or filtered references force abstention. Provider output cannot promote untrusted model text into verified evidence.

## Durable Outcomes And Rendering

The application commits one canonical outcome before JSON or SSE serialization. Supported outcomes cover completed, collect-input, confirmation, delayed, cancelled, failed, and unknown states.

The committed outcome stores stable message/run/interaction identities and the transport-independent payload. JSON, SSE, and channel adapters render that same outcome. Renderers do not create domain transitions, repair projections, or execute capabilities.

Final workflow-answer policy is read from the verified deployment pinned to the `WorkflowRun`. A later publication may change future runs, but cannot retroactively enable model rewriting or otherwise change presentation authority for an existing run.

If AgentGraph reached a terminal checkpoint but the process failed before `WorkflowRun`, `ChatTurn`, or the assistant message was finalized, a retry of the same durable turn projects the authoritative terminal state and commits the missing outcome without dispatching a node or external capability again. Workflow node and final-answer messages remain provisional in the in-memory execution result. The canonical outcome transaction materializes the visible `BotMessage` rows, replaces provisional identities with canonical IDs, and replays idempotently. No visitor-visible workflow message is durable before that transaction.

Structured read results carry one turn locale. Units are formatted centrally
for that locale, and entity labels may be localized only from explicit maps
keyed by stable canonical IDs; missing mappings fall back to the canonical
provider value rather than free model translation.

Turn authority and message presentation have separate identities. The positive durable `ChatTurn` ID is the active turn ID used by AgentGraph resume, capability execution, budgets, and usage attribution. The assistant turn ID (`user-message-{id}`) groups visitor-visible messages, quality evidence, and diagnostics. Presentation code never overwrites the active authority identity.

The public SSE endpoint is a commit-first event projection, not a pre-commit token channel. It emits complete committed messages and never simulates streaming by splitting finished text into artificial deltas. Explicit `WorkflowRunner` callers may receive ephemeral provider deltas through a callback, but that callback is not a domain-state or public-chat authority. Schema-v2 authoring derives callback eligibility from the typed step kind; it is not a visitor-visibility setting and does not control conversation memory.

Unexpected failure before a definitive outcome becomes `unknown`; the durable turn remains protected from automatic re-execution. Known validation or policy failures become bounded terminal outcomes with safe error codes.

Known capability failures also carry a closed response intent such as `not_found`, `invalid`, `rate_limited`, `unavailable`, or `forbidden`. One deterministic renderer localizes that intent from the current turn language. Connector configuration may select only an allowlisted intent and cannot inject recovery code or override unknown-write reconciliation.

## Release And Migration Operations

Operational cutovers use actor-bound, HMAC-signed reports, deterministic inventories, compare-and-set mutation plans, and new-only output files. Ambiguous data blocks. Destructive durable migrations require an authenticated encrypted backup and tested exact restore.

Migration readers may recognize removed pre-cutover values solely to classify stored data. Those readers are not registered in the productive chat path and cannot enable a removed runtime.

## Supported Extension Boundary

The supported host surface is allowlisted in [Public API](PUBLIC_API.md). In particular:

- host actions are immutable `CapabilityActionDefinition` values supplied by a tagged `CapabilityProvider`; their required `CapabilitySemanticProfile` is secret-free, hash-bound metadata and never execution authority;
- optional `CapabilityEntityResolver` implementations are local, deterministic canonicalizers selected only by declared slot entity type; external lookup still crosses `CapabilityExecutionGateway` as a deployed workflow capability;
- content extraction, chunking, and source URL resolution use their public contracts;
- node kinds and runtime schemas are package-owned;
- internal planners, registries, Eloquent model aliases, and runtime configuration trees are not extension APIs.

## Required Invariants

- one verified live deployment per bot;
- one application turn entry and one workflow command handler;
- semantic interpretation proposes; deterministic policy authorizes;
- AgentGraph is the graph-state authority;
- capability work crosses `CapabilityExecutionGateway` exactly once;
- writes preserve confirmation, payload binding, authority, idempotency, redaction, unknown-outcome, and reconciliation guarantees;
- canonical outcomes are committed before rendering;
- missing, stale, corrupt, ambiguous, or unverified state fails closed.

## Verification

The package release boundary runs the full test suite, runtime baseline/release gates, recovery and migration evidence, dead-code checks, archive-manifest validation, and marketplace readiness. Provider or external-host evidence is reported as blocked rather than passed when the required credentials or compatible host state are unavailable.

See [AgentGraph SDK Usage](AGENTGRAPH_SDK_USAGE.md), [Agentic Workflows](AGENTIC_WORKFLOWS.md), [Operations](OPERATIONS.md), and the accepted [Production Runtime Boundaries ADR](adr/0001-production-runtime-boundaries.md).
