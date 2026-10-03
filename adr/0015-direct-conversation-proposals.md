# ADR 0015: Direct conversation proposals and incremental request state

- Status: Accepted target; implementation and live acceptance in progress.
- Date: 2026-09-09
- Mandate: [Chat runtime refactor specification](../archive/CHAT_RUNTIME_REFACTOR_SPEC.md).
- Supersedes ADR 0014's mandatory message inventory, full word coverage and
  universally required semantic answer review. Its authority and provenance
  invariants remain in force.

## Decision

`AgentTurnLoop` remains the sole productive conversation owner. Laravel AI owns
the native model/tool loop, AgentGraph owns Playbook transitions, and
`CapabilityExecutionGateway` authorizes and executes external capabilities.

A model may directly propose a deployment-pinned capability. Server state binds
the proposal to the current visitor request and assigns internal references.
Exact input provenance, explicit user restrictions, immutable scope, admission,
confirmation, payload binding and effect policy remain mandatory. No complete
message inventory, word coverage, or replacement planner call gates a read.

The existing local Connector clarification action is the primary handoff for
missing inputs. It validates published fields, preserves source-bound known
inputs and conditions, and persists the pending task without an external call.
Explicit per-request changes advance canonical revisions; omitted fields never
erase pending work. Unique server relationships may fill omitted bookkeeping;
ambiguous or explicitly invalid references never select a different task.
Short free text still requires a semantic proposal and normal input admission.
Social replies and side questions do not themselves complete or cancel work.

Execution evidence, answer support and request completion are separate.
Structured source values are deterministically bound to their published labels,
identity, units and limits. Displaying an exact source value does not prove that the whole visitor request
has been answered. Source-backed request completion retains the bounded
deployed-model coverage assessment, including multi-part questions about one
source. Canonical execution with an unknown outcome remains unresolved until
its execution owner reconciles it; clarification or request edits cannot
downgrade it to a retryable state. Plain conversation does not require
request bookkeeping or a second claim reviewer. Failed completion preserves
already verified evidence and genuinely pending questions.

Questions allow natural plain language and ordinary punctuation under existing
field authorization, privacy and rendering rules. One composition owner emits
each bound question. Provider projection handles native wire constraints without
interpreting a domain inventory tool's text as execution policy.

Progress derives from authorized runtime state; final answers remain committed
before public delivery. Reconnection preserves the same client-turn identity
and cannot repeat a side effect.

## Cutover and verification

Remove the obsolete productive inventory tool, its prompts, coverage gate and
provider-specific inventory parsing. Preserve historical canonical replies and
receipt validation. Any changed persisted contract needs an explicit tested
version transition; no historical deployment or evidence is rewritten. The
Agent runtime and compiler ABI advance to v2. New request checkpoints use v2;
validated v1 checkpoints may be read during recovery, while new work requires
a freshly published compatible deployment. AgentGraph SDK 0.18.0 requires
its run-revision migration before graph workers restart.

Use targeted characterization and negative tests for task identity, atomic
changes, source admission, independent failures, tool correlation, replay,
confirmation, altered payloads and unknown writes. Live widget acceptance must
use the verified host, package source and exact allowed model/deployment.
The [goal status](../archive/CHAT_RUNTIME_GOAL_STATUS.md) records actual evidence and
remaining work; this accepted decision is not a claim that implementation or
acceptance is complete.

## Explicit retry of a failed direct read (2026-09-13)

### Finished reads and answer quality

A completed immediate read does not acquire a future input lifecycle merely
because answer coverage was partial or unavailable. At the next turn, the
existing conversation owner retains its open projection only while a verified
Connector task still requires continuation. An expired or completed task cannot
leave an orphan request binding behind. Historical canonical receipts and their
answer diagnoses remain unchanged; this does not assert that the answer was
complete. Unknown/running executions, Playbooks and the separately attested
failed-read retry below retain their existing ownership and checks. No receipt
version, database migration or new runtime is introduced.

### Independent current-message reads

A wait created by one read in the current visitor message is not an implicit
input target for a separately quoted request using that same capability. The
existing conversation owner filters that implicit task selection once; both
request binding and Connector context admission consume the same decision.
Explicit request/task selections keep their checks. Prior-message continuation,
unknown/running work, ordinary source and input admission remain unchanged.
This separation does not select values, infer a new intention, retry the failed
read or resolve its pending task. The second proposal still needs its own valid
current source and normal gateway authorization.

### Source-bound retry

Accepted bounded extension: an explicit short retry may reuse the original
request identity and exactly its source-bound inputs after one clearly failed,
retryable direct HTTP read. A refresh or new request still needs ordinary current
input admission. A continue proposal alone, an answer diagnosis, assistant prose,
or a presentation `retryable` flag never authorizes dispatch.

The Connector adapter records `connector_failed_read_source.v1` only from the
actual failed gateway outcome, retaining the original current visitor source,
request identity/revision, contract hash and exact admitted/proposed input values.
This bounded source record travels in the existing encrypted committed turn
receipt; it grants no capability. Admission independently verifies the exact
adjacent completed turn, canonical answer commit, unchanged deployment and
visitor scope, original source text/hash and purpose, a unique failed request,
and a current explicit retry selecting that same request. The existing 30-minute
source lifetime applies. Rebind original proposals under the current pinned input
rules and require the complete admitted payload to equal the original payload.
Reject changed, added or dependency-sourced inputs and unavailable source data.

The first implementation covers taskless synchronous HTTP GET/HEAD reads with
no context, confirmation, continued inputs or read dependencies. Only final
retryable transport/transient failures qualify. Provider-delayed failures are
excluded because the existing diagnostic caps Retry-After and cannot attest the
original full wait. Writes, MCP, pending, partial, unknown and nonretryable outcomes are
excluded. Successful reads and repeated failures of an already continued read
retain their existing admission rules. The new explicit visitor request permits
one normal per-turn dispatch; it does not increase automatic transport retries.
The gateway rechecks deployment, publication, credentials, permission, payload,
result and execution budgets as usual. Durable owners remain unchanged.
This initial path requires exactly one registered request and one failed call
in the preceding turn, with no delivered evidence. It does not yet cover a mixed
A-success/B-failure turn. Missing retry attestation fails closed rather than
allowing a word in the retry phrase to become a changed literal identifier.

No table, runtime ABI or historical receipt migration is needed. Historical
receipts without the new source record are ineligible for this narrow path.
The record is a server-produced source attestation, never model-authored input
or an execution flag derived from answer coverage. Verification includes exact
success, original request identity, changed inputs/source/authority, ambiguous
intent, retry policy, and excluded outcome classes with no HTTP dispatch.

## Whole-message answer diagnosis (2026-09-13)

Accepted extension, implementation tracked in the runtime hardening work log.
The existing source-answer review receives an `answer_review.v2` envelope with
the actual complete current visitor message, relevant verified continuation
messages, canonical registered request projections, the exact pre-rendered
`answer_text`, and existing factored claim support. The whole envelope shares
the 48,000-byte review bound. Required sources are never silently truncated.

The same review returns `coverage: {status, omitted}` alongside claim/request
verdicts. Status is `complete`, `partial` or `unassessed`. At most eight omissions
contain a server-assigned source reference and an exact nonempty source quote.
Unknown references, invented text and invalid shapes invalidate coverage, not
independently valid claim support. Complete requires no omissions and compatible
request verdicts. Empty claim/request objects are allowed when a source-answer
path needs coverage-only review. Ordinary zero-tool conversation gets no added
model call and remains semantically unassessed.

Pre-render a bounded candidate before this one review. Bind coverage to the full
review input hash and candidate text hash. If subsequent factual rendering changes
the answer, downgrade overall coverage to unassessed without another model call.
A validated omission notice may be appended as deterministic diagnostic text;
record reviewed-prefix and final-answer hashes separately and retain partial.
No unreviewed factual or success prose may follow a complete verdict.

Persist an additive private `answer_coverage.v1` receipt containing status,
source-message IDs/hashes and omission quotes, review-input/candidate/final-answer
hashes and a bounded reason. The canonical chat commit binds its final content;
restore checks that binding. Existing encrypted presentation receipts retain scope,
turn and deployment authority. Missing historical coverage means unassessed;
historical receipts, request state and global runtime ABI are not rewritten.
Raw diagnosis fields stay out of public JSON/SSE and ordinary trace summaries.

For Data Resource intent mismatches, invocation-local server feedback identifies
the exact rejection diagnostic before admission. The existing conversation owner
may discard the provisional binding only when the trace is exactly its previous
prefix plus that diagnostic and evidence, tasks, cancellations and the bound
request snapshot are unchanged. Restore an earlier request revision exactly;
retain the diagnostic but emit no provisional conversation reference. No model
text, reused call ID or parsed untrusted wrapper can establish this condition.
Exceptions, admitted work and independent nested changes retain their state.

Omissions create no request, task, execution, confirmation or retry identity.
They may inform later conversation only; actual execution still needs normal
request binding and current policy. Completed A remains complete when B was never
registered. Budget exhaustion or unavailable review preserves proven partial facts
and unassessed scope. Exact hashes establish binding, not model infallibility.

Bounded independent critical design review confirmed single-review ownership,
source/answer binding, private persistence, versioning and the zero-tool boundary.
