# ADR 0012: Connector clarification recovery within each visitor turn

- Status: Accepted
- Date: 2026-09-08
- Decision scope: Question budgets and presentation context for pending direct read-only Connector inputs
- Amends ADR 0010 decision 6 and the question-budget references in ADR 0011
- Preserves task, input, capability, scope, deployment, and canonical-commit authority

## Context

The pending-read dialogue originally counted question fingerprints across a
task's whole lifetime. After one unsuccessful clarification, the same admitted
values and issue could suppress another question even when the visitor sent a
new reply. Different misspellings and unsupported model normalizations could
leave that state unchanged. The resulting exact-value demand provided little
help and treated the question budget as a judgement of the visitor's answer.

A source mismatch establishes that a proposed argument lacks its required
evidence. It does not establish that the visitor supplied an invalid value.
The correction path implemented in `bc8d4727` specifically handles invalid
confirmation metadata without changing the pending visitor issue. Other source
faults retain their existing admission handling; this decision does not claim
that all such faults already have a model-only correction path.

## Decision

1. **Bound repetitions per task and visitor turn.** Each pending read permits
   at most six distinct question states within one freshly attested visitor
   turn. The fingerprint continues to describe admitted values and the
   unresolved issue; changing question wording cannot evade the limit. A
   repeated fingerprint within that turn is a duplicate, not another question
   state.

   A later persisted visitor message may ask about the same unresolved state
   again. Its message and turn identity must pass the existing source,
   deployment, conversation, and scope checks. Identical message text is
   permitted: the source hash proves integrity, not semantic progress. A new
   model step, reused admission object, checkpoint read, or transport replay
   cannot create a fresh visitor turn or reset its budget.

2. **Keep the current budget and useful question.** The current in-memory
   task or verified executing-turn checkpoint takes precedence over an older
   admission's question budget. The existing task update turn identifies the
   budget's visitor turn. Repeated calls cannot restore an earlier counter.
   A duplicate preserves the useful existing question for the same issue;
   blocking further model attempts must not replace it with an instruction
   that the visitor must now type an exact value.

   Only the question-attempt budget is renewed on a later visitor turn. Task
   identity, issue identity, retained sources, conditions, original creation
   time, and valid offers retain their existing meaning. Expiry, completed or
   cancelled state, recovery barriers, and model-step, capability-call,
   fan-out, result-size, and deadline limits still apply. Resetting the budget
   neither admits a value nor authorizes a provider call.

3. **Describe the failed proposal accurately.** Invalid confirmation metadata
   remains feedback to the current model through `correct_arguments`, preserving
   the open question and offer. A literal-source mismatch is reported as a
   mismatch between the proposal and available evidence. It must not be
   described as proof that the visitor supplied a wrong value or failed to
   answer. Missing or ambiguous visitor information can still require a
   clarification under the existing admission rules.

   Rejected model arguments are not attributed to the visitor. Any displayed
   visitor value must have its own verified source. Provider outcomes keep
   their existing failure classification and remain distinct from a proposal
   rejected before lookup.

   A proposed offer confirmation also fails when the complete reply identifies
   a different published value for that field without identifying the offered
   value. The current model receives bounded argument-correction feedback;
   the old offer cannot override the visitor's new value. The same check applies
   when restoring a retained confirmed source. This is a closed vocabulary
   consistency check, not a claim to classify all natural-language agreement.

4. **Give the existing model bounded recovery context.** An input
   `clarification_request` can carry the current request ID, pinned public
   field meaning and schema, issue code, lookup status, safe admitted retained
   fields and conditions, and a previously verified published spelling offer.
   The existing next-action contract determines whether the model should
   correct arguments or ask the visitor. Credentials, rejected provider facts,
   unpublished aliases, and arbitrary conversation history do not enter this
   presentation context.

   This context is data for the existing Laravel AI SDK tool loop, not input
   authority. The model may compose a useful question bound to the current
   request ID; the existing response guard still checks that binding and
   presentation. A deterministic fallback may re-present a valid published
   suggestion without demanding exact retyping. Offer creation, canonical
   question inclusion, explicit selection, and composite provenance continue
   to follow ADR 0011. Showing a previous offer or receiving another reply does
   not itself confirm the choice or extend its lifetime.

5. **Keep a failed exact-identity read available for correction.** A server
   `not_found` outcome may open the existing dialogue only when the published
   result-identity contract identifies a public, source-bound input. The
   failure remains an executed read with no admitted result facts. Its bound
   question lets a later corrected identifier continue the same request and
   conditions. An HTTP 404 without that identity contract, an authorization
   problem, a timeout, or invalid response data cannot create this input path.

   An optional spelling suggestion comes only from the existing published
   alias policy. It excludes the canonical value already sent to the provider;
   it cannot promise a match or claim that the intended entity does not exist.
   A performed lookup retires its task's old spelling offer. A later suggestion
   still requires a newly delivered offer and explicit selection under ADR0011.

6. **Preserve the runtime owners.** This change uses the existing dialogue,
   private context envelope, response guard, and canonical outcome commit.
   It adds no model call, model loop, scheduler, or execution owner.
   `AgentTurnLoop`, `CapabilityExecutionGateway`, and AgentGraph retain their
   respective responsibilities. Published aliases and typo policies remain
   unchanged, and Playbook approvals and write confirmation remain separate.

## Stored-state and verification consequences

Existing task fingerprints remain valid issue descriptions. Their recorded
update turn bounds the question counter; older state is not discarded or
reinterpreted as admitted input. This amendment creates no historical offers,
renews no task expiry, and requires no additional durable store.

Targeted evidence must cover a repeated typo across fresh visitor turns, six
distinct states and duplicate suppression within one turn, stale admission and
checkpoint reuse, canonical replay, unchanged task age and source hashes,
preserved questions and offers, and independent sibling results. Invalid
confirmation metadata must preserve the visitor issue; source-mismatch wording
must not blame the visitor. Expired, closed, incompatible, and uncommitted
context must retain its existing rejection behavior.

These are implementation acceptance criteria. Deterministic checks establish
state and authority behavior; they do not establish that every model question
is useful or certify every API or a production release.
