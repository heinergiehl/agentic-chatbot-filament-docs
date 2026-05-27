# API Source Roadmap

> **Last updated**: 2026-05-12

This page records the current API Source scope and the most valuable follow-up work. It exists so customer-facing promises stay accurate and future implementation work stays concrete.

## Current Implemented Scope

API Sources can feed the assistant knowledge pipeline from external JSON APIs.

What works today:

- create reusable API Connectors with base URL, auth, default headers, timeout, and SSL settings
- authenticate with no auth, API key header, Bearer token, Basic auth, or custom header
- create a Source of type **API Source**
- fetch records from a `GET` JSON endpoint
- select a JSON path that resolves to the records array
- map record fields into searchable text with `{{field.path}}` placeholders
- use a stable record ID field for safe document replacement
- optionally store title, source URL, and updated-at metadata
- paginate with page-number, offset, cursor, or response-provided next URL strategies
- cap syncs with `max_pages` and `max_records`
- periodically queue API sources through `filament-agentic-chatbot:sync-rag-sources`
- replace previous API documents only after a successful sync
- keep the previous index active when a new sync fails
- create API sources through a clearer multi-step Filament wizard

Recommended customer wording:

> You can feed the assistant knowledge index from external JSON APIs now. Database data can also be used if you expose the records through a stable API endpoint. Direct database-source ingestion and OAuth2 login flows are planned future improvements, not part of the current v1 scope.

## Product Positioning

Use API Sources for relatively stable knowledge that should become searchable later:

- product catalogs
- CMS entries
- help-center records
- documentation records
- structured public datasets
- stable internal reference data

Use workflow API Connector nodes for live or user-specific data:

- order status
- account balances
- stock levels
- customer-specific entitlements
- actions that write to another system
- anything where freshness or permissions matter at request time

Keeping those two paths separate avoids stale answers, privacy leakage, and unnecessary re-embedding.

## Priority 1: Better Mapping And Preview UX

This is the next highest-value improvement because it reduces setup friction for almost every API Source user.

Implementation ideas:

- fetch and display a sample response inside the API Source form
- auto-detect likely records paths such as `data`, `data.items`, `items`, `results`
- show a preview table of the first few records
- preview the rendered content template per record
- validate that `record_id_path` exists on sampled records
- warn when content templates render empty text
- show estimated record count and page count when possible

Acceptance criteria:

- a user can test an endpoint before saving the source
- common JSON response shapes can be configured without guessing paths
- empty mappings are caught before ingestion

## Priority 2: OAuth2 Connector Auth

OAuth2 is important for APIs such as Google, HubSpot, Shopify, Salesforce, Microsoft, and many customer-specific SaaS APIs. It is also the most complex connector-auth item and should be built deliberately.

Implementation scope:

- OAuth2 auth type on API Connectors
- authorization-code login flow
- optional client-credentials flow for machine-to-machine APIs
- encrypted client secret, access token, refresh token, scopes, expiry, and provider metadata
- callback route
- token refresh before request execution
- failed-refresh error handling
- per-tenant token isolation
- clear UI for connect, reconnect, disconnect, and token status

Acceptance criteria:

- a connector can authenticate through OAuth2 and keep working after access-token expiry
- token refresh is automatic and logged safely
- tenants/customers cannot accidentally share tokens
- credentials never appear in plain text in logs, traces, or tables

## Priority 3: Direct Database Knowledge Source

This would answer the customer question "can it read directly from a database?" without forcing users to create an API endpoint.

Recommended safe shape:

- read-only source type
- allow-listed database connections only
- table/model/resource selection instead of arbitrary SQL by default
- optional advanced SQL mode gated behind config
- ID/title/content/URL/updated-at field mapping
- row limit and timeout
- incremental sync using an updated-at column
- preview rows before saving
- tenant/permission filters where applicable

Risks to solve:

- SQL injection
- accidental ingestion of sensitive data
- huge table scans
- cross-tenant leakage
- stale embeddings after row deletion
- database credentials and connection ownership

Acceptance criteria:

- no arbitrary write queries can run
- source previews show exactly what will be embedded
- row limits and timeouts protect production databases
- tenant filters are explicit and testable

## Priority 4: Incremental And Delta Sync

Current API Sources perform safe full replacement after successful sync. That is simple and reliable, but not optimal for very large datasets.

Implementation ideas:

- `updated_since` query parameter support
- `updated_at_path` based delta sync
- ETag / Last-Modified request headers
- per-record soft delete handling
- tombstone endpoint support
- sync checkpoint metadata
- sync history table for diagnostics

Acceptance criteria:

- unchanged records do not need to be re-embedded
- deleted records can be removed safely
- failed delta syncs do not corrupt the active index

## Priority 5: Operational Visibility

Implementation ideas:

- sync history list per source
- last successful sync timestamp
- last failed sync timestamp and error category
- fetched page count, record count, document count, chunk count
- manual "Preview API Records" action
- manual "Run Sync Now" action
- scheduler health warning when auto-sync is enabled but Laravel Scheduler is not running

Acceptance criteria:

- operators can explain what synced, when it synced, and why it failed
- support can debug customer API issues without database access

## Priority 6: Advanced API Compatibility

Potential future compatibility features:

- HMAC/request-signing auth profiles
- custom query/body templates for APIs that require POST search endpoints
- XML and CSV API source parsing
- compressed response handling
- retry/backoff controls per connector
- rate-limit window metadata
- per-page delay
- custom user-agent and contact metadata

These should be added only when customer demand justifies the extra configuration surface.

## Non-Goals For API Source v1

Do not promise these as current behavior:

- universal support for every API shape
- OAuth2 login and refresh tokens
- direct database ingestion
- real-time retrieval over rapidly changing private data
- automatic permission-aware retrieval per end user
- automatic schema understanding without user mapping

## Testing Checklist For Future Work

Every new API Source capability should include:

- unit tests for mapping, auth, pagination, and failure states
- feature or resource tests for form validation
- local demo smoke test through `filament-demos`
- Bruno or CLI smoke request when an HTTP endpoint is involved
- failed-sync test proving the old index remains active
- private-network/SSRF guard test where URLs are user-configurable
- docs update in `RAG_SOURCES.md`, `API_CONNECTORS.md`, and `KNOWN_LIMITATIONS.md`
