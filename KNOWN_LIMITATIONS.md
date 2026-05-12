# Known Limitations

> **Version**: current main / next release<br>
> **Last updated**: 2026-05-12

This page documents known constraints, upstream limitations, and recommended workarounds.

## 1. `laravel/ai` Is Pre-1.0

The plugin depends on `laravel/ai`, which is still pre-1.0. Minor-version bumps may introduce breaking changes.

**Impact:**

- Per-node `temperature` and `maxTokens` values configured in workflow AI Agent nodes are stored and preserved, but not yet applied per request.
- Streaming support is limited to what the underlying SDK exposes.

**Workaround:** Configure model defaults through environment/config values or provider dashboards until the upstream SDK exposes stable per-call overrides.

## 2. PostgreSQL + pgvector Is The Default Path

The package supports PostgreSQL + `pgvector` and ChromaDB. PostgreSQL remains the default and most battle-tested path.

**Impact:** SQLite is useful for local package tests, but it is not a production vector backend.

**Workaround:** Use PostgreSQL + `pgvector` for the normal production path, or configure ChromaDB explicitly.

## 3. API Knowledge Source v1 Scope

API knowledge sources currently support authenticated `GET` JSON endpoints, field mapping, page-number/offset/cursor/next-URL pagination, scheduled full re-sync, per-sync safety limits, and full source replacement after successful sync.

**Supported auth today:**

- no auth
- API key header
- Bearer token
- Basic auth
- custom header

**Not implemented yet:**

- OAuth2 login flows with callback URLs and automatic refresh-token rotation
- direct database source type
- provider-specific request signing
- webhooks or event-driven delta sync
- automatic schema/mapping generation
- non-JSON API parsing as first-class API source input

**Workaround:** Expose stable JSON endpoints or use an API gateway. For live, private, or user-specific data, use workflow API Connector nodes instead of syncing the data into RAG.

## 4. Direct Database Ingestion Is Not A Source Type Yet

The plugin can read from databases at workflow runtime through configured internal actions/resources, but direct "sync this table/query into RAG" is not currently a first-class source type.

**Impact:** Database-backed knowledge should currently be exposed through a curated API endpoint if it needs to become searchable RAG knowledge.

**Workaround:** Create a read-only JSON endpoint for the records you want to sync, then configure an API Source against that endpoint.

## 5. RAG And Runtime Retrieval Should Stay Separate

RAG is best for relatively stable knowledge that can be embedded and searched later. Workflow runtime retrieval is better for live data such as order status, stock counts, account state, permissions, or write actions.

**Impact:** Syncing live user-specific data into RAG can create stale answers and privacy risks.

**Workaround:** Use API Sources for stable knowledge. Use workflow API Connector nodes or internal actions for live data.

## 6. Workflow Loop Execution Limits

Loop nodes enforce a hard step ceiling through workflow configuration.

**Impact:** Very large loop workflows can terminate before finishing.

**Workaround:** Keep chat workflows focused, or raise the configured step limit with care.

## 7. Widget CSP Restrictions

The embeddable widget is loaded through a script tag and injects its own styles.

**Impact:** Strict Content Security Policy headers can block the widget script, API calls, or injected styles.

**Workaround:** Allow the widget script origin, the chat API origin, and the required style behavior for pages that embed the widget.

## 8. Delay Nodes Require A Queue Worker

Delay/timer nodes dispatch a resume job to the queue.

**Impact:** With a `sync` queue driver, delay nodes can block the HTTP request.

**Workaround:** Use `database`, `redis`, or another real queue driver in production and supervise `php artisan queue:work`.
