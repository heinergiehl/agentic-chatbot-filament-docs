# Filament Agentic Chatbot 0.17.0

**Release status:** Approved<br>
**Release date:** 2026-09-03<br>
**Upgrade baseline:** 0.16.1<br>
**Previous-line security/critical EOL:** 2026-11-17

Version 0.17.0 is a breaking, security-focused Agent-first runtime cutover. It
has one production entrypoint: every live bot executes one immutable,
hash-verified Agent deployment. That Agent may answer normally, search only its
pinned Knowledge, query only its pinned read capabilities, or invoke an exact
pinned Playbook. AgentGraph owns Playbook state, and every external capability
call passes through the authorization, confirmation, idempotency, redaction,
and reconciliation gateway.

## What buyers gain

- A guided readiness flow from Agent setup through candidate publication, persistent real-chat testing, atomic live activation, optional Playbook validation, and turn/run/trace inspection.
- Versioned Solution Kits for reviewed starting configurations, including a built-in Customer Support & Human Handoff Kit that still requires explicit data, Connector, model, and Playbook choices before publication.
- Tokenless browser snippets with origin-checked bootstrap, short-lived in-memory tokens, renewal before expiry, and a separate anonymous conversation credential.
- A typed widget SDK, verified private chat attachments, suggested-message and bounded visible-page-context APIs, and privacy-minimized outcome, capability, and handoff events.
- Durable turn idempotency and serialization, explicit unknown-outcome reconciliation, immutable deployment/capability pins, and bounded external-call handling.
- A safer editor: raw HTTP inspection is read-only (`GET`/`HEAD`), host-policy checked, DNS pinned, and response-size bounded; connector writes remain behind the productive execution gateway.
- A full-page Integration Studio that imports OpenAPI, Postman, or cURL locally into inactive Connector drafts, optionally improves only presentation metadata through an existing central AI key, and records atomic actor-attributed installation evidence.
- A Production Handoff Desk with one-active-case enforcement, SLA and assignment state, encrypted internal notes, same-thread operator replies, immutable activity, and deterministic Agent handback.
- Scheduled Published Agent checks, exact candidate-versus-live Quality Lab comparisons, and a Knowledge Operations inbox for turning cited knowledge gaps into durable regression coverage.
- Production Telegram, Slack, WhatsApp Cloud API, Mailtrap Email, and Mailgun Email adapters with explicit per-adapter availability and acceptance boundaries in the compatibility matrix.
- An evidence-backed conversation-outcome ledger and Agent Analytics reporting for success, handoff, and currency-safe attributed value without treating model output as business authority.
- Fail-closed sensitive Filament surfaces and a shared privacy lifecycle for conversation inspection, export, and deletion.
- Bounded ingestion downloads, secret-aware operational logging, and dependency constraints that exclude audited vulnerable Guzzle/PSR-7/CommonMark versions while supporting Laravel 13's native Guzzle 8/PSR-7 3 line.
- Exact commercial artifact evidence: deterministic ZIP, whole-file SHA-256, per-entry sidecar, embedded release manifest, and CycloneDX 1.6 production-dependency SBOM.
- Bring-your-own-key distribution with a fail-closed credential scan over release-eligible source and the exact commercial ZIP; no maintainer-owned provider key is shipped to buyers.
- Safer Agent reads: exact latest-message purpose evidence, named opt-outs, duplicate-read suppression, bounded adjacent Connector follow-ups, and Data Resource intent matching that cannot be authorized by generic field words alone.
- Deterministic, visitor-ready evidence rendering for approved record lists and selected values, with one tool-free repair attempt for malformed Knowledge or direct-read answer contracts.

## Breaking runtime and authoring changes

- Legacy Assistant/runtime profiles, the top-level Knowledge-only bypass, compound planning, global-tool escape paths, and recursive Playbooks are removed from production routing. A bot without one verified live Agent deployment is blocked; ordinary conversation and pinned Knowledge do not require a Playbook.
- Compound Request models/modes and the legacy `loop` node are removed. Republish intentional bounded collection work with `batchMap`.
- API Connector v1/v2 execution compatibility is removed. Publish v3 operations and deployments with exact revision, contract, schema, environment, and capability pins.
- `RAG_*` environment fallbacks and legacy runtime mode aliases are removed. Use only documented `AGENTIC_CHATBOT_*` settings.
- Action result schemas are mandatory. Host capability providers without an explicit request/result contract fail registration.
- Old static widget `data-token` snippets no longer work. Republish or recopy the tokenless snippet and configure exact Allowed Domains.
- Several migrations are intentionally irreversible because they remove unsafe runtime ambiguity. Back up first and use a maintenance window.

Read `UPGRADING.md` completely before running migrations. In particular, rotate legacy Bot Access Tokens, inspect workflows retired by the cutover, publish replacement deployments, configure the widget signing key/allowlists, re-ingest knowledge for current index stamps, and run both package and AgentGraph Doctor commands before reopening traffic.

## Supported Golden Path

- PHP 8.3+
- Laravel 12.61.1+ or 13.12.0+
- Filament 5.7.6+
- AgentGraph 0.16.1 as the exact stable runtime dependency, including the idempotent existing-schema migration repair
- PostgreSQL 16 with pgvector and a supervised asynchronous queue worker for release certification

Docker is used to make the release host reproducible; customers do not have to deploy with Docker. ChromaDB and the documented provider/channel adapters remain available, but exact live certification is limited to the provider/model/profile rows and infrastructure named by the retained protected release evidence.

## Release evidence required before publication

Publication is blocked until the release contract is approved and the protected workflow has green evidence for the exact commit: locked Composer and npm dependency audits, platform requirements, source and exact-ZIP credential scans, dead-code gates, Pint, the full PHPUnit suite, PHPStan, workflow-editor `test:ci` plus a zero asset diff, the deterministic runtime release gate, calibrated multilingual retrieval plus real pgvector integration, the complete live provider profile matrix including Knowledge citation retention, restricted-capability rejection, the 1,000-iteration soak, byte-identical artifact rebuild, Laravel 12 and 13 exact-ZIP installs, the 0.16.1 upgrade and rollback/re-apply, synchronized public marketplace docs, and a clean Docker/PostgreSQL reference-host flow ending in a real chat and inspectable trace.

No unavailable credential, skipped external check, path install, or static checklist is counted as passing evidence.

## Known constraints

- Pre-1.0 minor releases may be breaking; patch releases within 0.17 are intended to remain compatible.
- AI provider behavior varies by exact model/account/region. Run saved quality tests with your production profile.
- PostgreSQL/pgvector is the certified persistence path; ChromaDB requires buyer staging.
- Strict CSP deployments must allow the widget script/API origin and the widget's current inline style behavior.
- `batchMap` is bounded to 100 items and the global workflow step budget.
- API knowledge sync intentionally does not provide universal OAuth refresh or delta-sync behavior.

See the buyer-visible [Known Limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md), [Compatibility Matrix](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md), and [Support Policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md) for the full boundaries.
