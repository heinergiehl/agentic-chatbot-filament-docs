# ADR 0011: Explicit confirmation of Connector input choices

- Status: Accepted
- Date: 2026-09-08
- Decision scope: Visitor confirmation of a displayed spelling suggestion for a direct read-only Connector input
- Extends ADR 0010 with composite input provenance; preserves the authority boundaries of ADRs 0008 and 0009

## Context

A published input alias can identify a useful spelling suggestion even when
the visitor's text does not satisfy the operation's literal or typo policy.
The runtime may ask whether that published value was intended. A later reply
can explicitly accept the suggestion without repeating its exact spelling.
Requiring the stateless literal binder to infer the value from that reply
either rejects a valid clarification or weakens the published input policy.

ADR 0010 correctly prevents generated questions from becoming visitor input.
This decision adds a distinct proof: an exact published value, a server-created
offer that reached the canonical answer, and a later visitor decision referring
to that offer. Neither the question nor the model's proposal supplies this
proof alone. This is an accepted implementation contract, not a claim that its
implementation or release verification is complete.

## Decision

1. **Offer one bounded, published choice.** An offer may be created only for a
   public, non-sensitive string input of a deployment-pinned direct read-only
   Connector. The existing suggestion assessment must yield exactly one safe
   published alias target. Ambiguous alternatives, unknown values, provider
   suggestions, and model-created aliases do not enter this confirmation path.
   The value must still satisfy the exact pinned input schema.
   This bounded path accepts only literal source policies. Inputs that require
   a resolver retain their existing admission and cannot use confirmation to
   bypass resolution.

   The pending task stores a server-generated offer ID, input field, exact
   canonical value, bounded question, and originating turn ID. The offer is
   bound to its exact task, unresolved issue fingerprint, capability pin,
   original visitor source, and enclosing deployment and authority scope.
   These bindings may reuse the validated task and context envelope; an offer
   ID by itself is insufficient. Labels and question wording cannot substitute
   another value. At most one active offer applies to the pending field, within
   the existing task and envelope limits.

2. **Require actual canonical question delivery.** Recording a question or a
   suggestion diagnostic before rendering does not make the offer confirmable.
   The response guard emits the exact server-created question. At the existing
   canonical outcome commit, the ledger retains that turn's offer only when the
   complete question is included in the final persisted assistant content.
   Omitted, truncated, or replaced questions leave no confirmable offer.

   The offer's originating context must be committed and bind the persisted
   assistant message ID and content hash. Later validation checks that same
   canonical content and the complete offered question. This proves inclusion
   in the canonical answer, not that a person read it or that a transport
   acknowledged delivery. JSON, SSE, and recovery use the same committed offer;
   replay cannot generate a new choice or a fresh offer identity. An offer
   created during the current turn cannot be accepted before a later visitor
   reply, including through the current-turn checkpoint exception in ADR 0010.

3. **Let the model propose a closed selection.** The existing turn model may
   propose confirmation through an intrinsic control such as
   `__input_confirmation`, naming the exact offer ID and supplying the complete
   current visitor message as reply evidence. The selected task, field, and
   value are resolved from validated server state. These controls never enter
   the provider payload and cannot create a new task from an orphaned reply.

   The proposal must concern acceptance of that offered input. Repeating the
   typo, discussing a name, rejecting a suggestion, or answering another task
   does not itself select the offer. Where several unresolved tasks make an
   acknowledgement ambiguous, the current reply must contain a verified
   literal or published suggestion reference to the chosen offer. A bare
   acknowledgement cannot select among those tasks. Such a reference only
   disambiguates the offer; it does not independently admit the input or relax
   its typo policy.

   Full-message evidence binds the proposal to the visitor's actual current
   turn and prevents selectively quoting an affirmative fragment. It does not
   mathematically prove the model's interpretation. Deterministic validation
   authorizes only the bounded published target and its verified provenance;
   the model still proposes meaning. No additional model call is mandatory,
   and a second classifier would not be an independent authorization proof.
   Ambiguous dialogue remains a quality risk requiring representative tests.

4. **Store a distinct confirmed source.** An accepted choice uses an explicitly
   typed `confirmed_offer` source. It binds the visitor's acknowledgement
   message ID and full source hash to the original offer turn and offer ID,
   exact task, field, and canonical value. The original committed offer and
   its source and assistant-message bindings remain independently verifiable.
   The runtime must not fabricate literal source text containing the canonical
   value or treat assistant content as a user message.

   Both the tool adapter and execution gateway independently validate the
   composite proof against the current immutable pin and fresh authority.
   Future retained-input restoration performs the same checks; it cannot
   downgrade a confirmed source to an unchecked canonical value. The stateless
   binder continues to reject an acknowledgement without that proof. Other
   inputs and conditions retain their existing sources and validation, and a
   rejected replacement cannot silently restore an older value.

5. **Preserve lifecycle and execution boundaries.** Offers apply only to a
   live matching task and its unresolved issue. An invalidated or superseded
   offer cannot confirm a different state. Completed and cancelled tasks stay
   closed. Expiry starts at the task's original creation time under ADR 0010;
   creating, displaying, or accepting an offer does not renew it or reset the
   current visitor turn's question budget. Under
   [ADR 0012](0012-turn-scoped-connector-recovery.md), a later freshly attested
   visitor turn has its own question budget, without granting choice authority.
   Progress from a valid choice can resolve its field while other unresolved
   fields remain pending.

   The same conversation, bot, deployment ID and hash, context area, attested
   scope, source ordering, canonical commit, and bounded recovery checks apply.
   Missing, edited, expired, uncommitted, or incompatible proof fails closed
   without searching older questions for a replacement. Reuse and execution
   replay still require the exact admitted inputs and conditions.

   `AgentTurnLoop` remains the conversation owner and
   `CapabilityExecutionGateway` the external execution boundary. This choice
   does not grant capability access, authorize a write, satisfy a Playbook
   approval, alter AgentGraph state, or establish provider result identity.
   Existing schema, result, redaction, budget, and failure checks remain in
   force after input selection.

## Publication and stored-state consequences

The confirmation path uses aliases already present in the exact immutable
operation and Agent pin. It adds no mutable lookup, inferred alias, or change
to published `literal` or `typo_tolerance: none` behavior. Automatic correction
still requires the published policy. An explicitly confirmed offer is a
separate input provenance path under this decision. New or changed aliases and
other operation contracts still require normal publication; runtime metadata
does not rewrite existing deployment hashes.

The private connector-context format must explicitly validate its optional
offer and confirmed-source members, including closed shapes and size bounds.
Existing snapshots without an offer retain only their existing ADR 0010
meaning. Historical question text, old diagnostics, answer receipts, and
provider output cannot be backfilled into offers or confirmations. Unsupported
or malformed confirmed-source state fails closed; it is never coerced into a
legacy literal source. This extension needs no separate pending-interaction
store, scheduler, or graph waitpoint. Existing Chat Turn retention and rollback
requirements apply to its encrypted state.

## Verification boundaries

Deterministic acceptance evidence must cover:

- An eligible singleton suggestion is fully shown, explicitly selected in a
  later turn, and verified independently at adapter, gateway, and restoration.
- A missing or truncated question, same-turn acknowledgement, historical
  question, forged offer, changed canonical content, or mismatched task, field,
  issue, pin, source, conversation, scope, or deployment cannot supply input.
- Expired, completed, cancelled, superseded, and incompatible state cannot be
  revived; repeated offers do not renew expiry or the same visitor turn's
  question budget. A later visitor turn follows ADR 0012.
- Stateless acknowledgements, unknown aliases, ambiguous suggestions, sensitive
  inputs, and writes remain outside this path. Existing literal and automatic
  typo admission retain their published behavior.
- Independent pending fields and conditions survive a valid choice; failures
  retain their own diagnostics; canonical replay preserves the same offer and
  exact admitted invocation.

Semantic scenarios must separately exercise affirmation with surrounding text,
negation, quotation, conditions, repeated misspellings, and acknowledgements
addressed to another open task. Model interpretation quality and live provider
behavior are distinct from deterministic state and authority correctness.
Passing local tests does not certify arbitrary dialogue or a production release.
