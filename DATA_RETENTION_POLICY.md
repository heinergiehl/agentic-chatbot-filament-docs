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

## Operational Rules

- Rotate and purge old conversations on a scheduled job
- Delete deactivated sources and associated chunks/documents when no longer needed
- Restrict production DB access and enforce backup retention policy

## Sample Purge Schedule

- Daily: delete conversations older than 90 days
- Weekly: delete failed sources older than 30 days with no retries
- Monthly: review active source relevance and prune stale datasets
