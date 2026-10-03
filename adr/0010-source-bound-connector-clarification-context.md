# ADR 0010: Source-bound context for Connector clarification

- Status: Accepted
- Date: 2026-09-07
- Decision scope: Multi-turn clarification of direct read-only Connector calls
- Extends ADRs 0008 and 0009 without changing graph, capability, or release authority

## Context

A visitor can request several independent reads and provide one operation's
arguments across multiple replies. A follow-up answer may supply a missing
field while earlier conditions remain relevant. Retaining only the last
question loses those conditions; copying arbitrary conversation text makes
generated answers or unrelated history into input authority. Counting questions
by operation name also confuses progress on a new field with a repeated failure.

Source grounding, input shape, and semantic correctness are distinct checks.
A literal city, supplier, or identifier may be a valid API argument while a
provider resolves it outside the visitor's requested region, organization, or
price limit. The runtime cannot derive every such relationship from an OpenAPI
`string`, nor can model world knowledge establish provider facts.

## Decision

1. **Retain sources, not inferred conversational memory.** Each pending read
   contains only admitted public API inputs and declared scalar conditions,
   their original proposed values, persisted user message IDs, and source
   hashes. New values bind to the current visitor message. Retained values must
   rebind against their original user messages and exact published policies at
   the tool adapter and execution gateway. Bounded arrays and objects may be
   retained only when recursive schema inspection excludes sensitive fields.
   Invalid replacement inputs cannot
   fall back to older values. Assistant text, generated questions, and provider
   output cannot become visitor input.

2. **Separate pending context from answer evidence.** A private encrypted
   `bot_chat_turns.connector_context` envelope stores at most 16 pending reads
   within 64 KB. The ledger checkpoints it and binds it to the canonical
   assistant-message commit. Its identity includes the source Chat Turn, bot,
   conversation, user message, input hash, exact Agent deployment ID/hash,
   context area, and freshly attested authority scope. Commit evidence binds
   the assistant message ID and content hash. Presentation receipts can prove
   source-scope equality but never restore pending values. Neither envelope
   restores capability grants or actor permissions.

   While correcting a tool proposal, the exact executing turn may re-admit its
   own uncommitted checkpoint. Fresh turn attestation, executing status without
   completion, matching envelope binding/scope/source hash, and a null commit
   marker are required. Only that turn's own user message may be an active
   source; earlier sources and updates must remain canonically committed.
   A present empty checkpoint is authoritative for absence, and an invalid
   checkpoint cannot fall back to old state. Turn-start and later-turn reads
   still consume only committed snapshots. This source reuse does not waive
   an explicit dialogue question's wait for the visitor or create new authority.

3. **Make reuse bounded and explicit.** Recovery scans at most 32 consecutive
   prior turns with the same deployment and scope. It checks canonical source
   and assistant messages and accepts only completed, waiting, or cancelled
   committed turns. It does not skip sequence gaps, incompatible scopes,
   deployment changes, expiry, or unfinished turns to reach older context.
   Unreadable or tampered state fails closed. An empty committed snapshot is a
   tombstone after all requests complete or are cancelled. Reuse expires from
   each request's original creation time, by default after 30 minutes through
   the internal `agent_runtime.connector_context_ttl_minutes` policy, clamped
   to 1–1440. New questions do not extend that age. Expiry is not a physical
   deletion policy. A value-only reply requires a matching live pending request
   or independently verified immediately adjacent successful Connector evidence.
   Without that proof, both the tool adapter and gateway require a complete new
   request. They neither restore expired conditions nor create a new task from
   the orphaned value. Full new requests establish their own current sources.

4. **Publish the conditions that can be checked.** Optional
   `metadata.context_contract` version 1 declares 1–16 public scalar fields and
   1–32 fixed predicates within 32 KB. Every field has a title and at least one
   check. Optional string aliases canonicalize source-bound values. Concrete
   input or result paths use `equals`, `lte`, or `gte` with type-compatible
   `exact`, `casefold`, or `numeric` normalization. Input checks require an
   existing compatible API schema path and run before dispatch. Result checks
   run before identity verification, answer projection, and evidence admission.
   Missing evidence or conflicts yield bounded field/reason diagnostics without
   rejected provider facts. Checks apply only to admitted conditions. There are
   no executable expressions, arbitrary network resolvers, or implicit
   geographic and business relations.

5. **Let the model propose the next dialogue action.** A unique matching open
   read may be continued implicitly; multiple matches require an exact task ID.
   The clarification tool can preserve other admitted fields while asking for
   one missing or ambiguous value. Existing conditions survive normal replies.
   Changing a condition requires an answer to its pending question or an
   explicit `revise` proposal with quoted current-message change evidence.
   Native proposals must assess all declared conditions using required typed
   nullable fields. Null means no new value and preserves retained conditions;
   it never erases them. Missing fields require argument correction before
   dispatch or recording a question. The final-JSON clarification path shares
   this normalization. This makes omission detectable, not semantic extraction
   infallible.
   A focused, tool-free model assessment separately examines declared conditions
   for the selected request. It shares the immutable provider/model, governed
   usage and turn deadline, with one step, 1,024 output tokens and at most
   20 seconds. No history, attachments or provider facts enter that assessment.
   Its partial values pass literal source admission before merging; canonical
   aliases agree and conflicting proposals ask about the specific declared
   field. Every ambiguous field remains in the sealed task until a current
   source-bound visitor value resolves it. Resolving one does not erase others;
   omission, retained old values and revision controls alone cannot settle it.
   An explicitly pending API input remains required even when its base schema
   marks it optional. A known condition rejected by provider results remains
   available for a corrected lookup; it is not an unknown condition.
   Explicit ambiguity retains other admitted values. Technical failure
   blocks the lookup. Per-turn memoization includes pin, arguments, purpose
   evidence, task and action, with at most 16 entries, including failed attempts.
   This is a meaning proposal inside the existing turn, not another turn owner.
   `new` creates a separate request without evicting old requests. The intrinsic
   cancellation tool closes only the selected local read. These controls stay
   outside the API payload and cannot cancel a Playbook or remote operation.
   Source attestation rejects a bare replacement value as change evidence;
   it does not mathematically prove the model's interpretation of intent.

6. **Budget unresolved state within each visitor turn.** As amended by
   [ADR 0012](0012-turn-scoped-connector-recovery.md), each request permits six
   distinct admitted-value and issue fingerprints per freshly attested visitor
   turn. A duplicate within that turn preserves its useful existing question
   without consuming another state. A later persisted visitor reply may repeat
   the unresolved state without renewing task age, admitting a value, or
   changing task, issue, sources, conditions, or scope. The current in-memory
   or verified checkpoint budget takes precedence over a stale admission.
   No pending request is evicted to admit another. Existing model-step,
   capability-call, fan-out, and result-size budgets remain in force. A completed
   task ID also stays closed within its current turn. Successful independent
   reads retain their verified evidence; replay requires the same inputs and
   admitted conditions.

7. **Preserve the runtime owners and immutable releases.** These conversation
   conditions apply to direct Agent reads. Publication rejects nonempty context
   contracts on writes; Playbooks retain their own validation, confirmation,
   and graph authority. `AgentTurnLoop` owns conversation,
   `CapabilityExecutionGateway` owns external execution, and AgentGraph owns
   tasks, checkpoints, waits, and resumption. The pending-read envelope schedules
   nothing and adds no second task runner. Context contracts are frozen in the
   operation revision and Agent pin. Absent contracts do not change old hashes;
   new or changed contracts require operation and Agent republication.

## Migration and operational consequences

`2026_09_07_000001_add_chat_turn_connector_context.php` adds one nullable column
without reinterpreting historical questions, answer receipts, or deployments.
Apply it before enabling the upgraded chat runtime. The encrypted snapshots
follow existing Chat Turn retention; this decision introduces no pruning job or
additional worker. Destructive rollback is refused. Restoration requires a
verified schema/data backup, its matching release, and the application
encryption key.

The published contract determines what can be verified. Provider metadata must
actually establish a declared condition, and an identity contract must identify
the requested entity when exact identity matters. A well-formed, source-quoted
model proposal is not a universal intent guarantee. Candidate conversations
must still exercise realistic ambiguity, corrections, interruptions, and
provider limitations. This decision does not certify a provider or a release.

## Verification boundaries

Contract and publication characterization cover closed fields, compatible input
paths, fixed operators, numeric comparison, sensitive-field rejection, read-only
scope, immutable pin propagation, and unchanged hashes without optional metadata
in `ConnectorContextContractTest` and `ConnectorContextPublicationTest`.

`AgentConnectorContextAdmissionTest`, `AgentConnectorContextReaderTest`, and
`AgentConnectorContextExecutionTest` characterize retained-source admission,
multi-input progress, revision and cancellation, scope/deployment/expiry barriers,
canonical commit binding, rejected result evidence, and execution boundaries.
These deterministic checks are separate from model dialogue quality and live
provider verification; neither follows automatically from passing local tests.
