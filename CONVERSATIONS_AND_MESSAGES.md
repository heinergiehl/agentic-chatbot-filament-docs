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

A submission is a schema-driven record created by a workflow action such as `store_submission`.

Submissions stay linked to the bot, workflow, conversation, and workflow run that produced them so operators can review structured outcomes without digging through raw chat text.

## Workflow Run

A workflow run is one execution record for an agentic workflow.

It stores:

- overall status
- node trace history
- workflow variables
- related submissions
- halt or failure context

## Review Surfaces

The Filament admin separates review tasks into three resources:

- **Conversations** for session review, message quality checks, and session-level exports or flags
- **Submissions** for structured records captured by workflows, including audit trail and related entities
- **Workflow Runs** for execution-level debugging across all workflows, including traces, variables, and JSON exports

## Why This Matters

Stored conversations let you:

- review how users interact with a bot
- inspect answer quality
- measure citation coverage
- support export and delete workflows
- trace structured data back to the chat and workflow that produced it
- debug failed or partial automations without replaying the whole session

## Privacy Considerations

Because conversations contain user input, you should define a retention policy and provide deletion/export flows where needed.

Filament Agentic Chatbot includes privacy-oriented endpoints for these workflows.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Security and Privacy](SECURITY_AND_PRIVACY.md)
- [Support Policy](SUPPORT_POLICY.md)
