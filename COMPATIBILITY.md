# Compatibility and Certification Matrix

Target release: `0.17.3`. **Release status:** Approved. This matrix separates installable support from evidence produced for one exact release artifact.

## Framework and runtime

| Surface | Supported range | Protected release evidence |
| --- | --- | --- |
| PHP | `8.3+` | CI covers PHP 8.3 and 8.4; the protected artifact path uses PHP 8.4. |
| Laravel | Laravel `12.61.1+` or Laravel `13.12.0+` | The same byte-verified ZIP is installed into separate Laravel 12 and 13 hosts. |
| Filament | `5.7.6+` within Composer's resolved 5.x line | The minimum excludes the audited MFA and login vulnerabilities fixed in 5.7.6; package UI and assets are tested without requiring buyers to compile package source. |
| Laravel AI | `^0.11.2` | Shared multi-step tool loop with provider continuation state and package-owned accounting and authorization boundaries. |
| AgentGraph | `0.16.2` | Exact stable patch release installed transitively and used as the sole productive workflow-state authority. |
| HTTP stack | Guzzle `^7.15.2` / PSR-7 `^2.13` or Guzzle `^8.0.2` / PSR-7 `^3.0` | Security floors reject the audited vulnerable line; Laravel 13 can retain its native current major. |
| Database | PostgreSQL 16 + `pgvector` is the certified Golden Path | Fresh install, migration, upgrade, rollback, re-apply, and retrieval checks use real PostgreSQL/pgvector. |
| Alternative vector store | ChromaDB | Supported adapter; not part of the exact-artifact PostgreSQL certification and must be staged by the buyer. |
| Queue | Laravel database, Redis, or SQS-style asynchronous worker | A supervised asynchronous worker is required for production delays, ingestion, and background work. `sync` is not a production Golden Path. |

The Docker/PostgreSQL setup is a reproducible release-validation host, not a requirement that customers deploy with Docker. Buyers may install the package into any host that satisfies the supported Composer, Laravel, Filament, database/vector-store, queue, and extension contracts.

## AI providers

The product UI and Laravel AI integration expose Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, Azure OpenAI, and OpenAI-compatible chat gateways. Embedding adapters include Gemini, OpenAI, OpenRouter, Mistral, Ollama, Azure OpenAI, Cohere, Jina AI, and Voyage AI.

An available adapter is not automatically a release-certified provider/model pair. Live certification is artifact-scoped and exists only for the provider/model/profile rows named by the protected `WORKFLOW_TURN_EVAL_MATRIX` and its retained successful report. The source candidate does not claim live certification for credentials or profiles that were not run. Before production, run Doctor and saved quality tests with the exact provider, model, region, account policy, and structured-output/tool profile you will use.

## Browser widget and channels

- The public widget requires JavaScript, `fetch`, server-sent events, Web Crypto-capable browsers, a CSP that permits the configured script/API origin, and an exact Allowed Domains entry.
- Production embeds use tokenless bootstrap and short-lived header tokens; query/body token compatibility is disabled by default in production.
- Telegram is available by default; Slack and Mailtrap Email have completed real-provider acceptance as explicit opt-ins. WhatsApp Cloud API and Mailgun Email are built in but default-off and fail closed until their separate real-provider acceptance is complete. Any enabled channel still depends on buyer-owned provider credentials, webhook configuration, platform policy, private attachment storage, and a staging smoke test.

## What “certified” means

For a release to be called certified, all protected jobs must pass for the exact source commit and the exact ZIP hash: deterministic runtime gate, dependency audits, complete provider profile matrix, live evals, restricted-capability rejection, Laravel 12/13 PostgreSQL installs, supported upgrade, migration rollback/re-apply, 1,000-iteration soak, and the reference-host Golden Path. A skipped or unavailable external credential is reported as untested, never as passed.
