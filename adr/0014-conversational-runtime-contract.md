# ADR 0014: Source-bound conversation requests and evidence-backed answers

- Status: Accepted; implemented. See the
  [verification record](../archive/CONVERSATIONAL_RUNTIME_VERIFICATION.md) for passing
  software checks and failed local-model candidate acceptance.
- Date: 2026-09-08
- Scope: Conversation projection, direct read inputs and dependencies, retrieval,
  model feedback and answer composition
- Extends ADRs 0008 through 0013. Replaces their direct-read literal-only,
  independent-read-only and mandatory display-of-every-read restrictions where
  the explicit contracts below apply.

## Decision

`AgentTurnLoop` remains the conversation owner, Laravel AI remains the native
model/tool loop, AgentGraph owns Playbook transitions, and
`CapabilityExecutionGateway` owns external execution. There is no second
planner, scheduler or alternate runtime.

The native Agent submits a compact request inventory through a local tool before
using capabilities. Exact visitor spans bind each proposed request to a source;
uncovered text receives correction feedback. Requests can continue, correct or
add to the committed conversation state. Existing source-bound Connector tasks,
their admitted inputs, unresolved conditions and offered candidates form part
of the same conversation projection. Missing fields in a proposal do not erase
open tasks or conditions. Actual execution evidence and committed answer
contributions determine completion. The model cannot declare a task executed.

Identical new read proposals in one inventory share one request so their
results enter the same whole-request review. This normalization preserves the
complete source span and every validation; it never merges different goals,
tool assignments, historical requests, continuations or Playbook proposals.

Planned reads reuse the already verified quote of their current request when a
second quote is omitted. A supplied quote must still match the current visitor
span. Stale plans, unrelated requests, prohibited reads and unsupported input
values remain inadmissible; this reuse introduces no new authority.

A mistaken initial purpose or tool assignment can be repaired within the same
native loop before admitted work. Repairs retain the source span and request ID,
advance its revision, use only pinned tools and share a three-repair limit.
Known pre-execution input and routing rejections remain repairable. Historical
requests, accepted tasks, evidence and dispatched work cannot be reassigned.

This makes omitted text and unresolved requests observable. It does not prove
that the model understood every meaning in a sentence. Semantic request
coverage and answer usefulness require separate conversation evaluation.

Inputs have explicit provenance: visitor text, a published default, a published
normalization, or a permitted verified read-result reference. A normalized value
must follow the pinned rule. Relative periods use the attested turn timestamp,
published timezone and precise calendar boundaries. A model-proposed date,
status, Boolean or identifier does not establish its own source.

Read dependencies require a published source capability, result path, target
field, scalar type and entity domain. They are confined to successful, complete,
redacted evidence in the current turn and the same immutable deployment and
authority scope. A list must have exactly one eligible entity; selecting its
first element is not identity proof. Data `first` queries cannot establish
uniqueness for a dependent read. Result
text supplies values only. It cannot add tools, change scope, grant a write,
confirm an action or populate a Playbook argument. Cycles and repeated completed
reads remain bounded. Pagination uses a server-bound receipt for the exact
query, scope and deployment, rather than accepting an arbitrary backend cursor.

Knowledge retrieval permits a small number of distinct purpose-bound searches,
including a correction after a genuine empty result. Provider failure and
unavailable indexes are not empty results. Candidate collection precedes the
optional reranker; final top-k and sufficient-evidence checks follow ranking.
Score thresholds are not lowered to make a test pass. Citations stay unique
across searches, and all attempts share the existing turn budget.

Normal source-backed answers contain request-linked claims and open items.
Source references are checked against accepted delivered evidence; intermediate
reads remain provenance without requiring their separate display. Exact source
statements and bounded typed derivations are checked deterministically. Natural
wording and complete request coverage receive one bounded tool-free semantic
review using the same deployed model and remaining execution budget. A true
individual fact does not complete a request with an unanswered second part.
The review receives the complete original and current visitor spans separately
from the model's goal summary. Partial page records may support individual facts,
but cannot establish full collection totals or a unique dependent-read identity.
An intact Data Resource page can complete an explicitly requested bounded page
when semantic coverage checks the actual query scope and continuation status.
The collection remains incomplete. The rendered answer states its page boundary,
and routing evidence credits only the particular page referenced by displayed,
verified claims for an answered, nonpending request. Published numeric units are
retained when natural wording omits them.
The semantic review, visible fact text and committed claim hash use the same
deterministic text including those units and required context. The original model
assertion remains unchanged for exact-value and arithmetic checks. Adding a known
unit does not replace a wrong unit, value or assertion in that original text.
Published labels use the answer language and the existing label fallback;
the runtime does not invent translations of source facts.
The review returns an explicit verdict for every supplied claim and distinct
request. Native-schema and prompt-only providers use the same exact contract.
Missing, foreign, duplicate or mistyped verdict keys invalidate the entire review;
negative verdicts never grant support or completion. Decisions remain bound to
the hash of the complete reviewed claims, support and visitor requests.
Its result is a model assessment, not deterministic proof of entailment. Review failure keeps
actual source facts and an explicit open point. Write and Playbook status always
comes from canonical execution state. The previous value-selection renderer
remains a bounded evidence fallback and historical presentation mechanism.

The tool-result projection distinguishes an invalid proposal, missing visitor
input, policy denial, accepted read, failed read and uncertain external effect.
Concrete field feedback returns to the same native loop. No catch-all exception
handler converts graph interrupts or uncertain writes into model retries.
Accepted call/result pairs are processed before another model answer. Canonical
outcomes and private provenance are committed before JSON or SSE rendering.

For providers supporting a native answer schema, source claims and their one
tool-free semantic review use that schema. The Ollama adapter leaves productive
tool steps unconstrained because its answer grammar suppresses tool calls. An
early tool-free stop consumes one remaining SDK step for the schema-constrained
answer; the last allowed step already has that role. This uses the same native
loop and budget, preserves actual call/result history and usage, and cannot
dispatch a tool from the formatting step. Unverified draft text is not streamed
as the final answer. Length limits, errors and cancellation do not earn a retry.

Native Ollama admission and dispatch use the same effective step projection.
After an accepted request inventory, complete schemas are limited to its open
requests; other pinned tools remain visible by name and published purpose for
bounded routing repair. A repaired assignment exposes its schema on the next
native step. Clarification, cancellation and Playbook continuation controls keep
their existing availability. The complete deployment manifest and execution
authorizers remain authoritative. No text-based router or new tool authority is
introduced. The budget includes actual message text, tool schemas, native answer
format and its schema instructions; validated attachments retain separate costs.

## 2026-09-09 refinement: source rendering and mechanical continuation

Implemented in the review candidate described in
[the repair handoff](../archive/RUNTIME_REPAIR_HANDOFF.md); post-change live acceptance
is outstanding. This explicitly refines the answer and proposal contracts above.

For structured tool results, a nonliteral `source_statement` selects admitted
fields. The runtime renders their actual values, published labels, units and
each field's own entity context before semantic review and claim hashing. The
model's unreferenced adjectives are not rendered as source facts. Original
proposals still undergo the existing numeric contradiction and support checks.
Knowledge-only source statements retain semantic entailment review. Supported
`interpretation` claims have a visible localized interpretation label; that
label is included in the reviewed and hashed text. Interpretations remain model
assessments and cannot alone complete an external read request.

Canonical displayed `source_statement` or `derived` claims determine per-read
`source_answered` evidence for answered, nonpending requests. A global answer
decision, an interpretation, a foreign evidence reference or a supplied coverage
flag cannot attest a read. Page coverage uses the same source requirement.
Historical receipts are read without inventing new source attestations.

An exact continuation ID may supply unchanged canonical goal and available tool
assignments when those fields are omitted. New requests still require both.
An omitted `__request_id` may bind only one eligible recorded request; an
explicit invalid ID is rejected before dispatch. These are mechanical defaults,
not semantic inference, new authority or reassignment of historical work.

Connector input questions have one presentation owner. A final open-item
question may word exactly one pending input belonging to the uniquely matched
canonical Connector task and request. It cannot create a pending task, replace
state authority or duplicate the canonical input prompt.

The affected Gemini adapter may request a native tool proposal on the existing
single empty-response recovery step after a newly accepted, unstarted inventory.
Waiting inputs, historical work, completed executions and the tool-free final
answer step remain exempt. No extra retry or execution budget is introduced.
Remove this bounded provider adaptation when the upstream empty-stop behavior
is resolved and equivalent native continuation is verified.

## Basis and independent challenge

The 2026-09-08 source research compared pinned implementations of Pydantic AI,
OpenCode, Codex CLI, OpenAI Agents SDK, LangChain/Deep Agents/LangGraph and Goose.
It confirms that Laravel AI already supplies native iteration and unknown-tool
repair. Its isolated regex probes and older dialogue observations are
characterization, not current integration or model-quality evidence.

The adopted patterns are call-specific validation feedback, complete tool
lifecycle, compact context projected from canonical state, and separate safety
and conversation-quality acceptance. Coding-agent shell policies and generic
timeout retries are not imported. The independent design challenge additionally
requires ambiguity, source injection, stale scope, mixed currencies, incomplete
collections and false claims with valid citations as negative cases.

## Finite implementation and acceptance

1. Characterize existing state, continuation, input and evidence boundaries.
2. Implement the shared request projection and native proposal feedback.
3. Add published input normalization, verified read dependencies and pagination.
4. Add bounded retrieval correction and ranking before final selection.
5. Replace normal value picking with request-linked answer claims and open items.
6. Run targeted deterministic conversations, one runtime integration gate and
   the isolated external-host widget/runtime path. Record model quality,
   software defects and omitted checks separately.
7. Review the final diff independently, update upgrade/architecture contracts
   and integrate only task-owned verified commits into Main. No push or public
   release forms part of this decision.

Acceptance includes Florida/weather plus database scope and its short follow-up;
correction plus a side question; ambiguous customers; last-month invoices plus
handbook knowledge; empty retrieval followed by a refined query; bad tool name
and argument repair; wrong result identity; source-instruction injection; partial
and failed reads; unsupported totals; valid citations with false claims; and
unchanged confirmation, payload binding, idempotency and unknown-write recovery.

New optional contracts require republishing affected capabilities and Agents.
Existing canonical conversations remain historical records; new provenance is
never backfilled from generated text. Private state migrations and concrete
compatibility limits are recorded in UPGRADING.md with the implementation.
