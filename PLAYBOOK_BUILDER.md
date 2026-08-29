# Playbook Builder

The Playbook Builder is the optional visual editor for bounded Agent processes.
Creating and publishing a conversational Agent does not require opening it.

## Editor model

The Agent is the conversation owner. It interprets free-form requests, asks for
clarification, and chooses direct read tools independently. A Playbook is one
optional Agent tool for a bounded process whose order, approvals, writes, or
recovery rules must be controlled.

The editor therefore has two deliberately separate layers:

1. **Use** defines the immutable invocation contract: bounded outcome, positive
   start rule, exclusions, and realistic matching requests.
2. **Steps** defines what happens only after the Agent has chosen the Playbook.

The React Flow canvas does not model the Agent's conversation or tool-selection
reasoning. It models only the deterministic process, including explicit
branches and typed waitpoints. This is why a flexible Agent and a directed graph
can coexist without implying that every chat follows a top-to-bottom workflow.

The saved document is a `schemaVersion: 2` Playbook with invocation metadata,
semantic steps, and transitions. The backend compiler produces the internal
executable graph used for preview and immutable publication. Compiled runtime
JSON is not a second editable source of truth.

The UI has one catalog, one canvas, one inspector, and one validation model.
Advanced fields are progressively disclosed inside the selected step; there is
no separate recipe runtime or expert node architecture.

## Starting a draft

A new Playbook starts with Entry only. From there:

- define **Use** before publication so the Agent has an unambiguous routing
  contract;
- choose **AI Draft** to generate a schema-v2 proposal from a description; or
- add one of the twelve process steps manually.

Review generated capabilities, branches, waitpoints, and write approvals before
publishing. AI Draft can propose structure but cannot grant dependencies.

## Canvas rules

- Keep one Entry and at least one Result before publication.
- Use Request Input only for typed information needed by this process.
- Use Decision for deterministic conditions or exact values.
- Put every write behind an explicit Approval. Only the Approved path may reach
  the write; the Declined path must end without writing. The capability gateway
  still enforces confirmation, authority, payload binding, and idempotency.
- Keep AI Task bounded; follow it with deterministic validation or routing.
- Give For Each a finite `maxItems` value.
- Use Note for documentation only. Notes never become prompts or runtime nodes.

## Responsive behavior

Use rules and the process canvas are peer authoring surfaces. Catalog, checks,
navigation, and the step inspector adapt as drawers at narrow widths without
introducing page-level horizontal scrolling. Build-tool labels collapse to
accessible icon buttons with tooltips when the rail is too narrow. The editor
uses the existing `--fi-wf-*` and Filament tokens in light and dark modes; it
does not install global CSS or Tailwind preflight.

Keyboard focus, canvas zoom/pan, drag/drop, connection handles, undo/redo,
autosave, and unsaved-state warnings remain part of the editor contract.

## Publication

Save updates only the mutable draft. Review, AI Draft completion, and Publish
share the same release-readiness preflight: outcome and start rules, graph and
step validation, explicit write approvals, exact capability materialization,
dependency pinning, and the published contract. Publish then creates the
immutable deployment. The invocation contract is frozen with that deployment.
The Agent can use it only after an explicit assignment is included in a newly
published Agent deployment.

See [Agents and Playbooks](AGENTIC_WORKFLOWS.md) and
[Playbook JSON Schema](WORKFLOW_JSON_SCHEMA.md).
