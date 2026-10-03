# ADR 0023: Keep answer completion in the native agent loop

Status: **Accepted variant A. B1, B2a, B2b, B2c and bounded response-language policy implemented in the unreleased worktree.**
Date: 2026-09-20.

Implemented supersession: [ADR 0025](0025-source-bound-conversation-reliability.md)
S4b replaces this ADR's terminal-only restriction with one bounded correction
inside the original native invocation and exact assessment reuse at finalization.
The remaining technical recovery, tools-closed formatting, evidence fallback and
language contracts below remain authoritative. See the
[S4b evidence](../archive/plans/runtime-reliability/S4b-result.md).

## Decision and scope

Use the existing native agent/tool loop with one terminal, tool-free claim
review. This decision supersedes the unimplemented pre-stop completion
controller proposed in S3A. The simplification applies to S3 of the
[dialogue refactor](../archive/audits/2026-09-19-dialogue-runtime-refactor.md) in the
coordinated, unreleased ABI v7 cutover; it introduces no ABI v8.

Preserve [ADR 0008](0008-agent-first-playbook-cutover.md),
[ADR 0009](0009-durable-external-operations.md),
[ADR 0020](0020-native-read-interactions.md),
[ADR 0021](0021-natural-dialogue-and-context-accounting.md) and
[ADR 0022](0022-coherent-connector-continuations.md).
`AgentTurnLoop` owns productive conversation, Laravel AI's `TextGenerationLoop`
owns native tool iteration, and AgentGraph owns Playbook transitions.

The main model proposes native tool arguments. Admission and
`CapabilityExecutionGateway` authorize execution. Real tool results and
admission feedback return to the same native loop, where the model chooses its
next action. Technical answer formatting remains available where required by
the provider. The existing terminal claim review checks answer wording against
canonical evidence; it cannot dispatch tools or continue productive work.

Do not add an answer-kind envelope, completion state machine, omission-relation
router, second semantic review, review receipt/cache, or automatic read round
triggered by omitted coverage. B1's preparation value is useful to the existing
finalizer and does not justify another review caller.

## Implemented slices

B1 (`6443f610741218e4865424ce54d9ec5d9ff2f780`) extracts
`LaravelAiAgentAnswerClaimVerifier` behind the existing interface. The turn model
no longer implements or forwards that interface. The verifier keeps pinned
model selection, bounded generation, the shared deadline and usage accounting;
it has no executable tools or history. Native tool calls or results invalidate
even otherwise valid review JSON. `AgentModelCompletion` shares pure completion
diagnostics, and `ChatTurnRequest::recordedTimeContext()` shares clock wording.

`AgentEvidenceAnswer::prepareReview()` provides the existing finalizer with an
immutable `AgentAnswerReviewCandidate`: bounded response, language, notice,
rendered fallback, claims, context, source validity and exact review-input hash.
Preparation performs no model call, transition or caching. The ordinary review
count and existing historical/Playbook branches remain unchanged.

B2a removes the second lexical meaning veto only after
`AgentAnswerSynthesis::reviewedFailureQuestion()` has admitted a question. Both
canonical input clarification and failed-read result clarification use this
rule. For example, an accepted question containing “search” and “database” must
not be discarded merely because those words also occur in completion claims.
Unreviewed wording retains its existing lexical checks. Exact pending identity,
revision, task/invocation/field binding, assessment hash, source redaction,
published choices, language and length constraints remain authoritative.
Question wording never answers its invocation or mutates pending inputs.

The 19 legacy `AgentReviewedFailureClarificationTest` cases now use native
`invocations` and revision-bound `questions`. Their business assertions remain
unchanged. Per ADRs 0020/0021, model-authored `request_id` and `open_items` are
obsolete; restoring those fields in production is not a compatibility goal.
Two public guard regressions first reproduced the lexical veto in both callers
and then passed with the change. These tests use deterministic review doubles;
they establish contract behavior, not real-model semantic judgment quality.

## B2b: one native technical recovery

The outer empty-completion prompt restart is removed. A productive native
invocation may continue once after an empty normal Stop, including without tools
or an answer schema. A second empty result terminates into the existing error,
fact or pending fallback. The previous extra formatting round after two empty
answers is superseded. Nonempty invalid drafts retain one technical formatting
transition only on the existing separate-format adapters; that step closes tools.
Final steps, provider errors/length/unknown finishes, approvals and real provider
continuation handles cannot start empty recovery. Review
agents gain no extra steps. Safe 429 transport retries remain separate and keep
the existing no-execution/state-unchanged checks.

The package no longer scans local rejection codes to force a selected tool after
the model's normal tool-result follow-up has stopped. Real `correct_arguments`
feedback and SDK `RepairToolCalls` remain. The additional forced chance, its tool
shortlist, and the old Flash-Lite bare-result continuation cue are removed.
Scripted tests verify voluntary correction through the real gateway while an
independent successful sibling executes once, and public safe fallback after a
bad stop. They do not establish equal or better real-model success rates.

All three package markers are removed from the provider continuation-token
field. Minimal technical flags belong to the existing BaseConversationalAgent
invocation lifecycle. StartingStep binds original SDK options to its invocation;
projection is read-only and internal projected option clones do not create a
second identity. Native provider tokens, replay blocks and call IDs remain intact.
Actual admitted attempts count toward the original native step ceiling even if
failover resets provider-local step numbers; time/cost admission stays in force.
Cleanup is per invocation, including interrupted and nested streams.

Initial and per-step request budgeting use the same effective instructions,
messages, tool definitions and answer schema as dispatch for affected native
adapters. Existing provider serializers supply tool definitions; attachments
retain their separate existing budget pass. Open-pending serialization remains
fresh, with one random wrapper boundary per AgentConversationState, so repeated
projection is identical without caching content or consuming flags. Other
UntrustedLlmContext wrappers keep their default fresh random boundaries.

Verification distinguishes supported high-level unstructured DeployedAgent
`stream()` from direct native SDK streaming with RunContext for schema-format
cases. The installed SDK still rejects high-level `stream()` on a structured
output agent; B2b does not enable that combination or patch the SDK.

## Displaying an omitted completed result

A terminal partial verdict bound to the exact review input and a current-message
omission may expose a wholly undisplayed successful read through the existing
fact renderer. Eligibility comes from the current invocation, pending answer
identity, delivered evidence and successful execution receipt. The omission's
text never selects a tool, interprets a result or restores historical work.
Already displayed evidence, answered/cancelled invocations, failed/uncertain
reads and unbound or unavailable reviews cannot add excerpts.

This bounded presentation preserves supported prose and pending questions,
uses published public fields, and observes the remaining answer budget. A real
zero-match result may be shown as such; missing evidence cannot become an empty
result. Rendering may disclose its existing output limit. Appended facts do not
mark an invocation answered. The visibility receipt binds the actual output;
changed text invalidates the previous semantic coverage verdict rather than
claiming a new complete review. There is no additional inference, tool call,
review or automatic omission controller. Never-invoked work remains a quality
gap.

## Technical attempts in the terminal review

The existing bounded native-result diagnostics retain their allowlisted reason
codes and exact available tool names even when sibling or later reads succeed.
The final review receives these independent aggregates as `technical_rejections`,
separate from invocation observations and pending request IDs. They are part of
the exact review payload and its hash; changed diagnostics cannot reuse an old
coverage verdict. Raw arguments, result data and technical prose are excluded.

These are earlier rejected attempts without established execution. The aggregates
supply no tool/code pairing or correction association. They may precede successful
native correction and do not prove an unresolved request, an HTTP failure or a
complete answer. The reviewer still assesses the final answer and canonical
results against the full visitor request. No fixed completeness veto, additional
review, forced correction or new task is introduced. The existing rejection-only
clarification fallback still requires its completion error and no execution or
evidence; mixed successes cannot enter it through diagnostics alone.

Scripted tests establish transport to the review, exact binding and unchanged
state/call counts. They do not establish that a real reviewer will recognize all
omissions; semantic completeness remains a measured quality gap.

## Preserved boundaries

Authorization, payload/source binding, confirmation, idempotency, redaction,
unknown-outcome handling and reconciliation remain gateway responsibilities.
A failed, unavailable or stale review cannot authorize wording. A question or
answer correction cannot authorize an effect or replay a successful operation.
The existing S2 context verifier remains until S4 evaluates its independent
field-meaning and source/selection guarantees; lexical/schema validation alone
has not been shown to replace them.

Historical text must not reconstruct old answered or cancelled work. A selected
pending continuation may carry verified retained sources and constraints.
Existing verified historical facts, supported subsets and Graph-owned status
remain available under their current contracts.

## Quality limits and remaining work

D01's whole-request completeness is a quality target to measure. Detected partial
coverage must remain honest. Completely overlooked work with zero native calls
can escape terminal review; this remains a quality gap. The original D09
automatic omission-repair assertion is **superseded, not passed**. No extra
semantic router is introduced to turn a coverage omission into a new read.
D12 still requires consistent bounded technical recovery across ordinary and
separate-format providers, synchronous and streaming output.

S3A (`e377f78bfde23fc5941febe1202c494e05625458`) characterized the baseline:
a valid stop draft can omit an available requested tool; zero-call work can
bypass review; calling the finalizer twice performs two reviews; native
continuation preserves opaque provider state. These are observations, not proof
of completeness or a reason to add a review cache. Existing characterization
tests must not be relabeled as passing the superseded controller proposal.

B2c removes the separate generative answer-selection repair. Invalid or missing
selections now retain the existing guarded facts fallback. Its interface,
provider binding, native repair schema, prompt-only repair instructions and the
exclusively repair-owned transient history snapshot are removed. The productive
first model answer, native schema formatting, SDK `RepairToolCalls` and one
terminal ClaimVerifier remain. `forAnswerClaimReview` directly establishes the
existing tool-free, history-free, single-step review boundary and its 20-second
maximum; ordinary conversation tools and memory projection are unchanged.

This is a measurable behavioral tradeoff, not an equivalence claim. Previously
accepted second selections could narrow two document links to one or select only
tomorrow after a short location follow-up. The existing fallback may instead show
both verified links or both days. It preserves source identities, required
context, record ordering, complete URLs, public-field and byte limits; it does
not promote unsupported drafts. Missing selections, invalid references, verified
zero results, missing evidence and failed reads keep their distinct outcomes.
The existing healthy exact curated-object/flat-list classification and its
12-record limit remain. Other useful fallback answers are not relabeled as
successful solely because no repair is attempted.

Historical displayed records, Knowledge/Capability mixtures and authoritative
Playbook waiting/unknown status retain their existing fallback and receipt paths.
Recovery loses only the obsolete allow-repair argument and gains no inference or
tool replay. Stored `answer_repair` operator metadata and usage stages remain
readable; no historical dialogue is rewritten and no new turn writes that stage.
Tests retain the source, presentation, state and JSON/SSE replay assertions while
replacing second-call assertions with zero repair usage. Pure repair transport,
schema and snapshot tests leave with their removed implementation. Native SDK
formatting and reviewer isolation are checked through their existing tests.

## Published response language

The productive model chooses the existing answer `language` within the pinned
Agent language set. Native schemas and prompt-based answers use that same set;
the previous server-inferred singleton and DeployedAgent override are removed.
Explicit permitted requests and short conversational continuations are model
interpretation. Software authorizes the locale, preserves a deterministic
published default and applies the existing evidence and output boundaries.

The set contains normalized, deduplicated built-in language tags. Empty means
all four; a single supported value is fixed. Unsupported entries in a mixed set
add no language. A nonempty unsupported-only set retains the already documented
published default as its sole technical locale. This is not a new publication
rejection or migration. Immutable deployments and the plain-prose response
format are unchanged.

`AgentEvidenceAnswer::admitLanguage` is the shared presentation admission point.
The existing candidate carries the permitted choice through finalization,
questions, failures, historical facts and supplements. Invalid or excluded
structured output cannot become allowed prose by changing its language tag.
A valid locale does not authorize malformed claims or references. Failed nested
checks may still render verified fallback facts in the permitted chosen locale.
No parsing, source, field, byte, idempotency or Graph contract is relaxed.

The existing review context carries the same locale in its hashed payload,
including coverage-only reviews. A result for an otherwise identical answer in
another language cannot certify coverage. The reviewer receives this value
without its own heuristic, new interface argument, output format or model call.
Existing claim/request verdict binding remains unchanged. A null review context
continues to use only the published default.

Input-language inference is a separate contract: the Connector binder still
uses the previous `VisitorMessageLocale` and verified continuation sources via
`forInputAdmission`. A German input reaches its mandatory entity resolver with
German locale even when the Agent's technical response default is English.
Removing answer rigidity does not change value normalization or source binding.

The verified Workflow policy wins for a fixed Playbook section; existing
canonical Workflow prose is not translated. Independent Agent sections can use
another allowed language. Plain prose, code fences and Markdown without a
structured language field retain their existing path; language compliance there
is a model-quality constraint. Neither this policy nor a declared locale proves
natural-language correctness. There is no translation or repair round.

Deterministic tests cover the previously blocked German/English choices, native
SDK and prompt-based processing, constrained sets, fallback questions and facts,
old selections, coverage-only hashes, fixed Workflow sections, unchanged input
admission, historical fallback, and canonical JSON/SSE replay. These are software
contract checks, not a paid-model conversation-quality or live-host claim.

S4 should measure real-model routing, omissions and verifier cost separately
from deterministic safety contracts. Connector evidence reuse, Data Resource
query identity and Knowledge duplicate-query behavior have different contracts;
no shared wrapper establishes equivalent replay guarantees.
