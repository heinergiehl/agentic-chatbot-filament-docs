# AgentGraph SDK Usage

This document records the AgentGraph SDK surface currently used by the plugin. It is a local SDK alignment note, not a release checklist. Do not tag, publish, or bump `heiner/agent-graph` from this document.

## Current Dependency

- Composer package: `heiner/agent-graph`
- Current plugin constraint: `^0.13.0`
- Sandbox resolution: `v0.13.0`
- The sandbox tracks the stable 0.13 SDK line so local host-app validation exercises the same public SDK surface as the plugin.

## Runtime Entry Points

- `AgentGraphManager`
  - Used for `define(...)`, fluent graph execution through `graph(...)->thread(...)->input(...)->meta(...)->run()`, direct `run(...)`, `resume(...)`, `inspect(...)`, and `timeline(...)`.
  - Used by workflow runtime, assistant chat runtime, sub-workflows, projection, and run inspection.
- `StateGraph`
  - Used to compile plugin workflow JSON and the generic assistant chat turn graph.
  - Required operations: `make(...)`, `state(...)`, `node(...)`, `edge(...)`, `conditional(...)`, `compile()`, `START`, and `END`.
- `GraphDefinition`
  - Returned by workflow compilation and passed into nested sub-workflow execution.
- `AgentNode`
  - Used for assistant chat turns and workflow AI nodes.
  - Required operations: `make(...)`, `agent(...)`, `prompt(...)`, `stream(...)`, `provider(...)`, `model(...)`, `writeTextTo(...)`, `onTextDelta(...)`, and invokable node execution.
- `SubgraphNode`
  - Used for workflow `subWorkflow` nodes instead of the former plugin-local subworkflow runtime node.
  - Required operations: `make(...)`, `isolated(...)`, child run parent metadata, interrupt bubbling, and child resume through `child_run_id`/`child_interrupt_id`.
- `GraphTool` / `DurableGraphTool`
  - Available as SDK-native graph tool helpers.
  - The plugin deliberately keeps its product-specific `RunWorkflowTool` because chat message persistence, workflow-run routing, protected runtime variables, and resume/cancel semantics are plugin-owned.

## Node Runtime Contracts

- `Node`
  - Implemented by plugin bridge nodes such as workflow executor, loop controller, and entry nodes. SDK `SubgraphNode` handles sub-workflow execution.
- `NodeContext`
  - Used for state reads, run metadata, checkpoint identity, resume payloads, task idempotency, memory access, and trace context.
  - Required accessors include `state(...)`, `runId()`, `threadId()`, `checkpointId()`, `nodeId()`, `hasResumePayload()`, `resumePayload()`, `tasks()`, memory store access, and trace access.
- `NodeResult`
  - Used for normal writes, interrupts, explicit goto, end, and fail states.
  - Required operations: `write(...)`, `interrupt(...)`, `goto(...)`, `end(...)`, `fail(...)`, `withMeta(...)`, and `withNodeMeta(...)`.
- `RunResult`
  - Used to project SDK execution back into `workflow_runs`.
  - Required accessors include `state(...)`, `status()`, `runId()`, `threadId()`, `interrupt()`, `resumeAt()`, `failed()`, and `error()`.

## Persistence And Inspection

- SDK tables are required in host apps when `agent-graph.store` is database-backed:
  - `agent_graph_runs`
  - `agent_graph_checkpoints`
  - `agent_graph_writes`
  - `agent_graph_tasks`
  - `agent_graph_interrupts`
  - `agent_graph_memories`
  - `agent_graph_node_executions`
  - `agent_graph_traces`
- The plugin currently auto-loads SDK migrations so normal host-app `php artisan migrate` includes them.
- The plugin now resolves the SDK migration directory through `AgentGraphManager::migrationsPath()` instead of reflecting SDK service-provider internals.
- `DoctorCommand` checks these tables on the app default connection unless the SDK store is configured as memory.
- `RunSnapshot` is used by the Workflow Run inspector through `run()`, `traces()`, `checkpoints()`, and `interrupt()`.
- `RunTimelineStep` is used for replay/debug traces through `nodeId()`, `stateBefore()`, `stateAfter()`, `meta()`, and `error()`.

## Stores, Memory, Tasks, And Delays

- `DelayScheduler`
  - The plugin binds this contract to `AgentGraphWorkflowDelayScheduler`.
  - The scheduler implements the SDK `schedule(string $runId, array $payload, DateTimeInterface $resumeAt): void` contract.
  - The scheduler dispatches plugin `ResumeWorkflowRunJob` when the SDK payload or run meta includes `workflow_run_id`; otherwise it falls back to SDK `ContinueDelayedGraphJob`.
- `RunStore`
  - Used by the delay scheduler to resolve run metadata.
- `InterruptStore`
  - Used by the inspector to list interrupts for a run.
- `EnumerableMemoryStore`
  - Used by workflow memory bridging and run inspection.
  - Required operations: `read(...)`, `write(...)`, `search(...)`, and `listNamespace(...)`.
- `MemoryScope`
  - Used for run, conversation/thread, session/thread, bot/application, and actor-scoped memory.
- `TaskRunner`
  - Reached through `NodeContext::tasks()` and used with `once(...)` to make HTTP/API/action side effects idempotent per checkpoint.
- `TaskStore`, `CheckpointStore`, `TraceStore`, `MemoryStore`, and in-memory store implementations are used in tests and inspection coverage.

## Plugin-Specific State Mapping

- Plugin workflow state is encoded as SDK graph state through `AgentGraphWorkflowStateCodec`.
- Transient runtime variables such as bot, conversation, workflow run, callbacks, and AgentGraph context are stripped before persistence.
- The plugin stores SDK linkage under `workflow_runs.meta.agent_graph`:
  - `run_id`
  - `status`
  - `thread_id`
  - `interrupt`
- Workflow resumes put user input into `AgentGraphInteractiveResumeHandler::RESUME_PAYLOAD_STATE_KEY` and pass the SDK interrupt id when available.
- Sub-workflow resumes keep the parent state patch on the parent run, but pass only the child resume payload into SDK child runs. This avoids accidentally overwriting child graph state with parent graph variables.

## Later SDK Alignment Items

- Confirm whether database store connection configuration should be SDK-controlled beyond the app default connection.
- Keep `AgentNode` streaming/write APIs stable because both public assistant chat and workflow AI nodes depend on them.
- Keep inspection APIs stable enough for host UIs to render checkpoints, interrupts, traces, timeline, tasks, and memory without reading SDK tables directly.
- Revisit `DurableGraphTool` only if the SDK later gains enough product-level extension points to preserve the plugin's chat/workflow-run lifecycle semantics without duplicating them outside `RunWorkflowTool`.
