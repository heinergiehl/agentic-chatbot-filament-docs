# Smart Workflow Builder

The workflow editor's primary authoring model is a `schemaVersion: 2` semantic workflow.

Authors work with semantic steps, transitions, annotations, and policies. The runtime graph is a compiled artifact, not the source of truth for schema v2 workflows. This lets the editor stay readable while the engine owns repetitive execution details such as turn understanding, write-confirmation policy, retry behavior, timeout handling, and runtime projection.

This semantic model replaces the old split between "smart" authoring helpers and raw runtime graph editing. It does not create a separate builder mode; authors stay in one editor and compiled runtime details remain internal diagnostics.

## Current Simplification Principles

- Author at the chatbot behavior level: ask, respond, route, knowledge answer, data answer, action, approval, finish, and annotation.
- Keep configuration visible only where it changes business behavior or safety.
- Prefer workflow-level policies when the engine can enforce a behavior without another visible node.
- Compile schema v2 to runtime nodes only at preview, validation, publish, activation, and execution boundaries.
- Treat the compiled runtime graph as a developer/debugging layer.
- Keep advanced fields reachable, but do not make raw runtime mappings the default editing experience.
- Treat legacy schema v1 JSON as an external/runtime artifact, not as an editor import or authoring path.

## Schema v2 Shape

A schema v2 workflow contains:

- `steps`: semantic workflow nodes on the React Flow canvas.
- `transitions`: semantic edges between step ids, with optional route path ids.
- `annotations`: canvas notes that do not compile to runtime behavior.
- `policies`: engine-owned behavior such as turn understanding, write confirmation, retry, and timeout.
- `compiler`: metadata for the runtime projection.

## Runtime Projection

Schema v2 payloads are stored as schema v2 in drafts, published workflow data, versions, imports, and exports.

Runtime consumers should ask the model or compiler for an executable graph instead of reading `nodes` and `edges` directly. In PHP, use `AgentWorkflow::runtimeWorkflowData()` for published workflows or `editorRuntimeWorkflowData()` for drafts. In React, the editor projects schema v2 through `compileWorkflowSchemaV2ToRuntime()` when React Flow needs runtime-compatible nodes and edges.

## Legacy Compatibility

Schema v1 runtime workflows are legacy data and internal execution artifacts. The editor does not import, save, publish, or silently mutate a v1 graph into schema v2 when an author adds semantic steps or annotations.

When an old workflow should become editable, rebuild it as a schema v2 semantic workflow. This is stricter than preserving v1 editing paths, but it keeps the commercial editor model cleaner and avoids teaching runtime plumbing as product UI.

This is an intentional breaking direction for the minor-version line: better authoring quality and a simpler product model are preferred over preserving every v1 editing path as a first-class experience.
