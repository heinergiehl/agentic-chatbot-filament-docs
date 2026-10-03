# ADR 0008: Agent-first runtime and optional playbook cutover

- Status: Accepted. [ADR 0038](0038-direct-agent-writes-with-visitor-confirmation.md) supersedes the read-only role of direct Agent tools: published writes are direct tools with visitor confirmation.
- Date: 2026-08-24
- Decision scope: Conversational ownership, published agent contracts, optional playbooks, product navigation, and the visual playbook editor
- Supersedes: ADR 0001 decisions 1 and 3 and ADR 0002 decision 1 where they make a main workflow the owner of every conversation
- Preserves: All deterministic authorization, immutable-release, AgentGraph, capability-gateway, confirmation, idempotency, durability, redaction, and fail-closed invariants from ADRs 0001 through 0007

## Context

The intended product is an agentic chatbot whose behavior and authority are
explicitly configured. The current product instead requires every bot to enter
one main workflow. Natural conversation is consequently treated as input to a
graph, and graph nodes must anticipate the shape of each turn. This makes
unexpected phrasing, side questions, missing values, and capability failures
feel like protocol errors instead of a coherent conversation.

The package already contains valuable production infrastructure: immutable
deployments, deterministic policy, AgentGraph durability,
`CapabilityExecutionGateway`, API Connectors, Data Resources, knowledge
retrieval, confirmation and write ledgers, channels, access tokens, usage
attribution, and budget enforcement. Replacing those controls would increase
risk without solving conversational ownership.

The package is pre-1.0 and the product owner has authorized a breaking hard
cutover. The desired result is one smaller productive architecture, not an
agent runtime beside the existing workflow-first runtime.

## Decision

### 1. The agent owns every conversation

Each live bot has exactly one immutable, hash-verified `AgentDeployment`. One
agent turn loop owns understanding the visitor, deciding whether to answer,
clarify, use an allowed capability, invoke an allowed playbook, or refuse, and
then composing the user-facing answer from canonical facts and outcomes.

Model output proposes intent, arguments, and wording. It never grants access,
authorizes a target or side effect, changes graph state, or turns an unverified
result into a fact. Deterministic contracts and policy retain those decisions.

A simple conversational or knowledge agent requires no workflow or canvas.

### 2. The published agent contract is the closed authority manifest

An `AgentDeployment` pins and hashes the complete productive contract:

- identity, behavior instructions, response policy, supported locales, and
  model/provider policy;
- allowed knowledge sources, Data Resources, capability operations, and
  playbooks, each with stable identity, version, hash, and scope;
- input and result schemas, read/write effect, confirmation and idempotency
  policy, budgets, rate limits, and escalation policy;
- channel, tenant, actor, environment, and release authority required by the
  existing runtime safety boundaries.

There is no global tool registry or mutable authoring fallback. Anything not
pinned in the live deployment is unavailable to the agent. Publishing is the
only transition from mutable configuration to productive authority.

### 3. Playbooks are optional typed capabilities

A playbook is an immutable, versioned, hash-verified graph for a deterministic
multi-step process. It has a typed input contract, typed result contract,
declared side effects, declared waitpoints, and a pinned dependency closure.
The agent may start it only when the live agent deployment grants that exact
playbook version.

AgentGraph remains authoritative for playbook checkpoints, interrupts, resume,
delay, structured concurrency, cancellation, and task state. A playbook does
not become a second conversational owner. When it needs visitor input, it emits
a typed waitpoint to the agent turn loop. Side questions remain agent turns;
only a validated answer to the pending input resumes the playbook.

The core authoring catalog is deliberately small:

1. Entry
2. Request Input
3. Capability
4. Decision
5. Approval
6. Wait
7. AI Task
8. Transform
9. For Each
10. Sub-Playbook
11. Result
12. Note

Conversational nodes such as generic Ask, Respond, Knowledge Answer, Data
Answer, Agent Answer, Fallback Reply, and Finish are not productive playbook
primitives. Conversation belongs to the agent.

### 4. One capability execution boundary remains

API Connector operations, Data Resource queries, host actions, memory writes,
and playbook-owned external work continue to cross
`CapabilityExecutionGateway`. Existing exact grant binding, payload/schema
binding, confirmation, idempotency, result validation, redaction,
unknown-outcome handling, and reconciliation remain mandatory.

API Connectors, Data Resources, knowledge sources, channels, access tokens,
usage accounting, and budget enforcement are retained. Their productive
integration is refactored into the agent deployment's closed capability
manifest; they do not receive independent conversation routers.

### 5. The editor becomes an optional Playbook editor

The existing React Flow island, Filament asset loading, scoped Tailwind setup,
local shadcn/Radix primitives, canvas geometry, viewport persistence,
serialization discipline, and responsive shell are retained. The editor's
semantic catalog and information architecture are changed from “build the
whole chatbot” to “build an optional process the agent may use.”

The current visual language is a compatibility contract: existing
`--fi-wf-*` and Filament tokens, light/dark behavior, spacing density, focus
states, panel hierarchy, canvas interactions, and responsive behavior must not
regress. New global CSS, Tailwind preflight, or host-theme overrides are not
allowed.

Agent configuration is a form-first experience. Playbooks are progressively
disclosed and never block creation, testing, or publication of a simple agent.

### 6. The cutover is physical, not a permanent adapter

The released architecture contains one productive turn loop and one productive
playbook transition owner. The workflow-first main-workflow selector, starter
workflow requirement, workflow-as-chatbot routing, conversation node catalog,
and obsolete planner/interpreter/target/command paths are removed once their
agent-first replacements are proven.

Mutable legacy definitions are classified before migration. Completed history,
side-effect ledgers, and audit evidence remain read-only and inspectable.
Ambiguous active state blocks or is quarantined by an explicit migration; it is
never silently discarded or resumed through a compatibility runtime.

No old productive alias, feature flag, service-provider binding, serialized
runtime reader, or selectable dual runtime remains after the switch.

## Product surface decisions

| Surface | Decision | Product role |
| --- | --- | --- |
| Bots | Refactor and rename to Agents | Primary configuration, test, publish, and live status |
| Workflows | Refactor and rename to Playbooks | Optional advanced process automation |
| React Flow editor | Retain shell; replace semantics | Optional Playbook authoring with preserved visual and responsive quality |
| Knowledge Sources | Retain | Agent-scoped knowledge capability |
| Data Resources | Retain | Governed read capability; advanced configuration |
| API Connectors | Retain | Governed external capability provider; advanced configuration |
| Usage and token accounting | Retain | Agent/playbook attribution, limits, budgets, and operations |
| Channels and access tokens | Retain | Deployment transport and access; advanced configuration |
| Conversations, action reviews, handoffs | Retain | Operations and human oversight |
| Workflow Runs | Refactor vocabulary | Playbook/execution runs; operational projection only |
| Quality scenarios and guardrails | Retain and rebind | Agent release evaluation and deterministic policy |
| Main-workflow assignment and starter workflows | Delete | Replaced by direct agent deployment and optional playbook grants |
| Workflow-owned chat routing and chat nodes | Delete | Replaced by the single agent turn loop |

## Migration and cutover

1. Establish the executable agent/playbook contract and characterization
   evidence without creating a second productive runtime.
2. Implement one vertical agent turn path through the existing durable chat,
   policy, capability, usage, and canonical-outcome boundaries.
3. Add publish-time dependency pinning for agent capabilities and playbooks.
4. Migrate or explicitly classify live definitions and active state.
5. Switch chat entry atomically to the agent-owned path.
6. Physically delete workflow-first productive code, bindings, configuration,
   node semantics, starters, tests that assert obsolete behavior, and shipped
   editor artifacts generated from the old catalog.
7. Refactor the Filament navigation and editor vocabulary, preserving the
   visual/responsive contract.
8. Run targeted evidence during each slice and one justified integration gate
   after dead-code and forbidden-path checks are green.

Rollback after a destructive production migration means restoring the verified
backup and pre-cutover package release. It is not a dual runtime or a
down-migration that recreates workflow-first execution.

## Completion conditions

The cutover is complete only when all of these are true:

- a simple agent chats, clarifies, uses knowledge, and handles unexpected
  wording without any playbook;
- only deployment-pinned knowledge, data, capabilities, and playbooks can be
  selected, and every external execution crosses the gateway;
- write confirmation, idempotency, unknown outcomes, budgets, usage
  attribution, checkpoint/resume, and canonical-before-render behavior remain
  proven;
- a playbook can branch, wait for input, obtain approval, call capabilities,
  resume, and return a typed result without owning general conversation;
- the main-workflow requirement, workflow-first entry router, conversation
  nodes, starter graphs, and superseded planner/interpreter paths are physically
  absent from productive code and container bindings;
- Agents are the primary product surface and Playbooks are optional advanced
  functionality;
- the editor passes light/dark, keyboard/focus, interaction, and responsive
  checks at 1440x900, 1280x800, 1024x768, 768x1024, and 390x844;
- API Connectors, Data Resources, knowledge, channels, access tokens, usage,
  operations, quality, and guardrails still work through their declared new
  ownership; and
- no unexplained dead productive files, runtime aliases, dual architecture, or
  compatibility bridge remains.

## Consequences

The product becomes agent-first while retaining the expensive safety and
integration infrastructure already built. Most destructive work is focused on
ownership, orchestration, authoring semantics, and obsolete glue rather than on
connectors or ledgers. Existing workflow-first deployments intentionally require
classification and republishing. The codebase should shrink materially, but
file count and line count are evidence of simplification rather than acceptance
criteria by themselves.
