# ADR 0040 Playbooks as flat tools

Status: Accepted on 2026-10-02 for the plugin overhaul (slice S08). Admin test conversations follow ADR 0041 (sandbox cards). Builds on
ADR 0037 (transcript loop, flat tools), ADR 0038 (confirmation card) and ADR
0008/0009 (AgentGraph authority, one Playbook beside independent reads).
Supersedes the Playbook control that ADR 0037 left in place ("classes that
Playbooks still use stay until those owners change"): source-bound Playbook
inputs and intent evidence (ADRs 0025, 0032, 0034 as applied to Playbooks),
answer/approve/reject/defer continuation admission with a forced first tool
step, and regex-attested cancellation.

## Context

After the cutover the Agent loop treated every tool as a flat tool except
Playbooks. A Playbook call needed a verbatim `request_evidence` span of the
visitor message, every argument had to occur literally in the latest message,
a waiting run forced the model's first step into a decision tool, approvals
were classified from free text against fixed grammars in four languages, and
cancellation was offered only when the message matched a regex. Inputs were
spread over one Request Input node per value and prefilled into waitpoints.

## Decision

1. **Inputs are one schema.** A Playbook declares its input schema on its Entry
   step (`data.inputs`): a flat list of fields with `name`, `label`, `type`
   (`text`, `textarea`, `email`, `phone`, `url`, `number`, `date`, `time`,
   `choice`), `required`, optional `description`, `choices` and `validation`
   (Request Input rule syntax). The published workflow contract carries it as
   `start_inputs`; the Agent deployment pins it as `input_contract` version 2.
   Publication rejects invalid fields and a field name another step reuses.
2. **A Playbook is a flat tool.** Its arguments are the input schema; its
   description is the published invocation contract. The server validates
   types, choices and rules; values are not bound to the visitor's wording and
   no intent evidence is required. Missing or invalid values return a tool
   result that names them; nothing starts. Valid values become run variables
   (a left-out optional value is empty) and the run starts in AgentGraph.
3. **The open run keeps one tool.** While a run is open, the same tool takes the
   value of the pending Request Input (schema from the AgentGraph interrupt
   payload; one field, a list, or a form's fields) or, without arguments,
   returns the compact status. A valid value resumes the exact interrupt with a
   typed resolution bound to its identity and payload hash; AgentGraph checks
   it. A turn performs at most one Playbook transition. A widget form or choice
   bound to the interrupt still resumes without a model call.
4. **`cancel_playbook` is always offered while a run is open.** The model
   decides from the conversation; there is no text gate. Cancellation stays the
   AgentGraph operation with its recovery and outcome semantics and closes the
   run's open approval cards.
5. **Approvals use the confirmation card.** A run waiting at an Approval shows
   an ADR 0038 card (title: the Playbook, notice: the authored question). The
   card row (`agent_tool_confirmations.workflow_run_id`) stores the interrupt
   identity. Confirm resumes the approved path, Cancel the declined path,
   exactly once under the row lock; a card whose interrupt moved on resumes
   nothing. Text never decides an approval. An operator review is not a
   visitor approval: it gets no card and no chat action resolves it. Surfaces
   without cards do not get Playbooks with approvals; admin live and quality
   tests keep their structured approval action until S10 replaces the test
   playground.
6. **The model writes the answer** from the compact tool result (status, the
   Result output or the Playbook's question, what it waits for, next step). The
   turn keeps the run's canonical projection and outcome flags. Without model
   text, when the model fails after the transition, and for an unknown
   outcome, the Playbook's fixed status text is the answer; such a turn is
   never offered as a retry.
7. **Old contracts fail closed.** Agent pins of input contract version 1 are not
   offered. An open run whose Agent version cannot be verified or pins the old
   contract is not continued; only `cancel_playbook` is offered for it and the
   answer ends with a fixed, localized notice. Old Playbooks are not migrated;
   they are republished.

## Consequences

- The model may pass a value the visitor did not literally type (a translated
  name, a normalized date). The run records the value used; validation,
  AgentGraph, the Gateway and approvals bound what it can do.
- Prompt injection can at most start a Playbook with values the server accepts,
  supply a pending value or stop an open run (steps already done stay done).
  It cannot approve a step: only the visitor's Confirm on the card does.
- A Playbook that collected its inputs with one Request Input per value must
  move them to Entry inputs; otherwise each value is a mid-run question.
- `AgentPlaybookContinuationAdmission`, `AgentPlaybookInputBinder`,
  `AgentPlaybookCancellationIntent`, `AgentCapabilityIntentEvidence`,
  `AgentTurnCapabilitySequence` and the forced first step of `RuntimeAgent`
  are removed.
