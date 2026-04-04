# Operations Guide

## Queue Worker

Ingestion jobs run on Laravel queues.

```bash
php artisan queue:work
```

If using a dedicated ingestion queue:

```bash
php artisan queue:work database --queue=rag-ingestion
```

`pending` sources are expected while waiting for retries after provider rate limits.  
If pending items do not move for several minutes, verify worker health and provider quotas.

## Dev Bootstrap

For local onboarding, run:

```bash
php artisan filament-agentic-chatbot:dev-bootstrap
```

Useful flags:

- `--no-docker` (if services already run)
- `--services=pgsql,chroma` (start both services for backend switching tests)
- `--no-doctor` (skip readiness checks)

## Signed Widget Tokens

If enabled, all widget API requests require a valid signed token.

```env
RAG_WIDGET_SIGNING_ENABLED=true
RAG_WIDGET_SIGNING_KEY=your-long-random-secret
```

## Health Check

Run the built-in readiness command:

```bash
php artisan filament-agentic-chatbot:doctor
```

Treat `FAIL` as a release blocker.

## Go-Live Baseline

Before production launch:

- `RAG_VECTOR_BACKEND=pgvector`
- If app DB is MySQL, set `RAG_DB_CONNECTION=rag_pgsql` and configure `RAG_DB_*` PostgreSQL env vars
- Queue worker process is supervised (systemd/Supervisor/Horizon)
- `RAG_WIDGET_SIGNING_ENABLED=true` with a strong signing key
- Domain allowlist configured per bot
- At least one successful load test run against a production-like environment

## Load Test Baseline

Use a tool like k6 against chat endpoints. Start with:

- 10 virtual users
- 2-5 minutes duration
- realistic message payload size

Track:

- response latency (p50/p95)
- provider rate-limit responses
- queue backlog during ingestion

## Recovery Playbook

- If ingestion fails: inspect `rag_sources.meta.error`, retry ingestion from Sources table.
- If ingestion is pending: inspect `rag_sources.meta.retry_after` and `rag_sources.meta.retry_delay_seconds`.
- If you changed vector backend/model settings: use `Re-Ingest Bot Sources` (bot page) or `Re-Ingest All Sources` (sources list).
- If chat rate-limited: reduce traffic burst and add retry backoff in clients.
- If retrieval quality drops: tune `top_k`, `min_similarity`, and source quality.
