# Agents and Workflows

The product is Agent-first. Every live chat is owned by one immutable,
hash-verified Agent deployment. A Workflow is an optional process tool that the
Agent may invoke; it is not the conversation loop.

## Agent ownership

The Agent understands ordinary language, answers within its published
authority, asks a natural clarification when information is missing, and turns
typed failures into truthful user-facing responses. It can operate without a
Workflow.

The model may propose an answer, tool call, or Workflow invocation. The
deployment contract and deterministic policy decide what is actually allowed.
An unpinned source, tool, API operation, app data tool, or Workflow is not
available.

External work crosses `CapabilityExecutionGateway`. Confirmation,
idempotency, payload and schema binding, redaction, budgets, unknown-outcome
handling, and reconciliation remain outside model authority.

## What a Workflow is

A Workflow is a bounded, immutable graph for a process that benefits from
explicit steps, such as:

- collecting and validating several values;
- approving a write before dispatch;
- calling a pinned API operation and transforming its result;
- deterministic branching;
- bounded iteration;
- waiting or invoking another pinned Workflow.

Use no Workflow for general conversation or a straightforward knowledge Agent.
Do not put response wording, open-ended intent routing, or a second autonomous
assistant in a Workflow.

## Workflow step catalog

The editable schema has exactly twelve step kinds:

| Step | Purpose |
| --- | --- |
| Entry | Single process entry |
| Request Input | Typed visitor waitpoint |
| Tool | One approved action, knowledge search, API/HTTP call, or memory operation |
| Decision | Deterministic condition or exact-value branch |
| Approval | Explicit approve/decline waitpoint |
| Wait | Durable bounded delay |
| AI Task | One bounded extraction or transformation, without tool or route authority |
| Transform | Deterministic data transformation or expression |
| For Each | Bounded collection processing |
| Sub-Workflow | One allowed, pinned child Workflow |
| Result | Internal typed outcome returned to the Agent |
| Note | Canvas-only documentation |

Generic Ask, Respond, Fallback Reply, Knowledge Answer, Data Answer, Agent
Answer, and Finish are not Workflow primitives. Request Input is a typed
waitpoint; Result is an internal process outcome. The Agent owns the eventual
chat response.

## Inputs, waitpoints and side questions

A Workflow is one Agent tool whose arguments are its input schema, declared on
the Entry step (ADR 0040). The Agent collects the values in conversation; if a
required value is missing or invalid, the tool names it and nothing starts.

Request Input and Approval create typed AgentGraph interrupts for values that
exist only mid-process and for approvals. While a run waits for input, the same
tool takes that value; it resumes only when it validates against the current
interrupt contract. An Approval is decided on a confirmation card with Confirm
or Cancel, never by text. A side question remains an Agent turn and does not
consume the waitpoint. The `cancel_playbook` tool (its name is unchanged)
stops an open run at any time.
## Tools

A Tool step selects one backend contract. Common forms are:

- `actionKey` for a registered host action or governed app data tool operation;
- an immutable API operation pin consisting of revision id, contract hash, and
  input-schema hash;
- `capabilityKey: knowledge_search` for attached, allowed knowledge;
- an explicitly configured raw HTTP operation;
- a bounded memory read or write.

A step describes process intent but grants no authority. Publication resolves
and hashes the dependency closure. Writes still require the declared approval,
grant, confirmation, and idempotency policy.

### Image generation action

The `generate_image` write action takes a prompt and generation parameters.
Its input schema has no `url` or `headers`. For a generic HTTP JSON provider,
configure the destination and credentials in the host package configuration:

```php
'workflow' => [
    'image_generation' => [
        'transport' => 'http_json',
        'model' => 'your-image-model',
        'timeout' => 120,
        'http' => [
            'endpoint' => env('IMAGE_PROVIDER_ENDPOINT'),
            'allowed_hosts' => ['images.example.com'],
            'headers' => ['Authorization' => 'Bearer '.env('IMAGE_PROVIDER_TOKEN')],
            'max_response_bytes' => 10485760,
        ],
    ],
],
```

`workflow.image_generation.http.endpoint`, `headers`, `allowed_hosts` and
`max_response_bytes` are supported host configuration keys. Header values can
come from the host secret store; they never come from Workflow or model input.
The endpoint must match an exact host in the allowlist and resolve exclusively
to public addresses. The allowlist defaults to empty and refuses wildcard
entries. Requests pin those validated DNS addresses, disable proxies and
redirects, require TLS certificate verification for HTTPS, and bound response
bytes including decompression (default 10 MiB, maximum 20 MiB). HTTP timeout is
host controlled and capped at 300 seconds, with at most 10 seconds to connect.
There is no private-network override. Doctor and Setup report invalid endpoint
or allowlist configuration. Native Laravel AI image generation still uses an
explicit provider and model with host-configured credentials.

The image handler contract is version `2` (ADR 0058). Published versions with
old image action pins require review and republication; upgrade preflight names
the affected Workflows and Agents. See [UPGRADING.md](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md).

## AI Tasks

AI Task is deliberately narrow. It may summarize, classify supplied data, or
extract a declared structure. It cannot select tools, route the
conversation, modify permissions, or generate the final chat answer. Use a
Decision after the AI Task when deterministic routing is needed.

## Draft, publish, assign

1. Create a Workflow only when the Agent needs a multi-step process.
2. Build or generate a draft in the Workflow Builder.
3. Validate the draft and test the bounded process.
4. Publish. When the Agent is Live or Paused, the primary action is
   **Publish and update {Agent}** (ADR 0048): one database transaction creates
   the immutable Workflow version and a new Agent version derived from the
   Agent's live version with exactly this Workflow pin replaced or added, so
   its exact version and hash are part of the closed authority manifest. The
   Agent's other draft changes stay unpublished, and Live or Paused stays.
5. When the Agent is still a Draft, Publish creates the Workflow version only
   and the editor shows "Publish the Agent to use this Workflow"; the Agent's
   first Publish includes it.

**Publish only** keeps the step-by-step path: publish the Workflow version,
assign it in the Agent draft (**Add to {Agent}**) and publish the Agent.
**Update {Agent}** makes the current Workflow version live in an Agent that
runs an older one, without a new Workflow version.

Publish and update needs publish authority on the Workflow and on the Agent
(`workflows.publish`, `agents.publish`) and, when it adds the Workflow to the
Agent draft's Workflow list, `agents.manage` on the Agent. It locks the Agent
row, then the Agent's Workflow rows by ascending id, and compares the heads
the editor reviewed: the Workflow draft and published fingerprints, the
Agent's live version and the revision of the draft's Workflow list. Any
concurrent change is a conflict and nothing is published; any failure leaves
both live pointers unchanged. It is refused when the new version would
weaken confirmation (an approval step removed), when a Workflow that saves
data would be added to a live version that may only read, when the draft no
longer lists a Workflow the live version uses, and when the Agent and
Workflow tables resolve to different database connections. A later Workflow
rollback cannot be undone silently by an Agent Publish (ADR 0055).

Editing a draft never changes a live Agent. A legacy live-workflow pointer never
grants Workflow authority.

## Editor

The Workflow Builder keeps the existing React Flow canvas, Filament colors,
light/dark themes, keyboard interactions, viewport persistence, and responsive
drawers. AI Draft is a convenience for producing the same schema; it is never a
separate runtime or permission source. See [Workflow Builder](PLAYBOOK_BUILDER.md)
and [Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md).

## Runtime boundary

The internal executable graph remains an implementation detail compiled from
the authoring document at preview and publication boundaries. AgentGraph owns
checkpoint, interrupt, resume, delay, cancellation, and task state. Operational
rows such as Workflow runs and pending interactions are projections, not an
alternative state machine.

The complete architecture decision is [ADR 0008](adr/0008-agent-first-playbook-cutover.md).
