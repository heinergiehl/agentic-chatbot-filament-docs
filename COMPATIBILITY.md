# Compatibility and Certification Matrix

Target release: `0.17.0` (`candidate`). This matrix separates installable support from evidence produced for one exact release artifact.

## Framework and runtime

| Surface | Supported range | Release-candidate evidence |
| --- | --- | --- |
| PHP | `8.3+` | CI covers PHP 8.3 and 8.4; the protected artifact path uses PHP 8.4. |
| Laravel | Laravel `12.61.1+` or Laravel `13.12.0+` | The same byte-verified ZIP is installed into separate Laravel 12 and 13 hosts. |
| Filament | `5.2+` within Composer's resolved 5.x line | Package UI and assets are tested without requiring buyers to compile package source. |
| AgentGraph | `^0.15.1` | Installed transitively and used as the sole productive workflow-state authority. |
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
- Slack and Telegram drivers are package integrations, but end-to-end certification still depends on buyer-owned app credentials, webhook configuration, platform policy, and a staging smoke test.

## What “certified” means

For a release to be called certified, all protected jobs must pass for the exact source commit and the exact ZIP hash: deterministic runtime gate, dependency audits, complete provider profile matrix, live evals, restricted-capability rejection, Laravel 12/13 PostgreSQL installs, supported upgrade, migration rollback/re-apply, 1,000-iteration soak, and the reference-host Golden Path. A skipped or unavailable external credential is reported as untested, never as passed.
