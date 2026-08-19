# Filament Agentic Chatbot 0.17.0

**Release status:** Candidate<br>
**Target date:** 2026-08-19<br>
**Upgrade baseline:** 0.16.1<br>
**Previous-line security/critical EOL:** 2026-11-17

Version 0.17.0 is a breaking, security-focused runtime cutover. It is designed around one production path: every live bot routes through one immutable, hash-verified workflow deployment; AgentGraph owns workflow state; and every external capability call passes through the authorization, confirmation, idempotency, redaction, and reconciliation gateway.

Do not publish or install this candidate as a production release until `scripts/release/release-contract.json` is changed to `approved` in a reviewed commit and all protected release jobs pass for the exact commercial ZIP.

## What buyers gain

- A guided readiness flow from bot setup through workflow validation, publication, live activation, real-chat verification, and run/trace inspection.
- Tokenless browser snippets with origin-checked bootstrap, short-lived in-memory tokens, renewal before expiry, and a separate anonymous conversation credential.
- Durable turn idempotency and serialization, explicit unknown-outcome reconciliation, immutable deployment/capability pins, and bounded external-call handling.
- A safer editor: raw HTTP inspection is read-only (`GET`/`HEAD`), host-policy checked, DNS pinned, and response-size bounded; connector writes remain behind the productive execution gateway.
- Fail-closed sensitive Filament surfaces and a shared privacy lifecycle for conversation inspection, export, and deletion.
- Bounded ingestion downloads, secret-aware operational logging, and dependency constraints that exclude audited vulnerable Guzzle/PSR-7/CommonMark versions while supporting Laravel 13's native Guzzle 8/PSR-7 3 line.
- Exact commercial artifact evidence: deterministic ZIP, whole-file SHA-256, per-entry sidecar, embedded release manifest, and CycloneDX 1.6 production-dependency SBOM.

## Breaking runtime and authoring changes

- Direct Assistant, knowledge-only, compound top-level, and recursive-workflow escape paths are removed from production routing. A bot without one verified live deployment is blocked.
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
- Filament 5.2+
- AgentGraph ^0.15.1
- PostgreSQL 16 with pgvector and a supervised asynchronous queue worker for release certification

Docker is used to make the release host reproducible; customers do not have to deploy with Docker. ChromaDB and the documented provider/channel adapters remain available, but exact live certification is limited to the provider/model/profile rows and infrastructure named by the retained protected release evidence.

## Release evidence required before approval

The release is blocked until the exact candidate commit has green dependency audits, full tests/static analysis/formatting/editor CI, deterministic runtime release gate, complete live provider profile matrix, restricted-capability rejection, 1,000-iteration soak, byte-identical artifact rebuild, Laravel 12 and 13 exact-ZIP installs, 0.16.1 upgrade, rollback/re-apply, synchronized public marketplace docs, and a clean Docker/PostgreSQL reference-host flow ending in a real chat and inspectable trace.

No unavailable credential, skipped external check, path install, or static checklist is counted as passing evidence.

## Known constraints

- Pre-1.0 minor releases may be breaking; patch releases within 0.17 are intended to remain compatible.
- AI provider behavior varies by exact model/account/region. Run saved quality tests with your production profile.
- PostgreSQL/pgvector is the certified persistence path; ChromaDB requires buyer staging.
- Strict CSP deployments must allow the widget script/API origin and the widget's current inline style behavior.
- `batchMap` is bounded to 100 items and the global workflow step budget.
- API knowledge sync intentionally does not provide universal OAuth refresh or delta-sync behavior.

See the buyer-visible [Known Limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md), [Compatibility Matrix](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md), and [Support Policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md) for the full boundaries.
