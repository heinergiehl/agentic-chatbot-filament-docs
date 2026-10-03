# ADR 0043 Agent Safety settings replace guardrail policies

Status: Accepted on 2026-10-03 for the plugin overhaul (slice S12b). Supersedes
the guardrail policy pins (`agent_guardrails.v1`) of the Agent deployment
contract and amends ADR 0042 (draft checks). ADR 0037 (immutable,
hash-verified deployments, closed manifest) is unchanged; `WorkflowSafetyBoundary`
stays the only enforcer.

## Context

Guardrail policies were a separate resource whose records an Agent referenced
by ID, per direction. Publication froze each assigned policy with its own
hash into `contract.safety` and locked the policy rows. In use they had weak
spots: banned terms matched substrings ("Ass" in "Assistent"), the phone
detector matched dates, order numbers and prices, "required terms" on input
blocked every message lacking them, the "Rules JSON" field had no
interpreter, and a hit always replaced the whole answer. A top-level resource
for a handful of checkboxes was also more setup than the checks were worth.

## Decision

1. **Settings live on the Agent.** `runtime_config.agent.safety` holds topic
   limits (`only_topics`, `never_topics`), blocked terms with their
   directions, a mode per personal data type (`allow`, `mask`, `block` for
   email, phone, url) with its directions, and an optional fallback message.
   `AgentSafetyContract` normalizes them; the editor's Safety section is the
   only authoring surface.
2. **Closed, inline contract.** A deployment whose settings differ from the
   defaults carries `contract.safety` = `agent_safety.v1` with exactly these
   canonical fields; default settings add nothing, so existing Agents keep
   their deployment hash and are not shown as changed. The deployment hash
   covers the settings, so there is no per-policy hash, head lock or
   dependency status. Unknown fields, non-canonical values and the former
   `agent_guardrails.v1` pins fail `AgentDeploymentRuntimeContractValidator`:
   such a deployment is not executable (admission answers "republish the
   Agent") and the boundary blocks with `policy_unavailable`. Deployments
   without `safety` keep baseline protection only.
3. **Topic limits are instructions.** They are bounded (500 characters each)
   and rendered by `SystemPrompt` as topic rules. Meaning is interpreted by the
   model; no deterministic check claims to enforce them.
4. **Deterministic checks are precise.** Blocked terms match whole words,
   case-insensitively and Unicode-aware, with an optional trailing `*` for
   word beginnings (`TermMatcher`). Personal data detection
   (`PersonalDataDetector`) excludes dates, prices, versions, IBANs, card
   numbers and labelled reference numbers from phone numbers. The checks read
   the visible answer text, not source links or button targets.
5. **Masking instead of blocking.** A masked visitor message is what is stored
   and sent to the model; a masked answer is what is stored, committed,
   streamed and delivered (`protectResult`, `protectMessage`, the draft
   inspector). Labels use the Agent's language. Blocking remains available
   per type.
6. **Baseline unchanged.** Instruction override, credentials, prompt leakage
   and length checks always run first. Required terms, advisory mode and
   Rules JSON are removed without replacement.
7. **Agent wording.** A visitor message stopped by the Agent's own settings
   and any blocked Agent answer without a fallback message get Agent wording
   (`runtime.safety.blocked_message`, `runtime.safety.blocked_answer`) instead
   of the Playbook catalog texts; the stored record of any blocked visitor
   message in an Agent turn is `runtime.safety.blocked_record`.

## Consequences

- The `guardrail_policies` table, model, resource, admin authorization
  config (`guardrails.authorization.*`) and translations are removed; a
  migration drops the table and the stale `agent.guardrail_policy_ids`
  assignments.
- Agents published with guardrail pins stop answering until they are
  published again; their settings are not migrated (plan decision on old
  host records).
- Masking or blocking visitor contact data also hides it from lead capture,
  handoff and Playbooks, because the model never receives it. The choice
  stays with the operator; the Safety section names this consequence when
  visitor messages mask or block email addresses or phone numbers.
- The streamed draft may restart its generation when a masked detail changes
  an already shown prefix; the relay sends `draft_reset` in that case.
