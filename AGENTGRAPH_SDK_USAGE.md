# AgentGraph SDK usage

This note records the AgentGraph boundary used by the plugin. It is not a
release checklist and does not authorize publishing or changing the SDK.

## Dependency

- Composer package: `heiner/agent-graph`
- Current plugin constraint: `^0.15.1`
- The required public surface is enforced by
  `AgentGraphPublicApiCompatibilityTest`.
- Recovery behavior is characterized by the interrupted-resume, delayed-resume,
  cancellation, projection-authority, and side-effect fault-injection tests.

## Ownership boundary

AgentGraph is not the chatbot loop. Every fresh message enters the verified
Agent deployment first:

```text
ChatTurnApplicationService
-> DurableChatTurnService
-> AgentTurnLoop
-> direct Agent answer, knowledge tool, or exact Playbook tool
-> WorkflowExecutionService / WorkflowRunner only for a Playbook
-> AgentGraph checkpoint, interrupt, resume, delay, task, and cancellation
```

The Agent model may propose a Playbook tool call and its arguments. The closed
Agent deployment, exact Playbook pin, workflow contract, and deterministic
policy decide whether that call is executable. A mutable draft, latest-version
lookup, global tool registry, or unpinned child graph cannot enter production.

When a Playbook is open, the Agent receives only its matching continuation tool
plus `cancel_active_playbook`; it retains approved knowledge tools so a side
question does not have to mutate the Playbook checkpoint. A different Playbook
cannot start until the current run is terminal.

## SDK surfaces used

- `AgentGraphManager` defines, validates, starts, resumes, inspects, cancels,
  and recovers Playbook graphs.
- `StateGraph` compiles the internal Runtime-v1 projection generated from the
  semantic Playbook document. Retry, channels, interrupt capability, node
  metadata, and coarse side-effect annotations are declared on this graph.
- `AgentNode` executes bounded Playbook AI Tasks. It does not own general chat
  or choose capabilities.
- `SubgraphNode` executes deployment-pinned Sub-Playbooks with isolated state,
  bounded depth, parent identity, interrupt bubbling, and declared output
  mapping.
- AgentGraph stores are authoritative for graph runs, checkpoints, interrupts,
  delays, and tasks. `WorkflowRun` and `BotPendingInteraction` are package
  projections and operational indexes.

## Interrupt and resume contract

`WorkflowInterruptPayloadBuilder` produces the one interrupt shape used by
executor nodes and retry paths. It includes the contract version, node id,
interaction contract, output target, and delay metadata. Persistent pending
interaction rows are derived from that payload; they do not become graph-state
authority.

Resume input is typed and bound to the exact run and interrupt. Examples are
`slot_value`, `slot_list`, `structured_object`, `choice`, `approve`, and
`reject`. The runtime validates the value, pending identity, payload binding,
and policy before AgentGraph receives it. Raw user text is preserved as input
evidence but cannot silently become an authorized write or arbitrary graph
state.

## Capability boundary

Graph nodes never dispatch connectors, actions, Data Resources, HTTP calls, or
memory writes directly. They use `CapabilityExecutionGateway`, which verifies
the deployment grant, request schema, server-attested authority, confirmation,
idempotency, redaction, and unknown-outcome/reconciliation policy. AgentGraph
side-effect metadata supports scheduling and inspection; it is not execution
authority.

## Recovery invariants

- Resume, cancel, delay, and recovery use the installed SDK's public atomic
  transitions; the plugin does not perform a second best-effort interrupt
  mutation.
- A run resumes from its immutable snapshot and exact deployment hash, never
  from current authoring data.
- Unknown dispatch outcomes remain blocked until reconciled. Recovery cannot
  convert uncertainty into an automatic retry of a write.
- Parent cancellation and timeout cascade through supported Sub-Playbook
  ancestry; a child cannot productively outlive its parent.

After changing the SDK constraint or any adapter boundary, run the public API
compatibility test, the targeted interrupted-resume/confirmation tests, and
Doctor. Missing required SDK methods are blocking compatibility failures.
