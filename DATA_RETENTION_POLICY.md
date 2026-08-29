# Data Retention Policy

## Purpose

This policy defines how conversation and ingestion data is retained when using Filament Agentic Chatbot.

## Data Classes

- Conversation records (`bot_conversations`, `bot_messages`)
- Durable Chat Turns, including optional encrypted visitor-visible page context (`bot_chat_turns.display_context`)
- Evidence-backed business outcomes (`bot_conversation_outcomes`)
- Derived knowledge-gap cases and immutable occurrences (`bot_knowledge_gaps`, `bot_knowledge_gap_occurrences`)
- Human-support cases and encrypted immutable activity (`bot_handoff_requests`, `bot_handoff_activities`)
- Private chat attachments and bounded retention metadata (`bot_message_attachments`)
- Temporary private channel-ingress attachments (`channel_inbound_attachments`)
- External-channel thread and delivery evidence (`channel_threads`, `channel_delivery_events`)
- Encrypted outbound business-event payloads, endpoints, and delivery evidence (`outbound_webhook_events`, `outbound_webhook_endpoints`, `outbound_webhook_deliveries`)
- Source and ingestion records (`bot_knowledge_sources`, `bot_knowledge_documents`, `bot_knowledge_chunks`)
- Runtime metadata (`meta` JSON fields, ingestion error details)

## Recommended Defaults

- Chat history retention: 30 to 180 days (based on legal/compliance needs)
- Visitor-visible page context: retain no longer than its owning durable Chat Turn; do not copy it into a separate analytics store by default
- Business outcomes: retain only for the host's declared analytics, accounting, or audit period
- Knowledge-gap cases: retain only while they are actionable or needed for the host's declared quality/audit period
- Completed handoff cases and activity: retain only for the declared support and audit period
- Chat attachments: 30 days by default; shorten or extend within the configured policy only after reviewing the host's legal basis
- Channel ingress attachments: 24 hours by default; keep only long enough for queue retries and never use them as an archive
- Channel thread/delivery evidence: retain only for the declared support, incident, and provider-reconciliation period
- Outbound webhook events/delivery evidence: 30 days by default after terminal delivery; shorten or extend only for the declared integration incident/audit period
- Failed ingestion metadata: retain until issue is resolved, then purge on schedule
- Vector chunks: retain while source is active and relevant

## User Rights

- Export session history:
    - `GET /api/filament-agentic-chatbot/chat/{botPublicId}/history/export?session_id=...`
- Delete session history:
    - `DELETE /api/filament-agentic-chatbot/chat/{botPublicId}/history`

These are session-history endpoints, not a complete data-subject-access or account-erasure implementation. The export is explicitly versioned as `user_visible_conversation_and_session_memory`. Deletion removes the live transcript plus conversation-, session-, and run-scoped memory only after all durable work is terminal. Its response includes `deletion_scope`, `erasure_status`, `deleted_records`, and a payload-free `retained_records` manifest.

Business submissions, evidence-backed business outcomes, completed handoff cases and encrypted activity, accounting entries, channel delivery evidence, action/reconciliation journals, quality artifacts, and AgentGraph runtime evidence may remain under the host application's declared retention policy. Their conversation foreign keys are detached where the schema supports it. A derived knowledge-gap case is deleted when the removed conversation supplied its only occurrence; a shared case is rebound to a remaining occurrence and its encrypted excerpt and count are recomputed. Active handoffs block transcript deletion until they are resolved or returned to the Agent. Outcome evidence references, knowledge-gap excerpts/notes, and handoff activity content are encrypted at rest, but outcome keys, gap status, handoff state, timestamps, and operator actor identifiers remain reportable business data. Hosts remain responsible for a separately authorized data-subject workflow that evaluates those records, backups, logs, long-term actor memory, and any other application data against the applicable legal basis.

Durable Chat Turns and their encrypted page context follow the owning
conversation's lifecycle and are not retained as a separate business record.

## Operational Rules

- Route scheduled conversation purges through `ConversationPrivacyLifecycleService`; do not bulk-delete conversation rows and bypass active/unknown-work guards, AgentGraph checks, memory cleanup, or retention reporting
- Delete deactivated sources and associated chunks/documents when no longer needed
- Restrict production DB access and enforce backup retention policy
- Store or aggregate each purge outcome so retained categories and lifecycle blockers remain auditable
- Run both `filament-agentic-chatbot:prune-chat-attachments` and `filament-agentic-chatbot:prune-channel-inbound-attachments` under Laravel Scheduler; alert when private objects cannot be deleted
- Run `filament-agentic-chatbot:maintain-outbound-webhooks` every minute; alert on dead letters and expired leases and let it prune terminal evidence under the configured retention policy
- Use Eloquent deletion paths for channel connections and Agents. They purge owned private attachment objects before database cascades; bulk SQL deletes bypass model lifecycle cleanup and are unsupported for these owners

## Sample Purge Schedule

- Daily: inspect conversations older than 90 days and delete only lifecycle-safe history through the shared privacy service
- Daily: purge expired canonical chat attachments and short-lived channel-ingress attachments with the package commands
- Daily: review outbound webhook dead letters; terminal ledger pruning runs through the package's minute recovery sweep
- Weekly: delete failed sources older than 30 days with no retries
- Monthly: review active source relevance and prune stale datasets
