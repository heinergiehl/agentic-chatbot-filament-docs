# ADR 0006: Authorized Turn Plan and connector contract v3 cutover

- Status: Accepted
- Date: 2026-07-28
- Supersedes: ADR 0004's `AuthorizedReadAgenda` representation and the productive Compound Request runtime
- Extends: ADR 0001, ADR 0002, ADR 0003, and ADR 0005

## Context

Natural messages can contain several objectives and repeated inputs for one
objective. Treating every value as a separate conversational act loses the
difference between “three tasks” and “one task for three items”. The former
Compound Request lifecycle also duplicated planning, persistence,
confirmation, graph execution, and response ownership already provided by the
workflow runtime.

API-specific entity fixes are not a scalable answer. Every published connector
needs the same declarative mechanism for admissible input, aliases,
normalization, ambiguity, result identity, and bounded batch behavior.

## Decision

1. **One executable plan.** An admitted multi-act entry is represented as
   `Authorized Entry Turn Plan` version 2. It contains ordered tasks and ordered
   items. Repeated values for one route are items of the same task; distinct
   user objectives remain distinct tasks.
2. **Two exact release hashes.** The plan binds both the immutable workflow
   release-contract hash and its capability-contract hash. Route bindings
   verify the former; admitted slot contracts verify the latter.
3. **Deterministic dispatch.** AgentGraph owns plan cursor, item isolation,
   transition, recovery, outcome coverage, and final ordered composition. A
   plan item carries its already authorized route and is never classified
   again by an inner node.
4. **All-or-nothing admission.** Every executable task must be independent,
   read-only, release-declared, input-valid, and within the bounded item limit.
   Unsupported, mixed, dependent, ambiguous, or partially covered input
   clarifies before execution.
5. **One external boundary.** Every item still dispatches through
   `CapabilityExecutionGateway`. The plan does not grant a new connector,
   action, write, retry, or confirmation authority.
6. **Connector contract v3.** Published API operations declare:
   - `batch_mode`: `single_only`, `fanout_safe`, or `native_batch`;
   - a bounded `max_items`;
   - one input policy per public input, including semantic/entity type, source,
     exact-source rule, normalization, aliases, and ambiguity behavior;
   - optional result-identity evidence binding requested canonical values to
     provider response fields.
7. **Typed identity outcomes.** Provider success is usable only when declared
   result identity is verified. Mismatch, ambiguity, and missing identity are
   typed failures; no API-specific conversational fallback may reinterpret
   them.
8. **One authoring primitive.** Explicit collection traversal is `batchMap`.
   It is a normal AgentGraph workflow node with bounded collection size,
   isolated iteration variables, ordered outputs, and `batchMap`/`done`
   transitions.
9. **Physical cutover.** The Compound Request model, tables, services, node,
   configuration, and graph runtime are removed. The old `loop`,
   `apiConnector`, and `compoundRequest` deployment shapes are retired and must
   be republished into the new runtime contract.
10. **One semantic owner for follow-ups.** Workflow-entry understanding v8 may
    propose declared result-set operation keys with an explicit result-set
    reference. Deterministic policy verifies freshness and resource roles,
    constructs the query patch, binds it to the selected start step, and allows
    exactly one matching Data Resource action to consume it. The former
    conversation turn-act classifier and task-frame continuation router are
    removed.
11. **No compatibility runtime.** The migration may read old persisted
    connector metadata to create v3 revisions, but productive code never
    accepts a v2 operation contract or dispatches an old node.

## Migration

`2026_07_28_000002_cut_over_authorized_turn_plans_and_connector_v3.php` is
irreversible. It upgrades drafts, creates a new immutable published v3 revision,
preserves result-identity declarations, derives safe literal input policies,
converts legacy batch declarations to bounded fan-out, retires incompatible
deployment pointers and active runs, removes Compound Request configuration,
and drops Compound Request persistence.

Deploy in a maintenance window after a database backup. Republish every retired
workflow before reopening chat traffic.

## Consequences

The weather-plus-Pokémon case and every equivalent API combination use the same
release-bound mechanism. “Bisaflor” can be admitted as the canonical
`venusaur` value only because the published input policy declares that alias;
the connector response must independently prove the requested identity.

The architecture has one multi-item execution owner rather than a special
compound subsystem. Adding another API requires contract data, not a new
planner or branch in the conversation runtime. Writes and dependent plans
remain ordinary workflow work with the existing confirmation, idempotency,
unknown-outcome, and reconciliation rules.

## Verification

- Architecture tests forbid productive Compound Request symbols and node types.
- Plan tests prove task grouping, item ordering, exact hash binding, state
  isolation, deterministic route reuse, and complete per-item outcomes.
- Connector tests prove generic normalization, alias admission, schema
  validation, batch limits, and result-identity mismatch behavior.
- A full endpoint regression executes Dortmund, Berlin, and the localized
  Pokémon alias through three pinned connector calls and verifies their exact
  outbound identities and ordered combined answer.
- Migration tests prove v3 revision creation, bounded legacy fan-out,
  deployment retirement, run cancellation, configuration cleanup, and schema
  removal.
