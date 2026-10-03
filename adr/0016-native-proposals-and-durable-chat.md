# ADR 0016: Native proposals and durable chat delivery

- Status: Accepted implementation target; acceptance in progress.
- Date: 2026-09-12
- Mandate: Explicit continuation after the runtime research and simplification review.
- Extends ADR 0015 and preserves ADRs 0008/0009 authority and side-effect rules.

## Decision

The native capability tool accepts a complete or incomplete proposal. Its
published execution contract stays strict. Missing or ambiguous user inputs
create a canonical pending task before a question is delivered, through the
same admission path as a complete proposal. Remove the separate native
Connector clarification catalogue and its duplicated input schemas.

An active Playbook waitpoint exposes a bounded semantic decision: provide its
answer, approve, reject, or defer to normal conversation. The native SDK's
first-step tool choice requests that decision; existing source, scope and
payload admission still authorizes any transition. Deferral does not resume,
cancel or approve. An ordinary conversation with no waitpoint has no mandatory
decision or planning tool.

Laravel AI owns the native model/tool loop, tool call correlation and step
options. AgentGraph owns Playbook transitions and durable external waits.
The capability gateway remains the only productive external effect boundary.
Provider adapters only fill characterized wire or accounting gaps.

Durable chat admission and asynchronous execution use the existing ChatTurn
identity and revision/lease rules. Queue redelivery is not permission to replay
an external effect. Public progress is a redacted persisted projection and
rechecks conversation authorization. Final content remains committed before
delivery. Browser lifetime never determines the outcome of an accepted write.

Connector dependencies are explicit published input-to-context mappings.
Authorized context corrections invalidate dependent retained inputs and stale
offers; source names never imply a domain-specific dependency. Visitor read
prohibitions apply at the gateway as well as the native tool adapter.

Answer reference copying is optional only when verified current evidence
uniquely identifies a request. Shared current source and exact quotes allow a
combined semantic coverage review, with separate claim verdicts, request state
and execution authority. Canonical successful empty-query evidence cannot be
used to clear failed or unresolved sibling work. These changes do not waive
semantic review or normal candidate release checks.

## Verification

Characterize partial proposals, source-bound continuations, corrections,
approval rejection/deferral and unknown effects. Verify the native first-step
choice is released by the SDK. Check async admission, duplicate delivery,
authorization changes, worker failure and reconnect against actual effects.
Use the synthetic live dialogs only within the separately authorized budget.
No release/readiness claim follows from this architecture decision alone.

The local candidate remains inactive: the final compound live answer failed
semantic review, and public-browser reconnect and confirmed write/readback
acceptance remain unrun. See [the evidence map](../archive/CHAT_RUNTIME_ACCEPTANCE.md).
