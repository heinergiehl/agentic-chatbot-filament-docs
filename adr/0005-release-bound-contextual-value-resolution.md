# ADR 0005: Release-bound contextual value resolution

- Status: Accepted
- Date: 2026-07-26

## Context

Workflow entry previously admitted only literal values from the current message. Completed read turns exposed a task frame, but only one primary slot was continuable and no productive boundary could safely resolve expressions such as “tomorrow”, “ten minutes later”, or “five euros more”. The model could recognize the meaning, yet copying or calculating an executable value inside the model would bypass release contracts, typed validation, and provenance.

## Decision

The existing workflow-entry understanding owner remains the only semantic owner.

- The model may mark a turn as a clear task-frame continuation and emit bounded typed value proposals. It does not calculate executable values.
- Every published slot has a hash-bound value policy declaring its type, accepted sources, carry-forward rule, and closed operator allowlist.
- Completed read task frames retain only policy-approved scalar values and bind them to the immutable deployment and capability-contract hashes.
- A deterministic operator catalog evaluates the approved standard operations for date, date-time, time, duration, decimal, and money values.
- Policy-produced values retain source, operator, operand, task-frame, and contract provenance. Literal slot admission and canonical validation still run before workflow execution.
- Missing, stale, ambiguous, invalid, or unsupported context produces a targeted clarification. It never falls through to a global route list or silently reuses a value.
- External or domain-specific calculations remain capabilities executed through `CapabilityExecutionGateway`; the local operator catalog is side-effect free.

## Consequences

Capability contract version 2 and workflow-entry understanding contract version 7 are cutover contracts. Published deployments must be rebuilt to opt into contextual resolution. Old task frames have no valid release binding and are intentionally not reused.

Adding another standard operation requires a deterministic typed implementation, a compatible slot-policy projection, bounded structured-output vocabulary, and regression coverage. It does not require another planner or API-specific conversational branch.
