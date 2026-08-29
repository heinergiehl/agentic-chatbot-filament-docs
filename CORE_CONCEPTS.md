# Core Concepts

## The short version

An Agent owns conversation. Its live deployment is an immutable, hash-verified
contract that fixes behavior, model policy, knowledge, budgets, and optional
Playbooks. A Playbook is a bounded process tool; it is never the main chat loop.

## Concept map

| Concept | Meaning | Learn more |
| --- | --- | --- |
| Agent | Configured conversational assistant with explicit behavior and authority | [Agents and Playbooks](AGENTIC_WORKFLOWS.md) |
| Agent deployment | One immutable contract currently receiving chat | [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md) |
| Playbook | Optional typed multi-step process the Agent may invoke | [Playbook Builder](PLAYBOOK_BUILDER.md) |
| Playbook deployment | Immutable graph and pinned dependency closure | [Playbook JSON Schema](WORKFLOW_JSON_SCHEMA.md) |
| Capability | An allowed knowledge, data, API, host-action, memory, or Playbook operation | [Agents and Playbooks](AGENTIC_WORKFLOWS.md) |
| Knowledge Source | Indexed content available only when included in the Agent contract | [Knowledge Sources](KNOWLEDGE_SOURCES.md) |
| Data Resource | Governed read contract for host-application records | [Data Resources](DATA_RESOURCES.md) |
| API Connector | Saved external connection with immutable published operations | [API Connectors](API_CONNECTORS.md) |
| Conversation | Durable visitor and assistant message history | [Chat Widget](CHAT_WIDGET.md) |
| Capability gateway | Only productive boundary for external execution | [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md) |

## How the pieces fit

The administrator creates an Agent, configures its behavior, attaches only the
resources it needs, and publishes a deployment. General conversation and
knowledge do not require a canvas.

When a task needs explicit branching, visitor input, approval, delays, bounded
iteration, or several external operations, the administrator creates and
publishes a Playbook and assigns it to the Agent. Publishing the Agent pins the
exact Playbook deployment. Mutable drafts and unassigned integrations are not
runtime authority.

The model proposes wording and calls. Deterministic policy validates grants,
arguments, side effects, confirmation, idempotency, budgets, and state changes.
AgentGraph owns Playbook checkpoints and waitpoints. Transport code renders
only persisted canonical outcomes.

## Knowledge and data

Knowledge Sources contain indexed documents and chunks for grounded context.
Data Resources expose live application records through declared columns,
filters, scopes, and limits. They are different capabilities and neither is a
global database tool.

## Connectors and writes

An API Connector can contain several versioned operations. A Playbook
Capability step pins the published operation revision, contract hash, and input
schema hash. Writes require the exact grant and policy, explicit approval when
declared, idempotency, and truthful handling of unknown outcomes.

## Read next

- [Quick Start](QUICKSTART.md)
- [Agents and Playbooks](AGENTIC_WORKFLOWS.md)
- [Playbook Builder](PLAYBOOK_BUILDER.md)
- [Data Resources](DATA_RESOURCES.md)
- [API Connectors](API_CONNECTORS.md)
- [Security and Privacy](SECURITY_AND_PRIVACY.md)
