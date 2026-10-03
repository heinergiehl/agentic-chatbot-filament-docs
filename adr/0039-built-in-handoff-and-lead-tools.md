# ADR 0039 Built-in handoff and lead capture tools

Status: Accepted on 2026-10-02 for the plugin overhaul (slice S05). Builds on
ADR 0037 (transcript loop, flat tools) and ADR 0038 (direct writes with visitor
confirmation).

## Context

Handing a conversation to a person and saving a visitor's contact details both
needed a Playbook (`create_handoff`, `store_submission`). These are the two most
common support actions, and a buyer should get them with a switch, not a canvas.

## Decision

1. **Two Agent settings, two pins.** `agent.human_handoff.enabled` and
   `agent.lead_capture.enabled` (with `schema` and an optional `consent_text`)
   are draft settings. Publication pins each switched-on tool into
   `authority.capabilities` of the closed, hash-verified manifest: type
   `human_handoff` with tool `request_human`, and type `lead_capture` with tool
   `save_contact`, its submission schema (key, version, default status, payload
   schema) and consent text copied into the pin. A change needs a republish.
   New Agents created in the editor start with the handoff switch on; lead
   capture starts off. Release capability coverage ignores both types: they
   are package-owned and covered by the package's tests.
2. **`request_human` needs no visitor confirmation.** It writes no business
   data; the visitor asked for a person, only text from the chat reaches the
   support team, and an operator can return the case to the Agent. The
   Playbook template asked for consent because it collected an email for
   follow-up; here contact fields are optional and the person answers in the
   chat. `CapabilityExecutionGateway::executeAgentHandoff` checks the verified
   deployment pin, refuses admin live and quality test conversations and
   validates the arguments, then creates the request through
   `HumanHandoffRequestService` (desk team, SLA, default assignee, outcome and
   webhooks as before). An open handoff of the conversation is returned
   instead of a second one. The tool is offered only when the conversation can
   receive operator replies (a channel conversation needs its channel thread).
3. **The requesting turn is not a takeover.** A handoff created during a turn
   normally replaces that turn's answer with the takeover notice. The runner
   reports the handoff its own `request_human` call created as
   `agent_execution.requested_handoff_id`; `HumanHandoffControl::interrupted`
   then ignores exactly that handoff, while any other active or newer handoff
   still interrupts. The model's answer is committed and the payload carries
   the public `handoff` state, so the widget switches to the support-team mode
   as for a Playbook handoff; the next visitor message goes to the desk.
4. **`save_contact` is a direct write with the ADR 0038 card.** It always
   confirms (`confirmation: visitor`): contact data is personal data. The card
   title, built-in field labels and the consent notice use the visitor's
   language; the notice is the admin's consent text or the translated default
   and is shown on the widget and channel cards. Confirm stores one
   `BotSubmission` of the pinned schema (source `agent_tool.save_contact`, the
   consent text in its meta) and its audit row in one transaction, under a
   confirmation-bound side-effect ledger claim, so a repeated delivery
   replays. Arguments are validated against the pinned payload schema at
   proposal and execution; errors return to the model. A lead saves visitor
   data, so it needs the Agent-wide write permission like any direct write:
   publication refuses the switch on a read-only Agent and the Gateway checks
   the permission at proposal and execution. The built-in schema `lead` (name and email required, phone and message
   optional) applies unless a registered schema is chosen.
5. **Surfaces follow ADR 0038.** `save_contact` is offered only where cards
   render (widget, chat API, channel connections with verified button
   callbacks), never in admin live or quality tests. No new webhook event is
   added for submissions; S15 adds events.

## Consequences

- Prompt injection can at most move a conversation to the handoff desk; it
  cannot save contact details without the visitor's confirmation.
- A handoff answer is the model's own text; when the model writes none, the
  runner answers with a fixed, translated handoff notice.
- Playbooks keep `create_handoff` and `store_submission` for multi-step
  processes; Solution Kits are unchanged.
