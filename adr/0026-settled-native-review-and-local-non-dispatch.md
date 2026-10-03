# ADR 0026: Settle a complete native step before independent answer review

Status: **Accepted for the bounded Candidate 165 reliability slice.**
Date: 2026-09-23.

## Context

The installed Laravel AI loop calls the package's final-answer hook inside
`generateTextStep` and emits `StepCompleted` only after that method returns.
ADR 0025 therefore retained the productive model reservation during a nested
tool-free answer review. Candidate 165 Row A exposed the consequence: a
separate reviewer could reserve and reach HTTP middleware before the completed
productive response was settled. A local incremental-run guard correctly
stopped that next request. The rejected review reservation then entered
`reconciliation_required` even though the reviewed middleware throw happened
before transport dispatch.

## Decision

When a complete native provider response reaches the answer hook and an
eligible review is about to invoke its verifier, the existing per-step usage
tracker settles that productive response first. It uses the same native receipt,
frozen tariff, budget periods and invocation/step identity as `StepCompleted`.
The later SDK event must match the settled step and usage and cannot settle it
again. A missing or unpriceable productive receipt stops the invocation before
the separate review; it remains reconcilable. Ordinary steps without a verifier retain their
existing `StepCompleted` settlement path. No usage listener owns tool execution,
answer meaning or turn transitions.

This replaces only ADR 0025's rule that the enclosing reservation remain open
through nested review. It also narrows the stream-abandonment rule: once the
fully drained provider response has a complete persisted receipt before review,
abandoning its later presentation cannot erase that settlement. Abandonment
before a complete response or receipt still requires reconciliation. Bounded
text quarantine, review allowance, safe fallback, tool closure, deadline and
canonical outcome contracts remain unchanged.

An operator may resolve a registered **local pre-dispatch** guard rejection
without fabricating a provider receipt. The proof binds the call, run and row
to a product-recorded throw-site fingerprint, the reviewed source commit and
the exact attempt report, which must exclude that call from admitted wire
requests. A separate append-only encrypted audit, reviewed call version and
atomic budget update record the zero-dispatch outcome. This proof type is
registered only for the Row A middleware site in commit `b755511d`; other
unknown calls, including 3714, retain their reservation and ordinary receipt
reconciliation. No provider timeout, lost response or missing receipt alone
qualifies as non-dispatch.

## Verification and migration

Deterministic tests cover the nested reviewer observing a settled productive
call, no reviewer dispatch on missing productive usage, sync and stream
invocation cleanup, and the local proof's wire exclusion, version, zero amount,
budget release and immutable audit. The new audit table is additive. A local
host migration must run before the reviewed operator resolution of call 3762.
No earlier unknown call is changed by that migration.

## Extension: serialized guard evidence and bounded review input

The local Candidate 165 harness now measures the SDK-serialized PSR request in
its existing request middleware. A 40,000-byte limit applies to that complete
Gemini request only. The guard reports the actual byte count, byte limit, phase
and a private body digest when it rejects before returning a request to the HTTP
handler. The unchanged PSR request is forwarded on admission. The 48,000-byte
compact review payload limit remains a separate product boundary; neither
limit is a universal provider policy.

A new local rejection report records the pending usage call, concrete attempt,
stage, turn, invocation, model step, throw-site fingerprint and request digest.
The operator adapter requires one matching rejection, unchanged guard source,
the exact report hash, no admitted wire request for that call, and settled prior
calls. It does not infer non-dispatch from a missing request ID or log event.
Timeouts and earlier possibly dispatched attempts remain unknown. The generic
reconciliation service still locks the call, checks its reviewed version and
writes an encrypted audit in the same transaction as the zero settlement.

The historic Row A proof remains bound to its original `b755511d` throw site
and v1 evidence hash through a dedicated Candidate 165 adapter. It does not
apply that fingerprint to a later call such as 3766. The general evidence and
accounting core contain no Candidate ID or report path selection. A new
source site requires its own reviewed adapter and transport-order proof.

Shared support contexts in the review input are factored only when identical.
Every reference resolves to the original context, including field units,
periods and source qualifiers. The answer text, visitor sources and pending
revisions remain in the bound review context. An oversized complete request
stops at the guard and follows the existing failed-review finalization path;
the local proof alone does not release its reservation without operator review.
