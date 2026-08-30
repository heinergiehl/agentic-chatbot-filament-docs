# Agent Runtime Architecture

This document describes the implemented production runtime after the agent-first hard cutover.

## Product Model

An Agent owns the conversation. A Playbook is an optional deterministic tool
that the Agent may invoke for a bounded process. A simple conversational or
knowledge Agent does not need a Playbook.

Every productive Agent is represented by exactly one live, immutable,
hash-verified `AgentDeployment`. Its closed contract freezes behavior, model
policy, one exact provider/model/driver/base-URL binding, effective token and
monthly budgets, exact read-only Data Resource and Connector operation pins,
and exact Playbook deployment pins. Provider fallback lists are authoring-time conveniences only
and cannot be published as productive Agent authority. Mutable bot, Connector,
or Playbook authoring data is never consulted as runtime authority.

API Connectors, Data Resources, knowledge sources, channels, access tokens,
usage accounting, limits, human handoff, and operational inspection remain
product capabilities. They do not own conversation routing.

## One Productive Turn Path

```text
HTTP / widget / channel
-> ChatTurnApplicationService
-> DurableChatTurnService
-> AgentTurnLoop
-> verified AgentDeployment
-> AgentTurnModel
   -> answer or clarify directly
   -> optionally invoke one or more exact deployment-pinned read tools
   -> or invoke an exact deployment-pinned Playbook tool
-> canonical ChatTurnResult
-> durable outcome and assistant-message commit
-> JSON / SSE renderer
```

`AgentTurnLoop` is the sole productive implementation of
`ChatTurnRequestExecutor`. It handles normal conversation, empty-input
clarification, provider failures, and Playbook results. Provider exceptions are
mapped to bounded errors and localized safe answers; raw exception text is not
returned to visitors.

Transport resolves access, bot, area, conversation, and client-turn identity.
It does not select a Playbook, mutate workflow state, or authorize a
capability. `ChatTurnApplicationService` applies the safety boundary and
commits a canonical outcome before a renderer can serialize it. Replaying a
completed client-turn identity returns the persisted result without another
model or capability call. The same identity may be replayed through JSON or SSE;
transport choice and a later active deployment do not change the canonical
request identity or persisted result.

## Agent Deployment Authority

`AgentDeploymentPublisher` creates an immutable contract and deployment hash.
Publication freezes:

- behavior and response policy;
- exact provider, driver, base URL, model, input/output limits, and monthly
  token/cost policy;
- allowed knowledge and data authority;
- exact published read-only Connector operation revision, contract and input
  schema hashes, environment binding, discovery metadata, input policies, and
  optional result-identity proof;
- exact Playbook workflow ID, deployment ID, deployment hash, tool identity,
  and structured invocation contract (outcome, start rule, exclusions, and
  examples); and
- the release metadata needed to verify the contract.

Publication selects that immutable artifact as the Agent's release candidate;
it does not change live traffic. `AgentReleaseService` runs the exact candidate
through the normal persistent `ChatTurnApplicationService` runtime using a
server-attested admin-test conversation. A passing evidence record binds the
candidate ID and hash, productive authoring fingerprint, committed Chat Turn,
operator, and evidence hash. Productive writes remain blocked by
`CapabilityExecutionGateway` during this test. Activation locks the Agent row,
compares both the expected candidate and previous live deployment, then locks
the candidate plus every referenced Playbook, Data Resource, Connector-
operation, Connector-environment, Knowledge-source, and Knowledge-generation
head before recomputing the current authoring fingerprint. It revalidates the
immutable artifact, release-test evidence, and
durable Chat Turn. Required Candidate Quality runs and every ordered quality
turn are HMAC-attested, locked, and re-bound to their exact terminal durable
Chat Turns and server-attested test conversations before the live pointer is
changed atomically. No direct productive publish-and-activate path exists.

`AgentDeploymentRepository` resolves and verifies the deployment selected for
the durable turn. A missing, foreign, mutable, or hash-invalid deployment fails
closed. Later authoring changes require publication of a new deployment; they
cannot alter an in-flight or historical turn.

There is no global tool or Playbook registry, client-selected operation or
workflow ID, mutable authoring fallback, or legacy main-workflow conversation
owner.

## Direct Read Capability Invocation

`AgentConnectorTurn` and `AgentDataResourceTurn` project only exact immutable
entries from the verified Agent deployment into model-visible tools. A direct
tool is eligible only when its published effect is `read`; every write,
approval, wait, or dependent multi-step job belongs in a Playbook.

Each approved Data Resource becomes its own closed read tool. Its normalized
resource definition, contract hash, allowed query modes, fields, filters,
sorting, scope rules, and list limits are copied into the Agent deployment.
Custom scope-source paths and code-reviewed static scope values are pinned with
that definition; request-specific authority values remain server-attested at
execution. Runtime never consults mutable host or Bot scope configuration for a
live direct tool.
Model-proposed filter values are type-checked and, except for booleans, must be
literal evidence in the latest visitor message before the central capability
gateway may execute the bounded database query.

The model sees the operation purpose, realistic intent examples, entity types,
closed JSON input schema, and a bounded set of explicit visitor aliases. This
metadata helps a smaller model associate terms such as “Bisaflor” with a
Pokémon lookup without adding API-specific routing classes. Metadata proposes
the route; it never authorizes it.

Each call is checked twice: the tool adapter and `CapabilityExecutionGateway`
independently bind every argument to literal evidence in the latest visitor
message, apply exact published aliases, optionally apply the pinned `safe_v1`
matcher only against that published alias map, or use a registered deterministic
resolver only for `capability_resolver`; they then validate the closed schema,
re-resolve the exact revision and environment, and verify declared result
identity. The safe matcher auto-corrects only a unique close candidate and turns
every uncertain candidate set into the contract's configured clarify-or-reject
outcome. Unknown literal values remain literal values. A host resolver used
directly must expose a stable key, version,
and behavior hash through `VersionedCapabilityEntityResolver`; that identity is
pinned into the Agent deployment and reverified at both admission and gateway
execution. Merely registering a resolver never changes `literal` or `enum`
behavior. An ungrounded correction is rejected unless the immutable contract
selects the published alias matcher or a versioned resolver returns an
unambiguous canonical value.

A scalar read input may explicitly publish
`continuation_mode: exact_previous_success`. After a complete authoritative
success, the runtime stores only those admitted fields in an encrypted,
hash-checked binding scoped to the conversation, capability, immutable Agent
deployment, and source user message. For the immediately following persisted
user message, a strict bounded follow-up grammar such as “Und morgen?” may make
that field optional in the tool schema; the model must omit it and the server
supplies the exact prior value. Unknown words, expiry, an intervening user turn,
a different conversation/capability/deployment, non-scalar inputs, writes, and
model-proposed historical values all fail closed. Expired ciphertext is pruned
by the package scheduler.

Continuation bindings use `binding_version: 2`; their uniqueness scope includes
`source_message_id`. A successful read in the current turn cannot overwrite the
previous turn's binding while that earlier source is still needed. Different
targets for the same capability and source message produce an empty `[]`
binding: ambiguity remains sticky for that source, even if another successful
call follows. The runtime never selects the last target of a fan-out as an
implicit continuation. Legacy version-1 rows remain encrypted and unchanged
until TTL cleanup, but are not executable. The source-scope migration requires
a quiesced host and a verified backup; see [Upgrading](../UPGRADING.md).

A read tool may be repeated for independent items only when the immutable
operation contract declares `fanout_safe`; `max_items` and the global five-call
budget both apply, leaving the sixth model step available for the final answer.
`single_only` and `native_batch` permit one call, with a
native batch owning its list input inside that call and the published
`max_items` bound constraining every declared array. Server-owned or prior-task
input policies are Playbook-only and make an operation ineligible as a direct
tool.

Calls remain separate evidence records with an exact evidence identity,
capability identity, redacted requested and grounded input provenance, and the
payload actually delivered to the model. Successful and replayed execution
traces must bind back to that same record; several calls cannot be justified by
one flattened union of unrelated values. A missing call evidence identity is
incomplete even when capability names or redacted inputs match. Each
model-visible result is bounded to 16 KB and all Connector results in one turn
share a 48 KB budget; truncation becomes incomplete evidence rather than a
silently shortened success. Provider partial results, missing records, and
explicit call failures cannot be presented as complete evidence. Ambiguous
resolver candidates still produce an input clarification.

For complete direct reads, the model selects evidence instead of writing the
factual answer. `AgentEvidenceAnswer` accepts this closed JSON document as
ordinary model text; native provider structured-output support is not required:

```json
{"language":"de","sections":[{"evidence_id":"exact-call-evidence-id","pointer":"/data"}]}
```

Only `language` (`de`, `en`, `fr`, or `es`) and `sections` are allowed. A section
contains `evidence_id` and `pointer`, optionally `fields` (one to 32 distinct,
literal child keys) or `detail: "all"`, never both. It contains no generated
labels, values, units, claims, or prose. A complete JSON code fence is also accepted. Every
available complete successful direct result must be covered. References must
match the delivered ledger and execution trace, and pointers must resolve
exactly under `/data` using RFC 6901 escaping. Mixed Knowledge results may
select `/context`, never `/sources` or source metadata. Invalid, duplicate, or
missing selections fail closed.

`ConnectorOutputContract` uses the verified operation's `response.output_mapping`
for both workflow mapping and an explicit Agent projection. `response.agent_output`
is `mapped` or `response`. A mapped projection is a closed field allowlist even
when every mapped value is absent or hidden. It never falls back to the raw
response. A missing mode preserves the existing published choice: a nonempty
mapping is curated, an empty mapping exposes the selected response. New form
and Integration Studio drafts default to `mapped`; clearing every field keeps
that mode. The `response` option is an explicit advanced choice and cannot
bypass a nonempty mapping.

Each mapping can publish `presentation` labels, language-specific labels,
description, unit, `summary`/`detail`/`hidden` visibility and sibling `context`
dependencies. Hidden fields and workflow-only role aliases do not reach the
Agent. Objects and record collections require explicit nested `fields`; records
retain their actual indices, and parallel wildcard arrays are never zipped.
Missing required context removes the dependent fact. Projection precedes model
context construction, while result identity verification still uses the full
provider result. Presentation metadata comes from the verified revision, never
from a provider property named `presentation`, and is redacted and budgeted with
the projected data. The complete envelope participates in the existing evidence
hash and exact in-turn replay.

The model selects relevant facts within that projection. Selecting an object
uses its published summary fields; an exact scalar or `fields` selection may
include detail fields, and `detail: "all"` selects all approved facts. Explicit
context is added without unrelated siblings. `AgentEvidenceRenderer` formats
readable labels, units, localized decimal separators, and call-specific subjects;
JSON pointers and raw request JSON remain internal. Each record and its complete
context (including an explicitly inherited parent currency or timestamp) render
atomically under the output budget. Uncurated results retain their containing
record because no field-level context contract exists. No field-name convention
such as `records` or `items`, flattened value pool, or word-distance/number
heuristic establishes identity. Strings are escaped as literal data, so API
content cannot supply active Markdown or HTML or alter the response contract.
Execution/source metadata and `data_preview` are not factual payloads.

The immutable answer-length profile bounds the entire rendered answer in UTF-8
bytes, including markup, labels, and provenance: `short` is 3,000, `balanced`
is 8,000, and `detailed` is 16,000. The renderer budgets sections and fields
within that total and visibly marks omitted data. These presentation limits are
separate from the tool-result and provider-usage budgets.

An invalid answer selection permits at most one output-only repair. It uses
the same immutable Agent deployment, provider, and model, a 20-second timeout,
and usage stage `agent_answer_repair`. It receives the current request and
already delivered redacted evidence and its exact presentation metadata as
untrusted data, with no tools, conversation history, or attachments. It cannot repeat capability execution or
restart the normal turn loop. Rejection, timeout, provider failure, or a usage
budget refusal preserves the server-rendered evidence and available sources in
`safe_evidence_fallback`; an output-format failure does not become a visitor
understanding question. Genuine input ambiguity and incomplete execution remain
the evidence guard's responsibility.

Conversation without direct reads and pure Knowledge answers remain prose;
Knowledge citations are checked against the actual delivered source identities.
Neither a valid source identity nor this output contract proves the semantic
truth of free prose, the correctness of external data, or that the model chose
every capability the visitor intended. Routing coverage remains an explicit
quality check.

When different direct-read capabilities compete for the same literal visitor
evidence, a candidate-free rejection is treated as route ambiguity rather than
as a missing field of the rejected tool. The visitor receives one contextual
choice between the public capability labels. A genuine resolver choice or an
unresolved request item with different evidence retains its specific input
clarification, so a successful sibling result cannot hide an incomplete
multi-part request.

Every direct-read tool call also carries a required, exact quote of the latest
visitor message that states the call's purpose. This routing-only value is
removed before input binding and is never sent to the external capability or
persisted. A per-turn ledger permits different explicit purpose spans, but
blocks a second capability before execution when it overlaps the same implicit
intent already completed by another direct read. The evidence guard remains the
fail-safe when a provider omits that model-side routing evidence.

The runtime deliberately does not use a keyword list to infer which tool
arbitrary prose must invoke. Such a classifier would be capability-specific,
multilingual, and brittle. Instead, **Test live bot** and the Agent Quality Lab
can assert one exact set of routes per turn: answer without a tool, knowledge
search, one or more Data Resources or API Connectors, one Playbook, or
clarification. API checks may also require an exact distinct item count.
Evaluation uses only committed, allowlisted execution evidence. It rejects
missing or incomplete evidence and every unexpected tool attempt. Request
values and provider results are not copied into durable operator evidence. This
makes routing an explicit weak-model eval rather than a false universal runtime
guarantee. New follow-up values are still admitted only from the latest visitor
message; only the preceding server-attested exception may be carried.

`chat_turn_execution_evidence.v5` adds optional, allowlisted `evidence_guard`
and `answer_repair` diagnostics. They record bounded reason codes and one
repair's attempt count, outcome, and initial guard reason, never raw prompts,
model drafts, or provider results. Existing v5 evidence without these fields
remains readable. A useful `safe_evidence_fallback` is not a passing `answer`
for routing, Quality Lab, or release evidence.

One per-turn sequence guard deterministically prevents a weak model from mixing
a direct read and a Playbook. Whichever productive capability class runs
first owns that model run; calls from the other class are rejected before
execution. An already-open Playbook owns productive capability execution from
the beginning of the turn. Knowledge search remains a bounded read-only context
tool and cannot supply executable Playbook or Connector inputs.

The runtime does not automatically search the public web for unknown terms. Web
or entity discovery must be published as its own governed read capability,
otherwise the Agent asks for clarification or states the limit.

## Playbook Invocation

For each turn, `AgentPlaybookTurn` derives the model's tool set only from the
verified Agent deployment. With no open run, those tools may start only their
exact pins. With an open run, the Agent sees the matching continuation tool,
unless the latest visitor message independently matches the bounded explicit
cancellation grammar. Only then is the continuation tool replaced by the
closed cancel tool. The cancel handler repeats this attestation before changing
state, so model instructions, retrieved knowledge, history, negation, quoted
text, and mixed requests cannot authorize cancellation.

Starting a Playbook reserves a `WorkflowRun` bound to the Agent deployment and
the exact immutable Playbook deployment. Continuing it uses the latest user
message only as proposed input to the current typed waitpoint. A Playbook
result is projected back through `AgentPlaybookResultProjector`; the graph does
not become a second general-chat owner.

`AgentPlaybookOutcomePresenter` is the shared, provider-free public outcome
projection for normal turns, terminal recovery, and delayed delivery.
`WorkflowResultEvidence` captures bounded, HMAC-attested capability receipts
inside the authoritative graph task after canonical redaction. Result field
references select those receipts; `AgentPlaybookResultComposer` renders only
their verified data, including mapped child results and For Each iterations.
This is presentation evidence, not a second capability ledger or execution
authority. It is bound to the conversation, run, exact Agent/Playbook releases,
graph contract and terminal turn. Failed steps, truncated evidence and unknown
outcomes cannot be hidden by a later success. A pending operator-review receipt
can only be replaced by that same review's authoritative outcome.

A Result step's literal internal prose, mutable inputs, headers and transport
metadata cannot supply visitor text, sources, cards, buttons, or visibility.
Unverifiable evidence falls back to the existing public status answer; process
completion alone does not prove that an external write succeeded. Unknown
outcomes remain explicitly uncertain and non-retryable. The delayed-delivery ledger still commits its message and
delivery completion atomically before emitting an event. Presentation never
redispatches a graph or changes its canonical state.

At most one open Playbook run (`running`, `halted`, or `delayed`) may exist for
a conversation, enforced both transactionally and by a database constraint.
Continuation and recovery resolve the historical Agent deployment recorded on
that run, even after another Agent deployment becomes live. The current mutable
Agent or a newly published allowlist cannot rewrite that authority.

Playbook execution is:

```text
AgentPlaybookTurn
-> WorkflowRunner::reserveRun
-> WorkflowExecutionService
-> AgentGraphWorkflowRuntime
-> typed result / waitpoint / delay / terminal state
-> AgentPlaybookResultProjector
-> AgentTurnLoop
```

AgentGraph owns checkpoint, interrupt, resume, delay, task, structured child
execution, and cancellation state. `WorkflowRun` and pending-interaction rows
are operational projections and indexes. Recovery verifies graph, thread, run,
deployment, checkpoint, and interrupt identity before projecting or resuming.
Before an interactive resume, the new durable Chat Turn is correlated to the
run without changing its projected execution status. Only the exact current
turn identity in an AgentGraph checkpoint or the SDK's atomic
`pending_resume` acceptance record counts as persisted dispatch evidence. A
database-only correlation written before SDK acceptance remains safely
retryable; an accepted dispatch with no definitive result remains blocked as
unknown. Local projection code never invents a `running`, `failed`, delayed, or
cancelled graph transition. A Sub-Playbook's failed, unknown, or cancelled
semantic result terminates the parent as failure; it cannot fall through a
success edge.
When a typed capability precondition fails before the first graph checkpoint,
the terminal projection is allowed only from matching persisted AgentGraph run
input and error envelopes; it carries no resumable graph progress and never
authorizes capability replay.

## Capability And Side-Effect Boundary

Direct read tools and Playbook nodes do not receive ambient permission. A
direct read is authorized only by the exact verified Agent deployment pin bound
to that admitted turn; activating a newer deployment does not mutate an
already-running turn. At
Playbook execution time,
`WorkflowCapabilityGrantIssuer` derives a fresh grant set from the exact
verified Playbook deployment and run. `CapabilityExecutionGateway` is the only
productive boundary for Data Resource queries, API Connector calls, host
actions, raw HTTP operations, and memory writes.

The gateway verifies:

- Agent deployment, and where applicable Playbook deployment, run and node,
  plus operation, environment, schema, and payload binding;
- read/write effect and declared authority;
- exact confirmation payload for writes;
- idempotency and side-effect ledger ownership;
- result schema and redaction; and
- unknown-outcome and reconciliation semantics.

Semantic model output may propose a tool and arguments. It cannot grant access,
change an immutable pin, authorize a write, confirm a different payload, or
turn an uncertain provider outcome into success.

## Conversation And Waitpoints

General questions and side questions remain Agent turns. A running Playbook may
continue only through its deployment-bound continuation tool. The current
Playbook waitpoint and AgentGraph state determine whether input can resolve an
interrupt; unexpected text therefore produces an Agent answer or clarification
instead of falling through a router/planner taxonomy.

Textual approval or rejection additionally requires the complete latest visitor
message to match a bounded explicit-response grammar, independently of the
model's proposed resolution and quoted span. Negated, quoted, conditional,
mixed, or otherwise unsupported wording cannot authorize either branch. The
waitpoint stays open for clarification or the existing bound widget controls.
Accepted textual resolutions retain the whole attested utterance as evidence;
operator-review and typed widget authority remain separate and unchanged.

Playbook node-level AI tasks may interpret bounded input for that node. Their
output remains untrusted data checked by the node contract and deterministic
policy. They do not plan the outer chat turn.

## Explicit Guardrail Policy Releases

Optional `runtime_config.agent.guardrail_policy_ids.input` and `.output` select
at most 16 authorized, enabled policies per direction. Publication normalizes
and freezes their identities, content hashes, modes, structured checks and safe
fallback text into `contract.safety` (`agent_guardrails.v1`). Publication and
activation lock policy heads; productive changes invalidate candidate evidence.
Unassigned artifacts retain their original baseline-only meaning and hashes.

`WorkflowSafetyBoundary` remains the only enforcer. It combines baseline safety
with the exact acquired Agent deployment's input/output pins before model work
and canonical message persistence. Recovery and delayed messages use the run's
historical pin, not the latest live Agent or mutable policy records. Blocking
policies reject matching text; advisory policies attach findings. A custom
fallback is used only if it passes the complete output checks.

Policies check banned/required phrases, length, and email/phone/URL patterns in
text. They do not inspect attachments or replace capability authorization,
confirmation or idempotency. Opaque legacy Rules JSON has no executable schema
and is rejected at both save and publication. Disabling/deleting an authoring
policy prevents new publication, but cannot revoke a frozen live release;
activate a tested replacement to change live protection.

## Durability, Safety, And Operations

- One durable `ChatTurn` owns client-turn idempotency and the selected Agent
  deployment.
- A completed turn replays from its canonical persisted outcome across JSON and
  SSE, including after its deployment is no longer active. Replay rechecks the
  same canonical input hash and expires stale pre-dispatch leases before it
  returns. Channel replay uses provider attachment descriptors and therefore
  does not redownload an attachment merely to recognize a duplicate.
- New channel conversations are created only after a valid active deployment
  has been resolved. An unpublished Agent cannot create empty durable
  conversations as a side effect of a failed request.
- Response format and delayed-message Agent/Playbook attribution come from the
  deployment bound to the turn or run, never from mutable current Bot settings.
- Before an active turn is reported as busy, blocks a new client-turn ID, or is
  projected by the turn-status endpoint, the application checks its bound
  AgentGraph authority. A terminal graph result is committed idempotently into
  the canonical `ChatTurn` outcome without dispatching any graph node again.
- One immutable Playbook deployment owns every live graph run.
- One open Playbook run at most is admitted per conversation.
- One AgentGraph checkpoint owns graph-backed progress.
- All productive memory reads, writes, and searches use the AgentGraph memory
  store. Playbook memory requires the current AgentGraph node context; general
  Agent conversation memory enters through an explicit conversation-thread
  boundary. Historical `workflow_memories` rows remain available only to export
  and privacy cleanup; they are never a runtime or operator-edit fallback.
- One capability ledger owns each external side effect.
- Canonical outcomes are persisted before JSON or SSE serialization.
- Unknown post-dispatch outcomes block automatic replay and require
  reconciliation.
- Usage preflight covers instructions, retained history, current input, tool
  schemas, and conservative local-attachment size before transport. Internal
  Playbook messages are removed before the public history limit is applied;
  history is retained and pruned as complete visible user/assistant turns, not
  as orphaned individual messages. The bounded scan and token preflight prune
  oldest whole turns to the effective input/context boundary, enforce the
  provider-profile output maximum on the request, and record provider-reported
  input, output, reasoning, cache-read, and cache-write buckets exactly once.
- Usage and cost accounting retain Agent deployment, Playbook deployment, run,
  stage, and parent-turn attribution without persisting prompts in operational
  summaries. Any unpriced settled call makes aggregate cost unknown rather than
  displaying a misleading zero or partial total.
- Provider compatibility is evaluated separately from deterministic local
  release contracts; missing credentials are reported as blocked or skipped,
  never as passed.
- Per-Agent provider configuration uses invocation-scoped temporary aliases.
  Long-lived workers cannot overwrite another Agent invocation's credentials,
  and each alias is removed after its owning invocation.

## Authoring Surface

Agent configuration is form-first. Administrators approve Data Resources,
select direct published Connector reads, and attach optional Playbooks on the
Agent form. Connector operation authoring
captures purpose, realistic request examples, ability aliases, entity types,
input grounding/aliases, and optional result identity in structured fields.

Playbooks are optional advanced process automation. The existing React Flow
island is retained as the Playbook editor, including its Filament tokens,
light/dark behavior, canvas geometry, scoped Tailwind setup, focus states, and
responsive shell. Its semantic catalog must contain process primitives rather
than generic conversation nodes.

The Playbook editor cannot define a second conversational persona, tone,
language policy, answer length, citation policy, or fallback behavior. Those
settings belong to the Agent. Publication snapshots the linked Agent profile
into the immutable Playbook artifact for bounded AI steps, and Agent publication
rejects a Playbook whose snapshot no longer matches the current Agent. Changing
Agent behavior therefore requires republishing affected Playbooks before the
next Agent deployment can be activated.

The editor presents the immutable invocation contract before the graph. The
contract helps the Agent decide whether to select the Playbook; the React Flow
canvas begins only after that decision and represents the controlled process,
not the Agent's free-form conversation or tool-selection reasoning.

The target primitive set is Entry, Request Input, Capability, Decision,
Approval, Wait, AI Task, Transform, For Each, Sub-Playbook, Result, and Note.
Conversation, fallback, knowledge-answer, data-answer, and finish nodes are not
Playbook primitives because the Agent owns those concerns.

## Routing Publication And Quality Assurance

`AgentRoutingManifestValidator` is a publish boundary. It caps the closed
manifest at 32 model-visible tools and 32,000 routing descriptor characters,
requires distinguishing metadata for direct API and Data Resource tools,
requires realistic Playbook examples and competing-tool exclusions, and
rejects duplicate model tool names or identical normalized routing phrases
across tools.

Published-Agent Quality Lab scenarios run every saved turn through
`ChatTurnApplicationService`, using one fresh test conversation per scenario
and the exact verified active `AgentDeployment`. Ordered turns share that
conversation, so compound requests and elliptical follow-ups exercise the real
history path. Each turn may require the complete exact route set; a missing
route or any extra attempt fails it. Results are bound to the scenario
fingerprint and deployment hash. A newer deployment therefore makes them stale.
Candidate-role runs additionally sign the finalized run and every ordered turn
with the application key. Activation locks and verifies those signatures and
their referenced durable Chat Turns again; unsigned pre-migration evidence or
evidence invalidated by application-key rotation cannot authorize release.
Playbook-draft scenarios remain separately bound to the draft fingerprint and
compiled artifact. Historical captured turns can remain immutable run evidence,
but cannot be created as executable scenario targets.

Admin live-test and release-candidate conversations are server-attested. The
central capability gateway blocks productive writes for one-turn live tests,
candidate tests, and multi-turn Agent Quality runs, even when the Agent invokes
a Playbook. Read operations and provider calls continue through the real
capability path so routing evidence remains representative without allowing a
test to mutate productive systems.

`AgentRoutingEvidenceEvaluator` owns the shared exact-route contract used by
both the live test and Agent Quality Lab. The protected
`evals/AgentRoutingProviderEvalTest.php` suite supplies real-provider confidence
for English, German, typo, negative, ambiguous, knowledge, Data Resource, API,
Playbook, compound-read, and contextual elliptical-follow-up routing. Missing
provider credentials make that gate skipped or blocked, never passed.

## Forbidden Productive Paths

The released runtime must not contain or resolve:

- a workflow-first chat router, runtime turn planner, authorized turn command,
  or second conversation coordinator;
- a mandatory main workflow or starter graph for a simple Agent;
- mutable or global tool fallback;
- capability execution outside `CapabilityExecutionGateway`;
- graph-state transitions in transport or rendering; or
- a compatibility switch that can reactivate the removed runtime.

Historical database rows and audit presenters may retain old labels only when
they are read-only and cannot be resumed or executed.
