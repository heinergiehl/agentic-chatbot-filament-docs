# Privacy Policy Template (Filament Agentic Chatbot)

Use this as a base and adapt with legal counsel.

## What We Collect

- Chat messages submitted by users
- Assistant responses
- Session identifiers for conversation continuity
- Retrieval source metadata used for citations
- Derived answer-quality signals and encrypted excerpts when durable runtime evidence identifies a missing knowledge case
- Files submitted through the web widget or connected Telegram, Slack, WhatsApp, or Email channels, including detected type, size, integrity hash, encrypted original filename, and retention state
- External-channel identifiers and delivery evidence needed to receive and answer a message
- PII-minimized outcome and handoff lifecycle events plus outbound webhook delivery evidence when an administrator enables an external automation receiver

## Why We Process It

- Deliver assistant responses
- Improve support workflows and answer quality
- Verify and resolve recurring knowledge gaps with reviewed regression tests
- Receive, validate, process, and answer messages and attachments from enabled external channels
- Monitor reliability and abuse

## AI Provider Processing

Prompts and context may be processed by configured AI providers (for example Gemini, OpenAI, Anthropic, xAI) according to your deployment settings.

When an administrator enables an outbound webhook, the configured business
automation receiver may process versioned outcome or handoff state metadata.
These payloads exclude conversation text, customer contact data, internal notes,
operator identity, credentials, and evidence references by design. Identify each
receiver and its purpose in your final policy.

## Data Retention

Conversation and source data is retained according to our data retention policy:

- `https://your-site.com/legal/data-retention`

Temporary multipart Email ingress files are kept only long enough to cross the
queue safely (24 hours by default). A validated copy attached to a committed chat
turn follows the normal chat-attachment retention period. Adapt both periods to
your legal basis and operational requirements.

Terminal outbound webhook delivery evidence defaults to 30 days. Adapt that
period to the declared integration incident/audit purpose.

## User Controls

Users can request:

- Conversation export
- Conversation deletion
- Privacy-related support assistance

Support contact:

- `privacy@your-site.com`

## Security Measures

- Domain allowlist enforcement per bot
- Optional signed widget tokens
- Rate limiting and ingestion safety controls
- Signed provider webhooks, provider-host-only file downloads, private attachment storage, and scheduled retention cleanup
- Signed public-HTTPS outbound callbacks with DNS pinning, receiver idempotency, bounded retry/dead-letter handling, encrypted event payload storage, and scheduled terminal-ledger pruning
- TLS in production and restricted DB access

## Contact

For privacy inquiries:

- `privacy@your-site.com`
