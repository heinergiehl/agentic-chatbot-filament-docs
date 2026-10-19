# Core Concepts

## The short version

An Agent owns conversation. Its live deployment is an immutable, hash-verified
contract that fixes behavior, model policy, knowledge, budgets, and optional
Workflows. A Workflow is a bounded process tool; it is never the main chat loop.

## Concept map

| Concept | Meaning | Learn more |
| --- | --- | --- |
| Agent | Configured conversational assistant with explicit behavior and authority | [Agents and Workflows](AGENTIC_WORKFLOWS.md) |
| Agent deployment | One immutable contract currently receiving chat | [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md) |
| Workflow | Optional typed multi-step process the Agent may invoke | [Workflow Builder](PLAYBOOK_BUILDER.md) |
| Workflow deployment | Immutable graph and pinned dependency closure | [Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md) |
| Tool | An allowed knowledge, data, API, host-action, memory, or Workflow operation | [Agents and Workflows](AGENTIC_WORKFLOWS.md) |
| Knowledge Source | Indexed content available only when included in the Agent contract | [Knowledge Sources](KNOWLEDGE_SOURCES.md) |
| App data tool | Governed read and optional write contract for host-application records | [App data tools](DATA_RESOURCES.md) |
| API connection / MCP server | Saved external connection with immutable published operations | [API connections](API_CONNECTORS.md) |
| Conversation | Durable visitor and assistant message history | [Chat Widget](CHAT_WIDGET.md) |
| Agent test | Saved conversation with checks, run against the draft | [Agent Tests](AGENT_TESTS.md) |
| Tool gateway | Only productive boundary for external execution | [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md) |

## How the pieces fit

The administrator creates an Agent, configures its behavior, attaches only the
resources it needs, tests the saved draft in the editor's chat, and publishes,
which makes a new immutable version live at once. General conversation and
knowledge do not require a canvas.

When a task needs explicit branching, visitor input, approval, delays, bounded
iteration, or several external operations, the administrator creates and
publishes a Workflow and assigns it to the Agent. Publishing the Agent pins the
exact Workflow deployment. Mutable drafts and unassigned integrations are not
runtime authority.

The model proposes wording and calls. Deterministic policy validates grants,
arguments, side effects, confirmation, idempotency, budgets, and state changes.
AgentGraph owns Workflow checkpoints and waitpoints. Transport code renders
only persisted canonical outcomes.

## Knowledge and data

Knowledge Sources contain indexed documents and chunks for grounded context.
App data tools expose live application records through declared columns,
filters, scopes, and limits. They are different tools and neither is a
global database tool.

## API connections and writes

An API connection or MCP server can contain several versioned operations. The
Agent deployment and every Workflow step pin the published operation revision,
contract hash, and input schema hash. Every tool is flat: reads run directly;
a write tool only proposes, the visitor confirms the exact values on a card
(on by default per operation), and the write runs once through the tool gateway. Writes require the
exact grant and policy, idempotency, and truthful handling of unknown
outcomes.

## Read next

- [Quick Start](QUICKSTART.md)
- [Agents and Workflows](AGENTIC_WORKFLOWS.md)
- [Workflow Builder](PLAYBOOK_BUILDER.md)
- [App data tools](DATA_RESOURCES.md)
- [API connections](API_CONNECTORS.md)
- [Security and Privacy](SECURITY_AND_PRIVACY.md)
