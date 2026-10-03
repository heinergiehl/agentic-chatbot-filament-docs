# ADR 0004: Lossless release-bound entry agendas

- Status: Superseded in representation by ADR 0006
- Date: 2026-07-26
- Decision scope: Idle workflow entry turns containing more than one conversational act
- Extends: ADR 0001, ADR 0002, and ADR 0003

## Context

Users naturally combine independent requests in one message. Reducing such a
message to one classifier label silently drops work. Independently dispatching
several workflow starts creates competing state owners, loses ordering, and can
accidentally couple capability data. Letting a model choose arbitrary nodes or
tools would also violate the rule that semantic interpretation proposes while
deterministic contracts authorize.

The production runtime needs lossless compound-read behavior without widening
write authority, bypassing the immutable deployment, or introducing a second
workflow engine.

## Decision

1. **One exhaustive semantic proposal.** Entry understanding contract v4 emits
   an ordered list of at most four acts. Every act cites a literal source span,
   disposition, relationship, route proposal, and bounded slot proposals.
   Uncovered meaningful text, overlapping or reordered spans, undeclared
   routes, duplicate executable routes, and unsupported combinations clarify
   without dispatch.
2. **Deterministic admission.** Only independent supported read acts may form an
   agenda. Mixed read/write, dependent, alternative, ambiguous, or unsupported
   acts do not partially execute. Existing single-act behavior remains the
   normal path.
3. **Immutable release binding.** Every agenda item is bound to an exact
   published classifier route, reachable target, read-only branch, and the
   canonical release-contract hash. Command handling re-resolves the authorized
   deployment by ID and hash and verifies the same contract before graph
   execution.
4. **One workflow run and one AgentGraph owner.** The runtime starts one
   verified workflow run. AgentGraph executes agenda items sequentially by
   returning to the bound classifier node through explicit `goto` transitions;
   an admitted item never invokes a second classifier model call.
5. **Isolated act state.** Every act starts from the same bounded baseline.
   Capability results and ordinary workflow variables from one act do not flow
   into the next. Only protected runtime authority and bounded presentation
   outcomes cross act boundaries.
6. **Complete coverage.** A failed read records a typed failed outcome and does
   not drop later independent reads. Completion records expected count, covered
   count, and one terminal status per act. Missing coverage is not a successful
   turn.
7. **One composed assistant answer.** Intermediate branch messages are not
   persisted as visitor-visible bubbles. The final ordered outputs are joined
   once and committed through the existing canonical turn-outcome path.
8. **Typed recovery language.** Capability failure categories map to a closed
   response-intent vocabulary rendered in the current turn language. Connector
   declarations may select only allowlisted intents; they cannot provide
   executable recovery logic or arbitrary user-facing failure text. Unknown
   write outcomes remain fail-closed and require reconciliation.
9. **No new authority.** `CapabilityExecutionGateway` remains the only
   productive external execution boundary. AgentGraph remains the graph-state
   authority. Transport and rendering do not gain workflow transitions.

## Verification

- Contract and policy tests cover literal exhaustive admission, connector-only
  residue, invalid routes, duplicates, and mixed unsafe turns.
- Planner tests prove all-or-nothing agenda authorization against the immutable
  release.
- AgentGraph tests prove ordered execution, state isolation, no inner
  reclassification, failure-then-success continuation, and exact coverage.
- Endpoint tests prove one combined response, one run for a compound turn, and
  a correct follow-up turn in the same conversation.
- Connector tests prove localized typed failures and fail-closed unknown writes.

## Consequences

Compound read requests now behave like one coherent conversation turn without
granting compound write authority. Some mixed or dependent requests require a
clarification; that is an explicit safety decision rather than silent task
loss. Supporting compound writes later requires a separate ADR covering
transaction, confirmation, compensation, and partial-success semantics.
