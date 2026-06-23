# AgentGraph SDK Usage

This document records the AgentGraph SDK surface currently used by the plugin. It is a local SDK alignment note, not a release checklist. Do not tag, publish, or bump `heiner/agent-graph` from this document.

## Current Dependency

- Composer package: `heiner/agent-graph`
- Current plugin constraint: `^0.15.0`
- Sandbox resolution: `v0.15.0`
- The package tracks the stable 0.15 SDK line so local host-app validation exercises the same public SDK surface as the plugin.

## Runtime Entry Points

- `AgentGraphManager`
  - Used for `define(...)`, fluent graph execution through `graph(...)->thread(...)->input(...)->meta(...)->run()`, direct `run(...)`, `resume(...)`, `inspect(...)`, and `timeline(...)`.
  - Used by workflow runtime, assistant chat runtime, sub-workflows, projection, and run inspection.
- `StateGraph`
  - Used to compile plugin workflow JSON and the generic assistant chat turn graph.
  - Required operations: `make(...)`, `state(...)`, `node(...)`, `edge(...)`, `conditional(...)`, `retry(...)`, `nodeMeta(...)`, `nodeChannels(...)`, `nodeCanInterrupt(...)`, `nodeSideEffects(...)`, `compile()`, `START`, and `END`.
  - Workflow `nodeRetryAttempts`, `nodeRetryDelayMs`, and `nodeRetryBackoff` fields are mapped to `StateGraph::retry(...)` for transient thrown node exceptions.
  - The compiler defensively skips optional node contract annotation if a stale local SDK lacks these methods, but `filament-agentic-chatbot:doctor` reports that as a blocking AgentGraph SDK surface mismatch.
- `GraphDefinition`
  - Returned by workflow compilation and passed into nested sub-workflow execution.
  - Manifest v2 is used as the neutral graph contract surface for SDK-aware inspectors and validation gates. The compiler annotates workflow nodes with SDK-neutral metadata, input/output channels, interrupt capability, and coarse `read` / `write` side-effect declarations.
- `AgentNode`
  - Used for assistant chat turns and workflow AI nodes.
  - Required operations: `make(...)`, `agent(...)`, `prompt(...)`, `stream(...)`, `provider(...)`, `model(...)`, `writeTextTo(...)`, `onTextDelta(...)`, and invokable node execution.
- `SubgraphNode`
  - Used for workflow `subWorkflow` nodes instead of the former plugin-local subworkflow runtime node.
  - Required operations: `make(...)`, `isolated(...)`, child run parent metadata, interrupt bubbling, and child resume through `child_run_id`/`child_interrupt_id`.
- `GraphTool` / `DurableGraphTool`
  - Available as SDK-native graph tool helpers.
  - The plugin deliberately keeps its product-specific `RunWorkflowTool` because chat message persistence, workflow-run routing, protected runtime variables, and resume/cancel semantics are plugin-owned.

## Conversation Boundary

AgentGraph is the workflow state machine. It owns graph execution, checkpoint identity, interrupts, resume payloads, delays, task idempotency, and run inspection.

AgentGraph does not decide whether a fresh user message is a side question, a result-set follow-up, a new task, a correction, or an unrelated chat turn. That decision belongs to the conversation shell above the SDK:

```text
User message
  -> conversation preflight / turn arbitration
  -> semantic candidate extraction
  -> deterministic policy against workflow, slot, result-set, approval, and capability contracts
  -> typed AgentGraph start or resume payload
  -> AgentGraph execution/checkpoint/interrupt
```

LLM output in this shell is advisory. The policy layer must validate declared slots, closed-vocabulary operators, result-set query patches, approvals, connector requests, and side-effect idempotency before AgentGraph receives a start or resume payload.

For active waitpoints, resumes must be typed, for example `slot_value`, `slot_list`, `structured_object`, `choice`, `approve`, or `reject`. Raw user text should not be treated as graph state unless the active interrupt contract explicitly allows that shape.

The plugin builds AgentGraph interrupt payloads through `WorkflowInterruptPayloadBuilder` so executor nodes and resume retry paths emit the same `contract_version`, `node_id`, `interaction`, `output`, and delay metadata. Persistent projections in `bot_pending_interactions` are derived views of that SDK interrupt payload; they are not the authority for graph state.

Resume payloads carry both raw input and a validated typed resolution:

```php
[
    AgentGraphInteractiveResumeHandler::RESUME_PAYLOAD_STATE_KEY => [
        'input' => $rawUserInput,
        'resolution' => [
            'type' => 'slot_value',
            'slot' => 'email',
            'value' => 'max@example.com',
            'confidence' => 1.0,
            'policy_reason' => 'pending_interaction_slot_value',
            'pending_interaction_id' => 123,
        ],
    ],
    'interrupt_id' => $agentGraphInterruptId,
]
```

The conversation shell stores the validated resolution under `WorkflowRuntimeVariableKeys::WORKFLOW_TURN_RESOLUTION` before `AgentGraphWorkflowRuntime` converts it into this SDK resume shape. Node handlers should prefer `resolution` over raw `input` because it has already passed waitpoint policy, interrupt identity checks, and deterministic validation.

For completed result-set follow-ups, the conversation shell starts a new workflow run with a self-contained input and a validated `__data_resource_follow_up.query_patch`; it does not resume an old AgentGraph checkpoint because the previous data query has completed.

## Node Runtime Contracts

- `Node`
  - Implemented by plugin bridge nodes such as workflow executor, loop controller, and entry nodes. SDK `SubgraphNode` handles sub-workflow execution.
- `NodeContext`
  - Used for state reads, run metadata, checkpoint identity, resume payloads, task idempotency, memory access, and trace context.
  - Required accessors include `state(...)`, `runId()`, `threadId()`, `checkpointId()`, `nodeId()`, `hasResumePayload()`, `resumePayload()`, `tasks()`, memory store access, and trace access.
- `NodeResult`
  - Used for normal writes, interrupts, explicit goto, end, and fail states.
  - Required operations: `write(...)`, `interrupt(...)`, `goto(...)`, `end(...)`, `fail(...)`, `withMeta(...)`, and `withNodeMeta(...)`.
  - AgentGraph retry policies do not retry `NodeResult::fail()`, interrupts, delays, or validation branches; those remain explicit workflow behavior.
  - The SDK also exposes `NodeResult::interruptContract(...)` and `AgentGraphManager::resumeContract(...)` for SDK-native typed interrupt response validation. The plugin continues to project its product-specific waitpoint contract shape and validates public answers before resume, so these SDK APIs are additive rather than a replacement for the conversation shell.
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
- `DoctorCommand` checks these tables on the effective AgentGraph connection. When the package DB connection is configured and the SDK connection is not set, the plugin defaults AgentGraph to the package connection so workflow state, SDK runs, interrupts, traces, and chatbot projections live in the same host database.
- If an explicit `AGENT_GRAPH_DB_CONNECTION` / `agent-graph.database.connection` is set and differs from `filament-agentic-chatbot.database.connection`, `DoctorCommand` fails the check. The runtime must not split AgentGraph persistence from the package workflow tables unless that split is intentionally reworked across projection, inspection, and cleanup code.
- `RunSnapshot` is used by the Workflow Run inspector through `run()`, `traces()`, `checkpoints()`, and `interrupt()`.
- `RunTimelineStep` is used for replay/debug traces through `nodeId()`, `stateBefore()`, `stateAfter()`, `meta()`, and `error()`.
- `GraphValidationReport` is available through `AgentGraphManager::validate(...)` for release-time graph diagnostics. SDK warnings such as terminal paths and missing conditional defaults are advisory unless the caller opts into strict validation.

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
- Workflow resumes put user input plus typed resolution into `AgentGraphInteractiveResumeHandler::RESUME_PAYLOAD_STATE_KEY` and pass the SDK interrupt id when available.
- Sub-workflow resumes keep the parent state patch on the parent run, but pass only the child resume payload into SDK child runs. This avoids accidentally overwriting child graph state with parent graph variables.

## Later SDK Alignment Items

- Keep `AgentNode` streaming/write APIs stable because both public assistant chat and workflow AI nodes depend on them.
- Keep inspection APIs stable enough for host UIs to render checkpoints, interrupts, traces, timeline, tasks, and memory without reading SDK tables directly.
- Revisit `DurableGraphTool` only if the SDK later gains enough product-level extension points to preserve the plugin's chat/workflow-run lifecycle semantics without duplicating them outside `RunWorkflowTool`.
