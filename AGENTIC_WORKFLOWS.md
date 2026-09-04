# Agents and Playbooks

The product is Agent-first. Every live chat is owned by one immutable,
hash-verified Agent deployment. A Playbook is an optional process tool that the
Agent may invoke; it is not the conversation loop.

## Agent ownership

The Agent understands ordinary language, answers within its published
authority, asks a natural clarification when information is missing, and turns
typed failures into truthful user-facing responses. It can operate without a
Playbook.

The model may propose an answer, capability call, or Playbook invocation. The
deployment contract and deterministic policy decide what is actually allowed.
An unpinned source, capability, API operation, Data Resource, or Playbook is not
available.

External work crosses `CapabilityExecutionGateway`. Confirmation,
idempotency, payload and schema binding, redaction, budgets, unknown-outcome
handling, and reconciliation remain outside model authority.

## What a Playbook is

A Playbook is a bounded, immutable graph for a process that benefits from
explicit steps, such as:

- collecting and validating several values;
- approving a write before dispatch;
- calling a pinned API operation and transforming its result;
- deterministic branching;
- bounded iteration;
- waiting or invoking another pinned Playbook.

Use no Playbook for general conversation or a straightforward knowledge Agent.
Do not put response wording, open-ended intent routing, or a second autonomous
assistant in a Playbook.

## Playbook step catalog

The editable schema has exactly twelve step kinds:

| Step | Purpose |
| --- | --- |
| Entry | Single process entry |
| Request Input | Typed visitor waitpoint |
| Capability | One approved action, knowledge search, API/HTTP call, or memory operation |
| Decision | Deterministic condition or exact-value branch |
| Approval | Explicit approve/decline waitpoint |
| Wait | Durable bounded delay |
| AI Task | One bounded extraction or transformation, without tool or route authority |
| Transform | Deterministic data transformation or expression |
| For Each | Bounded collection processing |
| Sub-Playbook | One allowed, pinned child Playbook |
| Result | Internal typed outcome returned to the Agent |
| Note | Canvas-only documentation |

Generic Ask, Respond, Fallback Reply, Knowledge Answer, Data Answer, Agent
Answer, and Finish are not Playbook primitives. Request Input is a typed
waitpoint; Result is an internal process outcome. The Agent owns the eventual
chat response.

## Waitpoints and side questions

Request Input and Approval create typed AgentGraph interrupts. A visitor answer
resumes only when it validates against the current interrupt contract. A side
question remains an Agent turn and does not consume or corrupt the pending
waitpoint.

A short, unambiguous whole-message answer to an active text or choice waitpoint
is admitted and resumed deterministically before model dispatch. The original
visitor text remains the submitted value. Questions, quoted text, conditions,
uncertainty, negation, cancellation, multiline input, and mixed statements do
not use this fast path; they remain Agent turns so the pending waitpoint is not
consumed accidentally. Approval, form, and operator-review interrupts retain
their dedicated typed paths.

## Capabilities

A Capability step selects one backend contract. Common forms are:

- `actionKey` for a registered host action or governed Data Resource operation;
- an immutable API operation pin consisting of revision id, contract hash, and
  input-schema hash;
- `capabilityKey: knowledge_search` for attached, allowed knowledge;
- an explicitly configured raw HTTP operation;
- a bounded memory read or write.

A step describes process intent but grants no authority. Publication resolves
and hashes the dependency closure. Writes still require the declared approval,
grant, confirmation, and idempotency policy.

## AI Tasks

AI Task is deliberately narrow. It may summarize, classify supplied data, or
extract a declared structure. It cannot select capabilities, route the
conversation, modify permissions, or generate the final chat answer. Use a
Decision after the AI Task when deterministic routing is needed.

## Draft, publish, assign

1. Create a Playbook only when the Agent needs a multi-step process.
2. Build or generate a draft in the Playbook Builder.
3. Validate the draft and test the bounded process.
4. Publish an immutable Playbook deployment.
5. Explicitly assign the Playbook to the Agent.
6. Publish a new Agent deployment so the exact Playbook version and hash become
   part of its closed authority manifest.

Editing a draft never changes a live Agent. A legacy live-workflow pointer never
grants Playbook authority.

## Editor

The Playbook Builder keeps the existing React Flow canvas, Filament colors,
light/dark themes, keyboard interactions, viewport persistence, and responsive
drawers. AI Draft is a convenience for producing the same schema; it is never a
separate runtime or permission source. See [Playbook Builder](PLAYBOOK_BUILDER.md)
and [Playbook JSON Schema](WORKFLOW_JSON_SCHEMA.md).

## Runtime boundary

The internal executable graph remains an implementation detail compiled from
the authoring document at preview and publication boundaries. AgentGraph owns
checkpoint, interrupt, resume, delay, cancellation, and task state. Operational
rows such as Playbook runs and pending interactions are projections, not an
alternative state machine.

The complete architecture decision is [ADR 0008](adr/0008-agent-first-playbook-cutover.md).
