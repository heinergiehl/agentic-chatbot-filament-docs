# Data Retention Policy

## Purpose

This policy defines how conversation and ingestion data is retained when using Filament Agentic Chatbot.

## Data Classes

- Conversation records (`bot_conversations`, `bot_messages`)
- Source and ingestion records (`bot_knowledge_sources`, `bot_knowledge_documents`, `bot_knowledge_chunks`)
- Runtime metadata (`meta` JSON fields, ingestion error details)

## Recommended Defaults

- Chat history retention: 30 to 180 days (based on legal/compliance needs)
- Failed ingestion metadata: retain until issue is resolved, then purge on schedule
- Vector chunks: retain while source is active and relevant

## User Rights

- Export session history:
    - `GET /api/filament-agentic-chatbot/chat/{botPublicId}/history/export?session_id=...`
- Delete session history:
    - `DELETE /api/filament-agentic-chatbot/chat/{botPublicId}/history`

These are session-history endpoints, not a complete data-subject-access or account-erasure implementation. The export is explicitly versioned as `user_visible_conversation_and_session_memory`. Deletion removes the live transcript plus conversation-, session-, and run-scoped memory only after all durable work is terminal. Its response includes `deletion_scope`, `erasure_status`, `deleted_records`, and a payload-free `retained_records` manifest.

Business submissions, accounting entries, channel delivery evidence, action/reconciliation journals, quality artifacts, and AgentGraph runtime evidence may remain under the host application's declared retention policy. Their conversation foreign keys are detached where the schema supports it. Hosts remain responsible for a separately authorized data-subject workflow that evaluates those records, backups, logs, long-term actor memory, and any other application data against the applicable legal basis.

## Operational Rules

- Route scheduled conversation purges through `ConversationPrivacyLifecycleService`; do not bulk-delete conversation rows and bypass active/unknown-work guards, AgentGraph checks, memory cleanup, or retention reporting
- Delete deactivated sources and associated chunks/documents when no longer needed
- Restrict production DB access and enforce backup retention policy
- Store or aggregate each purge outcome so retained categories and lifecycle blockers remain auditable

## Sample Purge Schedule

- Daily: inspect conversations older than 90 days and delete only lifecycle-safe history through the shared privacy service
- Weekly: delete failed sources older than 30 days with no retries
- Monthly: review active source relevance and prune stale datasets
