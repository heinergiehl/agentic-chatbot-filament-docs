# Workflow Turn Evals

Workflow turn evals protect the contract between natural language understanding and deterministic workflow execution.

## Local Matrix

Run the fake-backed robustness matrix in normal CI:

```bash
php -d memory_limit=1G vendor/bin/phpunit tests/Feature/WorkflowTurnRobustnessMatrixTest.php
```

This matrix covers semantic answers with typos, answer-plus-slot capture, side questions, compound requests, cancellation, new requests, low-confidence clarification, undeclared slots, invalid slot values, and declared corrections.

## Provider Evals

Run provider-backed routing evals:

```bash
WORKFLOW_TURN_EVAL_PROVIDER=openai WORKFLOW_TURN_EVAL_MODEL=gpt-4.1-mini composer eval:workflow-turns
```

Run provider-backed direct Turn Understanding evals:

```bash
WORKFLOW_TURN_EVAL_PROVIDER=openai WORKFLOW_TURN_EVAL_MODEL=gpt-4.1-mini composer eval:workflow-understanding
```

Without `WORKFLOW_TURN_EVAL_PROVIDER` and `WORKFLOW_TURN_EVAL_MODEL`, both commands skip. That keeps local and CI runs deterministic unless provider credentials are intentionally configured.

## Case Files

- `evals/workflow_turn_routing_cases.php` verifies end-to-end router decisions, replacement extraction, Slot Memory, and correction variable updates.
- `evals/workflow_turn_understanding_provider_cases.php` verifies the structured `WorkflowTurnUnderstandingService` output directly.

Add new cases by expressing the workflow state, the user message, and the deterministic expectation. Do not add phrase-specific cases merely to bless one wording; prefer categories such as correction, compound request, side question, answer plus future slot, invalid correction, or ambiguous task switch.

## Expected Semantics

Provider evals should prove that the LLM can understand real language. They must not prove that the LLM is allowed to execute freely.

The policy layer still decides:

- only declared slots can be stored or corrected;
- all values must pass `InputValidator`;
- compound requests require registered capabilities;
- write-like actions stay behind confirmation when multiple slots were captured;
- `shadow` diagnostics must not change routing behavior.
