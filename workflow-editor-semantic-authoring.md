# Workflow Editor Semantic Authoring

This document describes the current workflow editor authoring contract after the schema v2 refactor.

## Product Goal

The editor should help users build reliable chatbot behavior, not expose every runtime detail as a node.

The chatbot should communicate naturally while still obeying the workflow. Authors configure the moments that matter: what to ask, how to route, what answer sources to use, which actions may run, and when approval is required. The engine should own generic behavior such as understanding a user's full turn, applying write-confirmation policy, retrying safely, and compiling executable runtime nodes.

## Default Canvas

The default canvas is a semantic React Flow graph:

- Semantic steps are the visible behavior units.
- Transitions describe author intent between steps.
- Annotations are visual notes and are not executable.
- Policies describe engine behavior that should not require extra nodes.
- Runtime nodes are compiled for execution and debugging.

New workflows should start as empty schema v2 payloads. The node catalog should prioritize semantic steps and keep expert/runtime details secondary.

`Internal runtime` is a diagnostics surface for compiled graph definitions, not a recommended authoring mode. If a normal workflow need cannot be expressed with Builder or Expert semantic steps, add or improve a semantic step/policy instead of exposing another raw runtime node.

## Step Model

Use semantic steps when the author needs to configure behavior:

| Step | Author intent |
| --- | --- |
| `start` | Entry point for the workflow |
| `ask` | Collect a value from the user |
| `respond` | Send a message or final answer |
| `route` | Choose a branch from intent or conditions |
| `knowledgeAnswer` | Answer from approved knowledge sources |
| `dataAnswer` | Query approved data resources |
| `action` | Run an allowed side-effect or tool |
| `approval` | Require explicit user confirmation |
| `finish` | End the workflow deliberately |

Do not add a visible node when a workflow-level policy can express the behavior more clearly.

## Runtime Graph

Runtime JSON is still the execution format. It is generated from schema v2 when the editor, validator, activation service, or chat runtime needs executable `nodes` and `edges`.

Important rule: schema v2 runtime output is disposable. Do not persist runtime output as the canonical state of a schema v2 workflow; only legacy archive/export code should preserve schema v1 runtime JSON.

## Save, Publish, And Activation

Save and publish should preserve the authoring payload.

- Draft save stores schema v2 when the editor is in schema v2 mode.
- Publish stores schema v2 in `workflow_data` and records the schema version.
- Runtime access compiles schema v2 at the boundary.
- Activation validates the published payload before making the workflow active.

This prevents invalid published workflows from becoming live through list actions, model actions, or edit-page actions.

## Engine Policies

Schema v2 policies are part of the authoring contract:

```json
{
  "policies": {
    "turnUnderstanding": {},
    "writeConfirmation": {},
    "retry": {},
    "timeout": {}
  }
}
```

Use these when behavior should be generic across the workflow. For example, a workflow that stores a submission can satisfy write-safety either with an explicit `approval` step before the write or with a write-confirmation engine policy. The validator treats those as different confirmation sources, but both must be intentional.

## Legacy v1 Workflows

Schema v1 workflows are runtime graphs. They are not silently converted when an author edits the semantic canvas.

When the editor opens a v1 payload:

- The graph remains inspectable as runtime nodes and edges.
- The original v1 JSON is retained for archive export.
- The sidebar footer shows a compact schema v1 archive state.
- Adding semantic steps or annotations is blocked until the author explicitly converts the graph.
- Conversion runs the v1-to-v2 importer and reports warnings in Checks.

If conversion fails because transitions are ambiguous or runtime-only nodes cannot be mapped, the author should export the archive and rebuild the workflow in schema v2.

## Developer Rules

- Add new authoring behavior to `resources/js/workflow-editor/src/semantic/*` first.
- Keep schema v2 payload functions centralized in `workflowPayloadAdapter.ts`.
- Keep backend runtime access behind `AgentWorkflow::runtimeWorkflowData()` or the schema v2 compiler.
- Avoid new UI that writes raw runtime `nodes` and `edges` for schema v2 workflows.
- Add regression tests whenever the v2 payload boundary, legacy importer, publish path, or activation validator changes.
- Generated assets in `public/js/workflow-editor` must be refreshed after frontend source changes.

## QA Checklist

Before shipping workflow editor authoring changes:

- Open a new workflow and confirm the semantic catalog is the default authoring path.
- Open a schema v2 workflow and confirm save, export, publish, and activation keep schema v2.
- Open a schema v1 workflow and confirm original export is available before conversion.
- Convert a simple v1 workflow and review importer warnings.
- Verify the compiled runtime graph still passes `WorkflowJsonValidator`.
- Check desktop, tablet, and narrow mobile layouts for the sidebar footer, inspector, canvas, and validation checks.
