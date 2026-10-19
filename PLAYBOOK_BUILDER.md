# Workflow Builder

The panel calls a fixed multi-step process a **Workflow**. In translation keys (`playbooks.*`), runtime classes (`AgentPlaybookTurn`), tool names and the public API it is still called a Playbook. Both names mean the same thing.

The Workflows list reports total inventory only. Each row retains its verified
release status and repair warnings; the Updated column is hidden by default and
can be restored through the native column selector.

The Workflow Builder is the optional visual editor for bounded Agent processes.
Creating and publishing a conversational Agent does not require opening it.

## Editor model

The Agent is the conversation owner. It interprets free-form requests, asks for
clarification, and chooses direct read tools independently. A Workflow is one
optional Agent tool for a bounded process whose order, approvals, writes, or
recovery rules must be controlled.

The editor therefore has two deliberately separate layers:

1. **Setup > When to use** defines the immutable invocation contract. It asks
   what the Workflow does, when the Agent should start it, when it should not,
   and what visitors might say (realistic matching requests).
2. **Inputs** (on the Entry step) define the Workflow's input schema: the
   values the Agent collects before it starts the Workflow.
3. **Steps** defines what happens only after the Agent has chosen the Workflow.

The editor does not model the Agent's conversation or tool-selection
reasoning. It models only the deterministic process, including explicit
branches and typed waitpoints. This is why a flexible Agent and a directed graph
can coexist without implying that every chat follows a top-to-bottom workflow.

The saved document is a `schemaVersion: 2` Workflow with invocation metadata,
semantic steps, and transitions. The backend compiler produces the internal
executable graph used for preview and immutable publication. Compiled runtime
JSON is not a second editable source of truth.

## Step list and canvas

The default view is a vertical **step list** that starts at Entry. Steps with
paths (Run tool, Approval, Decision, an AI task with a result format) show each path as
an indented sub-list: Confirmed and Cancelled, If true and Otherwise, or the
Decision's own paths. When the paths meet again, the list continues below
them; a path that reaches a step shown elsewhere reads "Continues with ...".

The step picker lists the everyday steps by purpose and puts the steps for
looping, other Workflows, field extraction, images and value changes under
**Advanced**: For each, Sub-Workflow, Extract fields, Create image, Transform and
Calculate. They keep their runtime contracts and type ids; only the grouping
changed. The **Calculate** inspector lists every operator and function the step
evaluates (`+ - * / %`, `== != > < >= <=`, `~`, `length`, `upper`, `lower`, `trim`,
`reverse`, `abs`, `round`, `floor`, `ceil`, `now()`, `today()`) with one sentence
and one example each. No operator or syntax was added.

### Run tool Paths

Run tool has built-in **Done** and **Failed** Paths. A write also has
**Unverified action**. Reads never offer Unverified action.
**Needs review** is offered only where an outcome can take it. Operator review
and pending API connection outcomes always halt at their waitpoint, so no resolved
write contract settles into Needs review: native HTTP and Memory writes, resolved
API/MCP operations, the package handlers `store_submission`,
`mutate_data_resource`, and `generate_image`, and every registered host write
action offer Done, Failed, and Unverified action. Only an operation whose
contract cannot be resolved keeps the conservative set with Needs review,
because it cannot prove that its review halts. The server derives the handles
from the operation contract in one function, the compiler and validator enforce
them, and the editor receives the same handles in its payload for operations that
are not saved yet. Current Gateway write contracts can all leave an uncertain
result, including a local write whose ledger finalization failed.
The canvas exposes the same Path handles as the list rows, and both use the
same connection commands. There is no separate **Outcome paths** preset.

| Outcome | Path |
| --- | --- |
| Definite success, including a safely replayed success | Done |
| Staged outcome of an operation whose contract cannot be resolved | Needs review |
| API connection delay, operator approval, or visitor confirmation | No Path until the owning waitpoint resolves |
| Knowledge `degraded` or `insufficient_evidence` | Done; evidence quality remains in Data |
| Raw HTTP write returns `202 Accepted` | Unverified action |
| Failed, expired, denied, blocked, refused, cancelled, or declined | Failed |
| Unknown result | Unverified action for writes; Failed for reads |
| Unrecognized status | Unverified action when available; otherwise Failed |
| `simulated` | Done only in Preview/Test; otherwise Unverified action or Failed |

In Preview/Test, the write does not save anything. Its run log line says
**Test: nothing was saved**. The status remains `simulated` in Data. Live
execution never treats `simulated` as a successful write.

An unconnected Done Path retains the normal linear continuation. An unconnected
Needs review Path ends local execution with `needs_review`; an unconnected
Failed Path ends with `failed`. Unverified action ends with the existing failed
run status and explicit `unknown` execution outcome. None falls through Done.
Connecting a Path handles control flow only: it does not approve or settle the
pending write. Another write needs its own confirmation and idempotency key.
Re-entering a Step with a running, pending, queued-for-review, or unknown ledger
claim refuses another dispatch. Resuming that Step's own interrupt with its exact
claim is allowed; the Gateway still checks the bound decision or continuation.
The existing reconciliation boundary remains the authority for an uncertain
external effect.

API connection delays and operator approvals retain their AgentGraph waitpoints.
Pending acceptance takes no Path. After completion or approval and execution,
the settled result selects Done, Failed, or Unverified action. Operator rejection
selects Failed. A host write action has a closed status set and its operator
review always halts at the waitpoint, so it offers no Needs review either. A
refused re-entry of a pending or queued claim ends the run as `failed`. Only
unresolved operations retain Needs review as the fail-closed authoring option.

Every operation exposes its exact status in the Data picker as **Status of
Step ...**. Use the existing reference syntax, for example
`{{submission_result_status}}` when Save details saves its result in
`submission_result`. The status distinguishes denied, declined, failed, and
other results even when they share a Path. A value or condition Decision on
status Data downstream of a non-Done Path is supported, for example Failed to a
Decision distinguishing `denied` from `declined`. API tools project the canonical
result envelope's outcome into this status reference.

Editable Drafts convert on load/save. A value Decision directly after its
operation can become built-in Paths when every branch has an unambiguous
destination. Success aliases must agree; pending, unknown, and default outcomes
cannot share the Done destination. `continueOnFail: true` becomes an explicit
Failed connection to the previous successor; the option is removed. A Step that
ended a For each body (also after its empty Result was removed) gets a Failed
connection to that For each, the innermost one when loops are nested, so a
failure still starts the next item.
Inside a For each body, a body-ending `continueOnFail` Step or legacy Knowledge
or Memory read Step converts to a Failed Path back to its own For each (Next
item), so the loop continues as before. A `continueOnFail` Step that ends a Path
outside any For each converts with an unconnected Failed Path, so a failure now
ends the run Failed. Before W8.2 such a Draft could not be published
(`missing_outgoing_edge`). To complete the run after a failure, connect the
Failed Path to a Result.
Legacy Knowledge and Memory read Steps also gain an explicit Failed connection
to their former linear successor. Other reads retain their previous failure
semantics. Existing explicit Failed connections are preserved. Unknown branch
values, conflicting destinations, or legacy status Decisions on Done that cannot
be mapped unambiguously remain in the Draft with a blocking issue naming the Step.
Review and replace those branches explicitly. A stored invalid Draft still opens
with its raw fields and blocking issues for repair. Neither opening nor conversion
rewrites a published artifact.

For a multi-slot write confirmation, **No** retains the correction interrupt
("Which detail should I change?"). It does not select Failed or continue to the
successor. Explicit Workflow cancellation retains the existing cancelled run
semantics, even when the old Draft had `continueOnFail: true`. A settled operation
status of `cancelled` or `declined` selects Failed.
Published Versions and artifacts are never converted or rewritten. In-flight
runs retain the exact routing of their pinned, hash-verified artifact.

**Add step** sits between every two steps. A new step is wired into the path it
was added to. A new Approval continues with the rest of the path on Confirmed
and gets its own Cancelled end; a new Decision continues on its first path and
ends the other one. Deleting a step reconnects the steps around it; deleting a
step with paths keeps its main path and asks before the steps only its other
paths lead to are deleted. A path always ends in a Result, which cannot be
deleted while a path leads to it. Steps move up and down within a plain
sequence. The list therefore cannot create unconnected steps or forget a path.

**Canvas** in the header shows the same Workflow as a diagram for free
arrangement. Its toolbar holds zoom, **Fit view**, **Arrange steps** (lays the
steps out the way the list reads them) and **Add note**. Steps that no path
reaches (for example a step whose only connection you removed) are listed under
**Not connected** with a Remove fix.

Both views make every structural edit through the same operations, so the same
edit gives the same Workflow in either view:

- **Adding** a step from the Add step menu, a catalog click, a drop on the
  canvas or the plus on a path wires it into the path like the list does. A
  Result can only close an open path.
- **Deleting** a step, with the Delete key, the step actions menu or the list,
  reconnects the steps around it. Entry and a Result a path leads to cannot be
  deleted in either view; the canvas and the list do not offer to delete them and
  both say why if a key press tries (in the list the key works on the focused step card). A step whose removal would leave a path without an end
  stays and says why.
- **Connecting** two steps on the canvas follows the same rules as the server
  checks: a step has one next step, a branch has one connection per path, and a
  Result has no next step. A connection the rules refuse is not drawn; the
  reason appears next to the pointer where you let go. Moving a connection
  follows the same rules. The editor never drops a connection silently. A
  stored draft can hold a connection on a path its step does not offer (from
  before the step was changed, from an import or from generation). The canvas
  draws it dashed and red from a small extra output, marked "Not a path of this
  step"; the Problems list names the step and offers **Remove connection**, which
  is the same command as deleting the connection. While such a connection exists,
  Save stops with one error ("Not saved") and autosave waits until the draft
  changes.
- **Changing a step's settings** can change which paths it offers: a Decision's
  type, a Decision path added, renamed or removed, an AI task's result format.
  Every such edit is one command and one undo step, with or without
  connections, and undo and redo restore the steps and their connections
  together. Connections on paths that still exist stay,
  connections on paths the step no longer offers are removed with the change as
  one undo step, and a message says how many. An AI task keeps its routes when
  its result format appears or disappears: the next step moves to Valid result
  and error moves to Invalid result, and back (two connections that would land
  on the same output keep the first and remove the other, and the message says
  so). A message also names the path they moved to ("moved to Valid result") and offers **Undo**. A saved Workflow never
  holds a connection from an output its step no longer offers. The result
  format field changes the step when its text is complete JSON (after a short
  pause) or when you leave the field, never on a half-typed keystroke. Renaming
  a Decision path keeps its connection; a path that still has a connection
  cannot be removed until you disconnect it. A path's matching value and label
  are trimmed only when you leave the field, so a space can be typed between
  words (the connection follows the value on every keystroke), and typing a name is one undo step.
  Pressing the remove button of a connected path says under the row to disconnect it first. A pending result
  format commit is cancelled when Undo, a refresh or another step replaces the
  value it was typed on.
- **Narrow screens**: the save state keeps its words in the header, a step summary may
  take two lines, nested steps in the list use a small indent and cards
  shrink to fit, and the floating "Open step settings" button has its own
  column so it never covers a card.
- **Remove all steps** removes every step except Entry. Entry (with its Collect
  details) and the use rules stay, and so do canvas notes, so a template can be
  applied again.
- **Test chat**: a structural edit (add, delete, connect, disconnect, remove all)
  starts a new test session, from the list as well as the canvas. **Arrange
  steps** only moves cards and keeps it.
- **Positions**: only steps added by an edit are placed (below the step that
  leads to them, moved aside for any card in the way). Steps you arranged stay
  where they are, whichever view made the edit, until you press **Arrange
  steps**.

The Agent's own instructions are not edited here. The Describe panel shows
**Edit Agent instructions**, a link to the Agent editor's Instructions tab,
only for people who may edit that Agent.

## Starting a draft

**Create Workflow** asks for a name, what the Workflow does, the Agent (needed
to test and publish) and **How do you want to start?**:

- **Describe your process** creates an AI draft from a few sentences with the
  Agent's AI model (the Agent is then required);
- a template: **Callback request**, **Appointment request**, **Lead
  qualification**, **Order status**, **Return request**, **Support ticket** or
  **Quote request**;
- **Start empty** keeps Entry only.

The editor applies the choice once when it opens. A Workflow that still has
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
Finish. Saved API operations are chosen inside **Run tool**. Entry is
automatic; notes live in the canvas toolbar.

Review generated tools, branches, waitpoints, and write approvals before
publishing. Describe your process can propose structure but cannot grant dependencies.

## Testing

**Test** in the header opens the test chat beside the steps. It runs the saved
draft directly (not the Agent's choice of tools): write the visitor's message
and confirm cards as a visitor would. As in a chat, the linked Agent's model
fills Entry's details from what the visitor wrote (one extra model call per
start, recorded in AI usage) and the server checks them; a missing or invalid
value gets a short question, and the next message is read together with the
earlier ones. The **Details** fields are optional: a value typed there wins over
the message. The step the run waits at is highlighted in the step list and on the canvas. Reads
use live data; nothing is saved: the Gateway blocks every write of a test and
the step continues as simulated ("Test: nothing was saved."). **Play sample**
starts a run with the first **When to use** example and sample details for
every Entry input and confirms its cards, so every template runs to its end in
a few seconds. Test the Agent's choice of the Workflow in the Agent editor's
test chat after publishing.

A test runs the saved Draft, never what is still on the screen. Every send saves
pending edits first (one awaited save, including an autosave that is already
running) and then names the saved revision with a new request id. If the save
fails, a conflict is open or newer edits arrived while saving, the editor shows
the save problem and sends nothing. The server runs the stored Draft only when
it still is the named revision; if another tab saved in between it refuses with
"The Draft changed, reload or save again." and runs nothing. The editor never
sends Draft JSON to a test; the step dry run and the Runs drawer re-run still
take the open Draft, as they test one step in isolation.

One click is one test. The send button is disabled while a send is saving or
running, and the server runs a request id once per user: a replayed or retried
request returns the run it started and executes nothing, including a repeated
approval of a simulated write. The server remembers every request id of an
editor user, so a late replay of an earlier turn is detected after the run moved
on, and also after its run was deleted (it then names no run). These rows are kept as the replay fence, however many tests a Workflow has, and are removed only with the Workflow. A test session
belongs to the editor who started it: another editor who knows the session id
starts their own and cannot continue or clear it. The test stays inside the
Livewire request and uses no queue. Its run is written when it starts, so it appears in the
[Runs drawer](#runs-drawer) as a Test run, also after a reload during the
request or after navigating away, and the drawer opens it as any other run.
Test writes stay simulated and a test needs the same editor ability and tenant
scope as the Workflow itself; another tenant's user can neither start nor read it.

Errors name their step. Wrong Details point to the Entry step; a saved step the
Workflow cannot run with (for example an invalid mapping or a variable that may
not exist) points to that step and field; a step that fails while running is
opened from the run diagnostic. The editor selects, highlights and focuses the
step and shows the translated message. The server sends a closed code
(`entry_input_invalid`, `draft_step_invalid`, `draft_changed`, `request_invalid`)
and the step id with the response, so the editor reads no message text.

The Workflow editor has no saved tests and no test requirement for publishing.
Repeatable tests belong to the Agent: an Agent test with the check
**Tool called** `playbook_<id>` proves that the Agent uses this Workflow for a
message (see [Agent Tests](AGENT_TESTS.md)). Failing Agent tests warn when the
Agent is published and never block it.

## Collect details

Select Entry to edit **Collect details**, the Workflow's input schema
(`data.inputs`, ADR 0040). Each detail has a label, a name in lower snake case
(later steps use it as `{{name}}`, and the variable picker offers it), one of
nine types (text, long text, email, phone, URL, number, date, time, choice),
a required switch and, under **More**, an optional description for the Agent
and a rule in Request Input syntax such as `min:2|max:80`. A choice needs 1 to
50 options; a Workflow has at most 20 details. The name follows the label until
you change it. Publication reports invalid details at the field.

## Canvas rules

- Keep one Entry and at least one Result before publication.
- Declare the values the process needs up front under Collect details on the
  Entry step. The Agent collects them in conversation and starts the Workflow
  with all of them; a missing required value never starts a run.
- Use **Ask mid-process** (Request Input) only for a value that can be known
  only mid-process (for example a choice among results of an earlier step).
  The Agent supplies it through the same Workflow tool when the visitor gives
  it.
- Use Decision for deterministic conditions or exact values.
- Put every write behind an explicit Approval. Only the Confirmed path may reach
  the write; the Declined path must end without writing. The visitor decides an
  Approval on a confirmation card (Confirm or Cancel), never by typing. The
  tool gateway still enforces confirmation, authority, payload binding,
  and idempotency.
- Keep AI Task bounded; follow it with deterministic validation or routing.
- Give For each a finite `maxItems` value.
- Use Note for documentation only. Notes never become prompts or runtime nodes.

AI Task instructions are fixed authoring text in both plain and structured
output modes. Additional system rules supplement that task; they do not replace
it. Put visitor input and workflow references in the input template, not in task
instructions or system rules. Republish affected Workflows and their owning
Agent release after correcting an existing task: an immutable deployment does
not silently acquire new compiler behavior.

## Runs drawer

**Runs** in the editor header opens a drawer containing the latest 50 authorized
Test and Live runs of this Workflow, newest first. Each row shows its time,
status and taken Path. Select a run to highlight its Path in the canvas and
step list; **Clear selection** removes that highlight. The drawer supports
keyboard focus, Escape to close, and narrow screens.

Expand a Step to inspect its status, input, output, Data and error. The run's
halt reason is shown above its Steps. The server applies the
existing trace redaction before sending a Livewire payload. Payload details
also require the conversation's existing diagnostic authority; otherwise they
read **Hidden: needs diagnostic access**. Diagnostic access does not bypass
redaction. Runs always require the existing run-view ability and tenant scope,
as well as permission to open the editor, and must belong to its current Agent.

**Use as sample data** copies stripped input into the Test sample. Secrets,
identity and runtime authority are removed on the server. **Re-run from here**
starts a new simulated Test at a completed or failed recorded Step using stripped Data
and the current draft. It uses fresh preview authority and never restores the
old confirmation, interrupt, idempotency key, access token or runtime metadata.
Writes remain simulated. Both actions require diagnostic access to the source
conversation, checked again on every request. Without it, the server refuses
the action without returning recorded input or Data. Missing snapshots or a
removed Step cannot be replayed.

Runs never opens Issues on page load. A failed latest Live run adds a dismissible
badge to Runs. Dismissal is stored in the application's cache for that user and
run; clearing or evicting the cache can show the badge again. A newer failure
has its own badge. The badge lookup checks at most 50 recent Live candidates
within the run query scope, then applies record authorization. If none of
those candidates is authorized, no badge is shown. Test runs do not consume
that window. The lookup is reused within a request.

Selecting a failed run or receiving a failed Test result fills Issues without
opening it. Each authorized run has **Open run inspector** for reconciliation
and redacted export. A deleted, stale or unauthorized `?run=<id>` link opens
the editor and drawer without a selection.

The former `AgentWorkflowRuns` page and `agent-workflows/{record}/runs` route
are removed. The Workflow list's Runs action opens the editor with `?runs=1`
for editors, or the latest authorized run's existing `WorkflowRuns/ViewWorkflowRun`
inspector for run viewers. That inspector's Workflow action and breadcrumb open
the editor with `?run=<id>` when editing is authorized. Conversation run tables,
incident links and notifications that already open the run inspector retain
that authorized destination, including reconciliation and redacted export.

## Returning useful results

Use the Result field picker to select original outputs from earlier tools.
When the editor has a pinned field suggestion, it offers that field; otherwise
it offers the whole returned value. The optional preview uses samples from a
pinned test run or trace, not evidence of a new execution. The advanced Result template remains available
for explicit references, for example
`{{lookup.data.name}}` and `{{lookup.data.balance}}` for an API connection, or
`{{action_result.receipt}}` for an Action. Leaving the template empty selects
the last unchanged tool output. For Each retains the verified result of
each iteration; Sub-Workflow output mappings retain the child's verified fields.

The Agent composes a provider-free public answer from those fields. The literal
Result template and internal model prose are not copied to visitors; arbitrary
inputs, overwritten variables, API connection headers, execution metadata, and
unverified AI Task/Transform output cannot become asserted facts. Select the
original tool fields when a transform or AI step is only presentation
work. Unverified generated prose is not published by this composer; an existing
explicit user-facing Result contract remains a separate authoring choice, not a
general proof that generated prose is true.

The response reports partial/unverified steps and truncation, and never turns an
unknown write into success or a retry invitation. Evidence is bounded to 64
receipts, 16 KB per receipt, and 48 KB per run; exceeding a bound degrades the
answer explicitly. It is pinned to the run, conversation, Agent and Workflow
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
editor has one header. On the left: back to the Workflows (or to the Agent's
Tools when the editor was opened from there), the name (click it to rename)
and the save state. On the right: List or Canvas, undo and redo, the problem
count (only when there is something to fix), **Test**, **Runs** and **Publish**
(**Published** when the draft has no changes since). Everything else is in one
"..." menu: **Workflow** (name and description, the Agent, versions, Workflow
runs, discard unpublished changes), **Build** (Describe your process, saved
details, download or import a Workflow file), **View** (full screen) and
**Danger zone** (remove all steps, delete the Workflow). The header stays on one
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
| No Agent uses the Workflow yet | **Choose Agent** opens the Assign Agent dialog; a blocker when a step reads data |
| A query step has no data yet | **Choose data** lists the app data tools the Agent may read or may be given, or **Create app data tool** opens the form in a new tab |
| A path has no end, or a step has no next step | **End here** adds a Result |
| A step is not connected | **Remove** |
| A step saves data without an Approval before it | **Ask first** adds an Approval before the step |

The Agent fixes (an app data tool for a query step, adding the Workflow to the Agent) change only the
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
step validation, explicit write approvals, exact tool materialization,
dependency pinning, and the published contract. Publish then creates the
immutable deployment in one click: while problems block it, it opens the
problem list instead; a draft with risky writes asks for a short note. The
invocation contract is frozen with that deployment.

The button follows the linked Agent and the user's grants (ADR 0048):

- **Publish and update <Agent>** when the Agent is Live or Paused and the
  user may publish both the Workflow and the Agent. The Workflow version and
  a new Agent version derived from the live version go live in one
  transaction; the Agent's other draft changes stay unpublished. The arrow
  next to it offers **Publish only**.
- **Update <Agent>** when there are no draft changes and the Agent runs an
  older version of this Workflow, or does not use it yet.
- **Publish only** when the Agent is Live or Paused but cannot be updated
  from here; the tooltip and the Versions panel name the reason (no publish
  access to the Agent, the Agent draft no longer uses this Workflow, different
  database connections).
- **Publish** when the Agent is a Draft; the editor shows "Publish the Agent
  to use this Workflow".
- Disabled, with "You cannot publish this Workflow.", without publish access
  to the Workflow.

After **Publish only** or **Publish**, the summary offers **Add to <Agent>**
(in the Agent's draft, when it is not assigned yet) and **Test in chat**; the
Agent uses the version after its own Publish. Versions reports whether the
current Workflow release is actually pinned by the active Agent. The editor's process test starts
the Workflow directly with the values entered for its Entry details, checked
like the Agent's tool call; test the Agent's choice of the Workflow in the
Agent editor's **Test** chat and **Test & versions** tab after publishing.

A Workflow release does not contain the Agent's behavior (role, tone,
languages). Changing those on the Agent never requires republishing a
Workflow; the Agent writes the answers.

Editor saves compare the caller's draft and published fingerprints while holding
the Workflow row lock on the package connection. A stale session must load the
latest draft before saving again. Publication checks the fingerprint of the
exact normalized payload that was just saved, together with the previously
reviewed published fingerprint, under the release lock. A concurrent save or
publication cannot substitute its payload. If release validation fails, the
saved draft remains available for correction; no new deployment is selected.

See [Agents and Workflows](AGENTIC_WORKFLOWS.md) and
[Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md).

## Names and save feedback

**Settings → Rename** changes the internal Workflow name used in the editor and lists. **Title shown to visitors** is separate draft content and reaches chat only after the Workflow and its dependent Agent are published. Renaming does not replace process edits or deployment pins.

The draft saves itself a moment after each change; the header shows Saving soon, Saving… or Saved, and Ctrl+S saves at once. There is no separate save button. Leaving within Filament while changes are unsaved, saving or failed opens **Leave without saving?** with **Leave** and **Stay**. **Stay** keeps the editor and your changes open; **Leave** navigates even after a save failure, and unsaved changes may be lost. Leaving does not cancel a save already in progress. Wait for **Saved** to leave without a prompt, including after creating a Workflow from a template. Closing or reloading the tab shows the browser’s unsaved-changes warning.

A save that fails (or gets no answer within ten seconds) stays visible: the header shows **Save failed** with **Try again** until the draft changes, you try again or a save succeeds. Nothing resets it by itself and autosave does not send the same draft again, so a persistent problem is one message, not a new toast every few seconds. The server gives the toast of a repeated error the same id (Workflow and error text), so a retry replaces it instead of stacking. A failed save never replaces what you typed. If the answer to a save arrives after the editor gave up on it, it is still applied: the saved revision becomes the base of the next save, and anything you typed since stays unsaved. **Try again** is hidden for at most 45 seconds after the editor gave up, until that answer arrives, a newer save is answered or you load the latest draft, so your own retry is not refused as a newer draft. If the answer never comes, **Try again** shows after the 45 seconds, and the server still refuses a save built on an outdated revision.

Every save carries the revision it was based on. If another tab or person saved a newer draft first, the server refuses the save, keeps the newer draft and sends it back: the header shows **Newer draft available** and saving pauses. The strip in the sidebar offers **Load latest** (the editor shows the newer draft; your unsaved version is one **Undo** away), **Export local changes** and **Keep editing** (nothing is replaced; saving stays paused until you load the latest draft). A delayed timeout from an earlier save cannot change a newer save's status.

Typing is committed to the draft with every key, so **Test**, Ctrl+S, leaving the page and the autosave all see the last character: there is no debounce that could hold a keystroke back.

## Performance

The editor is measured on a generated Workflow of 200 steps (13 For each loops, 225 connections;
`resources/js/workflow-editor/scripts/fixtures/workflow200.json`, rebuilt by `workflow200.mjs`).
`npm run test:release-ux-gate` times the work an edit repeats (validation, For each bodies,
operation paths, layout, the step list, the problem list, the settings write and a structural
command) and fails when one of them returns to the quadratic cost it once had.

Measured reference values on one machine (AMD Ryzen 9 3900XT, Windows 11, Node 22.9, Chromium
through Playwright), on the fixture above. The first block is the median of 40 warm runs in Node
(`scripts/fixtures/measureCli.mjs`), the second the editor in Chromium on a local host:

| Per edit, 200 steps | Median |
|---|---|
| Validate the document | 4.4 ms |
| Problem list | 4.5 ms |
| Structural command (add a step) | 17 ms |
| Commit one keystroke to the draft | 3.2 ms |
| Delete and move allowances of all cards | 0.16 ms warm, 184 ms after a structural edit |
| Typing in a step, input to next frame (Chromium, 36 keystrokes) | 83 to 88 ms, longest task 79 ms |

The input-to-frame time includes two animation frames (about 33 ms) of the measurement itself.
The policy takes one analysis of the document for all connections, and bodies are found with an
index. The list plans delete and move for its cards once per structure, not once per keystroke,
and cards that did not change are not drawn again. Typing is not debounced: the numbers above
hold with every key committed.

Known limitation: opening a 200-step Workflow takes about 10 seconds before the first step card
shows. Editing after that stays within the numbers above.

## For each bodies

For each owns the Steps on its item Path up to a rejoin or the end of that
Path. The list indents this body in a container; the canvas outlines the same
group. **Next item** is implicit: finishing the body with a Done outcome returns to its
For each. A Failed, Unverified or Needs review outcome inside the body stops the run
unless that Path is connected.
An empty list runs the body zero times. After the last item, only the **done**
Path reaches Steps after the loop. Nested bodies return to their own For each;
the inner done Path continues the outer body. Existing failure and visitor
confirmation behavior still applies within the body. Resume continues the
waiting item without replaying earlier Steps or writes.

A **Result** Step cannot be added or connected inside a body. The server also
blocks publication of hand-crafted documents containing one. A Result cannot
end a For each body. Move this Result after the loop and use the item Data there.
Paths leaving a body and item targets shared with another loop or outside Path
are blocked too. Remove these connections and use Done to continue after the loop.

On loading and saving old Drafts, an empty terminal Result with no outgoing
Paths, default status Data and no shared or ambiguous ownership is removed in
favor of implicit Next item. Loading only projects the conversion; Save persists
it with the normal revision check. Results with text, custom status Data,
outgoing Paths, shared ownership or nested ambiguity stay visible as blocking
issues until repaired. Published
Versions and in-flight runs keep their original, hash-verified artifacts,
including the former behavior where a body Result adds its text and iteration
continues. No database migration or silent live conversion occurs.
