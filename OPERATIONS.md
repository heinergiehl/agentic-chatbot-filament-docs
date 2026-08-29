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

## Outbound Webhook Recovery

Signed outcome and handoff webhooks use a transactional outbox plus a durable
delivery ledger. The package registers this recovery command every minute:

```bash
php artisan filament-agentic-chatbot:maintain-outbound-webhooks --limit=500
```

It recovers un-fanned-out events, due retry rows, and expired worker leases, then
prunes only terminal ledgers older than `OUTBOUND_WEBHOOK_RETENTION_DAYS`. Preview
eligible work without dispatching or pruning:

```bash
php artisan filament-agentic-chatbot:maintain-outbound-webhooks --dry-run
```

Keep Scheduler and an asynchronous worker running. If a dedicated connection or
queue is configured, supervise it separately:

```env
OUTBOUND_WEBHOOK_QUEUE_CONNECTION=database
OUTBOUND_WEBHOOK_QUEUE=agentic-chatbot-webhooks
```

```bash
php artisan queue:work database --queue=agentic-chatbot-webhooks
```

Monitor old `pending`, `retry_scheduled`, and `delivering` rows and new
`dead_letter` rows. Resolve the receiver incident before an authorized operator
uses the reasoned manual retry in **Connect > Webhooks**. See [Outbound
Webhooks](OUTBOUND_WEBHOOKS.md).

## Quality Operations

The package registers two commands with Laravel Scheduler every five minutes:

```bash
php artisan filament-agentic-chatbot:run-due-quality-scenarios
php artisan filament-agentic-chatbot:collect-knowledge-gaps
```

The first atomically claims due, active **Published Agent** scenarios and queues each run once. A stale claim becomes eligible again after the configured lease window; a worker or dispatch failure clears the claim, records a bounded error code and failure count, and schedules another attempt. Playbook draft tests and archived scenarios cannot enable automation.

The second inspects already committed Chat Turns. It persists a gap only when durable operator evidence records `knowledge_searched=true` and `safe_capability_fallback`, the canonical answer has no sources, and the conversation is not an admin live test. Question excerpts and resolution notes are encrypted; occurrences remain immutable and deduplicated per Chat Turn. Existing history is intentionally not inferred or backfilled.

Production requires Laravel Scheduler and an asynchronous queue worker. Automated tests use the same Agent provider/model and credential resolution as a manual Published Agent quality run—an existing per-Agent key still takes precedence over the central provider key, and no quality-specific API key is stored.

```env
AGENTIC_CHATBOT_QUALITY_OPERATIONS_ENABLED=true
AGENTIC_CHATBOT_QUALITY_OPERATIONS_QUEUE_CONNECTION=database
AGENTIC_CHATBOT_QUALITY_OPERATIONS_QUEUE=agentic-chatbot-quality
AGENTIC_CHATBOT_QUALITY_OPERATIONS_DISPATCH_LIMIT=25
AGENTIC_CHATBOT_QUALITY_OPERATIONS_CLAIM_STALE_AFTER_MINUTES=30
AGENTIC_CHATBOT_KNOWLEDGE_GAP_DETECTION_ENABLED=true
AGENTIC_CHATBOT_KNOWLEDGE_GAP_LOOKBACK_DAYS=30
AGENTIC_CHATBOT_KNOWLEDGE_GAP_SCAN_LIMIT=500
```

Run the worker for a dedicated queue when configured:

```bash
php artisan queue:work database --queue=agentic-chatbot-quality
```

Operational probes are non-mutating with `--dry-run`:

```bash
php artisan filament-agentic-chatbot:run-due-quality-scenarios --dry-run
php artisan filament-agentic-chatbot:collect-knowledge-gaps --dry-run
```

See [Quality Operations](QUALITY_OPERATIONS.md) for the state, evidence, incident, and resolution contracts.

## Chat Attachment Retention

Chat files are stored separately from public assets and expire after
`AGENTIC_CHATBOT_ATTACHMENTS_RETENTION_DAYS` (default 30 days). The package
registers a daily `02:30` scheduler task:

```bash
php artisan filament-agentic-chatbot:prune-chat-attachments --limit=1000
```

Preview a retention run without deleting file content:

```bash
php artisan filament-agentic-chatbot:prune-chat-attachments --dry-run
```

Keep Laravel Scheduler running, monitor non-zero command failures, and verify
that `AGENTIC_CHATBOT_ATTACHMENTS_DISK` is private and writable on every worker.
The command is idempotent: it selects only expired `available` rows, removes the
private object, and then marks its bounded metadata `purged`. Conversation
privacy deletion uses the same storage service and fails closed when a file
cannot be removed.

### Channel Ingress Attachment Retention

When the staged Mailgun provider is explicitly enabled, it must persist
multipart uploads before its webhook can safely dispatch an asynchronous job.
Those temporary ingress objects use the same verified private disk but a
separate, short retention window controlled by
`AGENTIC_CHATBOT_ATTACHMENTS_CHANNEL_INGRESS_RETENTION_HOURS` (default 24
hours). Provider downloads for Telegram, Slack, and WhatsApp are resolved by the
worker and do not create ingress rows.

The package registers a daily `02:35` sweep:

```bash
php artisan filament-agentic-chatbot:prune-channel-inbound-attachments --limit=1000
```

Preview the selected rows without deleting content:

```bash
php artisan filament-agentic-chatbot:prune-channel-inbound-attachments --dry-run
```

The command selects only expired `staged` or `consumed` records. It removes the
private object before marking its bounded metadata `purged`, is idempotent, and
fails the run when storage still contains an object that could not be deleted.
Monitor that failure independently from normal chat-attachment retention.

For enabled-channel incidents, run **Connect > Channels > Diagnostics**. In addition to
Agent, token, webhook, provider, and queue readiness, diagnostics fails when a
channel accepts files while the global attachment runtime is disabled or the
configured disk is not a verified private writable disk. Re-run diagnostics
after changing a disk, worker identity, or public webhook hostname. Slack,
WhatsApp, and Mailgun diagnostics become available only after the corresponding
`AGENTIC_CHATBOT_CHANNELS_*_ENABLED` acceptance flag is deliberately enabled.

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

For conversational calls, preflight accounts for developer instructions,
retained history, the current message, tool schemas, and a conservative encoded
size bound for local attachments. Oldest history is pruned until the effective
input/context limit is met. Remote URL or provider-ID attachments whose token
footprint cannot be known fail closed. The provider-profile output maximum is
sent as the real per-round generation cap. Tool-enabled calls reserve the
verified worst-case context/output envelope for every permitted model step;
an unknown context window cannot start a multi-step call. This conservative
reservation is intentional: it keeps monthly token and cost limits hard even
when the provider performs several tool rounds internally.

Provider usage is normalized once into disjoint input, output, reasoning,
cache-read, and cache-write buckets. Dashboard and report token totals include
all five. If any settled call lacks pricing, aggregate cost is shown as
unpriced/unknown rather than as zero or a partial total.

The package registers this idempotent command with Laravel Scheduler every minute by default:

```bash
php artisan filament-agentic-chatbot:reconcile-ai-usage --limit=500
```

Keep both the scheduler and queue worker running. Per-call reconciliation retries are queued, while the scheduled sweep resolves expired reservations left by crashed processes. Disable package schedule registration only when the host runs an equivalent command centrally:

```env
AGENTIC_CHATBOT_USAGE_RECONCILIATION_SCHEDULE_ENABLED=false
```

Monitor `ai_usage_calls.status = reconciliation_required`, reconciliation event/log volume, and the age of `reserved` calls. Expiry is idempotent and releases only the still-reserved monthly aggregate; it does not invent provider usage.

## Human Review Retention

Human Review execution payloads and resumable state are encrypted at rest. The
package registers a daily `02:15` retention sweep that removes only terminal
reviews older than `ACTION_REVIEW_RETENTION_DAYS` (default 90 days):

```bash
php artisan filament-agentic-chatbot:prune-action-reviews --limit=1000
```

Pending, executing, and unknown/reconciliation-required reviews are never
removed by this sweep. Use `--dry-run` before a manual retention change; keep
Laravel Scheduler running so sensitive terminal payloads do not outlive the
configured window.

## Agent-First Runtime Constraint Upgrade

Run package migrations before enabling chat traffic after this upgrade. The
new constraint permits only one open Playbook (`running`, `halted`, or
`delayed`) per conversation. If historical data contains multiple open runs,
the migration stops before changing their state or dropping the previous
guard. Reconcile or cancel those runs through the AgentGraph-backed runtime,
then rerun the migration. Do not repair them with direct `workflow_runs` SQL;
that table is an operational projection, not the graph state authority.

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
AGENTIC_CHATBOT_WIDGET_CONTEXT_ENABLED=true
AGENTIC_CHATBOT_WIDGET_CONTEXT_TTL_MINUTES=10
AGENTIC_CHATBOT_WIDGET_CONTEXT_REFRESH_BEFORE_SECONDS=120
AGENTIC_CHATBOT_WIDGET_CONTEXT_REQUIRED_AREAS=
```

Browser embeds are tokenless at rest: the loader obtains an origin-bound token from `POST .../bootstrap`, keeps it in memory, renews it before expiry, and sends it in `X-filament-agentic-chatbot-Token`. It retries only safe reads after renewal. The separate anonymous conversation credential comes from `POST .../session` and never appears in a URL; production enforces this authority even if stale published config omits it. Keep query/body token compatibility disabled, configure explicit production Allowed Domains, and monitor bootstrap `429` responses separately from chat traffic.

Signed customer context is optional. Its key falls back to `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`; set `AGENTIC_CHATBOT_WIDGET_CONTEXT_SIGNING_KEY` only when independent rotation is operationally useful. Areas listed in `AGENTIC_CHATBOT_WIDGET_CONTEXT_REQUIRED_AREAS` fail closed when the context is missing, expired, origin-mismatched, or invalid. Never log the `X-Filament-Agentic-Chatbot-Context` header; the token is integrity-protected, not encrypted.

## Health Check

Run the built-in readiness command:

```bash
php artisan filament-agentic-chatbot:doctor
```

Treat `FAIL` as a release blocker.

For automated production setup, grant destructive authority explicitly and only to the step that needs it:

```bash
php artisan filament-agentic-chatbot:install --force-migrations
```

Add `--force-config` only when the deployment is intentionally replacing the host's published package config. The former ambiguous `--force` option is rejected before setup starts; it never overwrites config or authorizes migrations.

For faster in-panel checks during setup, use the **Setup Check** action on bot and source pages. It gives you a quick vector-backend and queue-readiness signal before you fall back to the full doctor command.

Supported vector backends today are `pgvector` and `chroma`. If the doctor output mentions Pinecone scaffolding, that path is not a supported production backend yet.

For pgvector, the host needs PHP `ext-pdo_pgsql` and a PostgreSQL database where the `vector` extension exists. If the app database user cannot create extensions during migrations, ask the database administrator or VPS provisioning script to run this once:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Production warnings are intentionally early and actionable. Review warnings for widget query/body token transport, active Agents without domain allowlists, APP_KEY fallback signing, missing or invalid Agent deployments, full Playbook trace capture, and encrypted bot credentials that cannot decrypt with the current `APP_KEY`.

### AgentGraph Interrupt Consistency

The doctor check `AgentGraph interrupt consistency` compares projected chatbot waitpoints with AgentGraph SDK pending interrupts. A warning means projection state and runtime state diverged: for example, a pending interaction has no SDK interrupt anymore, a confirmation is missing its AgentGraph identity, or a projection is already past `expires_at`.

First response:

```bash
php artisan filament-agentic-chatbot:doctor
```

Then reconcile the affected active conversations before allowing side effects. If a projection cannot be reconciled, active users should receive a safe clarification or already-handled message; the runtime must not execute a write operation from stale projection state.

### Durable Chat-Turn Reconciliation

The doctor check `Chat turn reconciliation` reports durable turn IDs whose result is `unknown` or whose active execution lease expired. These conversations remain locked intentionally: sending the same request with a new ID is not a safe substitute for reconciliation and could duplicate an external write.

Before unlocking a conversation, an operator must inspect the external provider, Playbook run, effect ledger, and application logs out of band. An expired lease alone does not prove that the original process stopped; verify that separately. Once the operator has established that the turn must be abandoned, run:

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

The doctor check `Side-effect reconciliation` reports write-ledger rows whose external outcome is `unknown`. Do not retry the Playbook Capability, connector, or action with a new identifier: a timeout or ambiguous provider response may have occurred after the remote system committed the write.

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

The command creates temporary QA Agents, Agent deployments, and Agent Access Tokens, then checks:

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

## Playbook Runtime Guardrails

- Enabled Playbook raw-HTTP capabilities require a non-empty `AGENTIC_CHATBOT_WORKFLOW_HTTP_REQUEST_ALLOWED_DOMAINS` list in every Laravel environment. Configure exact hosts or explicit wildcards such as `*.example.com`; local and testing environments grant no automatic network authority.
- `AGENTIC_CHATBOT_ALLOW_PRIVATE_REQUEST_URLS=false` blocks Playbook raw-HTTP capabilities, productive API Connector calls, OAuth token refresh, connector tests, and connector-backed API sources from targeting localhost, RFC1918, or other reserved/private destinations in every Laravel environment. Setting it to `true` enables those intentional internal targets; raw HTTP hosts must still match the separate raw HTTP domain allowlist. General URL-source ingestion remains governed by `AGENTIC_CHATBOT_ALLOW_PRIVATE_NETWORK_URLS`.
- `AGENTIC_CHATBOT_WORKFLOW_RUNNING_TIMEOUT_SECONDS` lets abandoned `running` Playbook executions be reclaimed so future conversations are not blocked forever.
- `AGENTIC_CHATBOT_WORKFLOW_DELAYED_TIMEOUT_SECONDS` lets abandoned `delayed` Playbook executions be reclaimed when a queued resume never arrives. It defaults to the running timeout when unset.
- `AGENTIC_CHATBOT_WORKFLOW_PENDING_RESOLVING_TIMEOUT_SECONDS` releases abandoned pending-interaction resolver claims when the AgentGraph interrupt still matches. This prevents stale `resolving` rows from blocking the next valid user answer.
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_CAPTURE_*`, `AGENTIC_CHATBOT_WORKFLOW_TRACE_MAX_STRING_LENGTH`, and `AGENTIC_CHATBOT_WORKFLOW_TRACE_REDACT_*` control how much trace data is stored and how sensitive values are scrubbed.

If all trace capture flags are left enabled in production, doctor reports a warning. That keeps this release compatible while making privacy review explicit.

Agent stream failures are mapped to safe `error` events and closed with `[DONE]`. JSON `/complete` failures use the same safe error mapper and roll back prepared Playbook runs. Treat repeated `chat_failed` errors as an operational signal: inspect Agent/Playbook evidence, server logs, provider credentials, and queue health rather than asking users to retry indefinitely.

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

Agent Access Tokens update `last_used_at` at most once per throttle window:

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
- Laravel Scheduler is supervised for automated Quality Lab runs and Knowledge Operations
- Quality automation uses an asynchronous supervised queue connection, not `sync`
- `AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true` with a strong signing key
- If `AGENTIC_CHATBOT_COMMERCIAL_MODE=true`, set `AGENTIC_CHATBOT_ANYSTACK_ID`, `AGENTIC_CHATBOT_DOCS_URL`, and `AGENTIC_CHATBOT_SUPPORT_EMAIL`
- Domain allowlist configured per bot
- Header-only widget token transport for public embeds
- Every active Agent has one hash-verified Agent deployment
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
- If a Playbook appears stuck: run `filament-agentic-chatbot:doctor`, inspect active `workflow_runs` and `bot_pending_interactions`, and verify the running/delayed/resolving timeout settings above.
- If retrieval quality drops: tune `top_k`, `min_similarity`, and source quality.

## Data Resources (`query_data_resource` and `mutate_data_resource`)

For Playbooks that use Data Resources:

- Define the required resources in **Agentic Chatbot > Connect > Data Resources**. Choose an Eloquent model, then select columns from the detected database table instead of typing column names by hand.
- Use config-backed resources only as install-time seeds or reviewed defaults. After migrations, **Sync from config** can create or update UI-managed resources when you intentionally want that.
- Restrict each bot to the minimum required resource keys and narrow fields per bot when needed.
- Add `field_metadata` for fields users may describe naturally, especially dates, numbers, prices, status enums, and names. This helps generated Playbooks map phrases like "newest", "top", "highest", "lowest", or "cheapest" to safe sort/filter fields.
- Keep direct Agent Data Resource tools read-only. For a Playbook write, explicitly enable only `insert` and/or `update`, require a server-resolved ownership scope, and select the minimum writable, required, and exact-identity fields. Updates also require an integer or date-time optimistic-lock column.
- Verify the confirmation text contains only policy-approved business fields. Confirm that stale versions, invalid values, multiple matches, replays, and cross-tenant targets fail closed and that the side-effect ledger records the exact result identity.
- Re-check permissions, migrations, and cache after changing global resources.
- Validate one real Playbook run against representative production data before go-live.
## Runtime Release Gate

Before shipping runtime changes, run:

```bash
composer assurance:runtime-release
```

The command blocks on Agent routing, evidence, write safety, pending Playbook
state, security, observability, model compatibility, release operations, or
operational-quality regressions. Its redacted JSON report is written to
`build/runtime-release-report.json` and contains aggregate test counts,
durations, named scenario results, quality thresholds, Wilson 95% intervals,
failed test identifiers, and exact rerun commands. It does not store PHPUnit
output, prompts, payloads, credentials, or model responses.

Protected tags additionally require the complete native structured-tools, prompt-JSON tools, and restricted/no-tools provider matrix, live provider evals for the two supported profiles, capability rejection for the restricted profile, PostgreSQL fresh-install/upgrade/rollback evidence, and the 1,000-iteration soak. See [Runtime Release Assurance](RELEASE_ASSURANCE.md) for the environment contract and release decision.

`filament-agentic-chatbot:doctor` reports removed runtime-mode and engine environment variables by name. Delete those variables; there is no replacement mode selector. Values are never printed. Doctor also reports an active Agent that lacks one verified Agent deployment and fails invalid deployment or Playbook pins.
