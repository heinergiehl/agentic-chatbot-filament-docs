# Playbook Builder

The Playbook Builder is the optional visual editor for bounded Agent processes.
Creating and publishing a conversational Agent does not require opening it.

## Editor model

The Agent is the conversation owner. It interprets free-form requests, asks for
clarification, and chooses direct read tools independently. A Playbook is one
optional Agent tool for a bounded process whose order, approvals, writes, or
recovery rules must be controlled.

The editor therefore has two deliberately separate layers:

1. **Setup > When to use** defines the immutable invocation contract: bounded outcome, positive
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

- define **When to use** before publication so the Agent has an unambiguous routing
  contract;
- choose **Add first step** to open the catalog, or start with **Retrieve data**
  or **Approve before writing**;
- use **More Playbook tools > Create draft with AI** for a generated proposal.

Starters insert ordinary semantic steps as one undoable edit. They do not select
resources or grant permissions. Choose the approved operation and complete its
required fields. The main catalog shows Request Input, Run Operation, Decision,
Approval, and Result; less common process controls remain under Advanced.

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

AI Task instructions are fixed authoring text in both plain and structured
output modes. Additional system rules supplement that task; they do not replace
it. Put visitor input and workflow references in the input template, not in task
instructions or system rules. Republish affected Playbooks and their owning
Agent release after correcting an existing task: an immutable deployment does
not silently acquire new compiler behavior.

## Returning useful results

Use the Result field picker to select original outputs from earlier capabilities.
When the editor has a pinned field suggestion, it offers that field; otherwise
it offers the whole returned value. The optional preview uses samples from a
pinned test run or trace, not evidence of a new execution. The advanced Result template remains available
for explicit references, for example
`{{lookup.data.name}}` and `{{lookup.data.balance}}` for an API Connector, or
`{{action_result.receipt}}` for an Action. Leaving the template empty selects
the last unchanged capability output. For Each retains the verified result of
each iteration; Sub-Playbook output mappings retain the child's verified fields.

The Agent composes a provider-free public answer from those fields. The literal
Result template and internal model prose are not copied to visitors; arbitrary
inputs, overwritten variables, connector headers, execution metadata, and
unverified AI Task/Transform output cannot become asserted facts. Select the
original capability fields when a transform or AI step is only presentation
work. Unverified generated prose is not published by this composer; an existing
explicit user-facing Result contract remains a separate authoring choice, not a
general proof that generated prose is true.

The response reports partial/unverified steps and truncation, and never turns an
unknown write into success or a retry invitation. Evidence is bounded to 64
receipts, 16 KB per receipt, and 48 KB per run; exceeding a bound degrades the
answer explicitly. It is pinned to the run, conversation, Agent and Playbook
releases, and signed with the application key. A missing or changed key makes
old evidence unverifiable; presentation falls back safely without re-execution.

## Responsive behavior

Use rules and the process canvas are peer authoring surfaces. Catalog, checks,
navigation, and the step inspector adapt to the editor container. Docked panels
share the available width and keep room for the canvas. At smaller widths, one
panel opens as a drawer while preserving its fields and keyboard focus. The
editor remembers preferred desktop widths separately from temporary limits.
Step labels wrap rather than becoming an icon-only catalog. The editor
uses the existing `--fi-wf-*` and Filament tokens in light and dark modes; it
does not install global CSS or Tailwind preflight.

Keyboard focus, canvas zoom/pan, drag/drop, connection handles, undo/redo,
autosave, and unsaved-state warnings remain part of the editor contract.

**Find step** searches existing canvas steps and opens the selected inspector.
It links to **Review** for validation instead of maintaining a second readiness
dashboard. Review shows publication blockers, optional warnings, and saved-test
attention with explicit repair actions. Setup, Review, and Test remember their
last subpage. Versions live in Review; publication settings live in Setup.

Request Input forms use a visual field list for names, labels, types, choices,
ordering, and required flags. Existing unsupported structures remain available
in the advanced JSON editor. Editing supported fields preserves additional
field metadata.

Invocation rule edits enter the saved document while typing. Changing a Request
Input type removes inactive form settings; the selected type controls the
compiled waitpoint. Renaming a Decision matching value updates its connected
transitions in the same edit. Disconnect a connected path before deleting it.

API arguments follow the published input schema: numbers remain numbers,
Boolean and enum fields offer their declared values, and lists and objects use
individual JSON fields. The variable picker remains available for values from
earlier steps. Invalid literal input remains visible for correction instead of
silently restoring a previous valid value.

## Publication

Save updates only the mutable draft. Review, AI Draft completion, and Publish
share the same release-readiness preflight: outcome and start rules, graph and
step validation, explicit write approvals, exact capability materialization,
dependency pinning, and the published contract. Publish then creates the
immutable deployment. The invocation contract is frozen with that deployment.
The Agent can use it only after an explicit assignment is included in a newly
published Agent deployment. Versions reports whether the current Playbook
release is actually pinned by the active Agent. The editor's process test starts
the Playbook directly; test Agent selection and conversation in the Agent's
candidate and live tests.

Editor saves compare the caller's draft and published fingerprints while holding
the Playbook row lock on the package connection. A stale session must load the
latest draft before saving again. Publication checks the fingerprint of the
exact normalized payload that was just saved, together with the previously
reviewed published fingerprint, under the release lock. A concurrent save or
publication cannot substitute its payload. If release validation fails, the
saved draft remains available for correction; no new deployment is selected.

See [Agents and Playbooks](AGENTIC_WORKFLOWS.md) and
[Playbook JSON Schema](WORKFLOW_JSON_SCHEMA.md).
