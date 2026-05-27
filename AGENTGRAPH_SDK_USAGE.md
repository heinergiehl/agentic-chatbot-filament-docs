# AgentGraph SDK Usage

This page documents how Filament Agentic Chatbot uses the `heiner/agent-graph` SDK after the post-`v0.12.0` runtime refactor.

It is mainly for maintainers, advanced implementers, and host-app teams debugging runtime or migration issues. Normal buyers should start with [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md), [Bots](BOTS.md), and [Agentic Workflows](AGENTIC_WORKFLOWS.md). Upgrade planners should also read [Database And Breaking Changes](DATABASE_AND_BREAKING_CHANGES.md).

## Current Dependency

- Composer package: `heiner/agent-graph`
- Current refactor branch constraint: `0.13.0-beta.1`
- The SDK is a transitive runtime dependency of the plugin.
- If the SDK is not available from Packagist or Private Packagist yet, the host app must add the SDK Git repository to its root Composer repositories before requiring the plugin from a VCS branch.

```bash
composer config repositories.agent-graph vcs https://github.com/heinergiehl/agent-graph.git
composer config repositories.filament-agentic-chatbot vcs https://github.com/heinergiehl/filament-agentic-chatbot.git
composer require heiner/filament-agentic-chatbot:'*@dev'
```

## What The SDK Runs

The SDK is now used for two runtime layers:

- **Assistant chat graph**: `AssistantChatGraphRuntime` wraps normal chat turns in an SDK `StateGraph` and runs `AssistantAgent` through an SDK `AgentNode`.
- **Workflow runtime**: `WorkflowRunner` delegates workflow execution to the AgentGraph runtime. The legacy workflow runtime has been removed from normal execution.

This means the product model is now:

```text
Bot
  -> AssistantChatGraphRuntime
      -> AssistantAgent
          -> optional KnowledgeSearchTool
          -> optional RunWorkflowTool
  -> AgentGraph workflow runtime
      -> workflow nodes
      -> SDK checkpoints, interrupts, tasks, memory, traces
```

`ParentAgent` and `RagAgent` remain as compatibility aliases only:

- `ParentAgent` aliases `AssistantAgent`
- `RagAgent` aliases `WorkflowLlmAgent`

## SDK Entry Points Used

- `AgentGraphManager` for defining, running, resuming, inspecting, and reading timelines.
- `StateGraph` for assistant chat turns and compiled workflow graphs.
- `AgentNode` for assistant chat and workflow AI calls.
- `SubgraphNode` for workflow `subWorkflow` nodes.
- `NodeContext` for state, metadata, checkpoint identity, resume payloads, memory, tasks, and traces.
- `NodeResult` for writes, interrupts, explicit routing, end states, and failures.
- `RunResult` for projecting SDK execution back into plugin workflow runs.

The plugin still keeps its product-specific `RunWorkflowTool` because chat persistence, workflow-run routing, resume/cancel behavior, and user-visible messaging are product concerns.

## Persistence And Migrations

Host apps using the database-backed SDK store need the SDK tables:

- `agent_graph_runs`
- `agent_graph_checkpoints`
- `agent_graph_writes`
- `agent_graph_tasks`
- `agent_graph_interrupts`
- `agent_graph_memories`
- `agent_graph_traces`

The plugin auto-loads the SDK migration directory through `AgentGraphManager::migrationsPath()`. A normal host-app `php artisan migrate` should therefore create both plugin tables and SDK tables.

`php artisan filament-agentic-chatbot:doctor` checks these tables on the app default connection unless the SDK store is configured as memory.

The database cutover also affects existing `workflow_runs`: old open runs without `workflow_runs.meta.agent_graph.run_id` are cancelled because the removed legacy runtime cannot safely resume them. See [Database And Breaking Changes](DATABASE_AND_BREAKING_CHANGES.md) for the exact migration behavior and audit queries.

## Workflow State Mapping

Plugin workflow state is encoded into SDK graph state through `AgentGraphWorkflowStateCodec`.

The plugin strips transient runtime variables before persistence, including bot objects, conversation objects, callbacks, and AgentGraph context objects.

SDK linkage is stored on workflow runs under:

```text
workflow_runs.meta.agent_graph
```

Important keys:

- `run_id`
- `status`
- `thread_id`
- `interrupt`

Workflow resumes pass user input through the SDK resume payload. Sub-workflow resumes keep parent and child state separate by passing only child resume payload into the child graph.

## Delays, Tasks, Memory, And Inspection

- Delay nodes use the SDK delay scheduler contract and dispatch the plugin `ResumeWorkflowRunJob` when the delayed run belongs to a plugin workflow run.
- Side-effect nodes use SDK task idempotency so repeated checkpoint execution does not duplicate external actions.
- Workflow memory uses SDK memory stores for conversation, workflow-run, session, actor, and bot scopes.
- Workflow run inspection reads SDK snapshots, traces, checkpoints, interrupts, timeline steps, tasks, and memory instead of depending on legacy `node_traces`.

## Operational Notes

- Keep the assistant graph enabled by default.
- Run `php artisan migrate` after installing or upgrading the SDK-backed plugin.
- Run `php artisan filament-agentic-chatbot:doctor` before release.
- Do not rename `RagBot`, `RagSource`, or other persisted model/table names only to remove old terminology. Those names remain compatibility details.
- Prefer `AGENTIC_CHATBOT_ASSISTANT_GRAPH_*` and `AGENTIC_WORKFLOW_*` env names in new docs/config. Legacy `RAG_PARENT_AGENT_*` and related variables are compatibility fallbacks.
