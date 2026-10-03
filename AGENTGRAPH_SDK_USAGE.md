# AgentGraph SDK usage

This note records the AgentGraph boundary used by the plugin. It is not a
release checklist and does not authorize publishing or changing the SDK.

## Dependency

- Composer package: `heiner/agent-graph`
- Current plugin constraint: `0.18.1` (exact stable release)
- The consuming host and isolated `apps/sandbox` harness declare the same exact
  stable release. A declaration alone does not update an installed lock or
  certify a host: complete the coordinated store migration and deployment
  publication before accepting work.
- Version 0.18.1 validates accepted-resume authority before recovery, queued
  dispatch and superstep mutations. Its native retry recognition replaces the
  plugin's duplicate `assertRecoveryBindings` and `matchesAcceptedNodeResume`.
  The original consumer recovery/projection tests pass before and after their
  removal; direct-child admission, ancestry and cancellation remain local.
  This patch adds no consumer migration or ABI change. The exact SDK pin still
  requires newly published Playbook artifacts and Agent deployments.
- The required public surface is enforced by
  `AgentGraphPublicApiCompatibilityTest`.
- Recovery behavior is characterized by the interrupted-resume, delayed-resume,
  cancellation, projection-authority, and side-effect fault-injection tests.
- The bounded 0.16 integration evidence is kept in the package repository's
  documentation archive.

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

When a Playbook is open, the Agent receives its tool (to supply the pending
value or read the status) plus `cancel_playbook` (ADR 0040); it keeps its other
read tools so a side question does not mutate the Playbook checkpoint. A
different Playbook cannot start until the current run is terminal.

## SDK surfaces used

- `AgentGraphManager` defines, validates, starts, resumes, inspects, cancels,
  and recovers Playbook graphs.
- `StateGraph` compiles the internal Runtime-v1 projection generated from the
  semantic Playbook document. Retry, channels, interrupt capability, node
  metadata, and coarse side-effect annotations are declared on this graph.
- `AgentNode` executes bounded Playbook AI Tasks. It does not own general chat
  or choose capabilities.
- Native Laravel AI tool approvals raise `AgentApprovalRequiredException`.
  The plugin adapter preserves that failure without a synchronous fallback or
  another model attempt. Productive approvals use the existing graph interrupts.
- `SubgraphNode` executes deployment-pinned Sub-Playbooks with isolated state,
  bounded depth, parent identity, interrupt bubbling, and declared output
  mapping.
- `StructuredConcurrencySubgraphNode` admits each child through an explicit,
  Fiber-local parent-node scope and `NodeContext::assertActive()`. Its runtime
  adapter overrides only public SDK operations. Removed protected execution and
  resume-validation hooks are no longer used. Native SDK resume validation and
  nested-child identity handling remain authoritative.
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

In 0.18, scheduling transfers accepted-resume authority from that temporary
metadata into durable node receipts for synchronous and queued execution. An
identical retry may use public recovery only when the receipt and resolved
interrupt prove the exact response, checkpoint and node. Application recovery
checks reject changed graph, descendant, interrupt and response bindings before
scheduling. A claimed receipt stays blocked until its original lease expires;
recovery never borrows or replaces the current claim token.

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
- Cancellation revokes the parent through the SDK's revision-fenced public
  transition before cancelling descendants. It does not hold a root cache lock
  across node execution. Native ancestor checks block further child admission
  even if the process stops during the cascade; repeated cancellation repairs
  remaining active descendants without rewriting terminal records.
- A child semantic result of `failed`, `unknown`, `cancelled`, or `canceled`
  fails the parent node. Only an explicitly successful child contract can
  reach the parent success edge; child interrupts and delays continue to bubble
  through the SDK's structured-concurrency contract.

After changing the SDK constraint or any adapter boundary, run the public API
compatibility test, the targeted interrupted-resume/confirmation tests, and
Doctor. Missing required SDK methods are blocking compatibility failures.

The database adapters forward the SDK run revision, task attempt and node claim
token without alteration while keeping durable error redaction. Run error
normalization intercepts `RunStore::transition`, including native SDK failures
and callers of the inherited `update` convenience method. Child selection and
delayed child interrupt validation use the SDK implementations. The plugin still owns
its ancestor authorization, cancellation policy, external capability gateway,
and immutable deployment checks; those are not removed by an SDK upgrade.

Upgrading from 0.16 requires the additive 0.17 run-revision migration on the
configured AgentGraph database while all old workers and requests are stopped.
The earlier claim-token migration must also be present. Synchronous execution
now requires the node-execution table and its receipt retention policy. 0.18
adds no migration beyond 0.17. Restart all PHP execution processes on the same
dependency set. Existing immutable Playbook artifacts are not widened or
rewritten: publish new Playbooks and then publish the Agents that use them.

Diagnostic event listeners cannot abort confirmed execution in 0.18. Recovery
fault tests therefore suspend and abandon an execution Fiber at a durable
acceptance event, then rebuild the runtime against the same test database.
Package checks cover exact retry, lease expiry, tampered bindings, cancellation
during a suspended child, restart cancellation, confirmation payloads and delay
recovery. Doctor is exercised on the isolated migrated test database; these
checks do not certify a host rollout, external provider, or unknown write.
