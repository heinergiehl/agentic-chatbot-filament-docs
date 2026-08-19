# Operations Guide

## Queue Worker

Ingestion jobs run on Laravel queues.

```bash
php artisan queue:work
```

For production, use an async queue connection such as `database`, Redis, SQS, or Horizon. If you use Laravel's `database` queue driver, migrate the host app queue tables before starting the worker:

```bash
php artisan queue:table
php artisan queue:batches-table
php artisan migrate
```

If using a dedicated ingestion queue:

```bash
php artisan queue:work database --queue=agentic-chatbot-ingestion
```

`pending` sources are expected while waiting for retries after provider rate limits.  
If pending items do not move for several minutes, verify worker health and provider quotas.

Source deletion also uses the queue when the backend needs an external vector delete call. Keep workers running after bulk deletes so `CleanupKnowledgeSourceVectorsJob` can remove Chroma vectors by collected chunk ID. The job is idempotent and safe to retry.

## Conversation Memory Repair

Historical workflow-run episodes and work events are not backfilled by chat requests. Run the explicit idempotent repair command after importing legacy conversations or when an operator has verified that prepared memory projections are missing:

```bash
php artisan filament-agentic-chatbot:repair-conversation-memory --conversation=123
```

For a bounded bulk repair, provide an explicit limit:

```bash
php artisan filament-agentic-chatbot:repair-conversation-memory --limit=100
```

The command accepts a maximum limit of 500, inspects only conversations with terminal workflow runs in bulk mode, and reports created episode/work-event counts. When more candidates remain, it prints the exact `--after=<last-id> --limit=<same-limit>` continuation to process the next bounded page. Re-running a page is safe and creates no duplicates. It does not execute workflows, call models or connectors, retry writes, or change runtime authority.

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

## AI Usage Reconciliation

Every provider call creates an atomic `AiUsageCall` reservation before transport starts. Successful responses settle from provider-reported input, output, reasoning, and cache usage. A provider failure, missing usage, or settlement database failure remains visible as `reconciliation_required`; it is never silently released or replaced with an estimated actual value.

The package registers this idempotent command with Laravel Scheduler every minute by default:

```bash
php artisan filament-agentic-chatbot:reconcile-ai-usage --limit=500
```

Keep both the scheduler and queue worker running. Per-call reconciliation retries are queued, while the scheduled sweep resolves expired reservations left by crashed processes. Disable package schedule registration only when the host runs an equivalent command centrally:

```env
AGENTIC_CHATBOT_USAGE_RECONCILIATION_SCHEDULE_ENABLED=false
```

Monitor `ai_usage_calls.status = reconciliation_required`, reconciliation event/log volume, and the age of `reserved` calls. Expiry is idempotent and releases only the still-reserved monthly aggregate; it does not invent provider usage.

## Delayed Workflow Resume Recovery

Delayed workflow continuations use a durable delivery ledger in addition to the queue. The package registers this recovery sweep with Laravel Scheduler every minute:

```bash
php artisan filament-agentic-chatbot:reconcile-workflow-resume-deliveries --limit=500
```

Keep the scheduler and queue worker running. The sweep redispatches due scheduled deliveries, unknown outcomes, and expired claims. Workers inspect AgentGraph before retrying: an unchanged delay interrupt is safe to resume, while an advanced SDK run is recovered and projected without a second resume dispatch. Disable the package schedule only when the host invokes the same command centrally:

```env
AGENTIC_CHATBOT_WORKFLOW_RESUME_DELIVERY_RECONCILIATION_SCHEDULE_ENABLED=false
```

`AGENTIC_CHATBOT_WORKFLOW_RESUME_DELIVERY_LEASE_SECONDS` controls claim expiry and defaults to 300 seconds, with a 30-second minimum. Monitor old `scheduled`, `dispatching`, and `unknown` rows in `workflow_resume_deliveries`; persistent rows indicate queue, database, AgentGraph-store, or continuation-authority failures.

Automatic redispatch stops after `AGENTIC_CHATBOT_WORKFLOW_RESUME_DELIVERY_AUTOMATIC_ATTEMPT_LIMIT` attempts (default 10, minimum 3). A retryable safe failure releases the delivery only while another automatic attempt remains. At the limit, whether detected by the worker while it owns the lease or later by the sweeper, the delivery moves to `unknown`, its lease is cleared, and `meta.reconciliation_required` plus `last_error_code=delayed_workflow_resume_retry_exhausted` are recorded. A genuinely non-retryable failure may still become terminal `failed`. The AgentGraph-backed run is left for authoritative cancellation or reconciliation rather than being rewritten or retried forever.

After fixing the queue, database, or AgentGraph-store incident, an operator may authorize one further inspection/recovery cycle for an `unknown` delivery. This records the operator, reason, time, and previous attempt count in the delivery audit metadata:

```bash
php artisan filament-agentic-chatbot:reconcile-workflow-resume-deliveries \
    --delivery="<delivery-public-id>" \
    --operator="ops@example.com" \
    --reason="AgentGraph database connectivity restored and run identity verified."
```

The command refuses terminal or actively leased deliveries. The worker still inspects AgentGraph before deciding whether resume is safe; the operator command does not directly mutate workflow projection state.

## Signed Widget Tokens

If enabled, all widget API requests require a valid signed token.

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true
AGENTIC_CHATBOT_WIDGET_SIGNING_KEY=your-long-random-secret
AGENTIC_CHATBOT_WIDGET_SIGNING_TTL_MINUTES=10
AGENTIC_CHATBOT_WIDGET_SIGNING_REFRESH_BEFORE_SECONDS=120
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
AGENTIC_CHATBOT_WIDGET_CONVERSATION_CREDENTIAL_REQUIRED=true
```

Browser embeds are tokenless at rest: the loader obtains an origin-bound token from `POST .../bootstrap`, keeps it in memory, renews it before expiry, and sends it in `X-filament-agentic-chatbot-Token`. It retries only safe reads after renewal. The separate anonymous conversation credential comes from `POST .../session` and never appears in a URL; production enforces this authority even if stale published config omits it. Keep query/body token compatibility disabled, configure explicit production Allowed Domains, and monitor bootstrap `429` responses separately from chat traffic.

## Health Check

Run the built-in readiness command:

```bash
php artisan filament-agentic-chatbot:doctor
```

Treat `FAIL` as a release blocker.

For faster in-panel checks during setup, use the **Setup Check** action on bot and source pages. It gives you a quick vector-backend and queue-readiness signal before you fall back to the full doctor command.

Supported vector backends today are `pgvector` and `chroma`. If the doctor output mentions Pinecone scaffolding, that path is not a supported production backend yet.

For pgvector, the host needs PHP `ext-pdo_pgsql` and a PostgreSQL database where the `vector` extension exists. If the app database user cannot create extensions during migrations, ask the database administrator or VPS provisioning script to run this once:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Production warnings are intentionally early and actionable. Review warnings for widget query/body token transport, active bots without domain allowlists, APP_KEY fallback signing, multiple active workflows on one bot, full workflow trace capture, and encrypted bot credentials that cannot decrypt with the current `APP_KEY`.

### AgentGraph Interrupt Consistency

The doctor check `AgentGraph interrupt consistency` compares projected chatbot waitpoints with AgentGraph SDK pending interrupts. A warning means projection state and runtime state diverged: for example, a pending interaction has no SDK interrupt anymore, a confirmation is missing its AgentGraph identity, or a projection is already past `expires_at`.

First response:

```bash
php artisan filament-agentic-chatbot:doctor
```

Then reconcile the affected active conversations before allowing side effects. If a projection cannot be reconciled, active users should receive a safe clarification or already-handled message; the runtime must not execute a write operation from stale projection state.

### Durable Chat-Turn Reconciliation

The doctor check `Chat turn reconciliation` reports durable turn IDs whose result is `unknown` or whose active execution lease expired. These conversations remain locked intentionally: sending the same request with a new ID is not a safe substitute for reconciliation and could duplicate an external write.

Before unlocking a conversation, an operator must inspect the external provider, workflow run, effect ledger, and application logs out of band. An expired lease alone does not prove that the original process stopped; verify that separately. Once the operator has established that the turn must be abandoned, run:

```bash
php artisan filament-agentic-chatbot:reconcile-chat-turn 123 \
    --force \
    --operator="ops@example.com" \
    --reason="Checked provider request log and CRM audit; no remote record was created."
```

The command accepts only an `unknown` turn or an active turn whose lease has already expired. It refuses `completed`, `failed`, `cancelled`, `waiting`, and live active turns even with `--force`. It never calls the model, workflow, tool, connector, or side-effect retry path. Instead it marks the turn `cancelled`/abandoned, clears the conversation lock, and stores the reconciliation time, operator, reason, previous status, previous error code, and `execution_attempted=false` in the audit record.

Afterwards, run the doctor again and retain the command reason with the corresponding incident record:

```bash
php artisan filament-agentic-chatbot:doctor
```

Do not use direct SQL to clear `active_lock`; that bypasses status eligibility, message metadata synchronization, and the reconciliation audit.

### External Side-Effect Reconciliation

The doctor check `Side-effect reconciliation` reports write-ledger rows whose external outcome is `unknown`. Do not retry the workflow, connector, action, or authorized turn-plan item with a new identifier: a timeout or ambiguous provider response may have occurred after the remote system committed the write.

Inspect the provider audit log and the local workflow/connector trace out of band. Then record the verified result:

```bash
php artisan filament-agentic-chatbot:reconcile-side-effect 456 \
    --outcome=succeeded \
    --remote-id="provider-record-123" \
    --force \
    --operator="ops@example.com" \
    --reason="Verified the provider audit log and matched the idempotency key."
```

Use `--outcome=failed` only when the external system proves the write did not complete. The command accepts only `unknown` rows, requires an operator and reason, records an audit entry, clears the lease, and never invokes a workflow, model, tool, action, connector, or external retry.

When the write belongs to an `unknown` durable chat turn, reconciliation also requires the exact execution ID recorded by that turn and a definitive terminal AgentGraph state. The ledger result, workflow-run audit metadata, chat-turn outcome, and conversation unlock are then committed together. A verified success is recorded as `reconciled_but_unmaterializable`: the provider completed the write, but a terminal graph cannot safely consume an out-of-band reconstructed result. The customer receives a localized terminal explanation and no execution or graph resume is attempted. A foreign binding, active graph, or unavailable graph authority keeps the turn locked and reconciliation blocked.

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
- `AGENTIC_CHATBOT_WORKFLOW_DELAYED_TIMEOUT_SECONDS` lets abandoned `delayed` workflow executions be reclaimed when a queued resume never arrives. It defaults to the running timeout when unset.
- `AGENTIC_CHATBOT_WORKFLOW_PENDING_RESOLVING_TIMEOUT_SECONDS` releases abandoned pending-interaction resolver claims when the AgentGraph interrupt still matches. This prevents stale `resolving` rows from blocking the next valid user answer.
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_CAPTURE_*`, `AGENTIC_CHATBOT_WORKFLOW_TRACE_MAX_STRING_LENGTH`, and `AGENTIC_CHATBOT_WORKFLOW_TRACE_REDACT_*` control how much trace data is stored and how sensitive values are scrubbed.

If all trace capture flags are left enabled in production, doctor reports a warning. That keeps this release compatible while making privacy review explicit.

Workflow stream failures are mapped to safe `error` events and closed with `[DONE]`. JSON `/complete` failures use the same safe error mapper and roll back prepared runs. Treat repeated `chat_failed` errors as an operational signal: inspect workflow run details, server logs, provider credentials, and queue health rather than asking users to retry indefinitely.

## Ingestion Fetch Limits

URL ingestion is bounded by:

```env
AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES=5242880
AGENTIC_CHATBOT_INGESTION_MAX_REDIRECTS=3
AGENTIC_CHATBOT_ALLOW_PRIVATE_NETWORK_URLS=false
```

Allowed content types live in `filament-agentic-chatbot.ingestion.allowed_content_types`. Keep JSON out of generic URL ingestion unless you intentionally need it for a curated source path; API knowledge sources remain the right integration point for authenticated JSON records.

`AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` is one cumulative budget per URL redirect chain or paginated API-source fetch. The HTTP transport enforces it from declared headers and download progress, with a final body-size check before extraction or JSON decoding.

## Runtime Write Pressure

Bot Access Tokens update `last_used_at` at most once per throttle window:

```env
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_LAST_USED_THROTTLE_MINUTES=5
```

Session and IP chat rate limits are configured independently with `AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE` and `AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE_PER_IP`.

## Go-Live Baseline

Before production launch:

- Laravel host app is on `12.61.1+` or `13.12.0+`
- `AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector`
- PHP `ext-pdo_pgsql` is enabled and PostgreSQL has `CREATE EXTENSION vector`
- If app DB is MySQL, set `AGENTIC_CHATBOT_DB_CONNECTION=agentic_chatbot_pgsql` and configure `AGENTIC_CHATBOT_DB_*` PostgreSQL env vars
- Queue worker process is supervised (systemd/Supervisor/Horizon)
- Database queue installs have migrated `jobs`, `failed_jobs`, and `job_batches`
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
- If a workflow answer appears stuck: run `filament-agentic-chatbot:doctor`, inspect active `workflow_runs` and `bot_pending_interactions`, and verify the running/delayed/resolving timeout settings above.
- If retrieval quality drops: tune `top_k`, `min_similarity`, and source quality.

## Data Resources (query_data_resource)

For workflows that use `query_data_resource`:

- Define the required resources in **Agentic Chatbot > Connect > Data Resources**. Choose an Eloquent model, then select columns from the detected database table instead of typing column names by hand.
- Use config-backed resources only as install-time seeds or reviewed defaults. After migrations, **Sync from config** can create or update UI-managed resources when you intentionally want that.
- Restrict each bot to the minimum required resource keys and narrow fields per bot when needed.
- Add `field_metadata` for fields users may describe naturally, especially dates, numbers, prices, status enums, and names. This helps generated workflows map phrases like "newest", "top", "highest", "lowest", or "cheapest" to safe sort/filter fields.
- Re-check permissions, migrations, and cache after changing global resources.
- Validate one real workflow run against representative production data before go-live.
## Runtime Release Gate

Before shipping runtime changes, run:

```bash
composer assurance:runtime-release
```

The command blocks on routing, evidence/fidelity, write-safety, pending/turn-plan state, security, observability, model compatibility, release-operation, or operational-quality regressions. Its schema-v2 redacted JSON report is written to `build/runtime-release-report.json` and contains aggregate test counts, durations, 42 named scenario results, quality thresholds, Wilson 95% intervals, failed test identifiers, and exact rerun commands. It does not store PHPUnit output, prompts, payloads, credentials, or model responses.

Protected tags additionally require the complete native structured-tools, prompt-JSON tools, and restricted/no-tools provider matrix, live provider evals for the two supported profiles, capability rejection for the restricted profile, PostgreSQL fresh-install/upgrade/rollback evidence, and the 1,000-iteration soak. See [Runtime Release Assurance](RELEASE_ASSURANCE.md) for the environment contract and release decision.

`filament-agentic-chatbot:doctor` reports removed runtime-mode and engine environment variables by name. Delete those variables; there is no replacement mode selector. Values are never printed. Doctor also blocks a bot that lacks one verified live workflow deployment.
