# Known Limitations

> **Version**: 0.12.0 plus AgentGraph SDK refactor notes<br>
> **Last updated**: 2026-05-27

This page documents known constraints, upstream limitations, and recommended workarounds.

## 1. Provider Generation Options Vary

The plugin supports `laravel/ai` `^0.7` and `^1.0`, but provider gateways still differ in how they apply request-level generation options.

**Impact:**

- Per-node `temperature` and `maxTokens` values are passed through for workflow AI calls, but the selected provider may ignore or clamp one of those options.
- Streaming support is limited to what the underlying SDK exposes.

**Workaround:** If a provider ignores a generation option, configure matching defaults in the provider/model settings or choose a gateway that supports the option.

## 2. AgentGraph SDK Is Now A Runtime Dependency

The post-`v0.12.0` refactor depends on `heiner/agent-graph` for assistant chat graphs, workflow execution, sub-workflows, delays, memory, and run inspection.

**Impact:**

- Fresh installs must be able to resolve the SDK package through Packagist, Private Packagist, or a root Composer repository entry.
- Host apps using the database-backed SDK store must run the SDK migrations. The plugin auto-loads them, so normal `php artisan migrate` should create the `agent_graph_*` tables.
- `php artisan filament-agentic-chatbot:doctor` checks the SDK tables unless the SDK store is configured as memory.
- Upgrading apps with open legacy workflow runs need a cutover check because those runs may be cancelled if they have no AgentGraph run metadata.

**Workaround:** For unreleased branch testing, add `heinergiehl/agent-graph` as a VCS repository in the host app root composer config before requiring the plugin. For production upgrades, follow [Database And Breaking Changes](DATABASE_AND_BREAKING_CHANGES.md).

## 3. PostgreSQL + pgvector Is The Default Path

The package supports PostgreSQL + `pgvector` and ChromaDB. PostgreSQL remains the default and most battle-tested path.

**Impact:** SQLite is useful for local package tests, but it is not a production vector backend.

**Workaround:** Use PostgreSQL + `pgvector` for the normal production path, or configure ChromaDB explicitly.

## 4. API Knowledge Source v1 Scope

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

**Workaround:** Expose stable JSON endpoints or use an API gateway. For live, private, or user-specific data, use workflow API Connector nodes instead of syncing the data into the source-grounded knowledge index.

## 5. Direct Database Ingestion Is Not A Source Type Yet

The plugin can read from databases at workflow runtime through configured internal actions/resources, but direct "sync this table/query into the knowledge index" is not currently a first-class source type.

**Impact:** Database-backed knowledge should currently be exposed through a curated API endpoint if it needs to become searchable assistant knowledge.

**Workaround:** Create a read-only JSON endpoint for the records you want to sync, then configure an API Source against that endpoint.

## 6. Source Ingestion And Runtime Retrieval Should Stay Separate

Source ingestion is best for relatively stable knowledge that can be embedded and searched later. Workflow runtime retrieval is better for live data such as order status, stock counts, account state, permissions, or write actions.

**Impact:** Syncing live user-specific data into the knowledge index can create stale answers and privacy risks.

**Workaround:** Use API Sources for stable knowledge. Use workflow API Connector nodes or internal actions for live data.

## 7. Workflow Loop Execution Limits

Loop nodes enforce a hard step ceiling through workflow configuration.

**Impact:** Very large loop workflows can terminate before finishing.

**Workaround:** Keep chat workflows focused, or raise the configured step limit with care.

## 8. Widget CSP Restrictions

The embeddable widget is loaded through a script tag and injects its own styles.

**Impact:** Strict Content Security Policy headers can block the widget script, API calls, or injected styles.

**Workaround:** Allow the widget script origin, the chat API origin, and the required style behavior for pages that embed the widget.

## 9. Delay Nodes Require A Queue Worker

Delay/timer nodes dispatch a resume job to the queue.

**Impact:** With a `sync` queue driver, delay nodes can block the HTTP request.

**Workaround:** Use `database`, `redis`, or another real queue driver in production and supervise `php artisan queue:work`.
