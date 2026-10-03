# ADR 0022: Coherent Connector proposals and bounded source reassignment

Status: **S2A and S2B accepted and implemented; coordinated candidate integration pending.**
Date: 2026-09-19. S2A follows the S1 local-repair contract and the
coordinator-approved S2 design. Host candidate acceptance remains separate.

## Scope and existing authority

This decision addresses S2 of the [dialogue refactor plan](../archive/audits/2026-09-19-dialogue-runtime-refactor.md).
It preserves ADRs [0008](0008-agent-first-playbook-cutover.md),
[0009](0009-durable-external-operations.md),
[0020](0020-native-read-interactions.md) and
[0021](0021-natural-dialogue-and-context-accounting.md).
AgentTurnLoop owns conversation, AgentConversationState owns open direct inputs,
and CapabilityExecutionGateway independently admits external reads. No graph
owner, request inventory, scheduler or history-based consent path is added.

S2A preserves the independent semantic check as a verifier of one native
proposal. S2B adds bounded source reassignment with explicit target-policy
opt-ins. Both changes belong to the coordinated ABI v7 candidate.

## Characterized pre-S2A behavior

The `connector-s2-characterization` group in
`tests/Unit/AgentConnectorContextExecutionTest.php` characterizes deterministic
native proposals. Providers and semantic responses are scripted. Passing
tests establish runtime behavior given those proposals, not model understanding.

| Case | Pre-S2A result | Implication |
| --- | --- | --- |
| Miami, Florida; Florida, Miami; lowercase; sentence | A coherent native proposal executes once. | The binder itself does not depend on word order. |
| Florida then city; city then a genuinely ambiguous region, bare and sentence replies | Exact `__pending` continues and consumes the selected task. | Basic source retention and explicit continuation already work. |
| Miami without a stated optional region | Executes without opening a region question. | Do not manufacture a required region to force a two-turn demonstration. |
| Two tasks for the same capability | Selecting one ID/revision consumes only that task. | Keep exact selection; matching a tool name is insufficient. |
| Bare Miami with omitted `__pending` while a Florida task is open | Executes a separate unconstrained read and leaves the task open. | Missing association is a semantic proposal problem; automatic merging would change the independent-read contract. |
| Earlier model proposal stores `location=Florida`, pending `context:region`; reply Miami | `revise` with `context.region=Florida` is rejected as not bound to the current message. Omitting region permits partial revision, but replaces the only retained Florida field source with Miami. | Reassignment must consume the original verified source atomically before overwriting it. History text alone cannot repair this. |
| Correct city reply plus retained Florida, second assessment proposes `region=Miami` | A new region question/revision is produced; Florida remains protected and nothing dispatches. | Source validation cannot distinguish two meanings of the same literal word. |
| Same API inputs with changed native context Florida to Georgia | The second call reuses the first assessment and becomes ambiguous; only the first provider call runs. | The cache key omits native context, and also does not bind the live task revision. |

The pre-S2A assessment supplied independent protection. Focused tests showed
that it could recover a
stated condition omitted from the native proposal, distinguish absence from
ambiguity/unavailability, reject invented literals, and preserve published alias
equivalence. A complete object containing null for every field does **not** prove
that the native model noticed every stated condition.

The pre-S2A assessment received proposed API arguments, a pending-field hint
and the latest message. It lacked native `__context`, full published API field
meanings and verified retained values. Its response proposed new context values
that `AgentConnectorTurn::prepare()` merged into the native proposal. S2A removes
this conflicting ownership.

## Accepted S2A: one field proposal, one bounded semantic check

1. **AgentConnectorTool / AgentConnectorContextArguments:** Keep API inputs and
   optional `__context` object in one native call. Missing/null/empty context
   and omitted declared fields mean no new value, preserving an admitted
   retained value. The native schema advertises an optional nullable object
   with optional typed nullable fields. Undeclared fields, nonempty lists and
   invalid scalar types are rejected without coercion. Optional absence is not
   ambiguity. Add a bounded `__ambiguous_context` list of declared fields, reusing
   the current assessment's ambiguity semantics. Listed fields must have no new
   value (omitted or null). Existing `__clarify_input` remains the explicit API
   ambiguity surface.
   The current invocation contains all known API values, context, pending ID,
   revision and action together.
2. **AgentConnectorTurn::prepare / AgentConnectorContextAdmission:** Reverify
   exact pending selection, source and schema before semantic work. Invalid
   shape, source, stale revision and invalid reassignment return S1-style local
   feedback, with no new pending task or checkpoint mutation. Correcting a model
   proposal never means that the visitor omitted the value.
3. **AgentConnectorContextAssessment and its existing agent classes:** Change
   from a second value extractor to a verifier of the complete admitted proposal.
   Its bounded input includes both published field meanings, native API/context
   values, explicit ambiguities, selected task/revision, latest message and the
   selected task's freshly verified retained values with original source labels.
   Retained words are historical evidence, not current-message agreement. Do not
   add arbitrary history, other task inputs, attachments or provider-result facts.
   Return a closed verdict with published field paths and bounded reasons
   `unaccounted_stated_condition`, `field_assignment_conflict`,
   `pending_selection_required` or `ambiguity_mismatch`. The closed response is
   `{status: accepted|correct_arguments, issues: [{field, reason}]}` with at
   most 16 unique fields. Provider failure or malformed output is separately
   unavailable; it cannot be encoded as accepted absence. Return no replacement
   values,
   new task identity, execution permission or visitor-facing question.
4. **AgentConnectorTurn / existing native loop:** A negative or unavailable
   verdict blocks dispatch and returns typed local correction feedback. The
   productive agent proposes the corrected complete call or explicitly requests
   the genuinely ambiguous field. Only that normally admitted proposal may
   create/update a pending task. A positive verdict still passes the existing
   gateway, field policies, context predicates and read-result checks. Successful
   sibling reads are never repeated to repair this proposal.
5. **Association:** The native model selects exact visible `__pending` controls
   for short replies. If association is uncertain, it must ask which existing
   task is intended; it may not create an equivalent wait by guessing. Missing
   `__pending` continues to denote a separate proposal. A verifier may return
   selection feedback using attested open-task IDs and field summaries, but
   cannot attach a task by capability name or borrow its values. Independently
   requested reads without `__pending` remain admissible.
6. **Cache and bounds:** Bind the verdict to the complete canonical proposal,
   native context and ambiguity list, exact selected ID/live revision, retained
   source hashes, deployment hash, current message hash and authority scope.
   A changed context, revision or source invalidates it. Reuse existing deadline,
   per-turn assessment cache and native proposal bounds; do not introduce an
   outer respond loop. Preserve the current one-step, 1,024-token/20-second
   assessment limits and stage accounting until a separately verified removal.

This leaves one proposer and a fallible semantic checker. It does not immediately eliminate the review call.
Deleting that call based only on required schema fields would lose the
characterized omission protection. A future single-call design needs equivalent
pre-dispatch evidence for that case. S3's post-answer coverage review alone
cannot restore a condition that was already omitted from the external request.

## Empty native context refinement

On 2026-09-20, the coordinated ABI v7 candidate replaces S2A's initial
complete-key requirement. A required object populated with nulls established no
additional semantic evidence; the normalizer already removed those nulls before
admission. Missing, null, empty and sparse native forms now express the same
absence of new values. This is the current contract, not a compatibility path.
The existing proposal builder still supplies every declared field to the
semantic verifier, including explicit nulls for missing values and separately
verified retained sources. No extraction, replacement value or context deletion
is introduced. All stated-condition, field-assignment, ambiguity and pending
selection checks remain. Unavailable review still blocks dispatch.

Equivalent empty or sparse forms share the same canonical review cache input;
changed values, source identities and live revisions still require distinct
review. The existing native schema and installed SDK serializers advertise this
contract; wrong types and undeclared keys remain invalid even on pins without
context fields. Source reassignment and exact pending authority are unchanged.
Deterministic tests establish these boundaries, including source retention and
Gateway result predicates; real-model success remains separate.

## Shared native protocol refinement, 2026-09-20

The shared conversation adapter supplies the entire attested current message for
an input-offer confirmation, rather than asking the model to echo it in
`__input_confirmation.reply_evidence`. The native selection carries `offer_id`
and the unchanged explicit pending ID/revision/action. A supplied echo receives
typed local correction; it cannot replace or shorten the server-bound message.
The internal Connector/Gateway admission still verifies the complete reply,
committed offer, source, task revision and authority. Semantic acceptance remains
a model proposal, not something proven by copying text. Standalone internal
callers retain the explicit evidence contract.

Common native Connector instructions appear once in the shared prompt; pending
guidance is conditional on open tasks. Per-tool schemas retain exact available
selectors and field policies. No source acceptance, task-transition authority,
context verifier or ABI v7 candidate activation requirement changes. See the
[G2 evidence and disposition](../archive/plans/2026-09-20-generic-agent-dialogue-native-protocol.md).

## Accepted S2B: explicit source reassignment within one open task

An earlier misassigned value can become a different field only through an
explicit new source contract. Do not treat `revise` or a historical string as
sufficient permission. The closed native shape is:

```json
{
  "location": "Miami",
  "__context": {"region": null},
  "__pending": {"id": "<offered id>", "revision": 2, "action": "revise"},
  "__rebind": [{"from": "input:location", "to": "context:region"}]
}
```

The reference names an existing source entry, not a model-supplied value or
message ID. Snapshot donors are read before applying any current replacements.
No retained source is overwritten until the complete proposal is validated.

Required constraints:

- Only exact currently offered and live open task ID/revision, same capability,
  conversation, deployment ID/hash, context area and freshly attested scope.
  No cross-task borrowing, including between two tasks for the same Connector.
- Require `revise`; reject new, cancelled, closed, stale or expired tasks.
  Reuse the existing verified reader's commit, ordering, source-message hash and
  TTL checks. Neither reassignment nor a question restarts source/task age.
- Only a retained public scalar with ordinary visitor-literal provenance is a
  donor. Exclude `confirmed_offer`, credentials/sensitive fields, server-bound
  values, read-dependency references, provider outputs, arrays and objects.
  The reference creates no write, confirmation, read-dependency or consent right.
- Require a **published opt-in at the target field policy** for pending-source
  reassignment in the immutable deployment contract. Optional strict boolean:
  `input_policies.<field>.pending_source_rebinding` for API targets and
  `context_contract.fields.<field>.pending_source_rebinding` for context targets.
  Absence or false denies it. This explicit, versioned exception must not silently
  broaden `latest_message_only`; `input_dependencies` remains invalidation data,
  not source permission. The API authoring row exposes the opt-in as a native
  toggle; context authoring retains it in the contract JSON. The metadata is
  stripped from the generated context input schema. Publication rejects enabled
  flags for writes, nonliteral or resolver sources, history continuation, sensitive
  fields and nonscalar schemas. Both endpoints must use exact visitor literals
  with `latest_message_only` and no resolver.
- Rebind the original `source_value` against the target's published schema,
  literal/alias rules and sensitivity policy using the original verified source
  message. Preserve original message ID/hash and proposed source value; store
  only the target policy's admitted canonical value. An alias accepted for the
  donor is not automatically accepted for the target.
- Only published concrete scalar root paths in the two namespaces. Bound the
  list to 16 references, each donor and target at most once; reject duplicate,
  cyclic, unknown, self, nested and conflicting literal/reference assignments.
  Reassignment removes the old donor binding unless a separately admitted new
  value replaces it. A required donor with no replacement becomes genuinely
  missing; it must not retain a known wrong field assignment.
- Evaluate existing published input dependencies and result predicates for the
  resulting complete context. Reassigned unresolved fields count as resolved
  only after target-policy admission and coherent semantic verification.
- Any invalid reference leaves task, revision, sources, questions and checkpoint
  unchanged. An admitted partial proposal may update that same task once; a
  successful read consumes only that task. The gateway independently repeats
  source-reference admission and compares the exact revision and bound sources
  again after its pre-dispatch callback, before progress or HTTP dispatch.

Use AgentConnectorContextAdmission's existing `restoreFields`, `source` and
public-tree rules plus ConnectorContextContract's field checks; extend their
shared admission path instead of adding a parallel source store. Thread the
bounded references through AgentConnectorTool, AgentConnectorTurn and
AgentConnectorCapabilityRequest to the existing gateway admission. Encrypted
Connector context remains the only future-input owner. No message text becomes
an authorization shortcut.

Because this changes source acceptance and native schemas, publish S2A and S2B
together under Agent runtime/compiler ABI v7 with fresh candidate evidence.
Old immutable deployments and historical turns remain untouched. This is a
versioned contract, not a permanent compatibility fallback.

The semantic reviewer receives the resulting proposal, the validated references
and their original source identities. It cannot add references or authorize a
source. Invalid references return `connector_source_rebinding_invalid` through
the existing `correct_arguments` / `not_started` repair path. An empty or absent
list follows ordinary admission. No extra persisted source schema is introduced.

## S2A verification and cutover

S2A requires Agent runtime and compiler ABI v7. Publication builds a fresh
candidate; hash-valid v6 artifacts fail closed and remain unchanged. Playbook
and AgentGraph ABIs are unchanged. Activation and representative host/dialogue
quality checks belong to the coordinated integration after S3, not this slice.

The old extractor and merge path are removed. Malformed native context, invalid
ambiguity controls and invalid sources return local repair before review.
Missing context instead reaches the existing review as no new values.
Negative verdicts use `connector_context_review_rejected`; unavailable verdicts
use `connector_context_review_unavailable`. Both return `correct_arguments` and
`not_started`, enter the existing native repair diagnostics, and create no
execution receipt or pending/checkpoint mutation. Only an admitted native
clarification can ask the visitor for a field.

The per-turn cache uses canonical object encoding of the complete proposal,
ambiguities, freshly verified selected sources/revision, value-free matching task
hints, exact pin, confirmation, deployment, authority scope and current message.
Object key order does not change identity. Changed context, revision or source
does. Failed and thrown reviews are cached within the existing 16-entry bound.

The legacy test migration preserves each source, scope, no-dispatch and pending
scenario while replacing superseded expectations: unbound replacements receive
local no-mutation repair; exact explicit revision admits current literal values;
a stale closed task is rejected; an omitted pending selector remains an
independent read. The full ContextExecution file also covers side answers,
early returns and a native Playbook resume without consuming an unrelated task.

Deterministic evidence includes both city/region orders, optional absent region,
true native ambiguity, omitted stated conditions, unavailable/malformed verdicts,
aliases, two same-capability tasks, correct and wrong selection, independent
reads, original source retention and cache invalidation. The old limitation
remains characterized for fields without the explicit S2B opt-in.

Run affected files with `LOG_CHANNEL=null` when reusing read-only Testbench
vendor dependencies:

```text
php vendor/bin/phpunit tests/Unit/AgentConnectorContextExecutionTest.php tests/Unit/AgentConnectorContextAssessmentTest.php tests/Unit/DeploymentRuntimeCompatibilityTest.php tests/Unit/AgentConnectorClarificationSchemaTest.php tests/Unit/AgentConnectorNativeContinuationDecisionTest.php
php vendor/bin/phpunit tests/Unit/LaravelAiAgentTurnModelTest.php
```

Run Pint and scoped PHPStan on changed productive PHP files. These checks use
scripted model responses and fake HTTP. They establish software contracts, not
live model quality, provider certification or release readiness.

S2A package verification: the six files above pass together with 257 tests and
1,959 assertions. Changed PHP files pass Pint; the nine changed productive files
pass scoped PHPStan. Canonical package docs drift passes; the external public
docs repository is unavailable in this worktree. No live model or host check ran.


S2B package verification: ContextExecution, ContextAssessment, contract validator,
context contract, authoring mapper and native form characterization pass together
with 371 tests and 1,899 assertions. After adding multi-reference and unchanged
context-replacement coverage, the final affected runtime subset passes with 55
tests and 330 assertions. Twelve focused native repair tests pass with 110 assertions using
actual invalid-reference tool results in scripted Gemini/Ollama complete/stream
paths. Coverage includes both move directions, non-geographic target aliases,
original donor snapshots, missing donors, dependency invalidation, result
predicates, task isolation, strict policy publication, immutable pins and stable
form round trips. Direct gateway tests cover unavailable/tampered/foreign sources,
expired/closed/stale tasks and revision changes before dispatch; post-review
revision changes also block partial persistence. Dependency invalidation compares
the resulting context, preserving inputs when a fresh donor replacement leaves
the condition unchanged. Changed productive PHP passes scoped PHPStan, changed
PHP passes Pint, and package docs drift passes (external public docs unavailable).
These checks use fake providers, not live model calls. No host activation or release acceptance is claimed.


S2B review follow-up: the operation contract also applies the actual effect to
context-field opt-ins. Write publication already rejected all nonempty context
contracts; absent/false flags retain their prior normalization and that existing
publication rule. Gateway callback reuse now passes fresh rebinding admission
before returning either a cached not-found result or a cardinality block. Changed
revisions/sources return local rejection; unchanged reuse sends no second HTTP
request, and callbacks still cannot supply success. Regression tests first failed
at these boundaries; the final scoped set passes with 88 tests and 479 assertions.
Both changed productive classes pass PHPStan and all changed PHP passes Pint.

## S3B2b follow-up

[ADR 0023](0023-native-answer-completion-review.md) removes the adapter's forced
local tool-correction round after a model stop. The historical S2 native-repair
test counts above describe their original contract. Domain `correct_arguments`
and `not_started` feedback remains available in the ordinary native tool-result
follow-up; no new tool choice or semantic reviewer replaces the removed force.
S2 admission, source/confirmation binding and the context verifier remain intact.
