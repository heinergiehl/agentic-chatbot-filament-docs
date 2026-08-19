# Workflow Turn Understanding

Workflow Turn Understanding lets a workflow-bound bot propose typed meaning for one complete human message at workflow entry or at an active waitpoint.

The rule is strict:

- The LLM makes one primary semantic proposal for a free-language turn. One read-only repair call is allowed only when deterministic entry-contract checks identify a repairable shape error.
- The workflow controls what can happen.
- Deterministic policy and validators decide what may be stored, resumed, cancelled, or clarified.

This is not a free-form ChatGPT replacement. It is a semantic interpreter for an active workflow state.

## Turn Types

The Turn Understanding layer classifies one user turn into a typed result:

- `answer_current_node`: the message answers the currently waiting node.
- `answer_and_more`: the message answers the current node and also contains values for later declared slots.
- `side_question`: the user asks about the current process instead of answering it.
- `correction`: the user changes a previously captured value.
- `cancel`: the user wants to stop the active workflow.
- `new_request`: the user asks for another task while a workflow is active; the request is returned as a deferred proposal, but is not queued or executed and does not interrupt or replace the active workflow automatically.
- `meta_question`: the user asks about the published workflow or the recorded conversation history; deterministic responders answer only from the compiled context snapshot.
- `ambiguous`: the model or policy is not confident enough.

Low-confidence or invalid results clarify instead of mutating workflow state.

## Contract Version And Calibrated Thresholds

Runtime traces serialize the canonical `TurnInterpretation` contract as version `2`. For this contract version, waitpoint intent acceptance uses `workflow_turn_understanding.min_confidence` (default `0.72`) and proposed slot values use `workflow_turn_understanding.slot_min_confidence` (default `0.72`). These are eval-calibrated configuration values, not universal confidence truths; a future contract version must document and evaluate its own thresholds before activation.

Every productive turn-understanding call is recorded with stage `turn_understanding`, the parent chat-turn ID, the active node ID, and the standard AI usage-budget reservation. Exact cancel, confirm, declared choice, and typed form controls remain local and create no model usage.

## One Proposal, Deterministic Authority

An exact signed control, declared choice, typed form resolution, or schema-evident atomic value takes the local deterministic fast path. Every other free-language turn receives one primary canonical Workflow Turn Understanding call. If deterministic entry admission finds missing literal-list items or a repairable relationship shape on read-only routes, the same interpreter may receive one constrained repair request. Actual call count and repair reason are carried in the result and planner diagnostics.

The final result may propose the current answer, additional declared slots, corrections, a side question, conversation-recall intent, or residual text. It is not followed by an alternative continuation router, intent classifier, or semantic initial-prefill planner. `WorkflowTurnPolicy`, slot contracts, provenance rules, and validators authorize at most one workflow mutation for the turn. A repair call never authorizes work by itself.

If the user starts a separate request while a workflow is active, the proposal uses `new_request` and carries the complete request as residual text in the current outcome. The active workflow remains unchanged, and the response states explicitly that the request has not been executed and must be sent as a new message after finishing or cancelling the workflow. If one message explicitly cancels and also asks for other work, cancellation is the only mutation; the other work is recognized but never started or silently queued in the same turn.

## Workflow Entry Routing

At workflow entry, the same semantic call returns a closed disposition plus an optional published `route_candidate`, independent route confidence, the language of the latest user turn, and bounded candidates for declared public slots. Every candidate must name a declared slot and quote a literal span from the latest message. Requests for help with a published capability remain supported even when the concrete entity or required input is missing. Misspellings and natural language are handled by semantic interpretation, not by keyword or fuzzy PHP routing.

The route and slot candidates are only proposals. Deterministic policy accepts a route only when its label matches exactly one route in the immutable public routing manifest and exactly one intent on the hash-verified release contract. The authorized binding contains the classifier node, intent index, canonical label, confidence, and release-contract hash. The matching intent-classifier node may consume that binding without a second model call; a mismatched node, label, confidence, or contract shape fails closed to normal in-workflow classification. Initial slot candidates separately pass literal-span binding, declared-slot lookup, provenance policy, and the slot's deterministic validator before they can become turn-local prefill.

When the release publishes semantically labelled entry intents, no workflow transition is inferred without one certain route binding. A plausible but weak published candidate produces a localized, targeted question and no run; the runtime does not fall through to an alternative classifier. A linear release whose structural start route has no labelled intents may start directly from one high-confidence `supported_request`. Required capability values are collected later as typed waitpoints. A missing value includes an absent key, `null`, or a blank string; `invalid` is reserved for a present non-empty value that fails its deterministic schema validator.

Conversation recall uses the same entry-understanding boundary. The interpreter may select only a closed recall kind; `ConversationRecallResponder` then answers from bounded recent messages, the compiled untrusted summary, and recorded workflow/action outcomes already present in the `TurnContextPack`. Recall never starts a workflow, calls a capability, or treats summary prose as workflow state.

## Runtime V2 Waitpoint Ownership

Runtime V2 separates closed answers from free-language meaning before execution:

- explicit form resolutions, approvals, declared choices, and atomic typed values are checked locally against the active `BotPendingInteraction` contract;
- side questions, corrections, natural-language answers, retries, and mixed question-plus-answer turns enter the canonical interpretation;
- the structured result is passed directly to deterministic policy, avoiding a second model call and keeping proposed values out of serialized traces;
- a side question proposes one closed kind plus the latest-turn language; a deterministic responder answers only from the pending contract and produces a read-only `answer_waitpoint_side_question` step that preserves the pending interaction plus AgentGraph interrupt;
- unknown side questions state the contract limitation, while ambiguous answers repeat the authoritative pending question and available choices;
- a mixed turn still authorizes no more than one workflow transition; any separate request remains residual text for a later user turn;
- a semantic `workflow_resume` is always converted back to `active_pending_interaction` before execution, so model output cannot bypass pending-answer, slot, provenance, or interrupt validation.
- when an executable capability node collects a missing logical input, its exact hash-bound AgentGraph interrupt is projected as the waitpoint contract; the API or action node is not mistaken for an unavailable interaction and resumes through the same typed binding.

Planning and interpretation never update `WorkflowRun.variables`, Slot Memory, or pending-interaction status. A retry can only resolve the waitpoint after the value passes the same deterministic contract used for the first attempt.

## Corrections

Corrections are first-class structured output. The LLM can propose corrected values under `corrections`, but `WorkflowTurnPolicy` accepts only declared workflow slots that pass the same deterministic `InputValidator` used by normal `collectInput` nodes.

Accepted corrections update only already captured workflow variables or existing Slot Memory entries. They do not create arbitrary variables. After a correction, the workflow remains paused and asks the user to continue or confirm the corrected state.

Example:

```text
Bot: Ich habe folgende Angaben erkannt:
- E-Mail: max@example.com
- Anliegen: Rechnung Mai fehlt

Soll ich das so speichern?

User: Nein, die E-Mail ist max.neu@example.com
Bot: Ich habe folgende Angaben erkannt:
- E-Mail: max.neu@example.com
- Anliegen: Rechnung Mai fehlt

Soll ich das so speichern?
```

## Slot Memory

For human-friendly intake, users often answer more than one question at once:

```text
max@example.com, ich finde meine Rechnung vom Mai nicht.
```

If the workflow is waiting for `email` and later declares `issue`, Turn Understanding can extract both values. Policy accepts only declared workflow slots. The current answer resumes the waiting node. Additional approved values are stored under internal Slot Memory and are consumed once when the matching later `collectInput` node is reached.

Slot Memory never invents workflow variables. It can prefill only slots declared by `collectInput` nodes.

## Initial Prefill

Initial prefill is deterministic admission, not another semantic interpretation step. It may consume values already present in authorized runtime variables, a validated typed form resolution, or literal-backed slot candidates from the one canonical entry-understanding result. Every value must still match a declared slot, its provenance requirements, and its deterministic validator.

The runtime does not mine the raw initial message with a secondary prefill planner. It binds any semantic candidate back to the exact source span before validation. When no candidate is authorized, the workflow starts normally and asks for the first missing field.

## Write Confirmation

If one turn fills multiple slots and execution reaches a write-like node, the runtime asks for confirmation before executing the write. The user can answer `ja`, reject, or correct a declared slot before the write executes. This protects actions such as:

- `store_submission`
- `create_handoff`
- registered `action` nodes with write capability
- non-GET HTTP/API connector calls

The summary includes only declared workflow slots and safe scalar values. A user confirmation continues the same node; rejection halts without writing.

Explicit workflow confirmation nodes still take precedence. If a `confirmation` node already gates a write action through its valid branch, the synthetic multi-slot guard does not duplicate it.

## Validators Stay Deterministic

The LLM may propose `email = max@example.com`, but `InputValidator` still validates the value as an email. The same applies to numbers, canonical `YYYY-MM-DD` dates, 24-hour times, choices, money rules, required fields, and custom validation rules.

This keeps semantic flexibility without allowing the model to bypass the workflow contract. If user input is naturally phrased, misspelled, multilingual, or ambiguous, resolve meaning before validation; do not loosen deterministic validators to guess at the contract boundary.

## Config

```php
'workflow_turn_understanding' => [
    'provider' => null,
    'model' => null,
    'min_confidence' => 0.72,
    'slot_min_confidence' => 0.72,
    'max_additional_slots' => 6,
    'confirm_multi_slot_writes' => true,
    'diagnostics_enabled' => true,
    'diagnostics_limit' => 20,
],
```

Workflow Turn Understanding plus deterministic policy is the canonical free-language path. Legacy `enabled` and `mode` switches are not productive routing controls.

Diagnostics store intent, confidence, policy action, reason, and slot names. They do not store raw user text, corrected values, residual text, or arbitrary workflow variables.

## Evals

Local fake-backed gates:

```bash
php -d memory_limit=1G vendor/bin/phpunit tests/Feature/WorkflowTurnRobustnessMatrixTest.php
php -d memory_limit=1G vendor/bin/phpunit tests/Feature/RuntimeV2WaitpointConversationEvalTest.php
```

Provider-backed gates:

```bash
composer eval:workflow-turns
composer eval:workflow-understanding
```

Both provider-backed commands skip unless `WORKFLOW_TURN_EVAL_PROVIDER` and `WORKFLOW_TURN_EVAL_MODEL` are set.

## Workflow Authoring

For human-friendly intake flows, prefer declaring each required fact as a named `collectInput` slot:

- `email`
- `issue`
- `order_number`
- `preferred_contact_method`

At an active waitpoint, the single Turn Understanding proposal can include additional declared slots for deterministic approval and Slot Memory. At workflow entry, the same single proposal may offer literal-backed candidates for declared public slots; deterministic policy decides whether they are admitted. Do not hide required data inside one unstructured text node if later nodes or actions need separate fields.
