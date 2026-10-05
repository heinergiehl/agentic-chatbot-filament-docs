# Agent Runtime Architecture

This document describes the implemented runtime on the `runtime-v2` branch.
Productive conversation follows [ADR 0037](adr/0037-transcript-agent-loop.md):
one transcript-based Agent loop with flat, deployment-pinned tools. ADR 0037
supersedes the dialogue-contract decisions of ADRs 0010 to 0012, 0014 to 0018
and 0020 to 0036; their observation snapshots, answer reviews, presentation
receipts, read drafts, read dependencies and tool-loading modes are removed. Deterministic package checks do not establish
real host, provider or user acceptance.

## Product Model

An Agent owns the conversation. A Playbook is an optional deterministic tool
that the Agent may invoke for a bounded process. A simple conversational or
knowledge Agent does not need a Playbook.

Every productive Agent is represented by exactly one live, immutable,
hash-verified `AgentDeployment`. Its closed contract freezes behavior, model
policy, one exact provider/model/driver/base-URL binding, effective token and
monthly budgets, exact Data Resource and Connector operation pins (reads, and
writes with their confirmation policy),
and exact Playbook deployment pins. Provider fallback lists are authoring-time
conveniences only and cannot be published as productive Agent authority.
Mutable bot, Connector, or Playbook authoring data is never consulted as
runtime authority.

API Connectors, Data Resources, knowledge sources, channels, access tokens,
usage accounting, limits, human handoff, and operational inspection remain
product capabilities. They do not own conversation routing.

## One Productive Turn Path

```text
HTTP / widget / channel
-> ChatTurnApplicationService
-> DurableChatTurnService
-> AgentRunner                      (sole ChatTurnRequestExecutor)
-> verified AgentDeployment
-> RuntimeAgent (Laravel AI agent loop, at most 12 steps)
   -> transcript of earlier turns, replayed natively
   -> flat read and write tools from the deployment pins
   -> optional Playbook tools for the pinned Playbooks
-> CapabilityExecutionGateway for every external read and write
-> canonical ChatTurnResult
-> durable outcome and assistant-message commit
-> JSON / SSE renderer
```

`AgentRunner` handles handoff ownership, deployment verification, empty input,
provider failures, confirmation cards and Playbook results. An open Playbook
run whose Agent version can no longer be verified or uses the retired input
contract is not continued: the model is offered only `cancel_playbook` for it
and the answer ends with a fixed, localized notice (ADR 0040).

`RuntimeAgent` accepts only the immutable runtime projection of exactly its
verified deployment: the runtime bot must carry that deployment's ID, hash and
contract version. Provider, driver and model come from that binding. A
mismatch fails before any provider request.

## Transcript

The conversation transcript is the Agent's only dialogue state. Each committed
assistant `BotMessage` stores the tool calls and tool results of its turn in
`meta.agent_transcript` (version 1). The next turn replays them as native
assistant tool-call and tool-result messages before the visible answer, so
follow-ups such as "and in Celsius?" use the same mechanism as any coding
agent. The public message serializer exposes only allowlisted meta keys, so
the transcript never reaches visitors.

- `conversation.session_memory.history_turns` (0 to 100, default 20 from
  `chat.session_memory.history_turns`, "Turns to remember" in the editor) is
  the upper bound of earlier turns loaded. Zero or disabled session memory
  sends no history.
- `ContextBudget` then fits those turns into the model's input room: the
  context window from `ModelCapabilityRegistry` minus the reserved output, and
  the configured input limit, each less the instructions, tool schemas, the
  current turn and a reserve for this turn's own tool loop (a quarter of the
  room, at most 16,000 tokens). A model without a known context window is
  given 32,000 tokens of input room. It estimates with the same estimator as
  request admission. The oldest whole turns go first; when only the newest
  earlier turn is left, its tool results are replaced by the placeholder; then
  it goes too. A turn is kept or dropped whole, so every tool call keeps its
  result. Only when the current turn alone cannot fit does the visitor get the
  "conversation too long" answer.
- Operator replies from the handoff desk keep their stored `assistant` role
  for the widget but are replayed with a prefix that marks them as written by
  a human operator, not by the Agent.
- Tool results stay verbatim for the three most recent assistant turns; older
  results are replaced by a short placeholder that tells the model to call the
  tool again when it needs the data.
- Unpaired tool calls or results are dropped, because providers reject them.
- Files a visitor attached on an earlier turn are replayed on that turn's
  message within the attachment count and byte limits left after the current
  turn's files. Unavailable or changed files are omitted with a note that asks
  the visitor to attach them again.
- `BaseConversationalAgent` admits every model step against the exact
  serialized request. Before the first step it still drops whole earlier
  turns, oldest first, if the request does not fit (never this turn's own
  messages). Later steps cannot shrink: the SDK sends every message it holds,
  so a step that does not fit is rejected. While earlier turns are still
  replayed, `RuntimeAgent` then stops the loop with its messages so far and the
  runner asks once more, with the earlier turns fitted again around them and a
  runtime note to continue. A request that cannot fit without earlier turns
  ends with a non-retryable `ai_context_window_exhausted` or
  `ai_input_token_limit_exceeded` answer.

## Tools

`ToolFactory` turns each read pin of the deployment into one flat tool:

- `ConnectorReadTool` for a published read operation of an API or MCP
  connection. Its description combines the published description, result
  fields, an intent example and, for MCP, the published source name, scope and
  URL.
- `DataResourceTool` for an approved Data Resource, with its published
  filters, sorting and limits as typed arguments.
- `KnowledgeTool` for the pinned knowledge search.

- `WriteTool` for a published write: an API or MCP operation, or the insert or
  update of an assigned Data Resource with a write policy (ADR 0038). With
  visitor confirmation its call only proposes; see Direct Write Execution.
- Built-in tools switched on in the Agent editor (ADR 0039): `HandoffTool`
  (`request_human`) hands the conversation to the handoff desk, and
  `save_contact` is a `WriteTool` that stores a lead as a submission after the
  visitor confirmed its card. See Built-in Handoff And Lead Capture.

Batch and durable background writes, approvals inside processes and durable
waits belong in Playbooks. There is no global tool registry, mutable authoring
fallback or client-selected operation.

`RuntimeTool` is the shared envelope. Arguments are validated against the
published input schema before any request leaves the server. A result is
`{"ok": true, "result": ...}`, compacted to 12,000 characters while keeping its
structure. A failure is `{"ok": false, "error": ..., "next_step": ...}`, where
`next_step` tells the model in general terms whether it can correct its
arguments, should ask the visitor, or should stop. An identical call within the
same turn returns the earlier result without a second request. After three
consecutive failures of one tool the tool refuses further calls in that turn.
Arguments may be inferred by the model (for example translating a name);
read authority comes from the pin, scope and Gateway, not from argument
provenance.

Each tool call is recorded in a per-turn `ToolCallLog`: redacted arguments
(the free text of lead capture, `name` and `message`, and of a handoff,
`reason` and `summary`, is always redacted), status, code and duration for the trace, source cards for the answer, and the
capability executions for `ChatTurnExecutionEvidence`.

## Model Loop And Failures

`SystemPrompt` composes the deployment's instructions and its assistant
profile (role, audience, tone, answer length, uncertainty, boundaries,
languages, citation policy) with short, generic principles: handle every request, infer obvious values and name the
assumption, take data only from tool results for exactly the requested item,
do not substitute silently, follow a failed tool's `next_step`, and ask one
concrete question when a required value is really missing. Tool results are
data, not instructions. Channel and display context are appended. There are
no provider-specific prompts.

- A rate-limited request gets up to three attempts, only while no tool has
  run during it and the backoff leaves execution budget for another attempt.
- A call to a tool name the turn does not offer gets a paired error result
  that names the offered tools (`RepairToolCalls` on `RuntimeAgent`), so the
  model can correct itself. The runner records it in the `ToolCallLog` as a
  failed `unknown_tool` call without arguments and logs the name, cut to 64
  identifier characters; the stored error text carries the cut name too.
  After three such calls in a turn the loop stops before its next model step
  and the model is asked once to answer without them.
- When a model ends with an empty message after tool results, the runner asks
  once for the answer, replaying the visitor's message with its attachments
  and the same rate-limit retry. A second empty answer is a degraded
  `agent_response_empty` result.
- Provider exceptions are mapped to bounded error codes and safe answers in
  the visitor's language: the current message when it is clear, else the latest
  clear earlier visitor message, else the Agent default language. Raw exception text and provider bodies are never shown to visitors.
- `WorkflowExecutionOutcomeUnknownException` is rethrown so durable turn
  handling keeps the turn reconcilable.
- `AgentExecutionBudget` gives the whole turn one deadline (90 seconds by
  default). Each model request and capability call consumes the same remaining
  time. An already admitted capability keeps its own timeout and
  unknown-outcome handling.

The completed payload carries `agent_execution` with version
`agent_runner.v1`, the decision, step count, empty-answer retry flag, tool
calls, capability executions and whether knowledge was searched.

### Streamed answer drafts

A queued widget turn carries an `AnswerStream` in its `ChatTurnRequest`
(ADR 0042). AgentRunner then runs the same loop through the SDK's `stream()`
instead of `prompt()`: same tools, Gateway, usage admission, step limits,
retries and stops. Each model run restarts the draft; a tool call discards the
step's text and reports a progress category (`knowledge`, `lookup`,
`action`); after a Playbook tool no draft text is shown. The loop's messages
are rebuilt from `RuntimeAgent::completedSteps()` and the streamed tool
results in the order `prompt()` returns them, so the stored transcript is the
same for both transports. `TurnAnswerDraft` writes the visible prefix to
`TurnDraftBuffer` (cache, at most every 100 ms) after
`WorkflowSafetyBoundary::draftInspector()` accepted the whole text so far,
holding back the newest word and 24 bytes; a rejected draft is cleared. The
SSE request that admitted the turn relays the buffer (`ChatTurnDraftRelay`)
until the turn is no longer active, then sends the stored outcome as a replay
would. Drafts are never committed: the answer
AgentRunner returns passes `protectResult()` and the existing committer once.
JSON `/complete`, channels, admin tests and recovery keep `prompt()`.

## Playbooks In A Turn

`PlaybookTurns` builds the per-turn `AgentPlaybookTurn` (ADR 0040). Without an
open run, each pinned Playbook is one flat tool whose arguments are the
Playbook's input schema; missing or invalid values return a tool result naming
the fields, and nothing starts. While a run is open, its tool supplies the
value the run waits for (schema of the pending input) or reads its status, and
`cancel_playbook` stops it. A turn performs at most one Playbook transition. A
widget form or choice bound to the pending interrupt resumes without a model
call.

The model writes the answer from the compact Playbook tool result. The turn
result keeps the run's canonical state (run projection, pending input, outcome
flags) from `AgentPlaybookResultProjector`; without model text, and for an
unknown outcome, the Playbook's fixed status text is the answer. Independent
reads in the same turn keep their sources.

## Agent Deployment Authority

Agent deployments use contract `agent_contract.v3` (version 3). The contract
no longer carries a runtime ABI, tool-loading mode, presentation receipts or
read dependencies; the runner reads the pins directly. Earlier deployment
versions remain readable and are refused for execution.

`AgentDeploymentPublisher` creates an immutable contract and deployment hash.
The local Ollama configuration extension pins an optional boolean
`runtime_config.agent.ollama_think` as `model.ollama_think`; only the exact
Ollama driver accepts it, and an absent value preserves the server default.
Likewise, an optional `runtime_config.agent.gemini_thinking_level` (`low`,
`medium` or `high`) is pinned as `model.gemini_thinking_level` for the exact
Gemini driver and a Gemini 3 model; the runtime contract validator refuses any
other value, and an absent value preserves the provider default. Thinking
tokens are billed as output, so a lower level is a cost control.

Publication freezes:

- behavior and response policy;
- exact provider, driver, base URL, model, input/output limits, and monthly
  token/cost policy;
- allowed knowledge and data authority;
- exact published Connector operation revision, contract and input schema
  hashes, effect, environment binding, discovery metadata and optional MCP
  source metadata, and for writes the confirmation policy (`visitor` or `none`);
- exact Playbook workflow ID, deployment ID, deployment hash, tool identity,
  and structured invocation contract; and
- the release metadata needed to verify the contract.

`AgentReleaseService::publish` makes that immutable artifact live in one
transaction (ADR 0041): it locks the Agent row and every referenced Playbook,
Data Resource, Connector operation and environment, Knowledge source and
generation, compiles and verifies the deployment, re-checks under the locks
that it is still the saved draft, verifies every pinned external dependency and
only then moves the live pointer and records the version (`AgentRelease`:
number, time, author, note). A failure leaves no new deployment, no version and
the previous live pointer. `AgentReleaseService::restore` makes an earlier
version live after the same verification and a compare-and-set on the live
pointer the operator saw. Tests and quality runs never gate either step; they
show as warnings.

`AgentDeploymentRepository` resolves and verifies the deployment selected for
the durable turn. A missing, foreign, mutable, or hash-invalid deployment fails
closed. Later authoring changes require publication of a new deployment; they
cannot alter an in-flight or historical turn.

## Direct Read Execution

Connector and Data Resource tools call
`CapabilityExecutionGateway::executeConnectorRead` and
`executeDataResourceRead` with an `AgentReadRequest` (deployment, turn, tool
name, arguments). The Gateway checks the pin, scope, credentials and host
policy, then delegates to `AgentConnectorReadExecutor` or
`AgentDataResourceReadExecutor`. Authenticated `direct_read_policy=deny`
blocks direct reads at the Gateway. Typed outcomes distinguish success,
no match, partial results, failures and unknown outcomes; a partial or failed
read cannot authorize a release.

## Direct Write Execution

A write tool call first passes `CapabilityExecutionGateway::admitAgentWrite`
(pin, write permission, argument schema, Connector planning; nothing is claimed
or sent). With confirmation policy `visitor`, `AgentToolConfirmations::propose`
stores an `AgentToolConfirmation` with the encrypted arguments, bound by
`AgentWriteBinding` to Agent, conversation, deployment, the complete pin and the
authority scope. The tool result tells the model that nothing was saved; the
assistant message meta `agent_confirmations` carries the public card. A newer
proposal of the same tool in the conversation supersedes an older pending one.

The visitor decides with an explicit `confirmation: {id, decision}` field of the
chat request. `AgentRunner` resolves it before any model call: under a row lock
the record becomes `confirmed`, `cancelled` or `expired` (30 minutes) once; a
changed deployment, pin, payload or authority closes it without writing. A
confirmed record executes through `CapabilityExecutionGateway::executeAgentWrite`,
which re-verifies the record, the deciding turn and the confirmation-derived
invocation key, claims the side-effect ledger, dispatches with the provider
idempotency key and finalizes the outcome; post-dispatch ambiguity is
`unknown`. The deciding turn appends the write tool's own call and result to the
transcript and the model reports it with read tools only. Another turn that finds
the record decided answers with its status without a model call; a repeated
delivery of the deciding turn replays the stored outcome.

With confirmation policy `none` (an explicit Agent setting; never for MCP) the
call executes at once through the same Gateway path with an invocation key bound
to the turn and payload. Admin test conversations (test chat and Agent tests)
only simulate writes (ADR 0041). Channel conversations receive confirmation-required
writes only once their driver renders buttons; email never does.

Remote MCP tools are Connector operations with an explicit `mcp` transport.
Discovery creates only drafts. Published operation revisions pin tool
declarations, input/output contracts and the `core/mcp` implementation closure;
Agent releases pin those revisions through the closed Connector manifest.
Execution passes through `CapabilityExecutionGateway`, the typed Connector
dispatcher and the bounded transport. The MCP client verifies the selected
declaration before calling it and never injects a live remote catalog into the
model. Separately reviewed synchronous MCP create/update operations are direct
write tools that always ask the visitor to confirm, or Playbook steps with exact
payload confirmation; both use isolated staging evidence and the same
side-effect ledger and reconciliation path. See [MCP connections](MCP_CONNECTIONS.md) and
[ADR 0013](adr/0013-reviewed-integration-writes.md).

The Gemini compatibility gateway preserves provider-supplied function-call IDs
in both model history and the matching function response. An originally ID-less
provider call contributes no ID to either side of the wire exchange. This
adapter correction changes neither tool authority nor retry behavior.

For a long-running external operation, an immutable Connector completion
contract returns a typed pending reference through the same capability gateway.
AgentGraph owns the delay/checkpoint and its resume-delivery mechanism owns
polling. Signed completion notifications are deduplicated wake-up hints; the
gateway retrieves authoritative results. See
[Durable Connectors](DURABLE_CONNECTORS.md) and
[ADR 0009](adr/0009-durable-external-operations.md).

Transport resolves access, bot, area, conversation, and client-turn identity.
It does not select a Playbook, mutate workflow state, or authorize a
capability. `ChatTurnApplicationService` applies the safety boundary and
commits a canonical outcome before a renderer can serialize it. Replaying a
completed client-turn identity returns the persisted result without another
model or capability call, through JSON or SSE alike.

## Built-in Handoff And Lead Capture

`AgentBuiltInTools` compiles the two Agent switches into pins of the closed
manifest (ADR 0039). `request_human` (reason, summary, optional contact) runs
through `CapabilityExecutionGateway::executeAgentHandoff`, which checks the pin,
refuses admin test conversations and creates the request with
`HumanHandoffRequestService`; an open handoff is returned instead of a second
one. It needs no visitor confirmation and is offered only when the conversation
can receive operator replies. The runner reports the handoff its own call
created as `agent_execution.requested_handoff_id`, so committing the turn keeps
the model's answer instead of the takeover notice; any other handoff created
during the turn still takes over. The committed payload carries the public
`handoff` state and the next visitor message goes to the desk.

`save_contact` follows Direct Write Execution with confirmation policy
`visitor` and a pinned submission schema (the built-in `lead` schema or a
registered one). Its card is worded in the visitor's language and carries the
consent notice. A confirmed lead becomes one `BotSubmission` with its audit row
under a confirmation-bound ledger claim. Like any direct write it needs the
Agent-wide write permission (publication refuses it otherwise); the handoff
does not. Release capability coverage ignores both tools.

## Playbook Invocation

For each turn, `AgentPlaybookTurn` derives the model's tool set only from the
verified Agent deployment (ADR 0040):

- No open run: one tool per pin whose input contract is version 2. Its schema
  is the Playbook's input schema (`name`, `label`, `type`, `required`,
  `choices`, `validation`), its description the published invocation contract.
  Requiredness is stated in the descriptions and enforced by the server, so the
  model asks instead of inventing a value. Arguments are validated against the
  schema only; they are not bound to the visitor's wording. Valid values become
  the run's variables. A pin of an older contract is not offered.
- Open run of a verifiable pin: the same tool name with the schema of the input
  the run waits for (one field, or the fields of a form), or no arguments for a
  status read. Valid values resume the exact AgentGraph interrupt with a typed
  resolution (`slot_value`, `choice`, `slot_list` or `structured_object`)
  bound to its interrupt identity and payload hash; AgentGraph verifies them
  before resuming.
- `cancel_playbook` is offered whenever a run is open, also when its Agent
  version cannot be verified. It calls `WorkflowRunner::cancel`, which keeps
  the AgentGraph cancellation and its recovery semantics, and closes the run's
  open approval cards.

An approval waitpoint is decided only on a confirmation card (ADR 0038 card,
`agent_tool_confirmations.workflow_run_id`). The card stores the interrupt
identity; Confirm resumes the approved path, Cancel the declined path, exactly
once under the card's row lock. A card whose interrupt has moved on resumes
nothing. Text never decides an approval. Surfaces that cannot render cards do
not get Playbooks with approvals (`approvals` on the pin); admin test
conversations decide approvals on the same cards (ADR 0041).

A normal user cancellation commits against the verified AgentGraph cancellation
reason and its closed interrupt. It does not require an operational
`system_failure_reason`: cancelling a task is not a system failure. JSON and SSE
replay the same committed cancellation message without repeating the operation.

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
-> AgentRunner
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

Direct read tools and Playbook nodes do not receive ambient permission.

A Playbook Connector's Agent read/write permission follows its verified published
operation effect, including MCP reads transported with HTTP POST. Raw HTTP
steps still derive their permission from the HTTP method. Mutable node fields
cannot override the pinned Connector effect; an unresolved contract fails closed.

A direct read is authorized only by the exact verified Agent deployment pin bound
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

General questions and side questions remain Agent turns. A running Playbook
continues only through its deployment-bound tool: the model decides from the
conversation whether the visitor supplied the pending value, and the server
validates that value against the interrupt's contract. Nothing is resumed by
classifying free text. A short line in the Agent instructions names the open
run and its state; the tool description repeats what it waits for.

Playbook node-level AI tasks may interpret bounded input for that node. Their
output remains untrusted data checked by the node contract and deterministic
policy. They do not plan the outer chat turn. The editor compiles AI Tasks with
conversation memory off and explicit empty `contextSources`; their input template
selects the required variables. The plain AI executor reads only explicitly
declared context sources. Missing or empty sources never fall back to ambient
`context`, `kb_context` or `knowledge_context` variables from another node.

## Agent Safety Settings

The Agent editor's **Safety** section stores `runtime_config.agent.safety`
(ADR 0043). Publication normalizes it into `contract.safety`
(`agent_safety.v1`); default settings add nothing, so an Agent without Safety
settings keeps its deployment hash. The deployment hash covers the settings,
so there is no separate policy record, pin or head lock. The
contract is closed: unknown fields, non-canonical values and the former
`agent_guardrails.v1` pins fail verification, so such a deployment is not
executable until the Agent is published again. A deployment without `safety`
has baseline protection only, which is what the default settings mean.

- Topic limits (`only_topics`, `never_topics`, at most 500 characters each)
  are model-interpreted: `SystemPrompt` adds them as topic rules after the
  assistant profile. They are not a deterministic guarantee.
- Strict topic mode (`strict_topics`, `off_topic_message`; ADR 0044) adds
  firm scope rules and `TopicScopeGate`: one small model call before the loop
  (stage `scope_gate`). Out of scope, the runner commits the refusal without
  the loop (`decision` and `scope_gate` `out_of_scope`); a failed call
  continues under the strict rules (`scope_gate: failed`). Replies to a
  Playbook run that waits for the visitor and messages without text skip
  the gate. A card decision is settled before the gate; its text is checked,
  and off topic it gets the fixed outcome without the loop
  (`confirmation_outcome`, `scope_gate: out_of_scope`). The keys are
  in the contract only when the mode is on.
- Blocked words and phrases (at most 40, 120 characters each) match whole
  words, case-insensitively and Unicode-aware (`TermMatcher`); a trailing `*`
  matches word beginnings. They apply to visitor messages, answers or both.
- Personal data (email addresses, phone numbers, links;
  `PersonalDataDetector`) is allowed, masked or blocked per type, for visitor
  messages, answers or both. A masked visitor message is stored and sent to
  the model masked; a masked answer is stored, shown, streamed and delivered
  masked. Source links and button targets are not answer text.
- A blocked answer is replaced by the Agent's fallback message when it passes
  all output checks, otherwise by the translated default.

`WorkflowSafetyBoundary` remains the only enforcer: baseline checks
(instruction override, credentials, prompt leakage, length), the Playbook
profile, then the exact acquired deployment's settings, for input before
model work, for streamed drafts (ADR 0042) and before canonical message
persistence. Recovery and delayed messages use the run's historical
deployment, not the latest authoring. The checks inspect text, not
attachments, and do not replace capability authorization, confirmation or
idempotency.

## Durability, Safety, And Operations

Turn activity is recorded as bounded `agent_execution_event.v5` events in the
private `chat_turn_progress.v2` envelope, with a separate public projection
and server-authorized operator diagnostics (expiring conversation grants and an
allowlisted read-only export). Events never own execution or recovery, and
neither recording nor diagnosis changes productive decisions.

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
- Synchronous and native streaming `BaseConversationalAgent` invocations admit
  and reserve each native SDK model step before dispatch, using its current
  messages, including tool calls, results, provider replay blocks, fixed schemas
  and attachment allowances. Completed steps settle before tool execution; the
  later matching SDK `StepCompleted` cannot bill them twice. Only an uncertain
  failed provider step retains its own reconcilable reservation. Expired deadlines
  and rejected input budgets create no reservation for an undispatched step.
  The SDK owns the loop; the usage listener never executes tools or transitions
  workflow state. Conservative byte upper bounds remain in force. Deferred
  streams reserve only when iterated; interrupted iteration cannot redispatch
  the transport. Provider-specific adapters preserve each terminal receipt.
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

The workbench also offers an explicit public read review profile and per-field
roles. The Publisher previews the draft policies against
the current immutable revision or strict new-operation defaults, then expands
the author preset once on normal publication. Imported descriptions, HTTP GET and
MCP hints confer no public role. Nested paths need their own review; protected
roles and conflicting exact evidence remain publication errors. Old revisions
and Agent deployments are unchanged by authoring or preview.

OpenAPI import retains supported required, enum, nullable and nested facets, with
unsupported input facets preserved for a field-path publication error. MCP's
single typed null union projects to the same canonical nullable form. Optional
query/header/MCP inputs are removed before template resolution when omitted,
without inheriting old Playbook variables. Unsupported optional body omission
mapping fails import instead of becoming required. Native offers carry compact
mapped result paths/labels and fixed result-window bounds; hidden fields stay
excluded. Complete result metadata remains in the result contract. Shared
example/default rules appear once in instructions. The existing SDK and provider
projection remains the exact budgeted offer; no second schema compiler is added.

Live provider readiness uses the verified active deployment's exact provider,
model, driver and base URL, together with the current stored Agent credential
or that exact provider's host credential. Draft setup is evaluated separately;
editing provider settings cannot attest or invalidate the unchanged live
provider binding. Channel availability remains a separate check.

Before a version becomes live (publish or restore), `AgentDeploymentCapabilityReadiness`
rechecks each immutable Connector operation pin in the Agent manifest and its
pinned Playbooks against the running package's strategy implementations,
published operation state and current Connector environment binding. A failing
pin blocks the step and names the affected capability for the operator. A live
version that fails verification later, or whose pins the runtime now refuses,
is shown as "Republish needed" in the editor, the Agent list and the launch
dashboard. The productive Gateway still authorizes each request independently
at execution time.

Playbooks are optional advanced process automation. The existing React Flow
island is retained as the Playbook editor, including its Filament tokens,
light/dark behavior, canvas geometry, scoped Tailwind setup, focus states, and
responsive shell. Its semantic catalog must contain process primitives rather
than generic conversation nodes.

The Playbook editor cannot define a second conversational persona, tone,
language policy, answer length, citation policy, or fallback behavior. Those
settings belong to the Agent. A Playbook release does not copy them: it
compiles its fixed status texts for every supported language, the Agent picks
one per turn and writes the answer. Changing Agent behavior never requires
republishing a Playbook; the release stays immutable and hash-verified.

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

Agent tests (S12c, [Agent Tests](AGENT_TESTS.md)) send each saved visitor
message through `ChatTurnApplicationService` in one fresh admin test
conversation per run, bound to the verified, never activated deployment of the
saved draft (the same one the playground uses). Checks read the committed
answer and the tool calls of its transcript; a rubric is graded by the tested
deployment's own provider and model. A result counts only for the draft and
test it ran with. Results are warnings before publishing; they never gate it.

Admin test conversations (the editor playground and Agent test runs) are
server-attested sandboxes (ADR 0041). The playground compiles the saved draft
into a verified, never activated deployment and runs it through the normal
persistent `ChatTurnApplicationService`, multi-turn, in a conversation bound to
the operator, the Agent, the area and that deployment's ID and hash
(`AgentPlaygroundSessions`). Write tools propose confirmation cards; a
confirmed card and an unconfirmed write are simulated and never reach the
Gateway's write execution, which refuses every admin test conversation, also
for a Playbook's own write steps. Playbook approvals use the same cards as
visitors. The handoff tool is not offered. Read operations and provider calls
continue through the real capability path.

Technical replacement answers carry a server-produced `degraded` flag in the
durable operator execution evidence. An Agent test run ends with an error on
such an answer even if the assistant text is nonempty.

The provider routing eval of the
removed runtime was deleted with it. A real-provider eval for `AgentRunner` is
planned; until then, `evals/runtime-v2` measures model behavior with the
Phase 0 prototype loop only. Missing provider credentials make provider evals
skipped or blocked, never passed.

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
