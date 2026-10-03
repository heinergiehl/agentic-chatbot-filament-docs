# ADR 0003: Literal-bound multi-act waitpoint proposals

- Status: Accepted
- Date: 2026-07-25
- Decision scope: Workflow Turn Understanding at an active waitpoint
- Extends: ADR 0001 and ADR 0002; it does not weaken their execution-authority invariants

## Context

Real user turns frequently contain more than one conversational act. A customer
may answer a pending field and ask why it is needed, correct an earlier value,
or cancel the current task while naming later work. Reducing such a turn to one
lossy label produces brittle conversation UX. Allowing a model to execute every
recognized act would instead create overlapping state authority and unsafe
compound mutations.

The existing waitpoint contract already represents current answers, additional
declared slots, corrections, side questions, confirmation controls,
cancellation, and residual requests. The production boundary needs to make
their combined meaning and authorization limit explicit.

This ADR supersedes the narrower statement that waitpoint semantic
understanding may propose only a side-question kind and language. That rule
remains true for model-authored explanatory facts: only the closed
side-question kind and current language may influence the deterministic
explanation responder.

## Decision

1. **One multi-act proposal, one authorization owner.** A bounded semantic
   interpreter may return several typed conversational acts from the latest
   user turn. The closed `intent` field identifies exactly one dominant act for
   deterministic policy; additional typed fields are evidence-bearing
   candidates, not commands.
2. **Closed acts.** Waitpoint proposals are limited to current answer,
   additional declared slots, correction, side question, approval, rejection,
   workflow cancellation, separate new request, and ambiguity. No model-chosen
   node, tool, capability, workflow, or command is admitted.
3. **Literal binding.** Every value candidate, correction, and residual span
   must cite text present in the latest user message. Missing or invented
   evidence fails closed. Deterministic slot schema, validation, provenance,
   confirmation, deployment, and policy checks remain authoritative.
4. **Deterministic dominance.** Explicit workflow cancellation dominates all
   other acts. A separate new request is deferred while the current workflow is
   open. A side question or qualified confirmation holds the waitpoint.
   Corrections and current answers are considered only when no higher-priority
   act owns the turn. Ambiguous combinations clarify.
5. **At most one mutation.** Policy may authorize at most one workflow-state
   transition for a user turn. A read-only protocol answer may accompany that
   decision, but cannot authorize another mutation or capability call.
6. **Answer plus side question.** The deterministic responder answers only from
   the authoritative pending-input contract. The workflow remains paused and
   recognized answer or correction candidates stay unapplied. The response
   states this explicitly and directs the user to the still-open workflow
   input. It never echoes a sensitive candidate merely to prove recognition.
7. **Task switching.** There is one active task and one active waitpoint. A new
   request never replaces the active workflow or starts another run in the same
   turn. Cancellation may carry one literal residual request for bounded
   follow-up handling; replacement requests remain forbidden.
8. **Existing runtime authorities remain closed.** AgentGraph owns graph state,
   interrupts, and resume. `CapabilityExecutionGateway` remains the only
   productive external capability boundary. Rendering and transport do not gain
   domain-state transitions.
9. **Hard pre-1.0 contract cutover.** Contract version 3 is the only productive
   waitpoint interpretation contract. There is no productive v2 fallback,
   second router, or parallel state machine.

## Verification

- Unit tests characterize mixed-act normalization, literal-evidence rejection,
  dominance, and the single-mutation policy.
- Runtime tests prove that mixed answer-plus-question turns return one
  read-only protocol step and preserve the AgentGraph waitpoint.
- Provider evaluations cover entry turns, qualified confirmations, mixed
  waitpoint turns, cancellation with residual work, and new-request deferral.
- Release evidence must distinguish deterministic controls from turns that
  actually invoke provider interpretation.

## Consequences

Natural-language understanding can preserve the full meaning of a turn without
gaining execution authority. Some mixed turns intentionally require an
explicit follow-up confirmation; that is the safety boundary, not an
interpretation failure. Richer UI affordances may submit a payload-bound
confirmation later, but may not bypass the same pending-interaction and
AgentGraph binding checks.
