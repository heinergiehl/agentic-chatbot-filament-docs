# Conversations and Messages

Filament Agentic Chatbot stores chat history in conversations and messages.

## Conversation

A conversation represents one session of interaction for one bot.

It is scoped by:

- bot
- session ID
- context area

## Message

A message is one entry inside a conversation.

Messages can be:

- `user`
- `assistant`

Assistant messages can also store cited sources and rendering metadata.

## Submission

A submission is a schema-driven record created by a Workflow Tool such as `store_submission`, or by the Agent's built-in **Collect leads** tool after the visitor confirmed the contact details (source `agent_tool.save_contact`, with the consent text in its meta).

Submissions stay linked to the Agent, conversation and, when a Workflow produced them, the Workflow and its run, so operators can review structured outcomes without digging through raw chat text.

## Workflow Run

A Workflow run is one execution record for a deployment-pinned Workflow.

It stores:

- overall status
- step trace history
- Workflow variables
- related submissions
- halt or failure context

## Business Outcome

A business outcome is evidence that a conversation produced a result that
matters to the host application, such as a resolved issue, qualified lead,
booked appointment, retained subscription, human handoff, or failed action.

Business outcomes are deliberately separate from technical chat-turn and
Workflow statuses. A completed response does not prove that the customer's goal
was achieved. Outcomes are recorded only by trusted package behavior, an
operator reviewing the conversation, or server-side host code using the public
`RecordsConversationOutcomes` contract after it verifies a domain event.

Each outcome keeps immutable Agent and Workflow deployment attribution when it
can be proven from the linked turn or run. It can also carry an optional amount
in integer minor units, a currency, and an encrypted evidence reference. Stable
source idempotency prevents webhook or job retries from double-counting it.
Operator-confirmed records also retain the authenticated actor type and ID.

## Review Surfaces

The Filament admin separates review tasks:

- **Conversations** for session review, message quality checks, and session-level exports or flags
- **Conversations > Submissions** for structured records captured by Workflows or the Agent's lead capture, including audit trail and related entities
- **Inbox > Handoffs** for claimed human-support cases, customer replies, internal notes, SLAs, and immutable case activity; requests come from the Agent's built-in **Human handoff** tool, a Workflow or an operator
- Workflow runs for execution-level debugging, including traces, variables, and JSON exports; they are listed under each Workflow's **Runs** and on the conversation page, and each row opens the run inspector

The conversation review page also lets an authorized operator record a verified
outcome. Each Agent's **Analytics > Outcomes** tab shows recent outcomes,
event-level success and handoff counts, immutable attribution, and attributed
value grouped without mixing currencies.

## Why This Matters

Stored conversations let you:

- review how users interact with a bot
- inspect answer quality
- measure citation coverage
- support export and delete workflows
- trace structured data back to the chat and Workflow that produced it
- debug failed or partial automations without replaying the whole session

## Privacy Considerations

Because conversations contain user input, you should define a retention policy and provide deletion/export flows where needed.

Filament Agentic Chatbot includes privacy-oriented endpoints for these workflows.

The API and Filament review page share the same versioned export and lifecycle-safe deletion authority. Deletion removes the live transcript and session/run memory, but deliberately fails closed while durable work is still active, waiting, unknown, unreconciled, or owned by an active human handoff. Structured business records, business outcomes, completed handoff activity, and operational, accounting, quality, or audit evidence may remain under the host retention policy. Outcome evidence references and handoff activity content are encrypted at rest. When live conversation history is deleted, retained records are detached where supported and the deletion result discloses their category and count without exposing evidence payloads.

Do not describe the session endpoint as a complete GDPR/DSAR erasure workflow. A host-level data-subject process must separately evaluate long-term actor memory, retained records, logs, and backups.

## Handoff Desk

Workflows and runtime services can create handoff requests for low-confidence,
blocked, or human-required moments. **Inbox > Handoffs** is a
transactional support desk rather than a free-form status editor:

1. An escalation opens one active case per conversation and calculates first
   response and resolution targets in the Agent's configured business hours
   (see [Handoff settings](BOTS.md#handoff-notifications-and-business-hours)).
2. An authorized operator replies, reviews the transcript and linked run, or
   adds encrypted internal notes. **Reply** opens a slide-over from the Inbox
   row or the handoff page; sending claims an unassigned case, so there is no
   separate claim step. **Send and resolve** replies and resolves in one go.
   The desk service keeps the ownership rule: only the assignee can reply to
   or resolve an assigned case, and another operator uses **Transfer to me**.
   The handoff page shows at most three header actions (Reply, Resolve and a
   More menu with Claim, notes, priority, Return to Agent, Archive and links).
3. Human replies are stored in the original conversation and delivered through
   its web, Telegram, Slack, or Email thread. External-channel writes fail atomically
   when no verified thread binding exists.
4. Customer messages move the case back to **Waiting for operator**. While the
   case is active, the deterministic handoff owner intercepts the turn before
   any Agent or model execution.
5. **Resolve** records a solved support case; **Return to Agent** records an
   explicit handback. Both end the takeover, and later customer messages may be
   handled by the Agent again.

**Resolve** also refuses while a visitor turn is admitted for the handoff and
not processed yet. Admission stores the visitor message
without moving the handoff version, so the desk service checks, under the
conversation lock that admission also takes, that no active turn of the handoff
is pending. The operator sees that a new visitor message arrived first and
nothing is closed unseen; **Send and resolve** keeps its reply and reports the
real state of the handoff.

Every state-changing action carries an optimistic state version and an
idempotency key. A stale browser tab conflicts instead of overwriting newer
work, and an exact retry returns the already committed result. The activity
timeline is append-only and records actor, transition, visibility, linked
message/delivery evidence, and handoff version. Operators cannot bypass this
contract with direct model edits.

Configure timezone and business hours in the Agent's
[Handoff settings](BOTS.md#handoff-notifications-and-business-hours). Configure
the default team, priority SLAs, optional team overrides, polling interval, and
optional default assignee under
`bot_handoff_requests.desk`. Production access uses the existing view/manage
Gates and the record-aware SQL authorization scope described in
[Security and Privacy](SECURITY_AND_PRIVACY.md#handoff-desk-authorization-and-privacy).

The local host browser regression is `npm --prefix tests/e2e run
test:handoff-desk`. It verifies the desktop inbox, the 390-pixel keyboard flow,
non-empty action dialogs, durable operator activity, encrypted notes, and
explicit return to the Agent.

## Conversation Review

Open **Conversations** to find recent requests by Agent and last activity.
The list shows the latest user request as a bounded, redacted text preview, only
when the operator can view that conversation. It does not preview assistant,
tool, source, or diagnostic content. Expand a conversation’s details to see and
copy its full Session ID, view message and submission counts, and check when it
was created. Session IDs remain searchable. **Agent test** and **Workflow test** contexts
distinguish recognized test conversations from **Visitor**, **Member**, and
**Admin** conversations.

Open **Inbox > Approvals** for actions awaiting an operator decision; the
list starts with the pending ones. **Inbox > Unverified actions** lists writes
whose result could not be verified until someone checks the provider and
resolves them (see [Side-effect integrity](SIDE_EFFECT_INTEGRITY.md#unverified-actions)).
Approval permissions and execution confirmation still govern each action.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Security and Privacy](SECURITY_AND_PRIVACY.md)
- [Support Policy](SUPPORT_POLICY.md)
- [Agent Tests](AGENT_TESTS.md)
