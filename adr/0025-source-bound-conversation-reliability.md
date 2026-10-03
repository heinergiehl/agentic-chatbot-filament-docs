# ADR 0025: Source-bound continuity and bounded native completion repair

Status: **Accepted target design for reliability slices S2–S8. S1 implements
only characterization tests and this contract. S2 implements alias/literal and
published Gateway resolver offers with delivery binding; S3 implements bound
continuity/status. S4a implements stream quarantine and persistent formatting
closure. S4b implements bounded native assessment/repair and finalizer reuse;
S5–S8 remain pending.**
Date: 2026-09-20.

Implemented supersession: [ADR 0026](0026-settled-native-review-and-local-non-dispatch.md)
replaces the rule below that keeps a complete productive step's financial
reservation open during a nested answer review. It also updates the treatment
of stream abandonment after that step's complete usage has been persisted.

## Decision and evidence

Extend the existing input, evidence, native-step and diagnostic boundaries.
Preserve [ADR 0008](0008-agent-first-playbook-cutover.md),
[ADR 0009](0009-durable-external-operations.md),
[ADR 0020](0020-native-read-interactions.md),
[ADR 0021](0021-natural-dialogue-and-context-accounting.md),
[ADR 0022](0022-coherent-connector-continuations.md) and
[ADR 0024](0024-portable-deployment-tool-loading.md).
AgentTurnLoop remains the conversation owner; AgentGraph owns Playbook
transitions; CapabilityExecutionGateway authorizes productive capabilities.
Closed immutable manifests, transitive pins, exact scope/source/revision binding,
write confirmation, idempotency, redaction and unknown-outcome reconciliation
are unchanged. A review is advice about a draft, never authority to execute.

This decision deliberately supersedes **only the terminal-only assessment and
prohibition on bounded pre-stop feedback/review reuse** in
[ADR 0023](0023-native-answer-completion-review.md). Its native technical
recovery, tools-closed formatting, exact fact fallback, language policy and
other safety contracts remain. S4 removes the redundant terminal review call
for candidates already assessed at the native boundary. S1 does not claim that
this migration has happened. ADR 0022's pre-dispatch semantic verifier stays:
neither a complete schema nor post-answer coverage proves that every condition
in free text was understood before a read.

The observed Bulbasaur/weather dialogue omitted weather, failed to establish a
usable offer, encountered a result-identity rejection and later asserted a
retrieval without successful weather evidence or current calls. The actual
rejected provider name was not retained. New York/Manhattan response variants
are synthetic test data, not a reconstruction of that provider response.
See the [implementation plan](../archive/plans/2026-09-20-conversation-runtime-reliability.md).
No general planner, model-authored request inventory or new durable conversation
state machine is introduced.

## 1. Operative offers (S2)

An operative question proposes a value for one existing open Connector field.
Plain informational questions require no tool. A value is eligible only under
the pinned field's source, normalization, sensitivity and resolver policy.
Extend `AgentConnectorInputOffer` with a closed versioned source union:

| Source kind | Required proof before offering or accepting |
| --- | --- |
| `published_alias` | Exact target in the immutable field alias map; pin and normalization-policy hashes. |
| `user_literal` | Canonical visitor message ID and content hash, exact quoted span, source turn, field policy and its declared normalized value. Only the current message or a freshly reverified retained source of this selected pending is eligible. |
| `verified_resolver` | Successful Gateway/read-dependency or versioned entity-resolver attestation; exact source operation/resolver pin, revision/hash, scope, source inputs, result identity and public selected field pointer. A unique candidate or explicitly selected member of an attested bounded candidate set, never arbitrary assistant prose or model coordinates. |

Confirmation of a display label does not authorize an opaque resolver target.
Target derivation still crosses the published resolver/read-dependency contract.
S2 must admit resolver sources only where that exact contract already exists;
S5 supplies the weather integration. Missing resolver authority fails closed.
A new user literal must not silently erase a retained region/country. New York
City alongside Florida remains a conflict until a source-bound correction
settles it. Semantic interpretation proposes that correction; the existing
context verifier and deterministic binder validate it.

The new private offer envelope is `connector_input_offer.v2`. It retains the
existing bounded value/question and adds `source`, `pending_revision`,
`deployment_hash`, `scope_fingerprint` and `expires_at`. Its ID binds those
fields, task/capability/field, issue fingerprint and originating turn. Keep the
160-byte public scalar value limit and the existing question/field bounds.
Do not turn an oversized value into a different candidate by truncation.

Creation is not delivery. The existing canonical outcome commit seals the offer
only when the exact full question survives rendering in the actual assistant
message. Seal assistant message/turn ID, content hash, offer ID and the exact
post-commit task revision exposed for the next turn. This must be atomic with
the context checkpoint. Re-rendering or reading a receipt cannot renew delivery
or expiry. Use the existing Connector-context TTL, bounded to 1–1440 minutes
(default 30), additionally capped by any source expiry. Persist that deadline;
later config changes cannot extend an existing offer.

The native model selects `__pending: {id, revision, action}` plus
`__input_confirmation: {offer_id}`. The adapter supplies the whole attested
current reply. Admission and Gateway recheck the live task revision, exact
committed delivery, source/pin/scope, expiry and candidate. A reply changing
city/country goes through normal revision/source admission. A new independent
request must not consume an offer. Two pending tasks require exact selection.
“ja”, “ja genau so” or a typo are semantic proposals, never a generic yes regex
or automatic consent. Scripted tests must exercise this downstream binding,
including stale, undelivered, expired and cross-scope rejection.
Offers authorize read inputs only; Graph waits and write approval remain separate.

### Implemented S2 resolver receipt boundary

`AgentConnectorResolverOffers` reads the existing encrypted
`ChatTurnPresentationReceipts` in the offer's own turn. It adds no receipt table,
history scanner, task owner or resolver execution. Source authority requires an
explicit published `authority.read_dependencies[].offer` policy with integer
`max_candidates` (1–12) and `max_age_seconds` (1–86400). Links without that policy
retain their invocation-local meaning. The source and target must be pinned
Connector reads; the source must have required result identity, and the target
must accept a public literal string. The published source pointer declares the
public value to confirm, never a label-to-private-target mapping.

The selected value must occur exactly once in the complete redacted result.
For bounded collections the link's single `/0/` segment enumerates candidates
only for this offer projection; the existing automatic read dependency still
requires uniqueness. Nested collections, duplicate values, oversized values,
hidden fields, partial results and more than the published maximum fail closed.
The model proposes a member's exact public value and the reviewed question must
contain that value. No member's other fields become input authority.

The private offer source references the exact source turn, evidence identity,
selected concrete field pointer, source pin hash, full link hash, execution hash
and source expiry. The canonical evidence identity binds original requested,
display and grounded inputs with the result. Exactly one matching successful
Gateway execution and the original visitor-message hash must remain available.
Bot, conversation, deployment and freshly attested actor/tenant/token/area scope
must match. Age starts at the source turn's receipt time, conservatively before
execution; the offer deadline is additionally capped by pending/context age.
Creation uses the current persisted checkpoint; acceptance requires that source
turn's committed context and the separately sealed exact question/revision.
Admission and Gateway independently reload and compare this proof. Reads,
redisplay and confirmation never execute or refresh the resolver.

This is the smallest implemented attestation extension: a published offer
projection over already durable execution/evidence receipts. Presentation
receipts alone still grant no execution permission, and historical fact/status
projections cannot be converted into offers. Invocation-local
`CapabilityEntityResolution` labels and resolver behavior hashes remain
insufficient. S5 may use this public-value path and the existing separate pinned
read-dependency path for opaque targets; it must not infer coordinates from a
confirmed label. No extra ABI/profile is added to the unreleased v9 cutover.

### S5 canonical target binding

The new explicit `read_dependencies[].canonical` policy makes a required
Connector input depend exclusively on fresh, successful, identity-verified
Gateway evidence. Both endpoints require result identity; the target exactly
checks its sole required schema input, with one published source binding.
Composite targets and any additional target schema inputs fail publication,
including optional literals or ordinary dependencies. The scalar response
verifier cannot prove a coordinate or customer/site tuple; a shared source
receipt does not resolve that limitation. The existing compiler and runtime
validator enforce the closed
transitive manifest. The turn ledger rechecks source, deployment, active turn
and scope; freshness begins at the original persisted turn receipt time.

The Adapter preserves only Gateway identity booleans alongside its canonical
execution receipt. Literal values, retained inputs and S2 label confirmation
cannot replace canonical proofs. Empty candidates, multiple candidates,
provider failure and result identity failure remain distinct. A verified
canonical target's identity/not-found failure cannot create a new internal-ID
confirmation. Source query/context conflicts still use existing current-source
and revision-bound clarification. No geographic alias or fuzzy matching rule
is added to the runtime. The deterministic provider example and limits are in
the [S5 result](../archive/plans/runtime-reliability/S5-result.md); a real provider must
establish the query/candidate/target relationship in its published contract.

## 2. Typed cross-turn execution context (S3)

Extend `AgentRecentReadContext` and the existing invocation/historical evidence
readers. Canonical encrypted receipts are the source, not assistant prose and
not mutable provider history. Project `agent_execution_context.v1` entries:

`source_turn_id`, `source_message_id`, `capability_key`, `deployment_hash`,
`invocation_id` (when genuinely recorded), `call_id` (only if recorded),
`status`, allowlisted `reason_code`, public grounded input summary,
`evidence_id` (when verified), `finished_at` and `source_class`.

An execution entry pairs a real invocation/call with its canonical outcome.
If a legacy receipt lacks a call ID, retain an explicitly typed receipt summary
with its real receipt identity; never invent a provider call/result pair.
Technical rejected attempts without admitted execution remain a separate type
with `execution: not_started`. Absence of evidence is not a successful empty
result. Successful, failed, blocked, unknown and cancelled outcomes stay distinct.

Retain the recent-read baseline bounds: at most 12 previous turns within
30 minutes, at most 3 considered reads, 4,800 JSON bytes and 6,000 prompt bytes.
Oversized/ineligible recent entries do not cause unlimited scanning for older
successes. All scopes must match freshly: bot, conversation, exact deployment
ID/hash, tenant, actor/token and area via the current scope fingerprint. Require
canonical committed message hashes, completion before the current turn, valid
source receipts and any shorter source/published freshness bound. Unknown,
stale, cross-scope or unverifiable data grants no factual/source authority.

Keep public execution status separate from historical factual payload. The
existing `AgentHistoricalEvidence` admission controls previously displayed facts
(3 source turns, 6 groups, 12 records, 12,288 bytes), their original presentation
proofs and required field context. Those limits are not new permission to put
all payloads into ordinary history. Default context entries contain no raw
provider arguments/results, credentials, private fields or unsupported values.
Historical success attests a past execution, never a fresh weather observation.

Projection is pure and read-only. Use a stable wrapper boundary per turn snapshot
as `AgentConversationState` already does; repeated request admission and dispatch
must serialize identical bytes. Fresh pending state is projected per native
step. Preserve the original current request, newest correction, selected pending
sources/conditions and active offer before dropping older redundant memory.
If mandatory context cannot fit, fail normal token admission instead of silently
dropping a constraint. Remove replaced duplicate summaries from
`BaseConversationalAgent`/`ChatSessionMemoryService`; do not restore completed
invocations as tasks or reexecute reads from projected history.

## 3. No-current-call status and prose (S3)

`DeployedAgent::needsStructuredConversationAnswer()` currently keys off current
invocations. S1 proves that a false retrieval statement can pass the finalizer
without coverage when there are none. Zero current calls must cease to mean
“no evidence contract”. Use current receipts, an active offer/pending,
technical attempts, verified recent execution context or selected historical
evidence to establish an evidence-bearing turn, even without a current call.
Greetings with none of that context retain the cheap ordinary conversation path.

Extend the existing claim union with a typed `execution_status` selection,
referring only to a server-offered current or historical receipt and its exact
operation/invocation identity. The model supplies neither a status value nor
status prose in that claim. Runtime rendering derives status, time and public
operation label from the receipt, clearly qualifying historical executions.
`not_started`, pending, failed and unknown can never render successful retrieval.
No success receipt means no successful status selection. A success receipt
without valid public result evidence may attest execution but supplies no
weather facts. Historical result facts still require historical admission.

Free semantic source/status wording in other claims must pass the same bounded
evidence review with these receipts as support. Invalid/unavailable review
falls back to supported facts, a committed question or an accurate no-verified-
result statement. Do not expand a keyword blacklist. Do not classify every
plain sentence as proven merely because it fits JSON. Completely overlooked
requests with no evidence-bearing context and arbitrary ordinary free prose
remain an empirical semantic limit. Detecting all such meanings would require
reviewing all conversation or eliminating free prose. This design deliberately
retains cheap ordinary conversation as a quality/cost trade-off; it is not a
limit on the user's authorization. S3 must reject/safely render the known false-success replay
with its actual failed/pending history and report this residual limit explicitly.

## 4. Actual SDK seam and one productive repair (S4)

Inspected installation: `laravel/ai` **v0.11.2**, reference
`ee2c5162838d440c4e2e629ea93c8c87e838eaed`; package constraint `^0.11.2`.
These are local source findings, not a claim about a future SDK release.

| Existing symbol | Verified lifecycle and required use |
| --- | --- |
| `Laravel\Ai\Contracts\Gateway\StepTextGateway` | Real `generateTextStep` and `generateStreamStep` return a `StepResponse` to the loop. |
| `Laravel\Ai\Gateway\TextGenerationLoop::{generate,stream}` | Calls the gateway, reports `RunContext::stepCompleted`, handles tools/approvals, appends assistant/tool history, then breaks when no tool results exist and the reason is not `Continue`. Approvals terminate first. The original `for` loop still enforces `maxSteps`. |
| `UsesFinalAgentAnswerStep::{generateTextStep,generateStreamStep,finalAgentStepResponse}` | Existing package adapter intercepts the actual response before that break. Empty/format recovery already clones `StepResponse` and sets `FinishReason::Continue`. Extend this seam; do not replace the loop. |
| `AgentStepRequestProjection::forStep` | Shared effective instructions/messages/tools/schema/options for dispatch and admission. Add immutable bounded repair guidance here, never as a fake visitor or tool message. |
| `BaseConversationalAgent::{trackModelStepUsage,nativeStepRecovery,requestNativeStepRecovery,forgetNativeRecovery}` | Existing invocation-local slots and original SDK options bound at `StartingStep`; actual attempts survive provider-local step-number resets. Extend this lifecycle, not provider tokens. `TextGenerationOptions::forStep` can clone options, so object identity alone is not invocation identity. |
| `NativeUsageGatewayFactory`, `GeminiUsageGateway` | Existing composition edges install the step adapter. Inject review preparation/snapshot dependencies here or through the deployed agent, not container lookup inside domain review policy. |
| `AgentEvidenceAnswer::prepareReview`, `AgentAnswerReviewCandidate`, `AgentAnswerReviewPayload`, `AgentAnswerFinalizer` | Reuse pure candidate preparation and the existing verifier. Finalization consumes a matching assessment or renders safely; it must not automatically run that same review again. |

No new upstream dependency or vendor patch is required for synchronous and direct
native streaming continuation. There is no SDK “before stop” event with semantic
repair behavior to subscribe to. The smallest adapter change is in the existing
gateway trait, invoking one package policy at response return. The installed
SDK still rejects high-level structured-agent `stream()`. Direct native stream
seam tests do not certify that unsupported combination.

### Candidate and assessment binding

Before converting a normal Stop, snapshot the existing live invocation state,
delivered evidence, execution trace, pending revisions, historical/status
projection and technical rejections through a pure response builder. Do not
call `AgentTurnLoop` again, finalize/commit a message, or restore an old task.
Review the exact draft against the original request and selected retained
sources, including the unfinished weather question alongside a completed sibling.
Separate-format providers need a bounded review input for an unstructured draft
**before** technical formatting closes tools. Treat that text as untrusted
draft, not source evidence. A coverage verdict for it cannot authorize later
formatted prose.

Bind the transient assessment to `(turn, native invocation, deployment hash,
scope fingerprint, draft SHA-256, review-input SHA-256, evidence/status snapshot
hash, pending/offer revision digest, response language)`. Reuse the existing
48,000-byte/24-claim review payload ceiling and existing verifier output/time
limits under the shared turn deadline. Keep these extra hashes in the review
payload as well as the invocation-local receipt. Changed text, sources, statuses,
pending revision, scope or language invalidates the assessment. A reused
assessment cannot turn a rendered supplement into newly reviewed complete prose.

### Eligibility and bound

1. Consider only a normal `FinishReason::Stop` with no tool calls, pending
   approvals or genuine provider continuation token; not an effective final
   step or tools-closed formatting step. No correction after cancellation,
   approval wait, hard provider failure, length/unknown finish or uncertain
   external outcome. Unrelated Graph waits stay intact; permitted independent
   reads still follow the existing manifest and Gateway contracts.
2. Trigger review for evidence-bearing drafts defined above, including omissions
   with a successful sibling. Validated partial/unsupported wording may yield
   at most 8 actionable, source-bound omission/claim diagnostics; at most 2,048
   feedback bytes. Empty drafts or malformed JSON envelopes use the existing
   technical recovery/fallback, not an invented successful semantic verdict.
   Ordinary prose from a productive separate-format step is eligible as an
   untrusted review draft before formatting, even though it is not final JSON.
3. Grant **at most one productive semantic correction per native invocation**.
   Require at least a nonfinal productive step and the final answer step within
   the original remaining ceiling, plus ordinary deadline/token/financial
   admission. Feedback identifies the omission or unsupported claim and bound
   source span; it supplies no new values, capability choice, forced tool,
   narrowed manifest or execution permission. Set `Continue` on a clone;
   preserve usage, raw response, text, provider replay blocks and token unchanged.
4. The next step can propose a legitimate read or create a source-bound pending
   clarification. Both use normal admission. The completed sibling remains
   available from its receipt; no replay is scheduled. Existing same-invocation
   call/argument identity and Gateway idempotency protect execution; new call
   IDs cannot be treated as permission to replay writes or unknown outcomes.
5. At most two semantic assessments per invocation: the original eligible draft
   and, if changed, its final replacement. No automatic second correction. A
   repeated identical draft reuses its negative verdict without another call.
   A changed draft invalidates the old verdict; if no review allowance remains,
   render facts/questions/status safely. Formatting may consume another native
   step but never grants another semantic allowance or reopens tools. Reserve
   the replacement assessment for the final formatted candidate where needed;
   an intermediate coverage verdict alone cannot certify its prose.
6. Review unavailable, no budget, ignored feedback, second Stop or unchanged
   feedback ends with supported facts plus accurate open/failure status. A
   failed review never authorizes the draft or fabricates a pending question.
   `AgentAnswerFinalizer` remains the deterministic evidence/presentation boundary.
   If there was no usable pre-stop seam (e.g. tools-closed final formatting),
   one eligible assessment may occur there within the same allowance, never
   a second review of the same candidate or a productive restart.

Keep semantic allowance separate from existing one-empty technical recovery;
both consume the same hard native ceiling. Failover must not reset semantic
credit, review count or a previously closed tool phase. Review model calls use
the existing tool-free reviewer with its own usage receipts and the same turn
budget, not another productive agent. The enclosing productive step emits its
`StepCompleted` only after the gateway returns: its financial reservation may
still be outstanding during review. Account conservatively; never pre-settle it
or bill it again to manufacture reviewer capacity. A failure must still settle
or reconcile every dispatched model attempt.

For native streams, buffer bounded candidate text until the verdict/continuation
decision. The current ordinary path emits nonempty draft deltas before the Stop
response arrives, so merely changing the finish reason would leak discarded
prose. Preserve event identities and actual usage; release only selected final
text, never a concatenation of rejected and repaired drafts. Do not buffer raw
private tool outputs or hidden reasoning. Keep nontext lifecycle events and
opaque provider history intact. Oversized drafts go to bounded safe fallback,
not unbounded buffering. The high-level durable widget path still persists
canonical output before JSON/SSE delivery.

### Implemented S4b assessment lifetime

`AgentNativeAnswerReview` is created from the real `StartingStep.invocationId`.
The complete pure response closure includes current evidence, observations,
knowledge, Playbook presentation, pending/cancellation data and frozen history.
`AgentToolRejections` projects the same bounded native results before Stop and
at terminal completion. Retained pending visitor sources are reread with their
canonical message hashes; private offer proofs never enter the review prompt.

`answer_review.v5` carries the complete binding tuple. Its review-input hash
identifies the unbound claims/context; the receipt/coverage hash then covers
that input plus the binding, avoiding a self-referential digest. Language,
wording, receipts, revisions and presentation limits invalidate reuse. The
invocation stores at most two distinct candidate attempts, including unavailable
or invalid reviews; identical candidates reuse even a negative result. A separate
untrusted draft gets coverage review, with the remaining assessment reserved for
formatted output. Malformed or oversized envelopes use technical recovery/fallback.

The response carries its invocation object beyond `prompt()` cleanup. Finalization
uses its remaining allowance and exactly matching receipt, without a terminal
reviewer restart. Non-native model adapters lacking a pre-stop seam use the same
assessment policy for their terminal first review. No cache or receipt grants
cross-turn authority. Canonical outcome replay remains inference-free.

`agent_tool_projection.v7` adds at most eight diagnoses/2,048 JSON bytes with a
stable untrusted wrapper to the identical admission/dispatch instructions. One
semantic correction requires two remaining native steps. Empty recovery has its
own credit; all phases share the original ceiling, deadline and normal usage
admission. Provider handles, approvals, hard/unknown failures, cancellation and
closed formatting cannot reopen productive work. Completed siblings remain
ordinary source receipts; feedback grants no tool choice or execution authority.

The productive reservation remains open during nested review. Insufficient
headroom suppresses review; an uncertain dispatched review retains reconciliation.
If the deadline expires during review, the adapter stops and allows the SDK to
settle the enclosing response. Nested active streams retain their provider alias
until the last active sibling exits, preserving its pricing/admission metadata.
Only unchanged text identical to the approved presentation can leave the stream
buffer; safe final rendering handles rejected or transformed drafts.

### Required adapter tests beyond S1

**S4a prerequisite, now combined with S4b:** native DeployedAgent text
is now held in a step-local buffer until the existing adapter response decision.
The buffer permits at most 48,000 serialized text-event bytes and 1,024 events,
including event metadata. It releases original event objects only when their
complete text equals the selected normal Stop response and there are no calls,
approvals or provider handle. Invalid serialization and either limit suppress
the entire candidate. The provider is drained so original receipts and native
history survive; the package does not claim to bound upstream SDK accumulation.
Nontext events are not buffered. Existing empty native stream responses without
a usable SDK receipt and abandonment before `StepCompleted` retain conservative
usage reconciliation rather than invented settlement. Provider failover cannot
reopen a closed formatting phase, even when its replacement supports combined
tool/schema requests. S4b now moves semantic review to this same seam; see
[S4b result](../archive/plans/runtime-reliability/S4b-result.md) for the implementation
and exact deterministic acceptance checks.

S1's test-only gateway proves the installed loop seam, history/call pairing,
same invocation/step accounting, null local continuation tokens, approvals,
errors and ceiling. It does **not** implement the new policy, test semantic
judgment, financial settlement or guarantee safe draft streaming.
S4 must add real package-adapter tests for: one omitted weather read or
clarification with one Pokémon execution; unchanged/changed/stale draft verdict;
empty/invalid draft; unavailable reviewer; exact allowance and deadline;
projected bytes matching admission; failover; genuine provider tokens;
separate-format closure; final-step unsolicited tool calls; discarded text
buffering; nested/interrupted stream cleanup; write denial and unrelated Graph
wait; canonical replay without inference. No external model calls are required.

## 5. Activity and privileged diagnostics (S6/S7)

Extend existing `ChatTurnProgress`, native lifecycle observations and
`ConversationTurnDebugger` with `agent_execution_event.v1`, stored/projected
through the existing durable turn path. Fields: event ID, turn ID, native
invocation ID, recorded call/execution identity where available, approved display
name, lifecycle, UTC timestamp, optional duration, allowlisted reason code and
authorized evidence/pending references. Use `proposed`, `rejected`, `not_started`,
`running`, `succeeded`, `failed`, `waiting`, `unknown`, `cancelled` distinctly;
never synthesize `running` from an unadmitted proposal. Limit to 64 events and
32 KiB per turn; coalesce/drop intermediate activity with an explicit truncated
indicator while retaining terminal outcome. Events observe, never own state.

Public activity exposes only safe identity/display/status/time fields. Diagnostic
arguments are separately authorized server-side by existing tenant/conversation
policies and default to absent; allowlisted fields still pass duplicate-value
redaction and a 2,048-byte per-event bound. No raw results, secrets, provider
tokens or hidden reasoning. A browser debug flag grants no access. Correlate
model calls, proposed tool calls and admitted external executions separately;
they are not interchangeable counts. GET/SSE reconnect reads canonical state
without executing, inferring or refreshing offers. Terminal/error paths clear
activity and expose the committed answer directly.

### Implemented S6 server contract

The candidate implements the closed event schema in the existing private
`ChatTurn.progress` envelope as `chat_turn_progress.v2`; presentation and
execution receipt versions do not change. Public projection is an explicit
allowlist, not a debug flag or serialized private model. The existing debugger
now repeats both conversation/diagnostic authorization and host query scopes at
its service boundary and rejects foreign message/turn/deployment associations.
No argument values are supported, so duplicated secret values are never copied
into activity. Admitted operations use bounded display labels from exact
hash-verified Agent tool pins; unresolved/unadmitted calls retain fixed
categories, with no arbitrary tool-text or mutable-authoring fallback. See
[the schema and S7 integration contract](../archive/EXECUTION_ACTIVITY.md).

Native proposals, model-step usage reservations and admitted Gateway dispatches
have distinct counters. SDK Request IDs bridge proposal and handler identity;
Gateway outcomes retain real ledger/pending references. Missing legacy IDs stay
null. Terminal activity is written inside the existing outcome transaction
through a best-effort savepoint. A telemetry failure cannot roll back the answer;
canonical terminal status still closes the public display. Historical replay
reads existing versions and never backfills events.

## 6. Persisted contracts and coordinated migration

S1 changes no ABI or stored data. Reserve **Agent runtime/compiler ABI v9** for
the coordinated unreleased S2–S8 cutover. The first S2 implementation advances
`DeploymentRuntimeCompatibility` to v9; this is an incomplete development candidate. New offer authority and answer/context
semantics must not silently apply to v8 immutable artifacts. Publish fresh
hash-verified candidates through the existing compiler/publisher; no mutation
of active manifests, receipts or original messages. Portable exact-name tool
loading from v8 remains mandatory. Playbook/AgentGraph ABI is unchanged.

ABI v9 itself binds the fixed reliability semantics and bounds in this ADR.
Do not add a configurable `conversation.reliability` profile or duplicate
version gate. The compiler/validator and runtime compatibility check reject
unsupported ABIs. Intermediate S2–S4 builds are development candidates only;
do not advertise v9 as release-ready before all its code and tests exist. S8 republishes
and verifies the final exact candidate. If slices require an independently
usable intermediate ABI, the coordinator must explicitly version that narrower
contract rather than changing the meaning of an already published hash.

Version the encrypted Connector-context envelope from v2 to v3 for the new
offer proof; preserve its sole pending authority. Keep observations immutable.
Typed history is a read-only projection and needs no new durable task table.
Version changed private presentation receipt members for typed status/event
data; a transient review binding lives only in the invocation and final canonical
assessment metadata, not a cross-turn cache or future-work owner.
Advance `AgentStepRequestProjection::VERSION` from v4 to v5 with the coordinated
new request projection; diagnostics and admission must describe the same bytes.

Classify open legacy pending contexts before switching ABI. Do not silently
translate an undelivered/alias-only offer into a new source proof. Drain or
explicitly cancel/reclarify incompatible open reads through the existing state
owner. An active Graph wait or uncertain external operation retains its exact
old deployment and blocks incompatible migration until its supported resolution;
it is never reset to make publication pass. Historical old receipts remain
readable for their original replay/diagnostic purpose, but missing new identity
or scope proof is ineligible for new offer/status authority. No receipt backfill
from assistant prose. These are envelope migrations; no new DB columns are
required by S1. S2/S3 must specify any actual migration and rollback checks in
UPGRADING when implementing it.

Remove the alias-only offer gate when the source union replaces it, duplicate
history summaries when typed projection replaces them, and terminal-only review
orchestration when S4 owns pre-stop assessment. Preserve deterministic final
rendering and terminal assessment only where no matching pre-stop assessment
exists. No permanent old/new productive mode and no answer-kind/request planner.

## Verification and limits

The focused executable map and handoff are in
[S1-result](../archive/plans/runtime-reliability/S1-result.md). The synthetic fixture
labels its provenance and contains no provider-derived location assertion.
Passing deterministic tests proves binding and lifecycle behavior for given
proposals, not understanding of confirmations, reliable omission detection,
location equivalence, improved cost or real-model completion rates. Those
quality claims require the separately bounded S8 integration evidence.
