# Playbook JSON Schema

The Playbook Builder persists a semantic `schemaVersion: 2` document. This is
the only editable Playbook source of truth. The package compiles it to an
internal `schemaVersion: 1` AgentGraph payload at preview and publication
boundaries; callers should not author that runtime projection directly.

## Top-level document

```json
{
  "schemaVersion": 2,
  "name": "Lookup order",
  "description": "Find an order and return verified data.",
  "invocation": {
    "version": 1,
    "purpose": "Return the verified order status.",
    "useWhen": "The user explicitly asks for the status of an existing order.",
    "doNotUseWhen": ["The user wants to place or cancel an order."],
    "examples": ["Where is order 1042?", "Check my existing order status."]
  },
  "steps": [],
  "transitions": [],
  "annotations": [],
  "conversationMemoryPolicy": "inherit",
  "policies": {},
  "compiler": {},
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

`invocation` is the deployment-bound Agent routing contract. `purpose` and
`useWhen` are required for publication. `doNotUseWhen` and `examples` contain
up to twelve bounded strings each. This metadata helps the Agent choose the
tool; it does not authorize capabilities or add graph transitions.

`steps` and `transitions` are ordered lists. `annotations` are visual only.
Policy objects are normalized and validated by the backend; they cannot grant
capabilities.

## Step shape

```json
{
  "id": "lookup_order",
  "kind": "capability",
  "label": "Lookup order",
  "position": { "x": 420, "y": 180 },
  "data": {
    "actionKey": "query_data_resource",
    "inputMapping": { "resource_key": "orders" },
    "outputVariable": "orders"
  }
}
```

Every step needs a unique stable `id`, one allowed `kind`, a label, a position,
and a `data` object. The accepted kinds are exactly:

```text
entry
requestInput
capability
decision
approval
wait
aiTask
transform
forEach
subPlaybook
result
note
```

## Transition shape

```json
{
  "id": "lookup_to_result",
  "sourceStepId": "lookup_order",
  "targetStepId": "result",
  "path": "default"
}
```

`path` is required only for a branching source. Conditions use `yes` and `no`.
Exact-value Decisions use the stable ids declared in `data.paths` plus
`default`. Approval uses `valid` and `invalid`. Structured AI Tasks use `valid`
and `invalid`. For Each uses `each` and `done`.

## Step data contracts

### Entry

Entry carries no capability authority. A publishable Playbook has exactly one
entry point.

### Request Input

Common fields are `prompt`, `variableName`, `inputType`, `required`, and typed
validation settings. It creates a visitor waitpoint; it does not make the
Playbook the general conversation owner.

### Capability

Use one of these mutually meaningful forms:

- registered action: `actionKey`, `inputMapping`, `outputVariable`;
- knowledge: `capabilityKey: knowledge_search`,
  `runtimeNodeType: knowledgeBase`, `queryTemplate`, `outputVariable`;
- saved API: `apiOperationRevisionId`, `apiOperationContractHash`,
  `apiOperationInputSchemaHash`, `inputMapping`, `outputVariable`;
- raw HTTP: `runtimeNodeType: httpRequest`, method, URL, schemas, side-effect,
  confirmation, and idempotency fields;
- memory: `runtimeNodeType: memoryRead` or `memoryWrite`, namespace, key, value,
  and output fields.

Publication resolves the actual grant and immutable dependency. The JSON alone
never authorizes execution. Only `GET` requests are retried by default; unsafe
methods need an explicit idempotency and retry policy.

### Decision

For `mode: condition`, declare `leftOperand`, `operator`, and `rightOperand`.
For `mode: value`, declare `switchValue` and stable `paths` entries containing
`id` and `label`. Matching is exact; fuzzy routing is not supported.

### Approval

Declare the approval prompt and result variable. The approved and declined
paths are explicit. Approval does not replace gateway-side grant, payload,
confirmation, or idempotency checks.

### Wait

`delaySeconds` is bounded and durably scheduled by AgentGraph.

### AI Task

Declare one bounded instruction, `inputTemplate`, output variable, and optional
`outputSchema`. AI Task cannot select tools, routes, permissions, or final chat
wording. A structured output has `valid` and `invalid` paths.

### Transform

Use a supported deterministic operation or an expression with an explicit
output variable.

### For Each

Declare `collectionVariable`, item/index variables, and finite `maxItems`. Use
the `each` and `done` paths.

### Sub-Playbook

Declare the allowed child workflow id, mappings or templates, result variable,
and bounded depth. Publication replaces mutable references with a pinned child
deployment closure.

### Result

Result is terminal and returns an internal process outcome to the Agent. It may
declare `resultTemplate`, `statusVariable`, and `statusValue`. It does not emit
the final visitor response directly.

### Note

Note is omitted from the executable graph. Its content cannot become a prompt,
permission, or runtime instruction.

## Minimal example

```json
{
  "schemaVersion": 2,
  "name": "Collect email",
  "description": null,
  "invocation": {
    "version": 1,
    "purpose": "Return a validated email address for the requested process.",
    "useWhen": "The user has chosen a process that requires an email address and none is available yet.",
    "doNotUseWhen": ["The user is only asking a general question."],
    "examples": ["Use me@example.com for the support case."]
  },
  "steps": [
    {
      "id": "entry",
      "kind": "entry",
      "label": "Entry",
      "position": { "x": 80, "y": 160 },
      "data": {}
    },
    {
      "id": "email",
      "kind": "requestInput",
      "label": "Email",
      "position": { "x": 360, "y": 160 },
      "data": {
        "prompt": "Which email should I use?",
        "variableName": "email",
        "inputType": "email",
        "required": true
      }
    },
    {
      "id": "result",
      "kind": "result",
      "label": "Return email",
      "position": { "x": 640, "y": 160 },
      "data": { "resultTemplate": "{{email}}" }
    }
  ],
  "transitions": [
    { "id": "entry_email", "sourceStepId": "entry", "targetStepId": "email" },
    { "id": "email_result", "sourceStepId": "email", "targetStepId": "result" }
  ],
  "annotations": [],
  "conversationMemoryPolicy": "inherit",
  "policies": {},
  "compiler": {},
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

Drafts may be incomplete. Publication additionally requires a bounded outcome,
an explicit Agent start rule, a valid entry, terminal Result, valid branch
paths, resolved immutable dependencies, and all security/policy checks.

Public presentation copy is not a second authoring chore. Unless explicitly
overridden, the compiler derives the public title and description from the
Playbook name and description and derives capability labels from visible step
labels. Obsolete `turnUnderstanding` policy input is discarded; Agent-owned
behavior remains outside the Playbook document. Every productive write must be
reachable only from an Approval's Approved path, while the capability gateway
continues to enforce its independent runtime safeguards.
