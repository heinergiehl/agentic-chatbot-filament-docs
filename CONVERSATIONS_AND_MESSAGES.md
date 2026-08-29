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

A submission is a schema-driven record created by a Playbook Capability such as `store_submission`.

Submissions stay linked to the Agent, Playbook, conversation, and Playbook run that produced them so operators can review structured outcomes without digging through raw chat text.

## Playbook Run

A Playbook run is one execution record for a deployment-pinned Playbook.

It stores:

- overall status
- step trace history
- Playbook variables
- related submissions
- halt or failure context

## Business Outcome

A business outcome is evidence that a conversation produced a result that
matters to the host application, such as a resolved issue, qualified lead,
booked appointment, retained subscription, human handoff, or failed action.

Business outcomes are deliberately separate from technical chat-turn and
Playbook statuses. A completed response does not prove that the customer's goal
was achieved. Outcomes are recorded only by trusted package behavior, an
operator reviewing the conversation, or server-side host code using the public
`RecordsConversationOutcomes` contract after it verifies a domain event.

Each outcome keeps immutable Agent and Playbook deployment attribution when it
can be proven from the linked turn or run. It can also carry an optional amount
in integer minor units, a currency, and an encrypted evidence reference. Stable
source idempotency prevents webhook or job retries from double-counting it.
Operator-confirmed records also retain the authenticated actor type and ID.

## Review Surfaces

The Filament admin separates review tasks into three resources:

- **Conversations** for session review, message quality checks, and session-level exports or flags
- **Submissions** for structured records captured by Playbooks, including audit trail and related entities
- **Handoff Requests** for claimed human-support cases, customer replies, internal notes, SLAs, and immutable case activity
- **Playbook Runs** for execution-level debugging across all Playbooks, including traces, variables, and JSON exports

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
- trace structured data back to the chat and Playbook that produced it
- debug failed or partial automations without replaying the whole session

## Privacy Considerations

Because conversations contain user input, you should define a retention policy and provide deletion/export flows where needed.

Filament Agentic Chatbot includes privacy-oriented endpoints for these workflows.

The API and Filament review page share the same versioned export and lifecycle-safe deletion authority. Deletion removes the live transcript and session/run memory, but deliberately fails closed while durable work is still active, waiting, unknown, unreconciled, or owned by an active human handoff. Structured business records, business outcomes, completed handoff activity, and operational, accounting, quality, or audit evidence may remain under the host retention policy. Outcome evidence references and handoff activity content are encrypted at rest. When live conversation history is deleted, retained records are detached where supported and the deletion result discloses their category and count without exposing evidence payloads.

Do not describe the session endpoint as a complete GDPR/DSAR erasure workflow. A host-level data-subject process must separately evaluate long-term actor memory, retained records, logs, and backups.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Security and Privacy](SECURITY_AND_PRIVACY.md)
- [Support Policy](SUPPORT_POLICY.md)
