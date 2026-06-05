# Smart Workflow Builder

The workflow editor has one authoring surface: the graph that the runtime already executes.

Smart Step metadata is an internal authoring helper for recipes, grouping, import cleanup, and future AI draft review. It does not create a separate mode, a separate canvas, or new runtime node types.

## Current Simplification Principles

- Keep workflows as ordinary `nodes` and `edges`.
- Use safer defaults for common chatbot tasks.
- Reduce each node inspector to the business fields needed first.
- Move provider, retry, memory, raw mappings, and developer controls into contextual advanced sections.
- Preserve imports, exports, validation, releases, traces, and runtime execution exactly as before.

## Smart Step Metadata

Smart Step metadata is optional data on ordinary nodes:

```ts
smartStepId?: string
smartStepKind?: 'ask' | 'reply' | 'route' | 'knowledgeAnswer' | 'useTool' | 'captureSubmission' | 'handoffFallback' | 'note'
smartStepRole?: 'root' | 'internal' | 'fallback' | 'success' | 'cancel' | 'branch'
smartStepLabel?: string
smartStepVersion?: 1
```

The runtime ignores these fields. Validation preserves them so existing workflow payloads remain compatible.

## Compatibility Notes

- Existing workflows without Smart Step metadata remain editable.
- Imported workflows may keep or omit these fields.
- Runtime executors ignore the metadata and continue to read the ordinary node type, node data, and edges.
- Advanced controls remain available inside the relevant node inspector when a workflow needs exact provider, retry, mapping, memory, or raw-data behavior.
