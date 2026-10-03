# Playbook Builder

The Playbooks list reports total inventory only. Each row retains its verified
release status and repair warnings; the Updated column is hidden by default and
can be restored through the native column selector.

The Playbook Builder is the optional visual editor for bounded Agent processes.
Creating and publishing a conversational Agent does not require opening it.

## Editor model

The Agent is the conversation owner. It interprets free-form requests, asks for
clarification, and chooses direct read tools independently. A Playbook is one
optional Agent tool for a bounded process whose order, approvals, writes, or
recovery rules must be controlled.

The editor therefore has two deliberately separate layers:

1. **Setup > When to use** defines the immutable invocation contract. It asks
   what the Playbook does, when the Agent should start it, when it should not,
   and what visitors might say (realistic matching requests).
2. **Inputs** (on the Entry step) define the Playbook's input schema: the
   values the Agent collects before it starts the Playbook.
3. **Steps** defines what happens only after the Agent has chosen the Playbook.

The editor does not model the Agent's conversation or tool-selection
reasoning. It models only the deterministic process, including explicit
branches and typed waitpoints. This is why a flexible Agent and a directed graph
can coexist without implying that every chat follows a top-to-bottom workflow.

The saved document is a `schemaVersion: 2` Playbook with invocation metadata,
semantic steps, and transitions. The backend compiler produces the internal
executable graph used for preview and immutable publication. Compiled runtime
JSON is not a second editable source of truth.

## Step list and canvas

The default view is a vertical **step list** that starts at Entry. Steps with
paths (Approval, Decision, an AI task with a result format) show each path as
an indented sub-list: Confirmed and Cancelled, If true and Otherwise, or the
Decision's own paths. When the paths meet again, the list continues below
them; a path that reaches a step shown elsewhere reads "Continues with ...".

**Add step** sits between every two steps. A new step is wired into the path it
was added to. A new Approval continues with the rest of the path on Confirmed
and gets its own Cancelled end; a new Decision continues on its first path and
ends the other one. Deleting a step reconnects the steps around it; deleting a
step with paths keeps its main path and asks before the steps only its other
paths lead to are deleted. A path always ends in a Result, which cannot be
deleted while a path leads to it. Steps move up and down within a plain
sequence. The list therefore cannot create unconnected steps or forget a path.

**Canvas** in the header shows the same Playbook as a diagram for free
arrangement. Its toolbar holds zoom, **Fit view**, **Arrange steps** (lays the
steps out the way the list reads them) and **Add note**. Steps added from the
list are arranged automatically. Steps that no path reaches (for example after
canvas edits) are listed under **Not connected** with a Remove fix.

## Starting a draft

**Create Playbook** asks for a name, what the Playbook does, the Agent (needed
to test and publish) and **How do you want to start?**:

- **Describe your process** creates an AI draft from a few sentences with the
  Agent's AI model (the Agent is then required);
- a template: **Callback request**, **Appointment request**, **Lead
  qualification**, **Order status**, **Return request**, **Support ticket** or
  **Quote request**;
- **Start empty** keeps Entry only.

The editor applies the choice once when it opens. A Playbook that still has
only Entry later offers the same choices in the editor.

A template adds its Entry details, fills **When to use** where it is still
empty and connects ordinary steps as one undoable edit. It grants no
permission and selects no resource. Every template except Order status runs on
built-in features: the visitor confirms a card (**Ask visitor to confirm**) and
the case goes to your team through **Hand over to team**; lead qualification
first checks the budget and hands only a fitting lead to sales. Order status
reads through a **Query data** step; until it has data, the problem list shows
"Choose the data this step reads." with **Choose data**. The canvas fits all steps into view after a template, an import or an AI
draft, and on every open. A flow that would only fit below 70 % zoom opens at
70 % with its Entry step in view; **Fit view** still shows every step.

The step palette is one list grouped into Operations, Flow, AI, Values and
Finish. Saved API operations are chosen inside **Run operation**. Entry is
automatic; notes live in the canvas toolbar.

Review generated capabilities, branches, waitpoints, and write approvals before
publishing. Describe your process can propose structure but cannot grant dependencies.

## Testing

**Test** in the header opens the test chat beside the steps. It runs the saved
draft directly (not the Agent's choice of tools): fill the details of Entry,
write the visitor's first message, and confirm cards as a visitor would. The
step the run waits at is highlighted in the step list and on the canvas. Reads
use live data; nothing is saved: the Gateway blocks every write of a test and
the step continues as simulated ("Test: nothing was saved."). **Play sample**
starts a run with the first **When to use** example and sample details for
every Entry input and confirms its cards, so every template runs to its end in
a few seconds. Test the Agent's choice of the Playbook in the Agent editor's
test chat after publishing.

The Playbook editor has no saved tests and no test requirement for publishing.
Repeatable tests belong to the Agent: an Agent test with the check
**Tool called** `playbook_<id>` proves that the Agent uses this Playbook for a
message (see [Agent Tests](AGENT_TESTS.md)). Failing Agent tests warn when the
Agent is published and never block it.

## Collect details

Select Entry to edit **Collect details**, the Playbook's input schema
(`data.inputs`, ADR 0040). Each detail has a label, a name in lower snake case
(later steps use it as `{{name}}`, and the variable picker offers it), one of
nine types (text, long text, email, phone, URL, number, date, time, choice),
a required switch and, under **More**, an optional description for the Agent
and a rule in Request Input syntax such as `min:2|max:80`. A choice needs 1 to
50 options; a Playbook has at most 20 details. The name follows the label until
you change it. Publication reports invalid details at the field.

## Canvas rules

- Keep one Entry and at least one Result before publication.
- Declare the values the process needs up front under Collect details on the
  Entry step. The Agent collects them in conversation and starts the Playbook
  with all of them; a missing required value never starts a run.
- Use **Ask mid-process** (Request Input) only for a value that can be known
  only mid-process (for example a choice among results of an earlier step).
  The Agent supplies it through the same Playbook tool when the visitor gives
  it.
- Use Decision for deterministic conditions or exact values.
- Put every write behind an explicit Approval. Only the Approved path may reach
  the write; the Declined path must end without writing. The visitor decides an
  Approval on a confirmation card (Confirm or Cancel), never by typing. The
  capability gateway still enforces confirmation, authority, payload binding,
  and idempotency.
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
Step labels wrap rather than becoming an icon-only catalog. The editor's
`--fi-wf-*` tokens derive from the panel's Filament variables (`--primary-*`,
`--gray-*`, the semantic colors and the panel font `--font-family`) and follow
Filament's `.dark` class; it does not install global CSS or Tailwind preflight.

Keyboard focus, canvas zoom/pan, drag/drop, connection handles, undo/redo,
autosave, and unsaved-state warnings remain part of the editor contract. The
editor has one header. On the left: back to the Playbooks (or to the Agent's
tools when the editor was opened from there), the name (click it to rename)
and the save state. On the right: List or Canvas, undo and redo, the problem
count (only when there is something to fix), **Test** and **Publish**
(**Published** when the draft has no changes since). Everything else is in one
"..." menu: **Playbook** (name and description, the Agent, versions, Playbook
runs, discard unpublished changes), **Build** (Describe your process, saved
details, download or import a Playbook file), **View** (full screen) and
**Danger zone** (remove all steps, delete the Playbook). The header stays on one
line: as it narrows, the List/Canvas labels, then Test, the problem label, the
save state and finally Publish collapse to icons with tooltips; undo and redo
stay. The rail keeps **Setup** and **Add step**.

## Problems

One problem list replaces separate review counters. The header shows the
count and opens the list; each finding is one sentence, for example "This
Agent may not save data, so “Request callback” cannot run." Clicking a problem
opens its step or setup field. The header, the step markers and the step panel
read the same list: while a check runs, a fixed problem disappears at once and
a new one appears only when the check has finished, so the count does not jump.
The editor opens with the server's findings for the saved draft, and while the
draft has unsaved changes the autosave reports them, so there is no separate
first check. Where a fix exists it is a button next to the sentence:

| Problem | Fix |
|---|---|
| No Agent uses the Playbook yet | **Choose Agent** opens the Assign Agent dialog; a blocker when a step reads data |
| A query step has no data yet | **Choose data** lists the Data Resources the Agent may read or may be given, or **Create Data Resource** opens the form in a new tab |
| A path has no end, or a step has no next step | **End here** adds a Result |
| A step is not connected | **Remove** |
| A step saves data without an Approval before it | **Ask first** adds an Approval before the step |
| The linked Agent may not save (or read) data | **Allow saving** / **Allow reading** |

The Agent fixes (permissions, a Data Resource for a query step) change only the
Agent's saved draft through the same settings boundary as the Agent editor
(Agent edit permission, compare-and-set baseline, assignment policy) and never
publish the Agent. Choosing data also filters the query by a collected Entry
detail whose name matches a filter field. Publication validation and
`PlaybookInputSchema` stay the authority; the server sends each finding with a
stable `code` and, where it has one, an `action` the editor maps to its fix.
Steps show only a small marker with their problem count.

Ask mid-process forms use a visual field list for names, labels, types, choices,
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

Saving updates only the mutable draft. The problem list, AI Draft completion,
and Publish share the same release-readiness preflight: outcome and start rules, graph and
step validation, explicit write approvals, exact capability materialization,
dependency pinning, and the published contract. Publish then creates the
immutable deployment in one click: while problems block it, it opens the
problem list instead; a draft with risky writes asks for a short note. After
publishing, a summary says what the Agent can now do and offers **Add to
<Agent>** (in the Agent's draft, when it is not assigned yet) and **Test in
chat**. The invocation contract is frozen with that deployment.
The Agent can use it only after an explicit assignment is included in a newly
published Agent deployment. Versions reports whether the current Playbook
release is actually pinned by the active Agent. The editor's process test starts
the Playbook directly with the values entered for its Entry details, checked
like the Agent's tool call; test the Agent's choice of the Playbook in the
Agent editor's **Test** chat and **Tests** tab after publishing.

A Playbook release does not contain the Agent's behavior (role, tone,
languages). Changing those on the Agent never requires republishing a
Playbook; the Agent writes the answers.

Editor saves compare the caller's draft and published fingerprints while holding
the Playbook row lock on the package connection. A stale session must load the
latest draft before saving again. Publication checks the fingerprint of the
exact normalized payload that was just saved, together with the previously
reviewed published fingerprint, under the release lock. A concurrent save or
publication cannot substitute its payload. If release validation fails, the
saved draft remains available for correction; no new deployment is selected.

See [Agents and Playbooks](AGENTIC_WORKFLOWS.md) and
[Playbook JSON Schema](WORKFLOW_JSON_SCHEMA.md).

## Names and save feedback

**Settings → Rename** changes the internal Playbook name used in the editor and lists. **Title shown to visitors** is separate draft content and reaches chat only after the Playbook and its dependent Agent are published. Renaming does not replace process edits or deployment pins.

The draft saves itself a moment after each change; the header shows Saving soon, Saving… or Saved, and Ctrl+S saves at once. There is no separate save button. Errors retain local edits, and a delayed timeout from an earlier save cannot change a newer save's status.
