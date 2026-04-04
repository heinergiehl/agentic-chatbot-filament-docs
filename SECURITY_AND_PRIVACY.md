# Security and Privacy Notes

## Data Collected

- Conversation messages (`user`, `assistant`)
- Retrieval source metadata attached to assistant messages
- Session identifier used for conversation continuity

## Recommended Privacy Policy Clauses

- What user text is stored and for how long
- Which AI providers process prompts
- How users can request export or deletion of chat history
- How to contact support for privacy requests

## Controls in This Plugin

- Per-bot domain allowlist checks
- Optional signed embed tokens (`RAG_WIDGET_SIGNING_ENABLED=true`)
- Request throttling by bot/session/IP
- Friendly provider errors without stacktrace leaks in widget output
- URL ingestion safety checks (blocks localhost/private networks by default)

## Compliance Endpoints

- `GET /api/filament-agentic-chatbot/chat/{botPublicId}/history/export?session_id=...`
- `DELETE /api/filament-agentic-chatbot/chat/{botPublicId}/history` with JSON body `{ "session_id": "..." }`

## Hardening Recommendations

- Use HTTPS only in production
- Place strict WAF or rate limits at edge
- Set retention schedule for old conversations
- Monitor AI provider quota and abuse spikes
