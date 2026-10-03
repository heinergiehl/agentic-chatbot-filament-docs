# ADR 0035: Budgeted context and independent read references

Status: Accepted target, 2026-09-30. The user explicitly authorized implementation of Runtime Recovery v3 and its serial execution-chat sequence. K0 starts at `e0d7a69098fca7d374993f0286761b5cadec4277` on `main`, with no predecessor. Earlier statements that only planning was authorized describe the prior state. Target acceptance does not claim implemented runtime contracts, host activation or release acceptance.

## Decision target

The accepted normative target is [Runtime Recovery v3](../archive/plans/runtime-recovery-v3/README.md), contracts C1 through C6. Its [slices](../archive/plans/runtime-recovery-v3/SLICES.md) define the implementation boundary. Existing executable contracts remain the baseline until their owning slice replaces them. Implementation progress is recorded in [STATUS.md](../archive/plans/runtime-recovery-v3/STATUS.md); acceptance does not claim that later slices are implemented.

Preserve ADR 0008 and ADR 0009: one productive turn owner, closed immutable deployments, one Gateway, AgentGraph transitions, confirmation, idempotency, source/scope checks and unknown-outcome reconciliation.

Preserve ADR 0029 native prose and the absence of a general answer reviewer. A result reference does not certify sentences or invent a displayed order.

## Explicit changes relative to existing decisions

| Existing contract | Target delta | First owning slice |
| --- | --- | --- |
| ADR 0034 S2 and current duplicate-only productive compaction | Preserve required draft/offer source turns inside the permitted native window; remove other whole turns under budget pressure. Bind offered provenance only to actual retained visitor history. Existing bound sources remain independently reverified. | K3 |
| ADR 0034 S3 observation snapshot | One source table in the same bounded snapshot; invocation source references instead of duplicated quote fields. Pure historical readers remain. | K2 |
| Current fixed read/RAG projection and forced pending-schema offer | Derive optional projections from remaining request capacity; explicit Lazy schema selection without loss of draft identity. Eager contracts are not silently converted. | K4A/K4B |
| Historical result selection through natural answer text and turn-wide exclusions | Verify individual committed result evidence; distinguish readable result from provable structured presentation. Preserve privacy and fresh authorization. | K5 |
| ADR 0034 S2 interpreted-only compact request control | One collision-free native envelope for current direct Connector/Data Resource reads, independent of field policy; retained protected proof contracts. | K6 |
| One turn-local historical replacement target | Independent per-reference selection within unchanged call, fanout and replay limits; no new persistent ledger. | K7 |

ABI/format changes occur in the first slice that writes or executes the new contract. Later incompatible changes advance the corresponding versions again. Each slice removes the replaced productive path and records its exact version delta. There is no supported dual productive runtime and no in-place immutable deployment mutation.

## Non-decisions

No general interpreted Write policy, no expansion of the accepted schema dialect, no new scheduler, no extra model summarizer, no new broad result-reading tool, no unbounded catalog and no parallel external reads. Protected input provenance never comes from summaries or ordinary assistant text.

## Verification and activation

Characterize changed behavior and retain its safety intent. Test the actual native projection, admission and dispatch, not only independent helpers. Existing successful reads remain evidenced after sibling failures; stale references and missing originals never grant access. A true minimum-context overflow still terminates safely.

Package verification, host acceptance and activation are recorded separately. A live host linked to this checkout must not execute across an incompatible code update. Drain or reconcile active work under its exact release before a later host cutover. Planning and package commits do not authorize live mutations.
