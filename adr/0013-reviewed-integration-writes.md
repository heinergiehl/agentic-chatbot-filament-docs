# ADR 0013: Reviewed writes through existing integration capabilities

- Status: Accepted for the current development implementation. Decision 1 is superseded by [ADR 0038](0038-direct-agent-writes-with-visitor-confirmation.md); the signed MCP write review stays.
- Date: 2026-09-08
- Decision scope: Synchronous MCP data create/update and consistent integration write authority
- Extends ADR 0008 and ADR 0009; supersedes the blanket MCP read-only product restriction
- Preserves AgentTurnLoop, AgentGraph, CapabilityExecutionGateway, immutable deployments and existing ledgers as the sole productive authorities

## Context

HTTP Connector writes and Data Resource insert/update already have governed
Playbook paths. MCP had a blanket prohibition even when an administrator could
review one bounded data mutation. The product owner explicitly authorizes this
limited expansion. Historical MCP mechanisms are not authorization evidence.
The capability matrix and characterization are recorded in
[Governed integration writes](../archive/INTEGRATION_WRITE_CAPABILITIES.md).

## Decision

1. Keep all direct Agent Connector and Data Resource tools read-only. Data writes
   belong to explicitly published optional Playbooks with concrete confirmation.
2. Keep existing reviewed MCP reads. A separate signed write-review object binds
   one create/update operation, its remote definition, connection/environment,
   fixed target and tenant/actor scopes, input/output contract, execution and
   reconciliation rules. A read review never grants a write. Remote hints and
   tool names are never authorization.
3. Use the existing request planner, capability gateway, exact payload grant,
   side-effect ledger, reconciliation and deployment infrastructure. No raw
   MCP/HTTP/SQL escape or parallel runtime is introduced.
4. Require explicit business success and a validated record identity. Treat all
   post-dispatch ambiguity as unknown, including an MCP tool error, business
   failure or unsupported asynchronous result. The initial MCP write contract
   has no provider-idempotency claim and no automatic retry; unresolved effects
   require the existing explicit reconciliation process.
5. Require evidence for the exact write candidate from an isolated staging/test
   context. Normal Agent and release-candidate tests remain unable to write.
   Connector staging keeps its existing separate origin, credentials and
   environment binding and now also requires the same transport. Data Resources
   use a separate staging application and database, an exact full-candidate
   export, an expiring in-memory action permit and signed portable evidence from
   the existing gateway ledger. The publication gate verifies that evidence per
   mutation step. No runtime database switching or persistent test authority is
   introduced.
6. Preserve Data Resource scoped single-record insert/update, host Eloquent
   policies, field allowlists, validation, transactions and optimistic conflicts.
   Do not add free SQL, arbitrary table access, bulk mutation or deletion.
7. Preserve historical ledgers and unknown results. No migration enables or
   repeats a previous MCP write. Changed implementation pins and reviewed
   contracts require deliberate testing and republishing.

## Limits and consequences

This is a chatbot integration feature, not a general autonomous Agent platform.
Local processes, shell/software control, MCP Tasks and asynchronous MCP writes
remain unsupported. A provider that cannot support an isolated staging target
or meaningful business-result proof cannot publish a write operation through
this first contract. Provider-specific idempotency or automated reconciliation
requires a separately reviewed contract, not an inferred remote hint.

The workbench exposes effect, precise targets, review status, confirmation,
staging evidence and publication. Approving a tool and confirming one visitor
payload remain distinct actions. Both are necessary for productive writes.

The current change is development code. It does not establish third-party
provider certification, a released package version, or production deployment.
