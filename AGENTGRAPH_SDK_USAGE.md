# AgentGraph SDK usage

This note records the AgentGraph boundary used by the plugin. It is not a
release checklist and does not authorize publishing or changing the SDK.

## Dependency

- Composer package: `heiner/agent-graph`
- Current plugin constraint: `0.16.2` (exact stable patch release)
- The consuming host must explicitly select the same stable release and complete the
  coordinated store migration and deployment publication before accepting work.
- The required public surface is enforced by
  `AgentGraphPublicApiCompatibilityTest`.
- Recovery behavior is characterized by the interrupted-resume, delayed-resume,
  cancellation, projection-authority, and side-effect fault-injection tests.
- The bounded 0.16 integration evidence is preserved in
  [the historical RC2 integration record](AGENTGRAPH_0_16_RC2_INTEGRATION.md).

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

Before dispatch, the package atomically correlates the new durable Chat Turn,
current user message, Playbook run, and immutable deployment references without
changing the projected run status. AgentGraph's accepted resume payload carries
the exact active-turn identity in `runtime.recovery.pending_resume`; the next
checkpoint carries the same identity in state metadata and runtime variables.
A package-database correlation by itself is not dispatch evidence. Recovery
therefore distinguishes a crash before SDK acceptance (safe retry) from a crash
after atomic acceptance (unknown until AgentGraph supplies a definitive state
or an operator reconciles it).

## Capability boundary

Graph nodes never dispatch connectors, actions, Data Resources, HTTP calls, or
memory writes directly. They use `CapabilityExecutionGateway`, which verifies
the deployment grant, request schema, server-attested authority, confirmation,
idempotency, redaction, and unknown-outcome/reconciliation policy. AgentGraph
side-effect metadata supports scheduling and inspection; it is not execution
authority.

## Recovery invariants

- Recovering the same committed delay reuses its delivery receipt, authority,
  due time, and projection revision. An unchanged, fully attested wait does not
  become a new projection revision merely because transport delivery was retried.
  A new checkpoint still requires the next revision. Claimed, unknown, and
  terminal receipts are never reset by repeated scheduling.
- Resume, cancel, delay, and recovery use the installed SDK's public atomic
  transitions; the plugin does not perform a second best-effort interrupt
  mutation.
- Package projections never pre-claim `running` or synthesize a graph
  `failed`, `delayed`, or `cancelled` transition. They project only a verified
  SDK checkpoint/result using compare-and-swap semantics.
- A run resumes from its immutable snapshot and exact deployment hash, never
  from current authoring data.
- Unknown dispatch outcomes remain blocked until reconciled. Recovery cannot
  convert uncertainty into an automatic retry of a write.
- Parent cancellation and timeout cascade through supported Sub-Playbook
  ancestry; a child cannot productively outlive its parent.
- A child semantic result of `failed`, `unknown`, `cancelled`, or `canceled`
  fails the parent node. Only an explicitly successful child contract can
  reach the parent success edge; child interrupts and delays continue to bubble
  through the SDK's structured-concurrency contract.

After changing the SDK constraint or any adapter boundary, run the public API
compatibility test, the targeted interrupted-resume/confirmation tests, and
Doctor. Missing required SDK methods are blocking compatibility failures.

The database adapters forward the SDK task attempt and node claim token without
alteration while keeping durable error redaction. Child selection and delayed
child interrupt validation use the SDK implementations. The plugin still owns
its ancestor authorization, cancellation policy, external capability gateway,
and immutable deployment checks; those are not removed by an SDK upgrade.

The 0.16 claim-token migration must run on the configured AgentGraph database
while old workers are drained. Existing immutable 0.15 Playbook artifacts are
not widened or rewritten: publish new Playbooks and then obtain new,
hash-bound Agent candidate evidence through the normal release lifecycle before
activation. A test with a different model cannot certify an unchanged candidate.
