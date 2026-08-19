# Workflow Turn Evals

Workflow turn evals protect the contract between natural language understanding and deterministic workflow execution.

## Local Matrix

Run the fake-backed robustness matrix in normal CI:

```bash
php -d memory_limit=1G vendor/bin/phpunit tests/Feature/WorkflowTurnRobustnessMatrixTest.php
```

This matrix covers semantic answers with typos, answer-plus-slot capture, side questions, multi-item requests, cancellation, new requests, low-confidence clarification, undeclared slots, invalid slot values, and declared corrections. `RuntimeV2WaitpointConversationEvalTest` additionally pins canonical waitpoint ownership, invalid typed answers, retry behavior, state preservation, and trace visibility.

## Provider Evals

Run provider-backed routing evals:

```bash
WORKFLOW_TURN_EVAL_PROVIDER=openai WORKFLOW_TURN_EVAL_MODEL=gpt-4.1-mini composer eval:workflow-turns
```

Run provider-backed direct Turn Understanding evals:

```bash
WORKFLOW_TURN_EVAL_PROVIDER=openai WORKFLOW_TURN_EVAL_MODEL=gpt-4.1-mini composer eval:workflow-understanding
```

Run the provider-backed entry contract separately when diagnosing start-route behavior:

```bash
WORKFLOW_TURN_EVAL_PROVIDER=openai WORKFLOW_TURN_EVAL_MODEL=gpt-4.1-mini composer eval:workflow-entry-understanding
```

Without `WORKFLOW_TURN_EVAL_PROVIDER` and `WORKFLOW_TURN_EVAL_MODEL`, these commands skip. That keeps local and ordinary CI runs deterministic unless provider credentials are intentionally configured. Protected release tags do not permit this skip.

For staging or release checks where provider-backed evals are required, use the explicit gate:

```bash
WORKFLOW_TURN_EVAL_PROVIDER=openai WORKFLOW_TURN_EVAL_MODEL=gpt-4.1-mini composer assurance:workflow-provider-evals
```

This command fails before running the evals if provider or model is missing, so a release job cannot accidentally treat skipped provider evals as a pass.

## Governed Runtime Release Gate

Turn evals are one part of the governed Runtime V2 release gate. For runtime, workflow, policy, planner, dispatcher, or node-contract changes, run:

```bash
composer pint:test
composer stan
composer test
composer run-script assurance
WORKFLOW_TURN_EVAL_PROVIDER=openai WORKFLOW_TURN_EVAL_MODEL=gpt-4.1-mini composer run-script assurance:workflow-provider-evals
npm --prefix resources/js/workflow-editor run build
```

Provider-backed evals may still skip in ordinary local development, but a release candidate is blocked unless the protected matrix covers `native_structured_tools`, `prompt_json_tools`, and `restricted_no_tools`. The first two run live evals and the restricted profile must prove capability rejection. Matrix setup and secret-handling rules are documented in [Runtime Release Assurance](RELEASE_ASSURANCE.md).

## Case Files

- `evals/workflow_turn_routing_cases.php` verifies end-to-end router decisions, literal residual extraction, the global no-replacement invariant, Slot Memory, and correction variable updates.
- `evals/workflow_turn_understanding_provider_cases.php` verifies the version-3 multi-act waitpoint proposal directly, including qualified confirmations and answer-plus-question turns.
- `evals/workflow_entry_understanding_provider_cases.php` verifies real `understandEntry()` classification, exact published-route binding, literal entry slots, meta questions, and no-start categories.
- `tests/Feature/RuntimeV2WaitpointConversationEvalTest.php` verifies deterministic invalid/retry classification and conversation arbitration history without provider calls.

Add new cases by expressing the workflow state, the user message, and the deterministic expectation. Do not add phrase-specific cases merely to bless one wording; prefer categories such as correction, multi-item request, side question, answer plus future slot, invalid correction, or ambiguous task switch.

Gateway unit and golden-matrix coverage also protects candidate-provider behavior that is too structural for provider evals. Concrete entity requests may carry a workflow-contract-derived workflow-start candidate, but expected routing must assert the active state-machine command. A high-confidence assistant owner remains allowed to decline workflow start even when the contract candidate is present in diagnostics.

## Expected Semantics

Provider evals should prove that the LLM can understand real language. They must not prove that the LLM is allowed to execute freely.

The policy layer still decides:

- only declared slots can be stored or corrected;
- a semantic turn may propose several literal-bound acts, but policy authorizes at most one workflow mutation;
- answer-plus-side-question turns hold the waitpoint and leave proposed values unapplied;
- a new request never replaces an active workflow or starts a second run in the same turn;
- all values must pass `InputValidator`;
- multi-item plans require published, release-bound capabilities;
- plan admission stays side-effect-free before ownership is assigned;
- workflow-contract example matches are workflow-start candidates, not direct execution authority;
- write-like actions stay behind confirmation when multiple slots were captured;
- strict planner actions always enter the canonical interpretation path and remain subject to deterministic validation and policy;
- `TurnPlanValidator` rejects invalid candidate plans, and `RuntimeTurnAuthorizer` must return one exact command or a non-executing protocol response before `AuthorizedTurnCommandExecutor` runs.
## Consolidated Runtime Release Gate

`composer assurance:runtime-release` is the deterministic merge/release gate across the local conversation evals and the critical safety contracts. Provider-backed workflow evals remain opt-in for local development because they require an explicitly selected provider and model, but the protected tag workflow makes the complete provider matrix mandatory. The consolidated report maps each deterministic suite to its covered behavior and safety metrics, including aggregate Wilson 95% intervals, without persisting case payloads or raw test output.
