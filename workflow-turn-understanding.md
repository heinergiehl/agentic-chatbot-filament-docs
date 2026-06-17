# Workflow Turn Understanding

Workflow Turn Understanding lets a workflow-bound bot understand a complete human message before deciding how to resume a paused workflow.

The rule is strict:

- The LLM understands the message.
- The workflow controls what can happen.
- Deterministic policy and validators decide what may be stored, resumed, cancelled, clarified, or delegated.

This is not a free-form ChatGPT replacement. It is a semantic interpreter for an active workflow state.

## Turn Types

The Turn Understanding layer classifies one user turn into a typed result:

- `answer_current_node`: the message answers the currently waiting node.
- `answer_and_more`: the message answers the current node and also contains values for later declared slots.
- `side_question`: the user asks about the current process instead of answering it.
- `compound_request`: the user asks for a registered multi-item capability such as weather in several places.
- `correction`: the user changes a previously captured value.
- `cancel`: the user wants to stop the active workflow.
- `new_request`: the user switches to another task.
- `ambiguous`: the model or policy is not confident enough.

Low-confidence or invalid results clarify instead of mutating workflow state.

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

## Write Confirmation

If one turn fills multiple slots and execution reaches a write-like node, the runtime asks for confirmation before executing the write. The user can answer `ja`, reject, or correct a declared slot before the write executes. This protects actions such as:

- `store_submission`
- `create_handoff`
- registered `action` nodes with write capability
- non-GET HTTP/API connector calls

The summary includes only declared workflow slots and safe scalar values. A user confirmation continues the same node; rejection halts without writing.

Explicit workflow confirmation nodes still take precedence. If a `confirmation` node already gates a write action through its valid branch, the synthetic multi-slot guard does not duplicate it.

## Validators Stay Deterministic

The LLM may propose `email = max@example.com`, but `InputValidator` still validates the value as an email. The same applies to numbers, dates, choices, required fields, and custom validation rules.

This keeps semantic flexibility without allowing the model to bypass the workflow contract.

## Config

```php
'workflow_turn_understanding' => [
    'enabled' => true,
    'mode' => 'structured', // legacy, shadow, or structured
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

Modes:

- `legacy`: disables Turn Understanding routing.
- `shadow`: calls Turn Understanding and records safe diagnostics in run meta, but preserves the legacy/current routing result.
- `structured`: uses Turn Understanding plus deterministic policy to route the paused workflow.

Diagnostics store intent, confidence, policy action, reason, and slot names. They do not store raw user text, corrected values, residual text, or arbitrary workflow variables.

## Evals

Local fake-backed gates:

```bash
php -d memory_limit=1G vendor/bin/phpunit tests/Feature/WorkflowTurnRobustnessMatrixTest.php
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

The Turn Understanding layer can prefill later slots only when they are declared by the workflow. Do not hide required data inside one unstructured text node if later nodes or actions need separate fields.
