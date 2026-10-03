# ADR 0038 Direct Agent writes with visitor confirmation

Status: Accepted on 2026-10-02 for the plugin overhaul (slice S04). Admin test conversations follow ADR 0041 (sandbox cards). Supersedes the
rule that direct Agent tools may only read: ADR 0008 ("Data Resources: governed
read capability"), ADR 0013 decision 1 and the read-only statements in ADR 0037's
tool section. ADR 0013's signed MCP write review stays in force.

## Context

ADR 0037 made the transcript loop the single turn owner and already named the
write trust boundary: the model proposes a complete payload, the visitor
confirms it, and idempotency, the side-effect ledger and unknown-outcome
handling stay. The implementation still rejected every published write at Agent
publication, so a buyer needed a Playbook for a single "create this record".

The existing confirmation machinery belongs to Playbooks:
`WorkflowCapabilityConfirmationBinder`, `ConfirmedCapabilityInvocationResolver`
and the runtime grants bind a confirmation into the `WorkflowState` of a run, and
`BotPendingInteraction` is the AgentGraph interrupt projection (one open row per
conversation, read by Playbook continuation admission). A direct tool has no run
and no graph interrupt, so binding its confirmation there would make a projection
authoritative and collide with Playbook waits.

## Decision

1. **Published writes become flat tools.** An assigned published write
   operation of an API or MCP Connector, and each enabled insert or update of an
   assigned Data Resource with a write policy, is pinned into the closed,
   hash-verified deployment manifest as one tool (`api_connector_operation` with
   `side_effect: write`, or `data_resource_write`). The pin records its
   confirmation policy: `visitor` (default) or `none`. Server-bound fields
   (ownership scope, version column) are absent from the tool schema. Batch or
   durable background operations stay Playbook-only. The Agent needs the write
   permission (`query_and_write` or `write_only`); Data Resource writes also need
   an explicit assignment of the resource. A direct Data Resource update must
   only reach records the current visitor owns (S04b): it is pinned with
   `record_scope: visitor` when the resource scope binds a server-attested
   identity of one visitor (`conversation.id`, or an actor's id together
   with its type: `actor.id` with `actor.type`, `widget_context.actor.id`
   with `widget_context.actor.type`). For an Agent-wide, tenant, token owner
   (`conversation.owner_id` of token and channel conversations), shared signed
   attribute or static scope it is pinned only after the admin's
   explicit "Allow updating any record" opt-in, as `record_scope: any`, and then
   always with `confirmation: visitor`. The Gateway re-checks this at proposal
   and execution and refuses any other update pin.
2. **A tool call only proposes.** With `confirmation: visitor` the call never
   writes. The Gateway first admits the arguments (schema, pin, permissions,
   connector planning) without claiming anything; then an
   `AgentToolConfirmation` row stores the arguments (encrypted) bound by
   `AgentWriteBinding` to Agent, conversation, deployment, the complete pin and
   the visitor's authority scope. The tool result tells the model that nothing
   was saved and to ask the visitor to press Confirm or Cancel. The committed
   assistant message carries the card (title, labelled values, status). The
   card shows every value in full; a payload with more than 24 values or a
   value over 2,000 characters is refused before anything is stored, and an
   update lists the record's identity apart from its changes.
3. **Only an explicit action decides.** Confirm and Cancel arrive as a
   structured `confirmation: {id, decision}` field of the authenticated chat
   request, never as interpreted text. Under a row lock the record moves from
   `pending` to `confirmed`, `cancelled` or `expired` (30 minutes) exactly once; a
   changed deployment, pin, payload or authority scope closes it without writing.
   Another turn that finds the record decided only reports its status. A repeated
   delivery of the deciding turn replays the stored outcome.
4. **The Gateway authorizes the execution.** `executeAgentWrite` re-reads the
   confirmed record and requires the same binding, the deciding turn and an
   invocation key derived from the confirmation. It then takes a lease-fenced
   side-effect ledger claim (a Playbook `workflow_run` scope becomes the
   conversation scope), dispatches with the provider idempotency key, validates
   the result and finalizes the ledger. Post-dispatch ambiguity is `unknown`,
   never success. A replay or ledger state is only reported to the
   conversation that claimed it: when an operation's business key or wider
   scope matches a ledger row of another conversation, the write is rejected
   as `agent_write_duplicate` without dispatching and without that row's
   result (S04b). Admin live and quality test conversations cannot propose or
   perform writes.
5. **The outcome joins the transcript.** The deciding turn adds the write tool's
   own call and result (done, failed, cancelled, expired or unknown) after the
   visitor's click and lets the model report it; later turns replay that pair
   natively. The card shows the deterministic status from the record.
6. **Opt-out is explicit and narrow.** In the Agent editor each assigned write has
   an "Ask visitor to confirm" switch, on by default. Turning it off pins
   `confirmation: none`: the call writes through the same Gateway path with an
   invocation key bound to the turn and payload, so a repeated delivery replays.
   MCP writes always confirm (ADR 0013).
7. **Surfaces without buttons do not get confirmation-required writes.** The
   widget and the chat API render cards. A channel conversation receives
   confirmation-required write tools only when its driver implements
   `ConfirmsAgentWrites` (S04b: Telegram inline keyboard, Slack block actions,
   WhatsApp interactive reply buttons) and the connection has its webhook
   secret configured, so every callback is verified; without the secret the
   connection counts as having no buttons and a callback decides nothing.
   Email never receives them. Such a
   driver renders each pending card of the committed message with buttons
   whose value encodes only the confirmation id and decision, and turns a
   callback that passed its webhook verification into the same structured
   `confirmation: {id, decision}` chat field. The callback's chat, thread or
   sender selects the conversation, so a card of another conversation is not
   found, and a card proposed in a channel conversation can be decided only by
   the channel user whose message led to it (`channel_sender_hash`), so in a
   shared group chat or Slack thread another member's press changes nothing;
   typed text never decides. After the decided reply, the driver shows
   the status on the card message where the provider allows editing, otherwise
   the reply states it. Writes without confirmation stay available.

## Consequences

- For a write that requires confirmation, prompt injection can at most
  produce a visible card with exact values; it cannot execute a write. A write
  the admin runs without confirmation is exposed to injected instructions like
  any tool call, so the opt-out is for harmless writes only.
- `AgentToolConfirmation` is the authority for "the visitor confirmed exactly
  this"; the side-effect ledger stays the authority for "it was written once".
  Playbook approvals use the same card (ADR 0040); their authority stays in
  AgentGraph.
- Direct Data Resource writes do not require the Playbook staging evidence of
  ADR 0013 decision 5: the published resource policy, scope, host model policy,
  transaction and optimistic lock bound them, and the visitor confirms each one.
  Connector write operations keep their publication staging requirement.
- Release capability coverage does not yet route write expectations; quality
  scenarios for writes follow with S12.
- A card's status is kept in step in every assistant message that shows it, so
  a proposal the model repeated is not left pending in the history. The widget
  hides Confirm and Cancel once `expires_at` has passed and re-enables a card
  whose confirm request failed before a turn started.
