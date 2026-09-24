# Agent Runtime Architecture

This document describes the implemented runtime after the agent-first hard cutover.
The current native/durable changes are unreleased; candidate acceptance remains
incomplete as recorded in [the acceptance evidence](CHAT_RUNTIME_ACCEPTANCE.md).

[ADR 0025](adr/0025-source-bound-conversation-reliability.md) is the accepted
target for source-bound offers, typed cross-turn status and one bounded native
pre-stop correction. S2–S4 implement these boundaries in the unreleased ABI v9
candidate. S5–S7 add canonical read dependencies and bounded activity presentation.
S8 verifies their deterministic integration on an isolated host candidate;
UI persistence and empirical provider/model acceptance remain incomplete in the
[S8 record](plans/runtime-reliability/S8-result.md).
N01 adopts [ADR 0029](adr/0029-native-text-conversation.md): native text answers
replace general Claims JSON and the universal answer reviewer. N02 removes the
public-search word anchor and general Connector context assessment. N03 adds
bounded native recovery. N04 prepares an ABI v15 candidate with revised source
cards, operation contracts and quality checks. The candidate is not active;
N05 live conversation and widget acceptance is outstanding. Older paragraphs
in this document that describe Claims or general answer reviews are historical
candidate details and cannot override the direct conversation contract below.

[ADR 0019](adr/0019-http-write-result-evidence.md) defines the implemented candidate
HTTP-write evidence contract. Publication checks explicit success evidence and
bounded provider fixtures; unproven dispatched effects remain unknown. Verification
and republish requirements are tracked in [the work log](audits/2026-09-13-runtime-hardening-plan.md).

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

## Direct conversation contract

[ADR 0029](adr/0029-native-text-conversation.md) governs the current
unreleased runtime candidate. The model writes ordinary answer text and may
propose only tools in the immutable deployment manifest. Typed tool input,
server-side admission and `CapabilityExecutionGateway` decide whether an
operation runs. General Claims JSON, a universal answer review, and language
heuristics are not productive conversation gates.

The current visitor message is server-attested. A model-supplied tool argument
is a proposal, not a source of authority. The direct Connector binder admits
published inputs and scoped pending revisions; it rejects invented values for
server-derived fields such as `attested_calendar_year`. That policy uses an
explicit, unambiguous year from the current message or the recorded turn clock.
It applies only to a published integer calendar-year input of a read operation.
Writes, confirmations, sensitive target selections and unknown outcomes retain
their separate durable authorization and reconciliation contracts.

The native model loop has bounded technical recovery for safe nonexecution,
empty and truncated completions. It keeps successful read evidence without
redispatching an identical operation. Graph recovery presents only execution-
matched recorded data. An incomplete model fragment is never committed as a
finished answer or executed as a partial tool call. Provider and usage limits
remain shared across attempts.

Admitted read results create canonical source cards, including sources without
public URLs. Inline reference markers bind cited cards to delivered evidence;
uncited cards may still be displayed as retrieved sources and are not claims
that every sentence is proven. The assistant message, its source cards and the
turn outcome are committed before JSON, SSE, widget or history projection.
Operational status comes from the durable ledger, capability receipts and Graph.
Model prose cannot create execution, confirmation or completion status.

The candidate on runtime ABI v15 pins the revised holiday and Pokemon operation
contracts and the short Agent 170 instructions. It has not been activated or
accepted by live provider and widget tests; see the
[N04 handoff](plans/runtime-dialogue-N04-handoff.md) and the
[dialogue redesign plan](plans/2026-09-24-runtime-dialogue-redesign.md).
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
   -> optionally invoke at most one exact deployment-pinned Playbook tool
-> verified read evidence and canonical Playbook outcome composition
-> canonical ChatTurnResult
-> durable outcome and assistant-message commit
-> JSON / SSE renderer
```

`AgentTurnLoop` is the sole productive implementation of
`ChatTurnRequestExecutor`. It handles normal conversation, empty-input
clarification, provider failures, and Playbook results. Provider exceptions are
mapped to bounded errors and localized safe answers; raw exception text is not
returned to visitors. Typed transport failures distinguish
`provider_connection_failed` from `provider_timeout`; timeout classification
requires typed or structured transport evidence. This does not add retries or
change unknown-outcome reconciliation.

HTTP provider failures retain only their status and an allowlisted structured
error category in operator diagnostics and `AiUsageCall.meta.provider_failure`.
HTTP 400/422 is `provider_request_rejected`, without visitor retry advice.
Private error prose cannot turn a rejected request into a rate-limit retry.
Absent usage receipts still require reconciliation; a rejection does not prove
zero billable usage.

The Gemini compatibility gateway preserves provider-supplied function-call IDs
in both model history and the matching function response. Laravel AI's internal
correlation ID remains available for every call, but an originally ID-less
provider call contributes no ID to either side of the wire exchange. This
adapter correction changes neither tool authority nor retry behavior. Its
overrides can be removed when Laravel AI preserves this distinction throughout
parsing, history, and function-response serialization.

Bare Gemini tool-result follow-ups use the normal native loop without an extra
model-specific continuation cue. Tool results, provider IDs and original visitor
messages remain intact.

The N01 text response has no general JSON answer schema for Gemini or other
providers. The SDK step projection still shares the same effective request with
admission and closes tools during a bounded technical answer continuation.
History, native tool IDs, receipts and per-step usage stay within that loop.

Productive native invocations permit at most two technical recovery steps within
the original SDK step budget, including at most one answer-only step after a
verified read. Empty and Length finishes can continue; incomplete or
nonexecuted tool proposals cannot dispatch. An identical proposal with a new
provider call ID reuses its existing rejection or completed read observation.
The provider finish reason and the SDK Continue signal are recorded separately.
Answer-only recovery closes tools. An exhausted, failed or interrupted model
step never promotes draft prose to a finished answer. A terminal Graph recovery
uses only execution-matched delivered read data and the authoritative run
projection. There is no outer empty-response prompt restart or per-tool repair
counter. Provider errors and unknown effects do not cause an automatic
post-dispatch retry. Safe rate-limit transport retries retain their
no-execution/state-unchanged guard.

Per-invocation technical flags live in the existing agent lifecycle and are bound
to original SDK options at StartingStep. Pure request projection shares effective
instructions, live pending state, messages, tool definitions and schema between
budget admission and dispatch. Pending data stays fresh; its random wrapper
boundary is stable only for that state instance. Attachment accounting remains
separate. Native provider tokens/blocks/call IDs are never package control markers.
The original native step ceiling counts actual attempts across provider failover;
shared time and usage limits still apply. Review agents gain no
extra steps. Deferred, nested and interrupted streams have separate cleanup.

The package does not force a tool or restrict its list after local argument
feedback and a subsequent model stop. That extra forced chance is superseded;
voluntary correction and safe failure remain. Its removal and removal of the
Flash-Lite cue have not been evaluated for real-model answer quality.
Supported unstructured high-level streaming and direct SDK schema-format streams
are tested separately: the installed SDK rejects high-level structured-agent
streaming, which this package change does not enable.

S4 holds native DeployedAgent text until `finalAgentStepResponse` has made
its response decision. `AgentDraftTextBuffer` retains at most 48,000 serialized
event bytes and 1,024 text events per step. Only unchanged, nonblank normal Stop
text without tool calls, approvals or provider continuation is released, with
its original event objects. Continued, failed, oversized or unserializable text
is suppressed in full. The provider stream is still drained for its actual
usage receipt. Nontext events, native response/history and opaque provider
blocks remain on their existing path. This bounds the package presentation
buffer, not the SDK's existing response accumulation. An overflow supplies no
text to the stream consumer; it does not invent a truncated answer or retry.
An abandoned stream still requires reconciliation when no complete native
receipt was persisted. If an eligible answer review already caused the complete
provider step to settle, later presentation abandonment cannot erase it.

Once native formatting closes tools, that closure survives provider failover
and reset SDK step numbers, including a switch to a provider that ordinarily
combines tools and schema. Admission and dispatch share that effective final
projection. `AgentNativeAnswerReview` assesses evidence-bearing drafts at this
seam and permits one semantic correction only with a productive and final step
remaining. It retains at most two exact candidate attempts across failover and
passes its receipt/allowance into the final response. The finalizer consumes that
receipt or remaining credit through the same policy; it cannot restart review.
The binding covers turn/invocation, deployment/scope, raw draft, full review input,
evidence/status, pending/offer revisions and language. Separate-format prose is
untrusted coverage input, never a certificate for later formatted prose.

Feedback has at most eight source-bound diagnoses and 2,048 JSON bytes through
`agent_tool_projection.v7`; it supplies no replacement values, tool selection or
permission. A complete productive native receipt settles before the separate
tool-free review uses the same deadline and normal admission. An incomplete
productive receipt stops the invocation before review and remains reconcilable. Failed/invalid
reviews consume credit and retain safe factual/status rendering. Native stream
text must also equal the approved presentation before its original events can
be released. See [S4b evidence](plans/runtime-reliability/S4b-result.md).

`DeployedAgent` enables Laravel AI's `RepairToolCalls` handling. An unknown tool
name produces a failed tool result naming the tools actually available in the
turn. The model may correct its proposal within the existing step and usage
budgets; the unknown tool never executes and no additional capability is
introduced. Exceptions from an executed handler still propagate through the
existing failure and reconciliation paths. Knowledge-search instructions are
included only when that turn actually provides the pinned knowledge tool.

`AgentPromptInstructions` composes the conversation contract from the actual
tools available in this turn. Connector, Data Resource, knowledge and Playbook
rules are included only for their corresponding capabilities; a tool-free
conversation does not receive direct-read JSON selection or tool-routing rules.
An open Playbook is identified from verified runtime state, independently of
whether its current status has a textual input snapshot. The closed deployment
manifest still determines tool availability. This composition does not add a
semantic tool shortlist or another routing authority. Instructions and schemas
remain fixed within the native SDK invocation.

The model chooses the response language within the immutable Agent policy.
`behavior.profile.languages` contains the published language tags;
`ChatLanguageResolver::agentLanguages` normalizes and deduplicates supported
`TurnLocale` values. An empty list permits all four built-ins. A singleton is
fixed; a mixed list permits only its supported subset. A nonempty list without
any supported built-in retains the documented default as its sole technical
response locale. The default is `behavior.default_language`, or the first
permitted locale when that default is excluded. No new publish migration or
Agent fixed-language field is introduced.

Native and prompt-based answers receive the same permitted set and default.
`AgentEvidenceAnswer::admitLanguage` reads the existing bounded response envelope;
its permitted `language` selects presentation, not evidence or execution
permission. The existing `AgentAnswerReviewCandidate` carries that choice through
claims, facts, questions, failure notices, historical sections and supplements.
Malformed or excluded declarations retain the safe fallback path without
relabeling model prose. All nested claims, references, public fields, sources
and byte limits still require their original checks. The choice is also included
in the existing `AgentAnswerReviewContext` and review payload hash, even when
there are no claims. The tool-free reviewer uses this value instead of making
another language choice. Stale coverage from another language is rejected.

A short continuation can follow the model's conversation context without a
server heuristic constraining its schema to one locale. `VisitorMessageLocale`
and verified open-request source inference remain only in
`ChatLanguageResolver::forInputAdmission`, preserving the Connector binder's
`SlotValueAdmissionContext.locale` behavior. They no longer authorize answer
language. Early failures and technical capability descriptions use the published
default; a capability description must not overwrite the final draft's locale.

The existing workflow `forTurn` fixed-language policy remains authoritative for
its Playbook section. The result projector passes the Agent choice as a
preference through the verified Workflow state. Already canonical Workflow
prose is not translated; incompatible Agent/Workflow policies can yield sections
in different languages. Plain prose without a structured locale keeps its
existing admission path, including code fences and Markdown. Its language is
prompt-guided, not deterministically certified. A locale declaration alone is
also not proof that every phrase is written in that language.

Changing draft settings or later conversation language cannot relocalize a
committed turn: JSON and SSE replay retain its stored content and presentation
proof. No translation call, additional review, language state or operational
continuation is added. Evidence, graph transitions, error codes and retry
authority retain their existing owners.

General capability questions use the normal model turn. The local
`describe_agent_capabilities` tool supplies only the immutable manifest's public
scope. A reviewed `capability_description` can express that scope naturally;
canonical labels remain the fallback. No keyword shortcut forces a list or
skips the model. Neither wording nor visitor requests expand published access.
See [ADR 0021](adr/0021-natural-dialogue-and-context-accounting.md) for the current
answer contract and the distinction between context sizing and cost reservation.

Within the normal model turn, an answer may also select `capabilities` with
the closed scope `all`, `data_resources`, `connectors`, `knowledge`, or
`playbooks`. This presentation selection can stand alone or accompany current
facts, historical facts, and a recorded clarification. The existing capability
overview renders only public labels and availability from the verified
deployment manifest. An absent Data Resource therefore means no database
source is enabled for this Agent, not that a database is empty or that its API
operations cannot return data. The scope field supplies no source contents or
permissions. Reviewed description claims can phrase that exact scope naturally.
The metadata never counts
as an executed read or satisfies evidence coverage. It has a separate share of
the answer budget; independent facts, failure reasons, source pointers, and
confirmation offers retain their existing validation. The facts fallback
preserves a valid original metadata selection and cannot change its scope.
The model receives complete category counts, including zero, from that same
manifest. Role descriptions and custom system prose cannot add sources to this
catalogue. Access descriptions must select this metadata contract; combined
requests must also cover unavailable scopes alongside their independent results
or questions.
Normal turns that already expose tools also offer `describe_agent_capabilities`,
a local presentation action over this manifest. It makes no source query and
grants no access. A healthy completion carries its selected scope into the same
answer contract even when final model prose omits or misstates it. The first
valid scope is retained; a conflicting second selection cannot overwrite it.
This selection is local to the invocation, not a recoverable external operation.
Tool-free history and answer review do not acquire this tool.

An admissible, server-bound question after an identity mismatch is presented
directly when it concerns a single operation. Mixed operations retain concise
source attribution. The operator receipt still records the mismatch; rejected
facts remain excluded. Without a valid question, with exhausted clarification,
or with an unresolved result condition, the bounded explanatory fallback
remains available. Visitor prose does not need the internal tool error and
field-assignment preamble to ask for a more precise input.

The synchronous deployed-model path shares one ephemeral, monotonic
`AgentExecutionBudget` per `ChatTurnRequest` (90 seconds by default). Model
requests, existing rate-limit retries and terminal claim review consume the same
remaining time; each native Laravel HTTP request is capped at dispatch rather
than receiving another full timeout. An exhausted admission budget has the
distinct bounded code `agent_execution_timeout`. The execution scope is restored
on exceptions and isolated between PHP Fibers; unrelated HTTP requests keep
their original options. The model, deployment pins and payloads are unchanged.

HTTP execution through `ChatTurnApplicationService`, including admin candidate
tests and Quality runs, applies the configured `api.max_execution_time` PHP
limit (120 seconds by default) before durable turn admission. Public API
controllers also apply it before context setup. This leaves room beyond the
shared model budget for canonical terminal persistence; it does not increase
that budget, retry allowance or lease. Nonpositive settings opt out, and CLI
workers retain their own process limit. PHP execution limits remain process
settings, separate from Fiber-local model deadlines; hosts must also align
their web server, proxy and worker limits with the supported execution path.

This is cooperative admission, not cancellation authority. A new model-requested
tool cannot start after expiry, but an already admitted capability keeps its own
timeout and unknown-outcome handling. Its elapsed time reduces the next model
request's allowance. Completed results are not retroactively discarded. This
HTTP enforcement covers the native Laravel HTTP gateways on the productive
synchronous path; direct AWS Bedrock transport and deferred native SDK streaming
are not claimed to have equivalent per-request deadline enforcement.

If model completion times out, is truncated, or ends with a filtering, provider,
incomplete-tool or unknown-completion error after verified reads, Knowledge
excerpts or historical evidence are available, `AgentAnswerFinalizer` preserves
their guarded rendering with a localized incompleteness notice. The native
finish reason is classified even when the provider returned text. Unfinished model prose is
discarded and no answer repair is attempted. Space for the notice is reserved
within the existing answer limit, and the presentation proof is rebound to the
full committed text before JSON/SSE rendering. With no usable evidence, the
visitor receives a bounded service/time-limit explanation without an automatic
retry instruction. This does not make a slow first provider response succeed.

A normal empty stop retains the existing healthy exact fallback classification
only for one complete curated object or a flat curated list of at most twelve
records, with its presentation proof and no failure, Knowledge or Playbook mix.
Other invalid or missing selections remain safe fallback decisions, even when
their displayed facts are useful. No second generative selection promotes them
to success.

Independent direct reads may coexist with one Playbook in the same turn. The
single-open-Playbook rule and all approval, wait, cancellation and unknown-write
semantics remain authoritative. `AgentAnswerFinalizer` composes verified read
evidence with the canonical Playbook presentation. Bounded encrypted
`ChatTurnPresentationReceipts` persist completed reads and the exact Playbook
observation before recovery can need them. Observing a busy, delayed or terminal
Playbook projects an authorized AgentGraph snapshot; it never dispatches or
resumes the graph just to reconstruct an answer. Uncertain writes retain their
terminal error and retry lock, with independent read evidence in `read_answer`.

A pure Playbook response is rendered from the authoritative run and verified
state, so it does not depend on provider prose after the tool exchange. If a
provider reports a normal stop with an empty final text after that completed
exchange, the deterministic Playbook projection remains a healthy response.
Typed timeout, filtering, truncation, incomplete-tool, and unknown completion
errors remain recorded and continue to block release evidence.

For a long-running external operation, an immutable Connector completion
contract returns a typed pending reference through the same capability gateway.
AgentGraph owns the delay/checkpoint and its existing resume-delivery mechanism
owns polling. Signed completion notifications are deduplicated wake-up hints;
the gateway retrieves authoritative results. There is no second job scheduler,
conversation loop, or webhook-controlled graph transition. See
[Durable Connectors](DURABLE_CONNECTORS.md) and
[ADR 0009](adr/0009-durable-external-operations.md).

Transport resolves access, bot, area, conversation, and client-turn identity.
It does not select a Playbook, mutate workflow state, or authorize a
capability. `ChatTurnApplicationService` applies the safety boundary and
commits a canonical outcome before a renderer can serialize it. Replaying a
completed client-turn identity returns the persisted result without another
model or capability call. The same identity may be replayed through JSON or SSE;
transport choice and a later active deployment do not change the canonical
request identity or persisted result.

## Agent Deployment Authority

Agent ABI v8 pins `portable_exact_names.v1` tool loading. Small offers remain
eager; larger offers expose the complete bounded name/purpose directory and
load exact original schemas for the next native step. Admission, wire projection
and the SDK's static dispatch handlers share the same frozen step offer.
Pending tools and controls stay available. Publication rejects oversized
directories, unloadable tools, unsupported modes and insufficient configuration
quota before candidate promotion. See [ADR 0024](adr/0024-portable-deployment-tool-loading.md)
for exact byte, native-step, deadline and financial-capacity boundaries.

`AgentDeploymentPublisher` creates an immutable contract and deployment hash.
Authoring may explicitly select `agent.tool_loading_mode = eager_bounded.v1`
for a modest catalogue. This hash-pinned alternative offers every original
schema immediately, caps the complete offer at 32,000 UTF-8 bytes at publication
and each native step, and retains the six-step eager allowance. It never falls
back to hidden loading. Normal full-request quota checks, Gateway authority and
exact-candidate release gates still apply. The default portable contract and its
8,000/16,000-byte thresholds are unchanged; see ADR 0024's bounded eager extension.

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

Remote MCP tools are Connector operations with an explicit `mcp` transport.
Discovery creates only drafts. Published operation revisions pin tool declarations,
input/output contracts and the `core/mcp` implementation closure; Agent releases
pin those revisions through the existing closed Connector manifest. Execution
passes through `CapabilityExecutionGateway`, the typed Connector dispatcher and
the existing bounded transport. The MCP client verifies the selected declaration
before calling it. It never injects a live remote catalog into the model. Direct
Agent tools remain read-only. Separately reviewed synchronous MCP create/update
operations use published Playbooks with exact payload confirmation, isolated
staging evidence and the same side-effect ledger and reconciliation path.
Read approvals never authorize writes; unreviewed functions remain blocked.
Write reviews bind connection/environment, definition, fixed targets and
identity scopes, request, result and execution contracts. See
[MCP connections](MCP_CONNECTIONS.md) and [ADR 0013](adr/0013-reviewed-integration-writes.md).

Optional published `metadata.mcp_source` is pinned with each MCP capability. The
turn exposes a compact catalogue containing each available source's public name,
configured scope and optional exact URL once, referenced by its tools. Catalogue
facts can answer source-link and scope questions without an external read; actual
source contents still require approved evidence. No mutable connection metadata,
raw server instructions or server diagnostic identity enter this catalogue. It is
presentation data, never execution authority. The catalogue is bounded to 8,192
UTF-8 bytes at publication and runtime and counted by the existing routing and
input budgets. It uses the already selected turn tools, with no extra routing
model or mid-invocation schema changes.

`AgentConnectorTurn` and `AgentDataResourceTurn` project only exact immutable
entries from the verified Agent deployment into model-visible tools. A direct
tool is eligible only when its published effect is `read`; every write,
approval, or durable wait belongs in a Playbook. A direct read may supply a
scalar input to another direct read only through an explicit Agent release
link, as described under [Published read dependencies](#published-read-dependencies).

Each approved Data Resource becomes its own closed read tool. Its normalized
resource definition, contract hash, allowed query modes, fields, filters,
sorting, scope rules, and list limits are copied into the Agent deployment.
Custom scope-source paths and code-reviewed static scope values are pinned with
that definition; request-specific authority values remain server-attested at
execution. Runtime never consults mutable host or Bot scope configuration for a
live direct tool.
Model-proposed filter values, including booleans, require typed source evidence
before the central capability gateway may execute the bounded database query.
Published aliases and calendar policies can transform exact visitor phrases.
An attested source in the same open request or an explicitly linked current
read result can supply an input only through its dedicated reference contract;
neither path can replace server-attested row scope. See
[Data Resource filter evidence](DATA_RESOURCES.md#published-filter-evidence).

The model sees the operation purpose, realistic intent examples, entity types,
closed JSON input schema, and a bounded set of explicit visitor aliases. This
metadata helps a smaller model associate terms such as “Bisaflor” with a
Pokémon lookup without adding API-specific routing classes. Metadata proposes
the route; it never authorizes it.

Each call is checked twice: the tool adapter and `CapabilityExecutionGateway`
discard undeclared top-level provider arguments without interpreting, persisting,
or forwarding their values. They independently bind new declared arguments to
literal evidence in the latest visitor message, rebind retained pending-read
values to their original persisted user sources, apply exact published aliases,
optionally apply the pinned `safe_v1` matcher only against that published alias
map, use a registered deterministic resolver only for `capability_resolver`, or
resolve an explicitly published current-request read dependency;
they then validate the closed schema,
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

If a model proposes a published alias target without an admitted literal source,
the rejected input may carry advisory spelling suggestions derived from the
latest visitor message and that same pinned alias map. These hints never change
`typo_tolerance`, admit an input, create a resolver choice, or authorize a call.
Unknown names and private fields produce no hints. An exhausted clarification
retains its field and useful suggestions in the answer without asking another
question; independent verified facts remain visible.

Source-bound read offers use `connector_input_offer.v2` in the encrypted
`chat_turn_connector_context.v3` envelope, under the coordinated unreleased
Agent runtime/compiler ABI v9. Sources are an exact published alias target,
a current or freshly reverified selected-pending visitor literal, and an
explicitly published durable Gateway resolver projection. The private proof binds the pin and
policy hashes; literals additionally bind the original message ID, content
hash, exact quoted span and source turn. Assistant prose supplies no authority.
`questions[].offer_value` explicitly proposes a candidate beside the exact
pending ID/revision and natural question. The existing semantic review checks
that complete question, candidate and retained conditions; deterministic source
admission must also succeed before rendering an operative offer. An unsupported
candidate falls back to the published field question.

Canonical commit seals an offer only if its entire question is an exact
paragraph in the actual assistant message. It atomically advances the pending
revision and records assistant message/turn, content hash, offer ID and that
post-commit revision. The stored expiry uses the existing bounded context TTL
and original task/source ages; re-rendering and later configuration changes
cannot extend it. A pending revision change removes the old offer. Readers,
admission and Gateway reject invalid source, scope, deployment, delivery or
revision bindings; expired offers are no longer offered for selection.

The native model selects the exact pending and offer, and interprets the whole
reply, including corrections and independent requests. The adapter binds the
whole attested reply, not a model echo or a yes/typo keyword classifier.
Ordinary changed values use normal source-bound arguments and revision policy.
Existing declared conditions, semantic context assessment, resolver policies,
write confirmations and Graph waits remain independent. Invalid metadata does
not erase pending work or dispatch a read. The protocol proves binding, not
semantic understanding of every reply.

`AgentConnectorResolverOffers` admits `verified_resolver` only through an
explicit published read-dependency `offer` policy. It reads the offer turn's
existing encrypted presentation receipts, verifying the exact successful
Gateway execution, evidence identity (including original inputs), source pin,
link, selected public field pointer, scope and source deadline. The question
contains the exact selected string, which is also the confirmed input; no
label-to-opaque-target conversion occurs. Admission and Gateway reload the
receipt independently. Historical status/fact receipts and versioned entity
resolver labels alone remain insufficient. Reading or accepting a proof never
executes the resolver. See [ADR 0025](adr/0025-source-bound-conversation-reliability.md)
for the implemented boundary and [S2b handoff](plans/runtime-reliability/S2b-result.md)
for verification and S5 integration constraints.

The native wrapper supplies source text from the attested turn. Domain tools
never ask the model or visitor to copy internal source evidence. Local argument
feedback uses the published fields and permits repair without granting execution
authority or requiring fixed visitor wording.

A scalar read input may explicitly publish
`continuation_mode: exact_previous_success`. After a complete authoritative
success, the runtime stores only those admitted fields in an encrypted,
hash-checked binding scoped to the conversation, capability, immutable Agent
deployment, and source user message. For the immediately following persisted
user message, a strict bounded follow-up grammar such as “Und morgen?” may remove
that server-owned field from the model-visible tool schema; the server supplies
the exact prior value. Model-supplied historical values remain rejected by the
unchanged input admission contract. Unknown words, expiry, an intervening user turn,
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
a quiesced host and a verified backup; see [Upgrading](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md).

A read tool may be repeated for independent items only when the immutable
operation contract declares `fanout_safe`; `max_items` and the global five-call
budget both apply, leaving the sixth model step available for the final answer.
The native gateway requests no tool selection in that final SDK step for a
deployed Agent, using the provider's native tool-choice option. The SDK already
refuses to execute tools at that point; the
request options now reserve it for composing the answer from available evidence.
This consumes the existing step, adds no model or capability calls, and leaves
the normal evidence validation and incomplete-completion handling in place.
Providers must support the native option; the current Ollama adapter does not
map tool choice and therefore retains the SDK's existing completion behavior.
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

An unresolved input does not hide a separate failed lookup. The existing
evidence fallback preserves its safe failure notice alongside the clarification
and any independently verified facts. A declared result-identity failure gets
a localized explanation scoped to its safely attributable published source,
followed by its clarification. Repeated failures share that source notice within
the answer budget. A pre-call input question alone does not produce a lookup
failure notice. Rejected payloads remain excluded; the explanation never claims
which different entity was returned. Required candidate choices remain unresolved.

Connector input questions use the normal native tool with known arguments.
The binder records missing required fields before a question is delivered.
For an ambiguous supplied or optional public visitor input, `__clarify_input`
names the field to leave unresolved; private and server-bound fields are
excluded. No external dispatch occurs for an incomplete proposal. A semantic
ambiguity blocks guessed retries in that turn while independent admitted reads
remain available. Final answer wording can present an issued question, but
cannot create a new task or execution authority.

Native Connector arguments are optional proposals even when the pinned API
schema requires them. Their descriptions retain the published title, description,
semantic meaning and requirement. Omission reaches the existing input binder,
which rejects missing essentials before the gateway and supplies a bounded
clarification request for a public field. The immutable API schema and execution
checks remain required; native omission is not a new default or continuation
authority. Verified server-bound continuation inputs remain absent from the
model schema and cannot be the subject of a pre-call question.

After a failed Connector result identity, the tool instead supplies a
`clarification_request` with an opaque request ID and bounded context from the
pinned identity input schema and its admitted, redacted value. Rejected provider
facts, credentials and unpublished defaults never enter that context. The normal
model completion can add `clarification: {request_id, question}` to its evidence
selection. The guard checks the issued request binding, language, closed shape
and direct-question form. Preambles, separate sentences and recognizable
statement clauses fall back to bounded application wording; ordinary output
safety still applies. A question
is conversational text, not verified evidence or new execution authority. These
checks do not prove its semantic quality. Missing or invalid proposals receive
a localized fallback naming only a safely attributable input.

Successful sibling selections remain intact in partial answers. Questions do
not erase failed outcomes or promote rejected facts. An already-required resolver
choice takes precedence. Repeated questions are bounded by the pending request's
admitted values and unresolved issue, rather than an adjacent answer receipt or
operation key. Under
[ADR 0012](adr/0012-turn-scoped-connector-recovery.md), each request permits at
most six distinct question states within one freshly attested visitor turn.
Duplicates preserve the useful existing question. Rephrasing, a model retry,
transport replay, or stale admission does not reset the current budget; the
current in-memory task or verified checkpoint takes precedence. A later
persisted visitor reply may repeat an unresolved state without renewing task
age or changing task, issue, input, condition, offer, or scope authority.

Input `clarification_request` context can include the pinned field meaning,
issue code, lookup status, safe admitted retained fields and conditions, and a
previously verified published spelling offer. It gives the existing Laravel AI
SDK tool loop presentation context for a question bound to the current request
ID. The deterministic fallback may re-present a valid suggestion without an
exact-retyping demand. This adds no input authority or model call. Invalid
confirmation metadata uses the existing `correct_arguments` path without
changing the visitor issue. Other source mismatches describe a proposal's
missing evidence; they do not establish that the visitor supplied a wrong value.

Pending direct-read context follows
[ADR 0010](adr/0010-source-bound-connector-clarification-context.md). The
per-turn dialogue snapshot carries source-bound public inputs, optional scalar
conditions, the pending field, every unresolved declared condition, and the
question-state budget. It is presented
to the model through `UntrustedLlmContext` as data rather than instructions.
It does not execute capabilities or schedule work. `AgentTurnLoop` remains the
conversation owner, `CapabilityExecutionGateway` remains the execution boundary,
and AgentGraph continues to own Playbook tasks, checkpoints, and waits.

The snapshot is a separate encrypted and serialization-hidden
`bot_chat_turns.connector_context` envelope, bounded to 64 KB and 16 open
requests. The ledger checkpoints it privately and binds it to the canonical
assistant message at the outcome commit. Its binding includes the Chat Turn,
bot, conversation, source user message, input hash, exact Agent deployment ID
and hash, and a fingerprint of context area plus freshly attested authority
scope. The commit binds the persisted assistant message ID and content hash.
Presentation receipts may establish scope equality for a source turn but never
supply pending inputs or conditions. A question text is not a value source.

`read()` restores only committed earlier context at turn start. During the
current turn, `readForAdmission()` may instead use its own uncommitted checkpoint
under a freshly attested, exact `executing` Chat Turn with no completion or
commit marker. The envelope binding, scope, and current user-message hash must
match. Only that exact turn's user message can supply an active source; every
earlier input source or task update still requires a canonical committed turn.
A present checkpoint, including an empty snapshot, takes precedence. Invalid
current checkpoints fail closed rather than falling back to earlier state.
This permits correction of an automatic tool-binding diagnostic from values
already present in the current message. It does not waive an explicit dialogue
question's wait for a visitor reply or carry uncommitted context to a later turn.

Recovery verifies source and assistant messages against canonical outcomes.
Each retained field carries its canonical value, original proposed value,
source user message ID, and source hash. Admission re-runs the exact published
binder against that original message before combining it with new values.
Bounded arrays and objects may be retained as well as scalars. Schema inspection
recursively excludes sensitive fields, including inside nested containers, from
this retention path. An invalid newly proposed
input removes that field from the retained inputs; it cannot fall back to its
older value. An invalid condition cannot silently delete an already admitted
condition. Both the tool adapter and gateway apply admission under current
authority, so the envelope does not restore old permissions.

The reader scans at most 32 consecutive earlier turns. A deployment, scope,
sequence, expiry, or unfinished-turn barrier prevents reaching older context.
Usable source turns must have a canonically committed `completed`, `waiting`,
or `cancelled` outcome with ordered user and assistant messages. Tampered,
unreadable, or uncommitted earlier envelopes fail closed. An explicit empty snapshot
after completion or cancellation prevents resurrection from older turns.
The internal `agent_runtime.connector_context_ttl_minutes` policy defaults to
30 and is clamped to 1–1440; request age starts at its original creation and is not extended by new
questions. Expiry prevents reuse. It does not introduce a ciphertext-pruning
job or change Chat Turn retention. The model may propose a new read from literal
current-message values. Reusing retained pending values requires explicit current
task selection; successful adjacent reads retain only their independently verified
continuation evidence. No linguistic value-only classifier grants or denies scope.

All semantically unresolved context fields remain in the sealed task until
individually resolved by current source-bound visitor values. Null proposals,
a reply to another field, and retained old values do not settle an ambiguity.
A pending API input remains required even when the base schema makes it optional.
A provider mismatch against an already known condition preserves that condition
for the next lookup; it is distinct from an unknown condition value.

The native model selects an existing pending with `__pending: {id, revision, action}`;
both the offered and live revisions must match. Omission means a new proposal.
The shared native input-confirmation object selects only an offered `offer_id`;
the conversation adapter binds the complete current visitor message as internal
reply evidence. A model-supplied reply echo receives local correction. Exact
pending selection, committed-offer admission and Gateway source checks still
apply; copying or binding a reply is not proof of semantic consent.
A partial native tool proposal
retains other admitted arguments and declared `__context` while asking for one
field. `__context` is separate from API arguments. Existing
conditions survive ordinary replies: a different value requires a question
about that condition or an explicit `revise` action with attested current-message
values. A new proposal preserves other tasks. `cancel_connector_request` requires
an exact task and revision, closes that local request, and commits
that change without a provider call or Playbook cancellation. Completed IDs
also remain closed within the turn, so a stale tool proposal cannot revive them.
Revision, new-request, and cancellation intent remain semantic model proposals.
The deterministic evidence check attests value provenance and scope; it does not
establish linguistic intent or exclude a value merely because it stands alone.

A native call may omit its `__context` object or supply null, an empty object,
or a sparse object of declared fields. Missing or null fields mean no new
visitor value and preserve previously sourced conditions. The native schema
advertises optional typed nullable fields in an optional nullable object.
Unknown keys, nonempty lists and malformed scalar values return local correction
feedback before review, dispatch or question-state mutation; no coercion supplies
missing values. Pins without declared context accept no extra context fields.

For operations with declared conditions, `__context` and the optional
`__ambiguous_context` list form one native proposal with API arguments and exact
pending controls. Ambiguity names must be unique, declared fields with no new
native value. Optional absence is not ambiguity. The existing proposal builder
supplies every declared field to semantic review, with null for missing values,
alongside independently verified retained sources. Shape completeness never
establishes semantic completeness. Source, schema, revision and confirmation
admission run before semantic review.

The tool-free assessment verifies that proposal using the exact deployment
provider/model, public API/context field meanings, current message, freshly
verified selected field sources and exact selected task. Matching open-task
hints expose only IDs, revisions and public open-field definitions, never other
tasks' values. Historical sources retain their provenance. Arbitrary history,
attachments and provider results are excluded.

The closed verdict contains `status` and bounded `{field, reason}` issues;
it supplies no values, task changes, execution permission or visitor questions.
Negative or unavailable verdicts produce local `correct_arguments` feedback with
`execution: not_started`, recognized by the existing native repair path. They
create no receipt or pending/checkpoint mutation. Only a corrected, admitted
native call may execute or record a genuine clarification. A failed interpretation
does not imply a provider outage or missing provider data. Private diagnostics
exclude response text and inputs. See [ADR 0022](adr/0022-coherent-connector-continuations.md).

The assessment uses one model step, at most 1,024 output tokens and 20 seconds
within the existing turn deadline. Usage remains
`agent_connector_context_assessment`. A maximum of 16 canonical per-turn cache
entries includes failures and binds the complete proposal/context/ambiguities,
fresh selected revision/sources, association hints, pin, confirmation, deployment,
authority scope and current message. Object key order and equivalent missing/
null native fields are immaterial; changed values, revision or source require
a new review. Operations without declared context and without source reassignment
incur no review call. Representative
model quality remains an integration check.

S2B `__rebind` is an optional closed list of at most 16 concrete input/context
root references within the exact live `__pending` ID/revision and `revise` action.
Targets require published `pending_source_rebinding: true` in API input policies
or context field metadata. Both endpoints must be public scalar literal fields
with exact source binding, no resolver and `latest_message_only`. Absence or false
denies reassignment. The shared context admission binds original donor literals
against target policies before current replacements, preserves their message
IDs/hashes and removes donors unless separately replaced. Required missing donors
and invalidated dependencies stay unresolved. Duplicate, cyclic, conflicting or
unauthorized moves return local no-mutation repair. The reviewer sees only the
validated references and resulting fields. The gateway repeats admission with
the revision and verifies fresh sources immediately before dispatch. Existing
ConversationState persists partial progress once without renewing task age; a
successful read consumes only the selected task. Context metadata is stripped
from the generated input schema. No second source store or transition owner is
introduced; details and candidate boundaries are in ADR 0022.

Optional `metadata.context_contract` is closed, versioned, and frozen in the
operation revision and Agent pin. It declares public scalar conditions and
fixed `equals`, `lte`, or `gte` predicates on compatible API inputs or concrete
provider result paths. Input predicates run after source/schema admission and
before dispatch; result predicates run before identity checks, projection, and
evidence admission. Missing metadata or conflicts produce field/reason
diagnostics without rejected provider values. Successful replay requires the
same admitted inputs and conditions. A general OpenAPI string and model world
knowledge cannot supply an undeclared relationship check. See
[API Connector context contracts](API_CONNECTORS.md#pending-direct-read-context)
for the schema and authoring limits.

Declared conversation conditions apply only to direct Agent reads. Nonempty
contracts on writes fail publication; Playbook validation and confirmation
remain separate. Existing operations without the optional metadata keep their
exact serialization and hashes. The additive context migration preserves old
history without deriving tasks from earlier questions; new conditions require
operation and Agent republication. This boundary adds neither a resolver
network call nor a second scheduler.

The deployed model is instructed to explain capabilities from their published
descriptions without executing them and to focus input clarifications on the
unresolved part of a request. These semantic instructions are not independent
proof of correct intent selection; representative candidate dialogue evidence
is still required. They do not introduce another router or execution authority.
One final language instruction applies to natural answers, capability limits,
clarifications and the evidence-selection language field. The evidence format
does not override this language choice; technical keys and identities stay
unchanged.

For complete direct reads, the model selects evidence instead of writing the
factual answer. `AgentEvidenceAnswer` accepts this closed JSON document as
ordinary model text; native provider structured-output support is not required:

```json
{"language":"de","layout":"auto","sections":[{"evidence_id":"exact-call-evidence-id","pointer":"/data"}]}
```

Only `language` (`de`, `en`, `fr`, or `es`), optional `layout`, and `sections`
are allowed. `layout` is limited to `auto`, `paragraph`, `bullets`, `numbered`,
or `table`; it is a presentation hint for an explicit visitor request and never
changes evidence selection or capability authority. A section
contains `evidence_id` and `pointer`, optionally `fields` (one to 32 distinct,
literal child keys) or `detail: "all"`, never both. It contains no generated
labels, values, units, claims, or prose. A complete JSON code fence is also accepted. Every
available complete successful direct result must be covered. References must
match the delivered ledger and execution trace, and pointers must resolve
exactly under `/data` using RFC 6901 escaping. Mixed Knowledge results may
select `/context`, never `/sources` or source metadata. Invalid, duplicate, or
missing selections fail closed.

The initial answer should respect the requested number of records. Covering
every successful call does not require displaying every returned record.
If its selection is invalid, the existing fallback can display a broader set
of verified records; no second model selects a narrower subset.
Both curated and raw renderers keep HTTP(S) URL scalar
values intact. If a complete record and its required context cannot fit, they
omit that record and retain the output-limit notice instead of shortening its
URL. Omitted records do not receive visible-fact presentation receipts.

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
description, unit, exact localized `value_labels`, `summary`/`detail`/`hidden`
visibility and sibling `context` dependencies. Value labels change only the
rendered form of an exact API enum or code; the original value remains in the
evidence envelope. Hidden fields and workflow-only role aliases do not reach the
Agent. Objects and record collections require explicit nested `fields`; records
retain their actual indices, and parallel wildcard arrays are never zipped.
Missing required context removes the dependent fact. Projection precedes model
context construction, while result identity verification still uses the full
provider result. Presentation metadata comes from the verified revision, never
from a provider property named `presentation`, and is redacted and budgeted with
the projected data. The complete envelope participates in the existing evidence
hash and exact in-turn replay.

For a fixed first-page API read, `response.result_window` may publish the
mapped collection field, mapped provider total, literal request limit parameter,
limit and first-position meaning. Publication requires a matching static query
limit and disallows automatic pagination on the same operation. Runtime checks
the mapped total against the delivered record count. A larger total yields a
typed, hash-bound selection scope on both the execution receipt and curated
evidence; an equal total proves this returned collection complete, including a
true empty result. Missing or contradictory counts fail the read. Answer review
and exact-fact fallback add the localized first-N boundary once for displayed
records, without exposing raw metadata or deriving a total from their count.
Existing revisions without this declaration retain their original meaning and
must be republished before a fixed response limit can establish this scope.

An optional versioned `response.answer_presentation` policy belongs to this
same immutable operation revision. Omission means `auto` and does not rewrite
older contracts. It can select a deterministic layout, preserve or suppress an
intro, choose the subject from an exact admitted input or visible field, name a
record-title field, append localized closing text, or use a bounded plain-text
template. Templates accept only `{{subject}}`, `{{count}}`,
`{{input:key}}`, and `{{field:semantic.path}}`; every reference must resolve to
the closed input schema or visible output mapping at publication. There are no
functions, expressions, HTML execution, provider-supplied templates, or new
model prose. Referenced fields become explicit same-record or inherited context
and remain subject to evidence validation and output budgets.

The model view omits repeated `summary` visibility defaults and renderer-owned
context dependencies. Field pointers, labels, meanings and approved values stay
visible; the renderer expands context from the full canonical ledger after
selection. The canonical evidence and its hashes retain every explicit context
dependency. Shared purpose and literal-input rules appear once in the Agent
instructions; each Connector description retains its published purpose, input
meanings, cardinality and special alias or continuation rules. Successful tool
results carry one brief completion cue instead of repeating the conversation
rules. Instructions and the native clarification schema ask the
model to account for each concern and retain every supplied other input in
`known_inputs`. This remains a semantic proposal checked by the existing binder,
not proof that every intended concern or value was identified.

The model selects relevant facts within that projection. Selecting an object
uses its published summary fields; an exact scalar or `fields` selection may
include detail fields, and `detail: "all"` selects all approved facts. Explicit
context is added without unrelated siblings. `AgentEvidenceRenderer` formats
readable labels, units, localized values and decimal separators, natural bounded
intros, configured record titles, and call-specific subjects. Connector binding
keeps both the admitted canonical input used for execution and the redacted
literal phrase used for presentation; both are included in the evidence hash.
JSON pointers and raw request JSON remain internal. Each record and its complete
context (including an explicitly inherited parent currency or timestamp) render
atomically under the output budget. Uncurated results retain their containing
record because no field-level context contract exists. No field-name convention
such as `records` or `items`, flattened value pool, or word-distance/number
heuristic establishes identity. Strings are escaped as literal data, so API
content cannot supply active Markdown or HTML or alter the response contract.
Execution/source metadata and `data_preview` are not factual payloads. A root
fact already fully visible in a published section intro is not repeated in each
nested record. Record pointers, displayed ordinals and complete context proofs
remain unchanged. Independent nested records still render separately.

The Agent tone and length profile applies to reviewed natural factual claims.
Exact source selection and published `answer_presentation` templates remain the
fallback if semantic wording is rejected. Evidence-pointer and arithmetic
validation remain exact; a digit regex does not prove natural prose truth.
Questions bind to exact pending IDs/revisions and share the existing batch
review. They cannot modify pending state or authorize an operation. No new
global style setting or per-question model loop is introduced.

Native paragraph output uses short public result references. After tool results
arrive, the shared step projection refreshes the response schema with the exact
currently offered references as an enum. Admission and provider dispatch use
that same schema; source field values cannot stand in for result identities.
This is a formatting constraint, not evidence or execution authority. The
existing finalizer still checks the referenced public fields and reviews prose.
The independent claim review does not inherit this productive reference offer.

The immutable answer-length profile bounds the entire rendered answer in UTF-8
bytes, including markup, labels, and provenance: `short` is 3,000, `balanced`
is 8,000, and `detailed` is 16,000. The renderer budgets sections and fields
within that total and visibly marks omitted data. These presentation limits are
separate from the tool-result and provider-usage budgets.

Invalid or missing answer selections use the existing verified source/facts
fallback directly. There is no separate generative answer repair, repair schema,
repair prompt or repair-only history snapshot. Normal native schema formatting,
SDK tool-call correction and the single terminal claim review remain separate
existing boundaries. Review is tool-free, carries no conversation history or
attachments, runs at most one step, and retains its 20-second cap within the
remaining turn deadline. Recovery does not acquire a model or tool replay.

This deliberately removes a second opportunity to choose a narrower record or
field. For example, a bad document-link pointer can now show both verified links,
and a malformed tomorrow selection can show both returned days. Unsupported
prose never becomes a fact. Existing public field, source identity, twelve-section
and answer-byte limits remain; an empty allowlist still exposes no private field.
Historical selection keeps the verified displayed record and original order;
Knowledge excerpts and independent reads retain their sources alongside the
authoritative Playbook status, including waiting or unknown outcomes.

Ordinary conversation without direct reads and pure Knowledge answers remain prose;
Knowledge citations are checked against the actual delivered source identities.
Neither a valid source identity nor this output contract proves the semantic
truth of free prose, the correctness of external data, or that the model chose
every capability the visitor intended. Routing coverage remains an explicit
quality check.

Each Knowledge attempt can retain a bounded private `knowledge_retrieval`
diagnostic in canonical execution evidence and the existing encrypted
presentation receipt. It records retrieval status, strategy, evidence quality,
returned/delivered chunk counts, index-compatible candidate counts and
allowlisted failure codes. Counts are integers limited to 0 through 1,000,000.
Query text or fingerprints, vectors, source content, raw errors and credentials
are excluded. The checkpoint survives model failure, empty delivery, mixed
Playbook composition and receipt restoration; successful retrieval checkpoints
once. The operator debugger can display these facts, while visitor JSON/SSE
exposes only the separate generic capability status. Older receipts remain
readable without inventing missing diagnostics. These diagnostics do not change
retrieval thresholds, capability authority or candidate acceptance.

The Knowledge tool admits at most three distinct normalized queries per turn
and at most two for an overlapping, exact `request_evidence` purpose. A second
query for that purpose is allowed only after a clean `no_evidence` result. A
successful first search permits another search only for a separate,
nonoverlapping source-bound purpose. Duplicate queries, retrieval errors,
unavailable sources and unusable evidence do not authorize a blind retry.
All attempts share the original turn deadline, pinned authority and remaining
Knowledge context budget. Delivered citations use increasing reference numbers
across the turn, with a separate evidence entry for each successful search.

When reranking is enabled, retrieval and hybrid fusion keep the pinned candidate
pool before applying the final `top_k`, within the existing backend ceiling of
30 candidates. Candidates still must pass index compatibility, original
thresholds and score checks. Final evidence scoring uses the selected results;
reranker failure falls back within the same final limit. No retry lowers a
threshold. Multiple attempts add at most three allowlisted diagnostic summaries
to the existing receipt, with one checkpoint per dispatched attempt and no
query text or source content in those summaries.

The S3b candidate also offers execution status as a value-free claim:
`{"kind":"execution_status","receipt_ref":"exact offered reference","capability_key":"exact offered operation"}`.
`AgentExecutionStatus` resolves the pair against current read receipts or the
once-per-turn `agent_execution_context.v1` snapshot. Current references address
an actual member of the current receipt array and its SHA-256 identity, never a
fabricated SDK call ID. A shifted position cannot select a different receipt.
The renderer supplies the pinned public label and recorded outcome. Historical
statuses explicitly identify the earlier source-turn completion time; they
never supply fresh observations or result facts. Result selection below keeps
its separate source/presentation admission.

Pending inputs, technical attempts, verified execution history and selected
historical evidence also make a turn evidence-bearing without a current call.
The same snapshot survives response copies and encrypted presentation checkpoints.
`answer_review.v5` includes the frozen context, bounded receipt offers, public
pending metadata, reverified retained visitor sources and native binding hashes. A `current_message` semantic review group is not an invocation,
request inventory or execution permission. Invalid or unavailable review cannot
publish that prose; deterministic facts/status or a verified-result limitation
remain. Completely context-free ordinary prose still has the explicitly retained
semantic limitation in ADR 0025.

Historical references to previously displayed direct-read records have a
separate admission rule inside this same answer/evidence boundary. The normal
renderer produces `agent_answer_presentation.v1` only for fully displayed
curated records, recording their displayed ordinals and visible fact pointers.
The normal outcome commit binds that private proof to the canonical assistant
message and its content hash in the existing encrypted presentation receipt.
Omitted or shortened records, uncurated prose and model summaries cannot supply
that proof. Historical rendering never creates a new current-read receipt.

`AgentHistoricalEvidenceReader` examines at most 32 earlier completed turns and
admits at most three source turns, six groups and twelve complete records within
a 12,288-byte catalog. Sources must match the current bot, conversation, exact
deployment/hash, approved read pins and freshly attested scope fingerprint,
including tenant, actor/token and area. It verifies the original receipt,
evidence hash, canonical message hash, visible fields and context closure.
Its catalog is bound to the current request. It neither refreshes capabilities
nor restores old scope values as execution authority. Old receipts without a
presentation proof or scope fingerprint are ineligible; they are not backfilled.

A bounded multilingual reference grammar recognizes explicit factual references
and definite ordinal phrases against published metadata. It is an additional
answer admission check, not a general intent classifier or capability router.
Social acknowledgements, fresh named lookups, supplied local lists and ordinary
conversation retain their existing path. Unsupported paraphrases remain outside
this grammar; this is not a universal factuality guarantee. Multiple possible
source groups or records require clarification instead of a recency guess.
Bounded list compounds can match an exact published subject prefix; they must
not hide one side of an explicit choice between source lists. Result values do
not become subject metadata. German retrospective source frames before a colon
and partitive ordinals also require a published subject. Predicate ellipses are
limited to complete auxiliary questions with a lowercase weak-participle form;
unrelated noun heads, arbitrary predicates and source frames in supplied local
lists cannot acquire a historical record position through this rule.
An English definite subject followed by `from before` also requires published
subject metadata; quoted titles and dated cutoffs do not supply this reference.
The relative phrase `you just read` follows the same published-subject rule;
an imperative request to read a source remains a new request. A short past-tense
pronoun question immediately following a bound historical subject stays with
that historical record. Explicit current work and newly named sources do not.

For a uniquely bound historical record, the adapter supplies a metadata-only
selection catalog under the existing input budget. The normal conversation
invocation retains its deployment-pinned tools and step budget even when a
language heuristic sees only a historical reference. The optional historical
field in `StructuredAgentConversationAnswer` contains `include: true` and
optional visible child `fields`. The server binds the exact source turn,
evidence ID and ordinal; those technical IDs are absent from the model offer.
Prompt-only profiles use the same selection instruction and deterministic
binding. The prompt, ordinary history, memory projection and input budget
remain on the same deployed path.
The server checks source and ordinal against the request and renders only
original verified facts with a historical notice. Invalid model prose or a
wrong selection or provider-formatting failure falls back to the uniquely bound
record without another model repair. Focused child fields retain their published
context dependencies; asking for only a name does not remove a contractually
required record identity. A missing, ambiguous or out-of-range source instead produces a visible
localized clarification according to the published uncertainty policy. Source
proofs remain available when native model history has dropped the original
message, subject to these explicit source-retention limits.
For a source-limited partial turn without a fact-level presentation receipt, one uniquely
identified curated record may be retained from the successful read. This path
requires the original bound coverage, source-answer attestation, unchanged
deployment and scope, and exact displayed scalar values. Only fields visibly
present in the original answer are eligible; other fields in the read result
cannot become historical facts. Ambiguous record order or a missing attestation
leaves the historical reference unavailable. This read-only path never repeats
the capability or supplies inputs for a new one.

A historical reference and an independent current request share the ordinary
deployment-pinned tools and their existing turn budget.
The current request still needs its own source-bound arguments and purpose;
the historical catalog supplies neither. A missing historical record therefore
cannot suppress a current read. The final normal evidence selection may carry
one separate historical selection with `include` and visible fields. The server
resolves its original identity. Both parts are validated independently and
rendered within the shared answer limit. Current presentation receipts contain
only newly executed facts; the original historical provenance remains separate.
An invalid historical selection cannot replace its bound record or erase a
successful current read. Already closed native answer-format steps still have
no tools under the technical SDK step contract.
An internal selection without current evidence is never ordinary answer prose,
including when it copies an old evidence ID or invents a new one. The historical
part remains available; the current part states the missing verified result,
using an unambiguous published source label where possible.

A successful direct-read source does not make another source redundant merely
because both use the same purpose phrase or literal subject. Input questions
remain bound to their own task; unsuccessful sibling input cannot erase verified
facts or create a choice between capability labels from shared values alone.
A complete value-only reply consumed by one verified pending request does retain
a narrow ambiguity barrier against reuse for another pending question. It may
produce a contextual capability choice, without weakening each task's own
input, deployment and scope admission. Previously committed route-conflict
receipts retain their original presentation on recovery.

An unexecuted model read proposal does not prove that its named source contains
or lacks information. Bounded source-content and completed-search assertions
are checked against that rejected capability's published label and aliases.
An independent API or knowledge result cannot attest to the unqueried source;
its own verified facts and citations remain available. The reply states that
the rejected source was not queried, without blaming
the provider or the visitor's input. Trace labels and rejected arguments cannot
supply the public attribution. Ordinary conversation, future help and explicit
non-execution keep their existing path. This is a bounded assertion guard,
not a general natural-language entailment check.

Distinct unresolved task/input receipts contribute their own questions to the
answer. One question cannot silently hide another concern. At most one displayed
spelling suggestion owns a canonical confirmation offer; additional unresolved
inputs remain visible without presenting an uncommitted second offer. A short
acknowledgement still cannot ambiguously select among pending requests.

Model-facing curated results omit value-label translations for values absent
from that exact field and localized labels identical to their fallback. The
full result, field pointers, evidence identity, units and visibility rules remain
available. Server-side evidence and rendering retain the full original contract.
This reduces repeated context without changing the conservative input budget.

Direct-read failure presentation preserves the adapter's bounded cause and
recovery action through the model context and final evidence guard. API/MCP
provider failures, rejected inputs, identity or condition mismatches, and
database execution failures remain distinct. Public explanations use closed
categories and pinned labels, never raw provider error text. Successful empty
database results remain evidence. Reverified retained input may supply
clarification presentation context without becoming fresh input authority;
resolver choices and partial input corrections keep the same source-bound
pending request and question budget. Mixed failures remain visible beside
verified independent results, subject to the answer size limit.

Every direct-read tool call also carries a required, exact quote of the latest
visitor message that states the call's purpose. This routing-only value is
removed before input binding and is never sent to the external capability or
persisted. One purpose can require several independently allowed read targets.
The per-turn ledger and adapters retain exact capability/query completion
identities, same-item replay, fan-out and execution budgets. Missing or invented
routing quotes create no ledger claim; existing input and result guards still
apply. Playbook start admission retains its separate overlap policy.
Neither those guards nor a matching source span prove that the visitor requested
the selected capability's purpose. This limit requires explicit routing tests.

For a verified pending Connector request, a continuation or source-attested
revision can refine a shared compound quote to its freshly bound input and
condition spans. Each task is still re-admitted before execution. Separate
spans keep each task's input evidence separate. An explicit current purpose may
use multiple sources; a bare pending value cannot silently answer unrelated
open questions. Task IDs, retained values and unverifiable source spans cannot
create input or execution authority.

If the model omits or paraphrases that routing quote while answering a pending
Connector question, the server may recover the complete current reply only for
an exact verified prior task. A missing task ID requires one uniquely open task
for that capability. Fresh input or confirmation evidence must pass the normal
binder first; retained values alone, invalid arguments and new tasks cannot use
this recovery. The original task supplies the purpose, not the model quotation.

The runtime deliberately does not use a keyword list to infer which tool
arbitrary prose must invoke. Such a classifier would be capability-specific,
multilingual, and brittle. Instead, **Test live Agent** and the Agent Quality Tests
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
and historical `answer_repair` diagnostics. New turns create no answer-repair
usage or metadata; old records retain bounded attempt counts, outcomes and
initial guard reasons, never raw prompts,
model drafts, or provider results. Existing v5 evidence without these fields
remains readable. A useful `safe_evidence_fallback` is not a passing `answer`
for routing, Quality Tests, or release evidence.
Optional `historical_sources` records only bounded original turn IDs, evidence
hashes and record ordinals. Historical decisions never fabricate current
`capability_executions`, and this private diagnostic is not public chat output.

One per-turn sequence guard permits independent direct reads alongside at most
one Playbook action when the mixed presentation can be checkpointed to the
originating durable turn. Crossing between these capability classes requires a
successful checkpoint; a missing checkpoint or a second Playbook action is
rejected before execution. An already-open Playbook limits the Playbook tools
to its matching continuation or cancellation while approved independent reads
remain available. Knowledge search remains a bounded read-only context tool
and cannot supply executable Playbook or Connector inputs.

The runtime does not automatically search the public web for unknown terms. Web
or entity discovery must be published as its own governed read capability,
otherwise the Agent asks for clarification or states the limit.

### Published read dependencies

The Agent compiler copies `runtime_config.agent.read_dependencies` into
`authority.read_dependencies` in the immutable deployment. Each link declares
both existing direct-read capability keys, one literal source pointer relative
to the delivered payload, one target input, its JSON scalar type and its entity
domain. For example, a host may publish:

```json
{
  "agent": {
    "read_dependencies": [
      {
        "source_capability_key": "data_resource_query:customers",
        "target_capability_key": "api_connector_operation:42",
        "source_pointer": "/data/0/id",
        "target_input": "customer_id",
        "value_type": "integer",
        "entity_domain": "customer"
      }
    ]
  }
}
```

Publication and runtime validation accept at most 16 distinct, acyclic links.
Both endpoints must already be pinned Connector or Data Resource reads. The
target type must match its published schema or filter type; sensitive inputs,
authority scope filters, self-links, wildcards and collection selectors other
than index zero are rejected. A declared Connector target entity type must
match the link's domain. Knowledge, Playbook outputs and write inputs are not
dependency sources or targets. Missing links grant no transfer permission.

An optional `offer: {max_candidates: 12, max_age_seconds: 300}` explicitly
publishes the separate durable public-string confirmation projection described
above. Bounds are 1–12 candidates and 1–86400 seconds, further capped by the
original pending/context deadline. This requires Connector endpoints, required
source result identity and a literal string target. One `/0/` segment may select
each member of a bounded collection for an offer; duplicate public values and
nested/partial collections are rejected. The following invocation-local ledger
and its automatic uniqueness requirement are unchanged.

An opt-in `offer.mode: bounded_selection_v1` instead offers individual public
values from an intact bounded search response. It does not require a provider
query echo or globally complete result set; it requires the actual successful
Gateway request/result pair and an exact-identity target. Such links never enter
the automatic read ledger, even for one match. Existing delivery, scope,
revision, age and Gateway checks still apply. The Open-Meteo decoder/profile
implements public ID selection and a fresh ID lookup with country/region checks;
it does not yet implement weather or coordinate-pair authority. See
[ADR 0026](adr/0026-bounded-provider-location-selection.md). Existing offer and
canonical policies retain the stricter meaning documented below.

The existing presentation checkpoint first persists the delivered evidence and
its matching successful execution. Only then does the turn-local
`AgentReadDependencyLedger` retain the explicitly linked scalar projections.
It binds the original request object, active persisted turn, source message,
deployment hash, freshly attested scope, and active conversation request id and
revision. Both capabilities must belong to that same recorded request. This
projection has at most 24 source identities and cannot be restored from history,
model arguments or a later checkpoint under another request.

Only successful, complete, redacted results qualify. Every collection traversed
by a pointer must contain exactly one entity. Data Resource sources additionally
require a complete `list` execution with exactly one delivered row and a pointer
of the form `/data/0/field`. SQL `first` chooses a record but does not attest
uniqueness; a partial page, final continuation page, empty list or multiple
matches cannot supply a dependency. Connector result-identity and output checks
still run before evidence admission.

Connector proposals carry `__read_inputs[input] = {evidence_id, pointer}`;
Data Resource scalar filters carry `source_reference` with the same two fields.
The normal input remains present and must equal the verified canonical value.
The existing gateway resolves the proof again before dispatch, enforcing the
same immutable input, scope and capability contracts. A broken model proof
returns correctable argument feedback without creating a visitor question.
Derived Connector inputs do not become retained visitor sources or implicit
cross-turn defaults. Native tool, query, item, context and deadline budgets
continue to bound execution; the links introduce no additional turn loop.

An optional `canonical: {max_age_seconds: 300}` makes the linked Connector input
mandatory evidence-derived authority. This is part of the unreleased ABI v9
candidate and requires explicit republication. Source and target must both
declare required result identity; the target must use `normalizer: exact` to
check the sole canonical input. The target schema must contain exactly this
one required property, with one published source link and no optional link or
`offer` on that field. Composite targets such as latitude/longitude or
customer/site are unsupported in this scalar mode: the response verifier checks only one scalar.
An additional optional property or ordinary dependency cannot bypass this
publication restriction. Static request configuration remains available for
fixed provider options. All transitive endpoints must already occur in the
closed capability manifest; neither compiler nor runtime discovers tools.

The distinct opt-in `canonical.mode: request_tuple_v1` supports a complete
required input tuple when the target pins a request-bound response adapter.
All fields must use one fresh verified flat source record and the same evidence
ID. The source's exact verified identity must be one tuple member. Publication
rejects incomplete tuples, mixed policies/sources and additional selectors.
The Gateway rechecks persisted source evidence/execution hashes before dispatch.
This mode does not require a collection-completeness claim for an exact-ID flat
record. The adapter validates the final authorized request and labels local
request provenance separately from provider result facts. The first profile
binds Open-Meteo coordinates and preserves its distinct forecast grid. See
[ADR 0027](adr/0027-canonical-request-tuples-and-grid-forecasts.md).

The Gateway's boolean identity verdict is checkpointed with the successful
execution. Scalar canonical source admission requires its accepted, verified result.
It also requires an explicit `complete: true` payload or
`data.collection_complete: true` witness. A provider's first/limited page must
never be relabeled as complete to manufacture a unique location.
Freshness is bounded to 1–86400 seconds and starts conservatively at the source
turn's persisted receipt time. Registration, redisplay and reuse cannot renew
it. The binder and Gateway require `__read_inputs` even when an identical value
occurs in visitor text, retained input or a confirmed public label. Expired,
cross-scope, incomplete, unverified or changed sources cannot supply a target.
Empty and multiple candidate collections yield distinct
`connector_read_dependency_not_found` and `connector_read_dependency_ambiguous`
diagnostics. They do not create another visitor confirmation. Provider outages
and identity failures retain their existing failure categories. A failed
identity/not-found response for a verified canonical target stops without asking
the visitor to reconfirm an internal identifier.

The executable [location example](examples/canonical-location-v1.json) and its
Gateway fixture use a provider-issued location ID, required target identity,
and the existing country/region context predicates. A station display name may
differ while that ID matches. Query echo attestation proves the query binding;
the published provider contract must separately establish that its candidate
IDs and country/region metadata describe the resolved locations. Neither a
generated echo nor fuzzy label similarity establishes that relationship.
The example specifies a deterministic provider protocol, not wttr.in or
Open-Meteo compatibility. See [the S5 handoff](plans/runtime-reliability/S5-result.md)
for the bounded external-host candidate step. Existing literal/exact-name
contracts and S2 public-string offers retain their meaning.

## Playbook Invocation

For each turn, `AgentPlaybookTurn` derives the model's tool set only from the
verified Agent deployment. With no open run, those tools may start only their
exact pins. With an open run, the Agent sees the matching continuation tool,
except at waitpoints that require bound structured widget input or authorized
operator resolution. These keep their existing resolution path without offering
the model an unusable continuation. Delayed runs retain their status tool.
Only when the latest visitor message independently matches the bounded explicit
cancellation grammar is the continuation tool replaced by the
closed cancel tool. The cancel handler repeats this attestation before changing
state, so model instructions, retrieved knowledge, history, negation, quoted
text, and mixed requests cannot authorize cancellation.

A normal user cancellation commits against the verified AgentGraph cancellation
reason and its closed interrupt. It does not require an operational
`system_failure_reason`: cancelling a task is not a system failure. JSON and SSE
replay the same committed cancellation message without repeating the operation.

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

Before model dispatch, the runtime captures the current question, input type,
resolution mode, and bounded choice options from the authoritative AgentGraph
interrupt of the exact pinned open Playbook. This presentation snapshot is
redacted and wrapped as untrusted data. It contains no future steps and does
not depend on conversation history or a stale pending-interaction projection.
An unavailable, absent, or mismatched Graph interrupt contributes no snapshot.
The context describes the waitpoint at turn start; it grants no authority and
does not save an answer. A canonical continuation result replaces it. The Agent
must use the available continuation tool to apply an unambiguous current answer
and must not invent the next process question. Side questions, clarification,
explicit approval, widget inputs, and operator review retain their boundaries.

Choice continuations expose the published labels and canonical values in their
answer schema. System and tool guidance both require a current request for the
published Playbook job and values supplied for use in that job; a literal mention
alone does not establish either intent. A rejected textual proposal explicitly
reports that no input was applied and whether clarification is possible; it must not be described as a
saved or confirmed choice. Every direct read and new Playbook start additionally
carries a reserved purpose-evidence field. The runtime removes that field before
input binding and requires a whole-token source span from the latest visitor
message; missing or model-invented purpose wording cannot dispatch the capability.
An evidence excerpt that only repeats one supplied input value from a larger turn
cannot dispatch either: a source-bound value is not proof that the visitor
requested the capability's job. A complete short value reply remains eligible
for a contextual clarification such as “Which city?” → “Berlin”.
Within the conversation plan, Connector, Data Resource and Knowledge reads reuse
the already verified current request quote when the duplicate purpose field is
omitted. Explicit malformed or unrelated quotes remain invalid. A stale plan or
historical request cannot supply current purpose, and published input-binding
and policy checks still authorize the actual read.
Textual replies at email, number, date, time, choice and free-text waitpoints
use the same native semantic decision before deterministic source binding.
An acknowledgement, side request or pause must not become a field value
automatically. A valid proposed answer still needs exact current-message
evidence and the existing input validation. Defer leaves graph and pending
request provenance unchanged and permits normal conversation or independent reads.
Questions, mixed acts, cancellations, invalid typed values, approvals, operator
reviews and widget-only inputs retain their existing explicit boundaries.
Rejected direct-read and Playbook-start proposals remain in the shared operator
trace but do not count as executed attempts or turn an otherwise safe
conversational answer into a fictitious lookup failure.

Standalone input and model-selected answers share the same complete-message
admission. When the proposed value is an excerpt, every surrounding word must
fit a closed affirmative response grammar. Unknown surrounding prose, questions,
conditions, refusals and quoted examples leave the waitpoint open. A closed
correction grammar may retract one contract-valid prior typed value, for example
“Nicht Berlin, sondern Hamburg.” Multiple unretracted choices remain ambiguous.
A complete valid free-text answer can itself contain negation as data; text
still requires an Agent proposal. These checks authorize supported response
forms rather than claiming universal semantic interpretation. Unsupported forms
require clarification or the existing bound input controls.

A separately recorded text input continuing the exact active Playbook can share
a turn with an independent read or knowledge question. Admission validates its
unique, nonoverlapping current visitor span and rejects uncovered prose, quoted
examples, qualifications and competing answers. The input remains bound to the
same authoritative graph interrupt; the independent request supplies no approval
or write authority. Textual approvals retain complete-message admission.

Before model dispatch, an open run's bound Agent deployment is verified. If its
runtime contract is incompatible, the turn commits localized, non-retryable
conversation advice and leaves that historical run and pending input unchanged.
The visitor is directed to the operator about unfinished work; a new conversation
is suggested only for new requests. This classification does not catch late
execution failures or replace unknown-outcome reconciliation.

Textual approval or rejection additionally requires the complete latest visitor
message to match a bounded explicit-response grammar, independently of the
model's proposed resolution and quoted span. Negated, quoted, conditional,
mixed, or otherwise unsupported wording cannot authorize either branch. The
waitpoint stays open for clarification or the existing bound widget controls.
Accepted textual resolutions retain the whole attested utterance as evidence;
operator-review and typed widget authority remain separate and unchanged.

Playbook node-level AI tasks may interpret bounded input for that node. Their
output remains untrusted data checked by the node contract and deterministic
policy. They do not plan the outer chat turn. The editor compiles AI Tasks with
conversation memory off and explicit empty `contextSources`; their input template
selects the required variables. The plain AI executor reads only explicitly
declared context sources. Missing or empty sources never fall back to ambient
`context`, `kb_context` or `knowledge_context` variables from another node.

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

The unreleased candidate records bounded `agent_execution_event.v2` activity
in private `chat_turn_progress.v2`, with separate public projection and
server-authorized existing-debugger diagnostics. Native proposals, model calls
(including reviewers) and Gateway dispatches have distinct counters. Events
never own execution or recovery. See [the schema, bounds and S7 consumer
contract](EXECUTION_ACTIVITY.md).

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
- The S3c candidate restricts productive Agent conversation compaction to an
  oldest complete native turn exactly duplicated by a later complete turn,
  including its message objects and attachments. A unique retained turn may
  carry a correction, condition or result detail; it cannot be discarded merely
  because the budget is tight or an execution-status receipt exists. If this
  bounded retained context cannot fit, admission fails before provider dispatch
  or usage reservation. Existing history selection/scan limits still apply;
  this is not unlimited recall of every condition ever mentioned.
- Conversation summaries use their own summary bounds instead of the generic
  scalar-memory prefix limit. Both prompt readers retain the newest complete
  summary records. Each record has bounded excerpts of both sides of the turn;
  optional topic and retrieval notes cannot displace them.
- New session-memory writes bind bounded previews to fingerprints of their full
  redacted, whitespace-normalized source content in the existing AgentGraph
  memory metadata. Summary projection records bind the exact rendered line,
  both full source messages and its topic/query notes. Projection omits a line
  only while the corresponding adjacent native user/assistant pair and matching
  independent notes remain. Last-message and timeline previews likewise require
  a matching full source fingerprint; shared prefixes alone are insufficient.
  Legacy unbound memory, unmatched summaries and independent retrieval/source
  notes remain. Projection snapshots its scoped reads once and can restore an
  omitted copy without rereading storage; it never deletes stored memories or
  replaces business results with execution status. Open v3 Connector offers,
  revisions and evidence retain their existing separate bound projection.
  These candidate changes remain within the unreleased ABI v9 and preserve
  `agent_tool_projection.v7` and the frozen S3 execution-context contract.
- Synchronous and native streaming `BaseConversationalAgent` invocations admit
  and reserve each native SDK model step before dispatch, using its current
  messages, including tool calls, results, provider replay blocks, fixed schemas
  and attachment allowances. Completed steps settle before tool execution, and
  eligible independent answer reviews settle the complete productive response
  before their own provider request. The later matching SDK `StepCompleted`
  cannot bill it twice. Only an uncertain
  failed provider step retains its own reconcilable reservation. Expired deadlines
  and rejected input budgets create no reservation for an undispatched step.
  The SDK owns the loop; the usage listener never executes tools or transitions
  workflow state. Conservative byte upper bounds remain in force. Deferred
  streams reserve only when iterated; interrupted iteration cannot redispatch
  the transport. Provider-specific adapters preserve each terminal receipt.
- If a later model step exceeds context or usage limits after verified reads,
  `agent_context_limit_reached` or `agent_usage_limit_reached` preserves the
  evidence with an incomplete-answer notice and performs no extra inference. It
  does not retry completed capabilities or spend another model request.
- Usage and cost accounting retain Agent deployment, Playbook deployment, run,
  stage, and parent-turn attribution without persisting prompts in operational
  summaries. All model-step records include `meta.invocation_id` and the
  one-based `meta.model_step`; they are not aggregate whole-loop usage rows.
  Native synchronous and supported streaming receipts establish completeness before SDK DTO
  defaults are accepted. Missing or partial receipts, including native streams
  without complete usage evidence, remain reconcilable. Each call pins its
  tariff rates, provider/model, currency and unit scale in a verified pricing
  snapshot before dispatch; later configuration changes cannot reprice it.
  Full totals include every recorded call in scope and become unknown when any
  call lacks verified usage or a compatible price. Clearly labelled known
  subtotals remain available. Calculated token costs are not provider invoices;
  reservation expiry does not attest zero cost or repair a missing receipt.
- Expired unknown calls enter `awaiting_evidence` and keep their reservations.
  A later native receipt or authorized per-request evidence settles against the
  original month and scopes. Unique provider receipt claims apply to both paths.
  Operator application records an encrypted audit atomically, verifies the
  reviewed version, and never retries a model, tool or Playbook. Known receipt
  facts and complete frozen tariffs cannot be erased or repriced by evidence.
  V2 tariff snapshots cover explicit context bands, service tiers, modality
  partitions and cache lifetimes. Missing dimensions or uncovered fees remain
  unknown. See [AI usage accounting](AI_USAGE_ACCOUNTING.md).
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

Live provider readiness uses the verified active deployment's exact provider,
model, driver and base URL, together with the current stored Agent credential
or that exact provider's host credential. Draft and candidate setup are evaluated
separately; editing their provider settings cannot attest or invalidate the
unchanged live provider binding. Channel availability and exact-deployment test
evidence remain separate checks.

Before a tested candidate becomes live, activation rechecks each immutable
Connector operation pin in the Agent manifest and its pinned Playbooks against
the running package's strategy implementations, published operation state and
current Connector environment binding. A failing pin blocks activation and
names the affected capability for the operator. The productive Gateway still
authorizes each request independently at execution time.

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
requires every Playbook to publish an explicit start rule, realistic matching
examples, and at least one nearby non-matching request even when it is the only
tool, rejects contradictory matching/exclusion phrases, and
rejects duplicate model tool names or identical normalized routing phrases
across tools.

Published-Agent Quality Tests run every saved turn through
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
both the live test and Agent Quality Tests. The protected
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

## Human conversation ownership

Human support admission uses the same conversation access and durable ChatTurn
ledger as Agent turns. Under the conversation lock, each new turn records the
current Handoff request and the latest Handoff identity. A human turn has no
Agent deployment authority and can only record the customer message and its
Handoff activity. Agent publication failures therefore do not disable an
already active support conversation. Active turns and unknown write outcomes
still block concurrent admission; human support never clears reconciliation.

Handoff creation and operator changes use the same conversation-first lock as
canonical response publication. A takeover invalidates an older Agent answer,
including when the operator returns the case before that answer commits.
Canonical completion and graph recovery retain execution evidence and publish
a bounded Handoff notice. New Agent read or Playbook proposals are rejected
after takeover. Work already admitted to a Playbook or capability retains its
original execution, checkpoint and reconciliation contracts; Handoff does not
pretend to cancel a remote effect. Background resume delivery is verified
separately from the synchronous turn boundary.

An authorized operator can explicitly transfer an active case to themselves.
Reassignment preserves the current customer/operator wait state, validates
version, scope and replay identity, and changes reply/completion authority.
Resolving or returning a case ends human ownership. It does not automatically
resume a visitor-input or approval waitpoint; the next customer turn again
requires an independently valid Agent deployment.


### Human Review outcome delivery

An authorized Human Review decision and its exact approval interrupt are admitted
atomically into `WorkflowResumeDelivery`. `ResumeWorkflowRunJob` remains the one
resume and recovery owner. It validates the stored operator decision before SDK
dispatch, then commits the public outcome and any next input binding with the
terminal delivery marker. Review effect status and response delivery status are
separate: recovery of a failed message commit does not repeat a successful effect.

Background outcomes remain in AgentGraph and the effect journal when Human
Handoff owns the conversation. The delivery is completed with `withheld_handoff`
and no public Agent message; the Review page requests an operator reply from the
Handoff Desk. A takeover watermark also fences a quick takeover and return.
Returning or resolving a Handoff does not itself resume a pending approval or
input and does not replay a withheld background response.
