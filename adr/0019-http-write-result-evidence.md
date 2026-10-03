# ADR 0019: Explicit HTTP write result evidence

- Status: Implemented candidate; offline evidence in the runtime hardening work log.
- Date: 2026-09-13
- Extends ADR 0008 and ADR 0009; preserves gateway, graph and ledger ownership.

New or republished synchronous HTTP writes declare
`response.outcome.write_result.version=1` and `success_signal` as `predicate`,
`strategy` or `http_status`. Reuse `success_when` and the pinned outcome strategy.
Every successful predicate branch requires a positive strict typed comparison
(`equals`/`eq` or `in`, with concrete non-null scalar values, bounded `all`/`any`).
Presence, truthiness, absence or negation alone is insufficient. Additional guards
use existing `error_when`; positive effect predicates themselves support only
the stated comparisons and groups. No universal remote ID
is required. Existing configured result identity still binds admitted input.

| Authoritative result after possible dispatch | Interpretation |
| --- | --- |
| Positive success evidence, valid schema and matching configured input identity | Success |
| Explicit reviewed final HTTP status, including documented empty 204 | Success without invented record |
| Positive `no_effect_when`, valid schema, documented final rejection, no conflicting success | Rejected without effect; preserve public business reason |
| Bound acceptance through ADR 0009 | Pending, not completed |
| Verified partial effect | Partial, not whole-goal completion or permission to redispatch |
| Missing/wrong-type evidence, conflict, foreign identity, unsupported pending, timeout or unproven effect | Unknown; reconciliation, no inferred retry |

Failed `success_when` and matched `error_when` alone never prove no effect.
The optional `no_effect_when` uses the same positive typed predicate restrictions.
Schema validation applies before accepting no-effect proof as well as success.
No-effect evidence is independent of an absent or mismatched success field.
Reads, MCP write evidence and durable completion retain their existing contracts.

HTTP-only success requires explicit integer final statuses, not default or wildcard
2xx. HTTP-only, custom strategy and no-effect declarations include a reviewed
`provider_contract` reference and SHA-256 snapshot hash inside `write_result`.
The declaration alone cannot authorize publication. Bounded public synthetic
`fixtures` in the same object are executed server-side through the production
result interpretation before publication. Each fixture declares `case`,
`http_status`, `content_type`, `body` and `expected`; expected is an assertion,
never an author-supplied pass result. Required cases cover positive success,
business rejection, pending and ambiguous failure; predicate/strategy cases also
cover missing and wrongly typed evidence, with field mutations derived from the
effect-evidence paths. Conflicts and supported partial effects retain their limits.
Fixtures and expected answers are not passed to custom strategies. Custom
strategies declare at most 16 concrete `evidence_paths` for generated missing,
container-type and scalar-type mutations of successful fixtures. Outcome strategy
selection belongs exclusively to pinned `strategies.outcome_classifier`; an inline
`response.outcome.strategy` override is rejected. Positive predicate values and
no-effect values each require an exercised fixture. No-effect mutation coverage
also applies to HTTP-only contracts. Fixture interpretation uses exact production
outcome kinds; a generic failure cannot stand in for unknown.

Fixture bytes, provider-document hash and strategy bindings remain in the exact
candidate contract hash. Existing append-only publication audit and matching
staging-write evidence bind that candidate; no new evidence table is needed.
Changing any of them requires fresh staging evidence. Synthetic conformance does
not establish the truth of an invented provider declaration or replace review.

## Version and migration

Version the HTTP outcome sub-contract only. Connector V3 and the global runtime
ABI do not advance. Never rewrite historical operations, hashes, receipts,
confirmations or deployments. Shared classifier/mapper implementation hashes also
participate in core strategy bindings, including MCP; changed bindings fail closed
under the existing validator. Republish affected operations and dependent Agent/
Playbook deployments before new work. Custom outcome bindings also include the
core outcome wrapper, mapper and schema validator. Historical canonical replay keeps its
original meaning. There is no silent hash refresh or compatibility bypass.

Review: bounded independent high-capability contract review traced publication,
classification, schema mapping, result identity and strategy hashing. It confirmed
the decision and the embedded-fixture approach. Implementation review additionally
identified and corrected conflicts hidden by error predicates, malformed 4xx
responses, overbroad fixture normalization and unpinned custom strategy overrides.
Gateway/ledger tests verify unknown replay protection. No live acceptance claimed.
