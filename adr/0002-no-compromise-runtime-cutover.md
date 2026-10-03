# ADR 0002: No-compromise runtime cutover boundaries

- Status: Accepted
- Date: 2026-07-16
- Decision scope: Runtime/workflow refactor phases 1-8 and findings RW-01 through RW-18
- Extends: ADR 0001; it does not weaken any ADR 0001 invariant
- Superseded in part: ADR 0008 replaces decision 1's workflow-first ownership with the Agent-first runtime. Decisions 2 through 7 and the one-runtime/no-compatibility intent remain accepted.

## Context

The accepted runtime audit selected a workflow-first end state but left several
cross-cutting choices to a Phase 1 ADR amendment. The current implementation
still has more than one productive runtime, a full `WorkflowRun` state merge
into AgentGraph resume, non-enforced parent/child cancellation claims, a broad
accidental PHP/configuration surface, and productive compatibility paths.

The package is pre-1.0. Breaking PHP and configuration changes are acceptable,
but persisted customer data, active deployment meaning, authorization, audit
history, idempotency, recovery, and historical run inspection are not.

## Decision

1. **One productive runtime.** Every live bot executes exactly one immutable,
   hash-verified main workflow deployment. Simple Assistant and Knowledge
   Assistant are starter workflow deployments, not top-level runtime profiles.
2. **Structured concurrency.** A child workflow cannot productively outlive its
   parent. Parent cancellation and timeout cascade through the transitive child
   run tree. Independent work receives a new top-level run identity.
3. **AgentGraph state authority.** AgentGraph checkpoints and interrupts own
   graph-backed state. Laravel projections may submit only a typed, validated,
   deployment-, checkpoint-, and interrupt-bound input patch. They cannot merge
   a complete execution snapshot into resume.
4. **One public extension path per category.** The supported public surface is
   an explicit allowlist covering panel-scoped Filament configuration,
   declarative capability/action providers, host policy/authorization ports,
   supported channel/transport ports, genuine provider/storage ports, selected
   events, immutable read DTOs, and canonical host settings. All other symbols
   are internal or removed.
5. **Hard pre-1.0 cutover.** Productive legacy, compatibility, fallback, shadow,
   V1, and dual-authority paths are physically removed after characterization
   and migration proof. The released result contains no productive transition
   bridge.
6. **Durable migration envelope.** Every durable or serialized-contract change
   has a dry-run classification, stable failure report, verification query, and
   tested restore procedure. Ambiguous data is quarantined or blocks the
   cutover; it is never silently discarded or executed through a fallback.
7. **Historical inspection is read-only.** Historical readers and presenters
   may remain when explicitly allowlisted. Historical writers, routers, resume
   paths, and executors do not.

## Enforcement

- Phase 1 evidence must be complete before a destructive production cutover.
- Each cutover slice removes its temporary bridge and its architecture
  exception in the same commit.
- Forbidden-path tests prove that deleted symbols, configuration keys, and
  runtime choices cannot be resolved or re-enabled.
- `docs/PUBLIC_API.md` becomes the final executable allowlist in Phase 7.
- A required external/provider/host gate reported `BLOCKED` prevents completion;
  `SKIPPED` and `BLOCKED` are never reported as `PASSED`.

## Consequences

- Existing 0.x consumers receive an explicit upgrade mapping instead of a
  compatibility facade.
- Deployment hashes can change only through a classified republish migration.
- Old runs remain inspectable even when their productive implementation no
  longer exists.
- The package remains a Laravel modular monolith; this decision does not add a
  generic command bus, plugin-level checkpoint engine, or microservice split.
