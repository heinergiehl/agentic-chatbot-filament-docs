# ADR 0031: Typed native read recovery

RC-02's candidate [ADR 0032](0032-source-bound-read-drafts.md) extends local
repair with a stable operation ID. A later result for the same tool settles
only its selected rejected operation, even when two operations are open.

Status: Accepted for RC-01 on 2026-09-26. The runtime implementation is a
candidate pending later slices and user end-to-end testing.

## Decision

The existing native SDK loop remains the only productive turn owner. A
server-produced `AgentToolOutcome`, attached to the current
`AgentConversationState`, supplies execution, input, and next-action facts.
Execution state is set only from a Gateway or Graph outcome. Delivered evidence
alone cannot promote a rejected or unknown invocation to success. The new
`agent_observations.v2` snapshot records input state and result usability
separately. Historical v1 snapshots remain readable.

An empty, truncated, or unexecuted model step may continue a locally
correctable read within the existing two-step recovery and native step limits.
A successful sibling read does not force answer-only formatting while that
repair remains. Two independent local rejections can be offered together.
Materially corrected proposals use normal admission and dispatch; identical
proposals still reuse their existing nonexecution or read outcome. Normal
complete text originally ended without another model step. That sentence is
explicitly superseded by the implemented S3 candidate in
[ADR 0034](0034-public-interpreted-input-and-native-continuation.md): one ordinary
Stop after a locally correctable nonexecuted read may consume a shared recovery
credit. A second Stop ends unresolved work. Genuine input needs, protected
evidence, policy boundaries and unknown effects do not grant this exception.
Unknown effects retain their reconciliation fence.

The productive completion path uses typed server observations for rejection
diagnostics. It does not parse model history for loop decisions. The existing
bounded ToolResult projection is retained only for direct historical diagnostic
compatibility. `agent_execution_event.v3` adds safe local-check, result, and
recovery phases to the existing progress stream. Argument values remain absent
from these events.

## Supersession and compatibility

This decision replaces the global single-rejection repair gate and the
successful-read-to-answer-only rule in ADR 0029's N03 follow-up description.
It also replaces the ambiguous execution-state use for local input rejection
and the generic Connector binding clarification default. The provider finish
reason, SDK continuation signal, Gateway authority, step/usage/deadline limits,
write confirmation, idempotency, and unknown-outcome reconciliation remain.

Runtime ABI v17 is required for new Agent deployments. Previously published
v16 artifacts are immutable and cannot execute under this runtime until
republished. No existing deployment pointer or historical receipt is changed
by RC-01. RC-02 owns persistent source and continuation semantics; RC-04 owns
optional operator recording and access for the new observations.
