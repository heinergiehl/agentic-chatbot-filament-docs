# ADR 0001: Production runtime boundaries

- Status: Accepted
- Date: 2026-07-12
- Decision scope: production hardening goals G00-G25
- Superseded in part: ADR 0008 replaces decisions 1 and 3 with one live Agent deployment and optional deployment-pinned Playbooks. The deterministic authorization, immutable deployment, fail-closed, and gateway boundaries remain accepted.

## Context

The package already has durable AgentGraph execution, workflow deployments,
side-effect confirmation, idempotency, and connector safeguards. Its remaining
production risk comes primarily from overlapping runtime authorities and
compatibility fallbacks. Those paths make the effective contract harder to
prove than the individual mechanisms suggest.

## Decision

The production architecture follows these boundaries:

1. A bot has exactly one active main workflow deployment. Drafts, historical
   deployments, and versions may coexist, but only one deployment is live.
2. Subworkflows are version-pinned modules of that deployment. A parent
   deployment owns the transitive child deployment closure, including hashes,
   input/output contracts, and aggregated side effects.
3. `workflow_bound` is a closed runtime profile. It cannot fall through to a
   general assistant, global tool registry, or recursive workflow tool entry.
4. Semantic interpretation proposes meaning. Deterministic policy authorizes
   targets, capabilities, data access, side effects, and state transitions.
5. Production workflow execution is deployment-only. Mutable authoring data is
   never a runtime fallback when a deployment is missing or unreadable.
6. Runtime decisions fail closed. Unknown, missing, unregistered, stale, or
   unprovable state produces a typed, redacted outcome.

## Enforcement

`docs/architecture-hardening-exceptions.json` is the temporary, machine-readable
exception register. `ProductionHardeningArchitectureTest` pins every admitted
legacy occurrence to a removal goal and prevents the legacy surface from
growing. An exception is removed in the same commit that removes its final
occurrence. The same gate token-scans Application, Domain, and Services for
global `app()` / `resolve()` helper calls. Pre-existing dependency debt is
fingerprinted per file, may only shrink, and must reach zero before 1.0 release
certification; method calls and framework composition-edge code are not
misclassified as global helpers.

## Consequences

- Runtime hardening is delivered one invariant and one reviewable commit at a
  time; no compatibility bridge is introduced merely to keep two productive
  architectures alive.
- Provider transport compatibility and read-only historical readers may remain
  when they do not create an alternative authorization or execution path.
- Breaking removals wait for migration evidence and a documented release window.
