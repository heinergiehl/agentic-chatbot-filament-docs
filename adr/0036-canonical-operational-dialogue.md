# ADR 0036 Canonical operational dialogue

Status: Target accepted by the user's explicit implementation order on 2026-10-01. Package implementation and host acceptance are recorded separately in the dialogue quality implementation status. This decision does not assert model suitability or production release.

## Decision

Implement the bounded operational presentation contract in the [implementation plan](../archive/plans/2026-10-01-runtime-dialogue-quality-implementation.md). Preserve ADRs 0008, 0009, 0034 and 0035: one AgentTurnLoop, one Gateway, immutable closed deployments, existing encrypted draft state, AgentGraph task authority, two shared recovery credits and no parallel external reads.

This narrowly supersedes ADR 0029's unchecked native prose projection for turns with unresolved local rejection, actual missing capability input, failed or uncertain execution, pending operations, no-match evidence or a native status selection. These turns are composed from canonical outcomes and execution-matched delivered evidence. Free model prose is withheld completely on this path, including its stream events. This is a pure projection, not a semantic reviewer or tool dispatcher. Successful ordinary answers and explanations retain native prose.

The native `inspect_conversation_status` control reads existing scoped draft and verified historical execution projections. It creates no work, authorization, second ledger or external effect. Like capability description, its bounded schema is part of native deployment composition and publication budgeting. Historical receipts retain their time basis and never become current jobs. Failure to choose this control remains a semantic routing failure to be measured, not something inferred from answer prose.

Committed question delivery, exact task revision, scope, expiry and source checks remain authoritative. The prompt exposes the already verified delivery reference and asks only when competing interpretations materially change the action. No confidence threshold, word-matching intent router or implicit latest-task inheritance is introduced. Public searchable inputs and localized aliases require explicit immutable publication; no runtime vocabulary branches or global lookup fallback.

Repair eligibility distinguishes a demonstrably correctable source proposal from missing protected evidence. It does not grant access or change literal admission. Unknown outcomes always retain reconciliation. Identical rejected proposals, successful sibling calls and canonical delivery retries retain their existing replay behavior.

Citation syntax with no resolvable source is removed from public presentation; ordinary numbers, Markdown links and code examples are preserved. Canonical outcome persistence still precedes transport. Lifecycle diagnostics include nonexecuted local outcomes separately from real dispatches.

## Versions and migration

For a newly admitted missing public field, generate a bounded question from its
published safe title and capability label when no valid question already exists.
Sensitive or injected metadata, inert tasks and exhausted question budgets cannot
create a question. Generation is not delivery: only canonical commit of the actual
question binds it for continuation. Unresolved tasks alone do not replace unrelated
greetings with an operational answer.

Operational data presentation uses at most 12 evidence blocks, 24 facts per block,
12 children per collection, four nested levels and 240 bytes per scalar. It
discloses abbreviation and omitted result windows. Only explicitly pinned decoder
proof metadata is omitted from prose; its receipts and binding checks remain
intact. Empty display data cannot prove no-match. No-match requires the published
complete successful result-window contract; partial or failed responses cannot
establish it. Mixed knowledge failures remain visible alongside successful reads.

Current retrieved-source cards have a pure projection from bound receipts and the
immutable manifest, reused by the finalizer and offline collector. Historical
cards require independent historical evidence. Private diagnostics may retain a
validated task operation reference; public lifecycle projection deduplicates only
the exact task and status, not other tasks sharing a capability.

The first package candidate advances Agent runtime ABI to v33, compiler ABI to v18, native projection to v18 and Observation to v5. Observation v5 adds the server-owned operation correlation and a bounded reason code, allowing a later successful repair to settle only its own earlier rejection. Pure historical v1 through v4 readers remain. Connector context v6 and historical presentation readers remain unchanged. Operational diagnostics derive from existing typed observations; they are not another state owner.

Drain active host work before incompatible code cutover. Existing artifacts are not rewritten and require normal republication, candidate verification and activation. No compatibility executor or automatic activation is added. Package verification, host semantic acceptance and activation must be reported separately.

## Verification

Characterize rejection plus invented progress, mixed successes, missing inputs, no-match, provider failure, unknown effects, real pending and empty status. Test canonical finalization and stream suppression together. Verify stale delivery references and source expiry still fail closed. Run the fixed multi-turn dialogue families against the exact selected candidate; green deterministic suites alone do not certify semantic completeness.
