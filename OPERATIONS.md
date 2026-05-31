# Operations Guide

## Queue Worker

Ingestion jobs run on Laravel queues.

```bash
php artisan queue:work
```

If using a dedicated ingestion queue:

```bash
php artisan queue:work database --queue=agentic-chatbot-ingestion
```

`pending` sources are expected while waiting for retries after provider rate limits.  
If pending items do not move for several minutes, verify worker health and provider quotas.

Source deletion also uses the queue when the backend needs an external vector delete call. Keep workers running after bulk deletes so `CleanupKnowledgeSourceVectorsJob` can remove Chroma vectors by collected chunk ID. The job is idempotent and safe to retry.

## Scheduled API Source Sync

API knowledge sources can be configured with **Auto Sync** and a sync interval in the source form. The plugin exposes a command that queues due API sources:

```bash
php artisan filament-agentic-chatbot:sync-knowledge-sources
```

Call it from Laravel's scheduler every minute or every few minutes:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('filament-agentic-chatbot:sync-knowledge-sources')->everyMinute();
```

Useful options:

```bash
php artisan filament-agentic-chatbot:sync-knowledge-sources --dry-run
php artisan filament-agentic-chatbot:sync-knowledge-sources --force
php artisan filament-agentic-chatbot:sync-knowledge-sources --source=123
php artisan filament-agentic-chatbot:sync-knowledge-sources --limit=25
```

The command only queues sources whose `next_sync_at` is due. It skips busy sources and inactive bots. Successful dispatch records `meta.api.sync.last_scheduled_at` and advances `meta.api.sync.next_sync_at`.

## Signed Widget Tokens

If enabled, all widget API requests require a valid signed token.

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true
AGENTIC_CHATBOT_WIDGET_SIGNING_KEY=your-long-random-secret
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
```

For browser embeds, prefer the `X-filament-agentic-chatbot-Token` header. Keep query/body token compatibility only during migration.

## Health Check

Run the built-in readiness command:

```bash
php artisan filament-agentic-chatbot:doctor
```

Treat `FAIL` as a release blocker.

For faster in-panel checks during setup, use the **Setup Check** action on bot and source pages. It gives you a quick vector-backend and queue-readiness signal before you fall back to the full doctor command.

Supported vector backends today are `pgvector` and `chroma`. If the doctor output mentions Pinecone scaffolding, that path is not a supported production backend yet.

Production warnings are intentionally early and actionable. Review warnings for widget query/body token transport, active bots without domain allowlists, APP_KEY fallback signing, multiple active workflows on one bot, full workflow trace capture, and encrypted bot credentials that cannot decrypt with the current `APP_KEY`.

## Enterprise Smoke Test

Run this after migrations when validating API integrations, scoped bot tokens, usage budgets, and OpenAI-compatible provider setup:

```bash
php artisan filament-agentic-chatbot:qa-enterprise-smoke --host=your-app.test
```

The command creates temporary QA bots, workflows, and Bot Access Tokens, then checks:

- JSON complete endpoint success through `Authorization: Bearer ...`
- area-scope rejection
- invalid-token rejection
- max input token budget blocking before provider execution
- OpenAI-compatible runtime alias creation and missing-base-URL failure

Temporary records are removed automatically. Add `--keep-records` only when you need to inspect the generated fixtures.

## Commercial Profile

If you run the plugin in commercial mode, set the profile metadata that the doctor command checks before launch:

```env
AGENTIC_CHATBOT_COMMERCIAL_MODE=true
AGENTIC_CHATBOT_ANYSTACK_ID=your-anystack-product-id
AGENTIC_CHATBOT_DOCS_URL=https://github.com/heinergiehl/agentic-chatbot-filament-docs
AGENTIC_CHATBOT_SUPPORT_EMAIL=webdevislife2021@gmail.com
```

Use a public documentation URL for `AGENTIC_CHATBOT_DOCS_URL`, not an internal admin route or a private repository link.

## Workflow Runtime Guardrails

- `AGENTIC_CHATBOT_ALLOW_PRIVATE_REQUEST_URLS=false` blocks workflow HTTP Request and API Connector nodes from targeting localhost, RFC1918, or other reserved/private destinations.
- `AGENTIC_CHATBOT_WORKFLOW_RUNNING_TIMEOUT_SECONDS` lets abandoned `running` workflow executions be reclaimed so future conversations are not blocked forever.
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_CAPTURE_*`, `AGENTIC_CHATBOT_WORKFLOW_TRACE_MAX_STRING_LENGTH`, and `AGENTIC_CHATBOT_WORKFLOW_TRACE_REDACT_*` control how much trace data is stored and how sensitive values are scrubbed.

If all trace capture flags are left enabled in production, doctor reports a warning. That keeps this release compatible while making privacy review explicit.

## Ingestion Fetch Limits

URL ingestion is bounded by:

```env
AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES=5242880
AGENTIC_CHATBOT_INGESTION_MAX_REDIRECTS=3
AGENTIC_CHATBOT_ALLOW_PRIVATE_NETWORK_URLS=false
```

Allowed content types live in `filament-agentic-chatbot.ingestion.allowed_content_types`. Keep JSON out of generic URL ingestion unless you intentionally need it for a curated source path; API knowledge sources remain the right integration point for authenticated JSON records.

## Runtime Write Pressure

Bot Access Tokens update `last_used_at` at most once per throttle window:

```env
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_LAST_USED_THROTTLE_MINUTES=5
```

Session and IP chat rate limits are configured independently with `AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE` and `AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE_PER_IP`.

## Go-Live Baseline

Before production launch:

- `AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector`
- If app DB is MySQL, set `AGENTIC_CHATBOT_DB_CONNECTION=agentic_chatbot_pgsql` and configure `AGENTIC_CHATBOT_DB_*` PostgreSQL env vars
- Queue worker process is supervised (systemd/Supervisor/Horizon)
- Laravel scheduler calls `filament-agentic-chatbot:sync-knowledge-sources` if API source auto sync is used
- `AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true` with a strong signing key
- If `AGENTIC_CHATBOT_COMMERCIAL_MODE=true`, set `AGENTIC_CHATBOT_ANYSTACK_ID`, `AGENTIC_CHATBOT_DOCS_URL`, and `AGENTIC_CHATBOT_SUPPORT_EMAIL`
- Domain allowlist configured per bot
- Header-only widget token transport for public embeds
- No workflow routing conflicts in the Workflows list
- Knowledge sources show completed chunks before public launch
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

- If ingestion fails: inspect `bot_knowledge_sources.meta.error`, retry ingestion from Sources table.
- If ingestion is pending: inspect `bot_knowledge_sources.meta.retry_after` and `bot_knowledge_sources.meta.retry_delay_seconds`.
- If API auto sync does not run: inspect `bot_knowledge_sources.meta.api.sync.next_sync_at`, run the sync command with `--dry-run`, and verify Laravel Scheduler is active.
- If you changed vector backend/model settings: use `Re-Ingest Bot Sources` (bot page) or `Re-Ingest All Sources` (sources list).
- If bot setup still feels unclear: use `Test Retrieval`, `Test Bot Answer`, and `Setup Check` before you debug deeper infrastructure.
- If chat rate-limited: reduce traffic burst and add retry backoff in clients.
- If retrieval quality drops: tune `top_k`, `min_similarity`, and source quality.

## Data Resources (query_data_resource)

For workflows that use `query_data_resource`:

- Register the required data resources in the host app configuration.
- Restrict each bot to the minimum required resource keys.
- Add `field_metadata` for fields users may describe naturally, especially dates, numbers, prices, status enums, and names. This helps generated workflows map phrases like "newest", "top", "highest", "lowest", or "cheapest" to safe sort/filter fields.
- Re-check permissions and config cache after publishing configuration changes.
- Validate one real workflow run against representative production data before go-live.
