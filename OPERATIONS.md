# Operations Guide

This guide covers what a host must run and watch: queue workers, the
scheduler, the shared cache for streaming, retention, reconciliation and
recovery commands. Upgrade steps are in [UPGRADING](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md).

## Admin Navigation And Access

The plugin adds one navigation group, "Agentic Chatbot" by default, with five
top-level items:

- **Build**: Agents, Workflows, Sources. Safety settings and tests are part
  of the Agent editor.
- **Connect**: **Channels**, **Tools & data** (API connections, MCP servers and
  App data tools as three tabs of one entry) and **Developers** (Access tokens
  and Webhooks as two tabs). Opening Connect opens the first entry you may use;
  there is no landing page.
- **Inbox**: one count badge. **Handoffs** that wait for an operator (open,
  assigned or waiting for the operator) are always there. **Approvals**
  (formerly Action Reviews) and **Unverified actions** appear as tabs once
  they have something to decide or a history. Unverified actions are writes
  whose result could not be verified, newest first, until someone checks the
  provider and resolves them (see
  [Side-effect integrity](SIDE_EFFECT_INTEGRITY.md#unverified-actions)). A
  handoff row has one primary action, **Reply**, which opens a slide-over and
  claims an unassigned handoff when you send; **Claim**, **Resolve** and
  **View** are in the row menu.
- **Conversations**: Conversations, Submissions and Usage as tabs of one item.
- **Settings**: **General** (admin) holds the provider keys, the defaults for
  new Agents, the embedding profile and the website signing key. **Health**
  (any ability) shows what keeps the package from answering customers. For
  administrators, **Developer tool providers** lists the tool providers the
  host registered. See [Health Page And Doctor](#health-page-and-doctor).

An Agent, a Source or a conversation is also found by the panel's global search
(Agents and Sources by name, conversations by session ID). It lists only what
you may open and never searches message text.

To show the package on the panel's own dashboard, opt in on the plugin:
`FilamentAgenticChatbotPlugin::make()->dashboardWidgets()` adds a **Next step**
card (the single most important action) and the stats **Live Agents**, **Open
handoffs**, **Waiting approvals** and **Setup blockers**, each linking to the
list behind it. **Setup blockers** and a blocked-check **Next step** are
installation-wide, labelled so, and shown only to administrators
(`setup.diagnostics`). A host with a custom dashboard lists
`FilamentAgenticChatbotPlugin::overviewWidgets()` in its own page instead. Each
widget shows only what the signed-in user may open, and the plugin never
changes the dashboard unless you opt in.

Workflow runs have no list of their own. Open a Workflow's **Runs** action or
the conversation page; each row opens the run inspector. The plugin class sets
the group, order, labels, icons and shown sections; see
[Public API](PUBLIC_API.md#filament-plugin).

Every signed-in panel user sees **Conversations**. Reading them needs
`filament-agentic-chatbot.operate` in the abilities mode, or the
`filament-agentic-chatbot.view-bot-conversations` and
`filament-agentic-chatbot.manage-bot-conversations` Gates in the `strict` mode,
in every environment. When a grant or Gate denies a user, the list shows
"No access to conversations" instead of records and a record URL answers 403
with the same text. A record-aware Gate needs an `AdminAuthorizationQueryScope`
binding so the list stays limited to the user's records.

Conversation rows show the visitor's first message, redacted before display.
When no message is available, the title describes how the conversation started.
The **Outcome** badge gives an active **Handoff** precedence, then shows
**Confirmation pending** for an unexpired pending direct-write card or Workflow
approval. Reading the badge never decides or expires a card. The latest failed,
uncertain or technically degraded turn shows **Error**, including a completed
safe fallback after an empty response or provider failure. **Answered** requires
a nonempty completed assistant reply without that failure evidence. Other
conversations show **In progress**. Answered does not claim that the visitor's
problem was resolved. A historical error does not override a later normal reply.
The conversation view uses an Infolist for metadata and keeps the transcript,
flags and authorized operator actions. Relative times have absolute tooltips.

**Submissions** stays a tab of **Conversations** and links an empty list to
Workflows for users who may view them. Under **Usage**, **All calls** and
**Model prices** are tabs. The missing-usage count links to the same scoped,
month-to-date visitor calls used by that count. Inspect the call's receipt
status and reconciliation guidance before acting; opening the link never
replays a provider request. See [AI usage accounting](AI_USAGE_ACCOUNTING.md).
The Conversations, Submissions and Usage tables offer larger native page sizes
when the scoped, filtered list exceeds its smallest page size. A list that fits
that size hides the selector. Model prices use the same behavior starting at
25 rows; search and filters apply before pagination.

Agents follow the same rule with `filament-agentic-chatbot.view-bots` and
`filament-agentic-chatbot.manage-bots`. A user with only the view Gate opens
an Agent in a read-only view; every change needs the manage Gate (see
[Agents](BOTS.md#read-only-view)).

## Settings Page

**Settings**, the last entry of the plugin group, holds the installation-wide
settings (W2.2):

- **AI providers**: the providers your Agents use, one row each: the chat
  provider of every Agent (its Draft and its published Version, so a live
  provider stays listed when a Draft changes), the embedding provider when an
  Agent has Sources, the defaults for new Agents and any provider with a stored
  key or `.env` key. The **Key** badge states the effective key source:
  **Settings** or **.env**, **Agent key** when only Agents have keys, or
  **Missing** with the Agents that lack a key and an **Add key** action. When
  Settings or `.env` has a key and some Agents use their own, the badge says so,
  for example "Settings (1 Agent uses its own key)". A key is resolved per
  provider and purpose (chat or embeddings) in this order: the Agent's own key,
  the key stored here, the `.env`/config key. The Health checks and the Agent
  checklist read the same resolver. Source ingestion has no Agent and needs the
  app-wide key; the Setup embedding check and the row say when only an Agent key
  exists (retrieval by that Agent works, ingestion does not). **Add provider**
  (a slide-over) adds any other provider of the catalog, **Edit** replaces a key
  (shown as the last four characters only) and keeps the base URL under
  **Advanced** (first for Ollama and OpenAI-compatible endpoints). **Remove key**
  asks for confirmation and says that Agents using the key fall back to the
  `.env` key or stop answering. Published Versions keep their pinned provider
  and base URL; a changed key applies to the next call. The page refuses to
  remove a stored key while live Versions or ingestion still rely on it and
  `.env` has no replacement; store the new key instead. Stored keys reach Agent
  replies, tests, Topic Scope checks, the Workflow generator, ingestion and
  retrieval embeddings, and Workflow AI steps on the Agent's own provider.
  Retrieval reranking, image generation, provider failover lists and Workflow AI
  steps that name another provider still read only the `.env`/config keys.
- **Test connection**: reads the provider's model list (OpenRouter: its key
  info), never a model call, so it costs nothing. It tests the app-wide key
  (Settings, then `.env`) and the notification names which key it used; keys of
  single Agents are not tested. The slide-over also tests a key you typed
  without saving it. Every request goes through the outbound destination guard
  (no private networks, no numeric IP aliases such as `2130706433`, DNS pinned,
  no redirects, HTTPS when a key is sent). A key goes only to the provider's
  official host or to the base URL already saved for that provider. An unsaved
  base URL is tested only together with a key you typed, never with the stored
  key. Ollama and OpenAI-compatible endpoints may be private, as their real calls
  are, but only at the saved base URL; an unsaved private address is refused.
  Only the time, the result category (works, key rejected, not reachable, error)
  and a keyed fingerprint of the tested endpoint and key are stored, never a key
  or a provider message. The result disappears when the base URL, the key or the
  effective key source changes. The provider's own error text is never read,
  shown or stored, because providers can echo credentials; the notification
  shows a translated reason (key rejected, address not found, no answer in time,
  not reachable, address not allowed, unexpected response) and the HTTP status.
  A saved base URL may carry credentials in its query string; the Edit
  slide-over shows it without the query string, says that query parameters are
  kept, and keeps them on save unless you replace the URL. Providers without a key-checking
  metadata endpoint (Azure OpenAI, Jina AI, Voyage AI) have no test. It needs the
  same admin ability as the page.
- **Defaults for new Agents**: the chat provider and model preselected in the
  create wizard. Existing Agents keep their own. The **Save defaults** button
  appears once a value differs from the saved one.
- **Embeddings**: one embedding profile (provider, model, dimensions) for all
  Sources, shown with the key source. No Agent pays for a Source.
- **Website signing key**: a status badge (**Generated here**, **Configured
  (.env)**, **Using the app key**, **Missing**), the environment variable name
  to copy, and a confirmed **Generate** or **Rotate** action that explains
  which tokens stop working (see "Signed Widget Tokens").
The page needs `filament-agentic-chatbot.admin` from a grant that does not take
a record (`strict` mode: the class-wide Gate
`filament-agentic-chatbot.manage-settings`). Every change records the panel
user in `agentic_settings.updated_by_type` and `updated_by_id`.

**Changing the embedding profile.** **Change embedding profile** previews the
Sources whose active index uses another embedding identity, the live Agents
that pin them and the estimated embedding requests. It refuses without an
app-wide key for the new provider, while a rebuild is running, without queue
batch tracking, and on pgvector or Chroma when the dimensions differ from the
stored ones. Saving stores the profile and queues one rebuild batch for exactly
those Sources; when the batch cannot be queued, the previous profile is
restored. Follow or cancel it under **Rebuild Progress**. Live Agents keep
answering from the generations their Version pins; a failed or cancelled
rebuild keeps the previous complete generation active. Publish the Agents
after their Sources are rebuilt; until then a publish refuses Sources that are
not indexed with the current profile. Running the same change again queues the
Sources that still use another profile.

## Queue Worker

Widget chat turns, ingestion, channel messages, Workflow delays and webhook
deliveries run on Laravel queues. Chat turns use the `agentic-chat` queue
(`AGENTIC_CHATBOT_CHAT_QUEUE`) on the host's default connection
(`AGENTIC_CHATBOT_CHAT_QUEUE_CONNECTION`):

```bash
php artisan queue:work --queue=agentic-chat,default --timeout=150 --tries=1
```

Set the queue connection's `retry_after` above the chat job timeout (360
seconds for the default 120-second chat execution limit). A `sync` queue cannot
stream widget chat.

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

## Durable API connection completion

Long-running API tools use the existing AgentGraph delay/resume
queue. Keep a supervised worker on the host's default queue and an additional
worker on the completion-notification queue when webhooks are enabled:

```bash
php artisan queue:work database --queue=default
php artisan queue:work database --queue=connector-completions
```

Replace connection/queue names with the effective host configuration. Supported
persistent drivers are `database`, `redis`, `sqs`, and `beanstalkd`; `sync`,
`null`, `deferred`, and in-process/background-only drivers cannot provide durable
completion. Queue tables belong to the queue connection, which may differ from
the package's PostgreSQL connection. Configure worker timeouts and retry/visibility
windows to exceed the permitted status-request duration.

```env
CONNECTOR_COMPLETION_WEBHOOKS_ENABLED=true
CONNECTOR_COMPLETION_QUEUE_CONNECTION=database
CONNECTOR_COMPLETION_QUEUE=connector-completions
```

Keep Laravel Scheduler running. The package registers inbox recovery every
minute; the command can also be invoked directly:

```bash
php artisan filament-agentic-chatbot:maintain-connector-completions --limit=500
php artisan filament-agentic-chatbot:doctor
```

Doctor checks schema, persistent queue configuration, immutable completion
contracts, registered signature verifiers, referenced encrypted credentials,
and overdue work. Passing Doctor does not prove worker health or provider
callback delivery. Monitor queued/failed jobs, old pending completion events,
overdue continuations and unknown side effects. Use a stable public HTTPS
`APP_URL`, synchronize clocks, and retain the encryption key on every worker.

Restart workers after deploying new code/configuration. Do not delete an active
job or retry an uncertain write to make the queue look healthy. Local Workflow
cancellation does not establish remote cancellation; verify the external
outcome and use the existing operator reconciliation action. See
[Durable API connections](DURABLE_CONNECTORS.md).

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

## Knowledge Gaps

The package registers one command with Laravel Scheduler every five minutes:

```bash
php artisan filament-agentic-chatbot:collect-knowledge-gaps
```

It inspects already committed Chat Turns. It persists a gap only when durable
runtime evidence records `knowledge_searched=true` with an empty or
insufficient retrieval result, the canonical answer has no sources, and the
conversation is not an admin live test. Question excerpts and resolution notes
are encrypted; occurrences remain immutable and deduplicated per Chat Turn.
Existing history is intentionally not inferred or backfilled.

Gaps appear in the Agent's **Analytics** page under **Knowledge**, with counts
and redacted examples. **Add answer** writes to that Agent's owned Text Source.
The publication badge distinguishes **Answer drafted**, **Indexing**, **Publish
needed** and **Available to Agent**. New Sources require Publish; existing Live
current-mode Sources receive completed refreshes automatically. Availability is
checked against the verified Live binding with stored vectors and no AI calls;
failed indexing and failed probes keep the gap open. This scheduled command also
retries interrupted availability checks. Deleting the evidence Source reopens
the gap. See [Gap answers](KNOWLEDGE_SOURCES.md#gap-answers). An operator can also
create an Agent test from the question.

```env
AGENTIC_CHATBOT_KNOWLEDGE_GAP_DETECTION_ENABLED=true
AGENTIC_CHATBOT_KNOWLEDGE_GAP_LOOKBACK_DAYS=30
AGENTIC_CHATBOT_KNOWLEDGE_GAP_SCAN_LIMIT=500
```

The probe is non-mutating with `--dry-run`:

```bash
php artisan filament-agentic-chatbot:collect-knowledge-gaps --dry-run
```

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

When a staged email provider is explicitly enabled, Mailtrap downloads and
Mailgun multipart uploads must be persisted before their webhooks can safely
dispatch an asynchronous job. Those temporary ingress objects use the same
verified private disk but a separate, short retention window controlled by
`AGENTIC_CHATBOT_ATTACHMENTS_CHANNEL_INGRESS_RETENTION_HOURS` (default 24
hours). Provider downloads for Telegram and Slack are resolved by the
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
Mailtrap, and Mailgun diagnostics become available only after the corresponding
`AGENTIC_CHATBOT_CHANNELS_*_ENABLED` acceptance flag is deliberately enabled.

## Scheduled Knowledge Re-Sync

URL and API knowledge sources have a **Re-sync** setting: never, daily or
weekly. The package registers
`filament-agentic-chatbot:sync-knowledge-sources --limit=50` with the Laravel
scheduler every 15 minutes (on one server, without overlap). The host must run
the scheduler, for example with this cron entry:

```bash
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

Set `AGENTIC_CHATBOT_KNOWLEDGE_SOURCE_SYNC_SCHEDULE_ENABLED=false` to remove the
registration and call the command yourself. Useful options:

```bash
php artisan filament-agentic-chatbot:sync-knowledge-sources --dry-run
php artisan filament-agentic-chatbot:sync-knowledge-sources --force
php artisan filament-agentic-chatbot:sync-knowledge-sources --source=123
php artisan filament-agentic-chatbot:sync-knowledge-sources --limit=25
```

The command queues sources whose `next_sync_at` is due. It skips sources that
are already queued or processing and sources no active Agent uses. A queued
run fetches the source again through the same safe fetcher and size limits,
compares the content hash with the active generation and builds a new
generation only when the content changed; an unchanged run makes no embedding
calls. The previous generation stays active until the new one is ready.

A success sets `last_synced_at`, clears `sync_failures` and plans the next run
one interval later. A failure keeps the active generation, shows the source as
failed with its error, increments `sync_failures` and retries after 15 minutes,
1 hour, 4 hours and then every 12 hours (never later than the interval). A
live version with current knowledge reads the new generation once it is ready;
a version with published (frozen) knowledge keeps reading the generation pinned
in its deployment, and the Agent editor shows the new generation as a draft
change until the Agent is published (ADR 0046). Revoked sources are skipped.

`filament-agentic-chatbot:prune-knowledge-generations --limit=200` runs daily
at 02:50 and archives superseded generations that no source, frozen version,
Workflow deployment or live current version needs after
`AGENTIC_CHATBOT_KNOWLEDGE_GENERATION_RETENTION_DAYS` (default 30, minimum 1).
Set `AGENTIC_CHATBOT_KNOWLEDGE_GENERATION_RETENTION_SCHEDULE_ENABLED=false` to
run it yourself; `--dry-run` lists what it would archive.

## AI Usage Reconciliation

Every provider call creates an atomic `AiUsageCall` reservation before transport starts. Successful responses settle from provider-reported input, output, reasoning, and cache usage. A provider failure, missing usage, or settlement database failure remains visible as `reconciliation_required`; it is never silently released or replaced with an estimated actual value.

For conversational calls, preflight accounts for developer instructions,
retained history, the current message, tool schemas, and a conservative encoded
size bound for local attachments. Oldest history is pruned until the effective
input/context limit is met. Internal Workflow messages are filtered before the
configured public history limit, and pruning removes oldest complete visible
user/assistant turns rather than leaving an orphaned half-turn. The database
scan remains bounded even when a conversation contains many internal messages.
Remote URL or provider-ID attachments whose token footprint cannot be known
fail closed. The provider-profile output maximum is sent as the real per-round
generation cap. Synchronous package agents check and reserve each native SDK
model request, including its growing tool-result history, and settle that step
before executing tools. `meta.invocation_id` and `meta.model_step` correlate those
usage rows without recording the aggregate response twice. Rejected follow-up
requests preserve completed usage and create no new reservation. Native SDK
streams retain the verified worst-case context/output reservation for the whole
permitted loop; an unknown context window cannot start such a multi-step stream.
Both paths apply monthly reservation checks and conservative input admission.

Provider usage is normalized once into disjoint input, output, reasoning,
cache-read, and cache-write buckets. Dashboard and report token totals include
all five. A complete total requires every call in the selected scope to have
verified usage and a compatible price. Pending, failed and reconciliation-required
calls remain in that scope. The interface labels known subtotals as incomplete,
shows how many calls lack data, and never uses reserved or estimated tokens as
actual consumption. An explicitly reported zero is distinct from missing usage.

Native synchronous and supported streaming receipts are checked before the
SDK's zero-default usage DTO can turn missing counters into apparent zero usage.
Both paths reserve and settle each model step through the same owner. An
unsupported streaming protocol or incomplete terminal receipt remains unknown.
A partial positive counter is not proof of a complete receipt. This also applies to zero-token embedding responses
whose SDK DTO cannot distinguish a provider-reported zero from missing metadata.
Normal chat calls with later SSE rendering use synchronous provider receipts.

### Configured token costs and provider bills

Each reservation stores the selected provider/model tariff, version, effective
date, currency, unit scale and integrity hash in `meta.pricing_snapshot`.
Settlement verifies and uses this snapshot instead of looking up a mutable
configuration entry again. A changed provider/model, missing snapshot, invalid
snapshot or used category without a price leaves cost unknown while preserving
the available token receipt. A display-currency change does not convert or
relabel old money. Historical amounts without a verifiable snapshot remain
stored but are not included in current-currency totals.

Rates are non-negative integers in micro-minor-units per million tokens. Flat
standard-text tariffs require input and output rates, including an explicit zero
for a free category. V2 variants bind operation, service tier, prompt-size bands,
modalities and cache lifetimes. Every used or reserved category needs a rate.
Arithmetic uses checked
integers and rounds each call upward to the next micro-minor-unit after adding
all token categories; it does not round each category to a cent. For USD with
100 minor units per unit, a micro-minor-unit is USD 0.00000001. This is the
package's calculation rule, not an assertion about a provider's invoice rounding.
Hard cost reservations additionally require a known upper bound for all possible
categories. Unknown or incompatible costs in the current monthly authority scope
block new cost-budgeted calls, even after reservation expiry.

The package's Gemini GenerateContent gateway does not create a cache and reports
no cache-write token bucket. Its prompt reservation therefore excludes cache
creation without assigning it a fictional zero price. Explicit cache-write
reservations or receipts still need their own price. This exception is a gateway
contract, not a caller-controlled context option. Other providers retain the
conservative requirement for every possible category.

The budget check compares the locked monthly counters with recorded call sums
and rejects unmatched historical amounts. Database aggregates and distinct
tariff bindings keep this check from hydrating every monthly call for each new
model step. Bot and access-token reports also flag historical period counters
that lack receipts; they cannot infer how many calls are missing or assign them
to a day. Global usage cards explicitly describe recorded calls within their
existing permission scope.

The UI's calculated token cost means the configured tariff applied to recorded
plugin calls. The provider invoice can differ because of tariff changes,
service tiers, credits, taxes, storage or provider-hosted tool charges. V2 token
tariffs can cover explicit tiers, modality rates and cache lifetimes; observed
uncovered fees keep the cost unknown. Use an explicit compatible rate or leave
the amount unknown; do not advertise
the displayed amount as a reconciled provider bill.

Provider billing reconciliation is a separate, currently unimplemented
integration. OpenAI's [Costs API](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/usage/methods/costs)
supports project and API-key grouping with administrative credentials.
Anthropic's [Usage and Cost API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)
also requires administrative access; cost grouping and service-tier coverage
differ from its token-usage endpoint. A shared API key does not identify which
application caused an aggregate charge. A dedicated provider project/workspace
and key make a future reconciliation more useful. Provider account totals must
never replace plugin-attributed call totals without a matching scope.

### Reconciliation operation

The package registers this idempotent command with Laravel Scheduler every minute by default:

```bash
php artisan filament-agentic-chatbot:reconcile-ai-usage --limit=500
```

Keep both the scheduler and queue worker running. Per-call reconciliation retries are queued, while the scheduled sweep resolves expired reservations left by crashed processes. Disable package schedule registration only when the host runs an equivalent command centrally:

```env
AGENTIC_CHATBOT_USAGE_RECONCILIATION_SCHEDULE_ENABLED=false
```

Monitor `reconciliation_required`, `awaiting_evidence`, reconciliation event/log
volume, and the age of `reserved` calls. Expiry without a complete receipt is
idempotent and retains the monthly reservation until evidence arrives. Legacy
failed calls whose reservations were released can still be reconciled.

Trusted CLI operators can preview a bounded per-request receipt with
`--call=<public-uuid> --evidence=<local-json-path>` and apply that reviewed version
with the required operator, reason and force options. The same transaction owns
settlement, unique provider receipt claims and the encrypted audit. It never
re-executes a model request or a tool. See [AI usage accounting](AI_USAGE_ACCOUNTING.md)
for the receipt schema, pricing variants and complete operating procedure.

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
new constraint permits only one open Workflow (`running`, `halted`, or
`delayed`) per conversation. If historical data contains multiple open runs,
the migration stops before changing their state or dropping the previous
guard. Reconcile or cancel those runs through the AgentGraph-backed runtime,
then rerun the migration. Do not repair them with direct `workflow_runs` SQL;
that table is an operational projection, not the graph state authority.

For a stale or divergent projection, first create and archive the signed,
read-only inventory, verify it, and only then apply an authorized repair:

```bash
php artisan agentic-chatbot:agent-graph-projection-dry-run --actor=<operator> --output=<report.json>
php artisan agentic-chatbot:agent-graph-projection-dry-run --verify=<report.json>
php artisan agentic-chatbot:agent-graph-projection-repair <report.json> --actor=<operator>
```

Use the optional `--workflow-run` selector to narrow repair scope. The repair
command accepts only rows classified and signed as repair-eligible; there is no
supported `WorkflowRun::markStale()` or direct status-update fallback.

## Delayed Workflow Resume Recovery

Delayed workflow continuations use a durable delivery ledger in addition to the queue. The package registers this recovery sweep with Laravel Scheduler every minute:

```bash
php artisan filament-agentic-chatbot:reconcile-workflow-resume-deliveries --limit=500
```

Keep the scheduler and queue worker running. The sweep redispatches due scheduled deliveries, unverified actions, and expired claims. Workers inspect AgentGraph before retrying: an unchanged delay interrupt is safe to resume, while an advanced SDK run is recovered and projected without a second resume dispatch. Disable the package schedule only when the host invokes the same command centrally:

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

Browser embeds are tokenless at rest: the loader obtains an origin-bound token from `POST .../bootstrap`, keeps it in memory, renews it before expiry, and sends it in `X-filament-agentic-chatbot-Token`. It retries only safe reads after renewal. The separate anonymous conversation credential comes from `POST .../session` and never appears in a URL; production enforces this authority even if stale published config omits it. Keep query/body token compatibility disabled, configure explicit production Allowed hosts, and monitor bootstrap `429` responses separately from chat traffic.

The signing key resolves as: the key generated on the Settings page, then
`AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`, then `APP_KEY` (Doctor warns about the
`APP_KEY` fallback). **Rotate signing key** replaces the generated key at once:
tokens signed with the previous key stop validating and open widgets fetch new
ones after a page reload.

Signed customer context is optional. Its key falls back to the website signing key above; set `AGENTIC_CHATBOT_WIDGET_CONTEXT_SIGNING_KEY` only when independent rotation is operationally useful. Areas listed in `AGENTIC_CHATBOT_WIDGET_CONTEXT_REQUIRED_AREAS` fail closed when the context is missing, expired, origin-mismatched, or invalid. Never log the `X-Filament-Agentic-Chatbot-Context` header; the token is integrity-protected, not encrypted.

## Knowledge source file storage

File sources use `filament-agentic-chatbot.knowledge_sources.uploads.disk`,
`.visibility`, and `.directory`. Defaults are `local`, `private`, and
`filament-agentic-chatbot/knowledge-sources`; missing keys in older published
configurations inherit these defaults. Explicit invalid values remain errors.
The host must configure the selected disk and keep its upload directory out of
public storage links and public URL handlers.

The Doctor check `Knowledge source uploads` reports an invalid disk, visibility,
or directory as `FAIL` with the configuration repair path. It does not create a
test file or certify write permissions. After a storage change, rebuild the
configuration cache and verify a file upload and ingestion with the application
and worker identities used in production. Existing owned files remain tied to
their recorded disk and path; changing configuration does not relocate them.

The source form displays setup guidance when File Upload is selected and the
configuration is invalid. File submission stays blocked until repaired; Manual
Text, URL, and API Source remain usable. Pre-1.0 public files require the explicit
`filament-agentic-chatbot:migrate-knowledge-source-files` dry run and reviewed
`--execute` cutover described in [UPGRADING.md](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#0200-private-knowledge-source-uploads).

## Health Page And Doctor

**Agentic Chatbot > Settings > Health** (formerly **Setup**; the page keeps its
URL `/agentic-chatbot-setup`) and `php artisan filament-agentic-chatbot:doctor`
render one registry of checks (`Support\Setup\SetupCheckRegistry`). A check
exists once, in a class that implements the internal `SetupCheck` interface
(`key()`, `group()`, `run()`), so both show the same pass, warning or failure
for the same environment. The Doctor keeps its table and exit codes: any `FAIL`
exits with 1, warnings exit with 0. After the table it prints one fix line per
warning or failure and, where one exists, a command to copy. The Health page
shows problems first: a **Needs attention** section with one section per
warning or failure, each with a status badge, the fix line, one **Fix in …**
button to the page that owns the setting (when you may open it), the command in
a copy field and, for admins, the details. All passing checks sit together in
one collapsed **n checks passed** section.

| Group | Meaning | Checks |
| --- | --- | --- |
| Required to answer customers (`required`) | Without these the package cannot answer, or cannot show that it can | `configuration_cutover` (Configuration cutover), `vector_backend` (Vector backend), `package_storage` (Package storage), `chat_provider` (Chat provider/model), `capability_providers` (Capability provider contracts), `heartbeat` (Scheduler and chat queue heartbeat), `package_schema_placement` (Package schema placement), `agent_graph_sdk_surface` (AgentGraph SDK surface), `agent_graph_runtime_schema` (AgentGraph runtime schema), `workflow_runtime_schema` (Playbook runtime schema), `active_deployment_contract_freshness` (Active deployment contract freshness) |
| Recommended (`recommended`) | Operations, reconciliation and knowledge | `model_capabilities` (Model capabilities), `embedding_provider` (Embedding provider/model), `agent_credential_decryption` (Agent credential decryption), `vector_dimensions` (Vector dimensions), `vector_index_strategy` (Vector index strategy), `queue_connection` (Queue connection), `queue_worker` (Queue worker), `knowledge_gaps` (Knowledge gaps), `outbound_webhooks` (Outbound webhooks), `connector_completions` (Durable Connector completion), `workflow_generation_queue` (Workflow generation queue), `legacy_rag_schema_names` (Legacy RAG schema names), `agent_deployment_readiness` (Agent deployment readiness), `chat_turn_reconciliation` (Chat turn reconciliation), `ai_usage_reconciliation` (AI usage reconciliation), `side_effect_reconciliation` (Side-effect reconciliation), `agent_graph_interrupt_consistency` (AgentGraph interrupt consistency), `stale_workflow_runs` (Stale Playbook runs), `active_agents` (Active Agents), `completed_sources` (Completed sources), `knowledge_source_uploads` (Knowledge source uploads) |
| Production readiness (`production`) | Hardening of a live installation | `admin_authorization` (Sensitive admin authorization), `data_resource_query_budgets` (Data Resource query budgets), `workflow_trace_privacy` (Workflow trace privacy), `request_runtime_safety` (Request runtime safety), `domain_allowlists` (Domain allowlists), `widget_signing` (Widget signing), `commercial_profile` (Commercial profile) |

The Agents list, when it has no Agent, points to the Health page while a
required check warns or fails. The scheduler and chat queue heartbeat
([Scheduler And Worker Heartbeat](#scheduler-and-worker-heartbeat)) is a
required check; it warns and never fails, so it cannot change a Doctor exit
code.

Who sees what (ADR 0053):

| Ability | Health page |
| --- | --- |
| `operate`, `configure` or `publish` (action `setup.view`) | The required group: title, status and a one-line fix. No details, no commands, no other group |
| `admin`, granted without a record (action `setup.diagnostics`) | Every group with details (connections, tables, Agent IDs, configuration keys) and commands |

Details can name connections, tables, Agents and configuration keys, so they
are installation-wide diagnostics: a record-aware grant never opens them, and
the groups a user may not see are not evaluated for that user. In the `strict`
mode `setup.view` follows the Agents view Gate and `setup.diagnostics` the
`filament-agentic-chatbot.manage-settings` Gate.

## Health Check

Run the built-in readiness command:

```bash
php artisan filament-agentic-chatbot:doctor
```

Treat `FAIL` as a release blocker. The same checks are on the Health page of the
panel (**Settings > Health**).

For automated production setup, grant destructive authority explicitly and only to the step that needs it. Without a terminal, or with `--no-interaction`, the installer asks nothing, edits no host PHP and never writes `.env`:

```bash
php artisan filament-agentic-chatbot:install --no-interaction --force-migrations
```

It stops before changing anything when the storage preflight refuses the configured storage, and for an existing pre-1.0 installation it prints the preflight and upgrade steps instead of migrating (see `UPGRADING.md`, "Interactive installer").

Add `--force-config` only when the deployment is intentionally replacing the host's published package config. The former ambiguous `--force` option is rejected before setup starts; it never overwrites config or authorizes migrations.

For a quick vector-backend and queue-readiness signal while editing, use the **Setup Check** action on Agent and Source pages; **Settings > Health** in the panel shows every doctor check.

Supported vector backends are `database` (the default), `pgvector` and
`chroma`. Doctor's **Package storage** check runs the storage preflight
described below and fails when the configured storage does not hold the
existing knowledge.

For pgvector, the host needs PHP `ext-pdo_pgsql` and a PostgreSQL database where the `vector` extension exists. If the app database user cannot create extensions during migrations, ask the database administrator or VPS provisioning script to run this once:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Production warnings are intentionally early and actionable. Review warnings for widget query/body token transport, active Agents without domain allowlists, APP_KEY fallback signing, missing or invalid Agent deployments, full Workflow trace capture, and encrypted bot credentials that cannot decrypt with the current `APP_KEY`.

### AgentGraph Interrupt Consistency

The doctor check `AgentGraph interrupt consistency` compares projected chatbot waitpoints with AgentGraph SDK pending interrupts. A warning means projection state and runtime state diverged: for example, a pending interaction has no SDK interrupt anymore, a confirmation is missing its AgentGraph identity, or a projection is already past `expires_at`.

First response:

```bash
php artisan filament-agentic-chatbot:doctor
```

Then reconcile the affected active conversations before allowing side effects. If a projection cannot be reconciled, active users should receive a safe clarification or already-handled message; the runtime must not execute a write operation from stale projection state.

### Durable Chat-Turn Reconciliation

The doctor check `Chat turn reconciliation` reports durable turn IDs whose result is `unknown` or whose active execution lease expired. Expiry before any exact current-turn AgentGraph checkpoint or atomically accepted resume is persisted is classified as pre-dispatch and fails retryably. Once AgentGraph has accepted that exact turn, expiry is post-dispatch uncertainty and remains locked. A database-only turn/run correlation does not by itself prove dispatch, while an invalid existing AgentGraph binding fails closed instead of being downgraded to retryable. Sending the same request with a new ID is not a safe substitute for reconciliation and could duplicate an external write.

Before unlocking a conversation, an operator must inspect the external provider, Workflow run, effect ledger, and application logs out of band. An expired lease alone does not prove that the original process stopped; verify that separately. Once the operator has established that the turn must be abandoned, run:

```bash
php artisan filament-agentic-chatbot:reconcile-chat-turn 123 \
    --force \
    --operator="ops@example.com" \
    --reason="Checked provider request log and CRM audit; no remote record was created."
```

The command accepts only an `unknown` turn or an active turn whose lease has already expired. It refuses `completed`, `failed`, `cancelled`, `waiting`, and live active turns even with `--force`. It never calls the model, workflow, tool, API connection, or side-effect retry path. Instead it marks the turn `cancelled`/abandoned, clears the conversation lock, and stores the reconciliation time, operator, reason, previous status, previous error code, and `execution_attempted=false` in the audit record.

Afterwards, run the doctor again and retain the command reason with the corresponding incident record:

```bash
php artisan filament-agentic-chatbot:doctor
```

Do not use direct SQL to clear `active_lock`; that bypasses status eligibility, message metadata synchronization, and the reconciliation audit.

### External Side-Effect Reconciliation

The doctor check `Side-effect reconciliation` reports write-ledger rows whose external outcome is `unknown`. Do not retry the Workflow Tool, API connection, or action with a new identifier: a timeout or ambiguous provider response may have occurred after the remote system committed the write.

Inspect the provider audit log and the local workflow/API connection trace out of band. Then record the verified result:

```bash
php artisan filament-agentic-chatbot:reconcile-side-effect 456 \
    --outcome=succeeded \
    --remote-id="provider-record-123" \
    --force \
    --operator="ops@example.com" \
    --reason="Verified the provider audit log and matched the idempotency key."
```

Use `--outcome=failed` only when the external system proves the write did not complete. The command accepts only `unknown` rows, requires an operator and reason, records an audit entry, clears the lease, and never invokes a workflow, model, tool, action, API connection, or external retry.

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

## Workflow Runtime Guardrails

- Enabled Workflow raw-HTTP tools require a non-empty `AGENTIC_CHATBOT_WORKFLOW_HTTP_REQUEST_ALLOWED_DOMAINS` list in every Laravel environment. Configure exact hosts or explicit wildcards such as `*.example.com`; local and testing environments grant no automatic network authority.
- `AGENTIC_CHATBOT_ALLOW_PRIVATE_REQUEST_URLS=false` blocks Workflow raw-HTTP tools, productive API connection calls, OAuth token refresh, API connection tests, and API connection-backed API sources from targeting localhost, RFC1918, or other reserved/private destinations in every Laravel environment. Setting it to `true` enables those intentional internal targets; raw HTTP hosts must still match the separate raw HTTP domain allowlist. Website sources always require public network destinations.
- `AGENTIC_CHATBOT_WORKFLOW_RUNNING_TIMEOUT_SECONDS` lets abandoned `running` Workflow executions be reclaimed so future conversations are not blocked forever.
- `AGENTIC_CHATBOT_WORKFLOW_DELAYED_TIMEOUT_SECONDS` lets abandoned `delayed` Workflow executions be reclaimed when a queued resume never arrives. It defaults to the running timeout when unset.
- `AGENTIC_CHATBOT_WORKFLOW_PENDING_RESOLVING_TIMEOUT_SECONDS` releases abandoned pending-interaction resolver claims when the AgentGraph interrupt still matches. This prevents stale `resolving` rows from blocking the next valid user answer.
- `AGENTIC_CHATBOT_WORKFLOW_TRACE_CAPTURE_*`, `AGENTIC_CHATBOT_WORKFLOW_TRACE_MAX_STRING_LENGTH`, and `AGENTIC_CHATBOT_WORKFLOW_TRACE_REDACT_*` control how much trace data is stored and how sensitive values are scrubbed.

If all trace capture flags are left enabled in production, doctor reports a warning. That keeps this release compatible while making privacy review explicit.

Agent stream failures are mapped to safe `error` events and closed with `[DONE]`. JSON `/complete` failures use the same safe error mapper and roll back prepared Workflow runs. Treat repeated `chat_failed` errors as an operational signal: inspect Agent/Workflow evidence, server logs, provider credentials, and queue health rather than asking users to retry indefinitely.

## Knowledge Storage And Vector Backends

The package tables use the host's default connection unless
`AGENTIC_CHATBOT_DB_CONNECTION` names another one. Vectors are stored by the
configured backend:

- `database` (default): float32 vectors in `bot_knowledge_vectors` on the
  package connection. Each search reads only the pinned source generations of
  the Agent and computes exact cosine similarity in the queue worker.
- `pgvector`: the `vector` column of `bot_knowledge_chunks` on a PostgreSQL
  package connection.
- `chroma`: a Chroma collection; chunk text and metadata stay in the database.

**Capacity of the database backend.** Search time grows with the number of
text sections (chunks) one Agent can search. Doctor warns above
`AGENTIC_CHATBOT_VECTOR_DATABASE_WARNING_CHUNKS` (default 800) and fails
above `AGENTIC_CHATBOT_VECTOR_DATABASE_MAX_CHUNKS` (default 3,000); both are
counted at 1,536 dimensions and scale down for larger embeddings. The hard
limit is enforced before an import is embedded, again when its new version is
activated (every Agent that shares the source is checked), when an Agent is
published, and at search time. A refused import shows the remedy on the source
and the previous version stays active. Raising the limits trades answer
latency and worker time for size; ADR 0047 records the measurements and the
sizing assumptions (warm and cold p95 per size, four concurrent workers).

**Storage preflight.** `php artisan filament-agentic-chatbot:storage-preflight`
prints the effective connection (name, driver, database, host), the vector
backend and which credentials are set, never their values. It fails when the
connection is undefined or unreachable, when package migrations are recorded
but the tables are missing on the connection (the storage is elsewhere), or
when sources or live Agent versions need knowledge that the configured backend
cannot search. It writes nothing; `--json` prints the same report as JSON.
Ingestion refuses to write into a backend that fails this last check.

### Switching backends

`php artisan filament-agentic-chatbot:switch-knowledge-backend {backend}` moves
knowledge between `database`, `pgvector` and `chroma` without downtime:

1. Run it with `--dry-run` first. It lists per source what will be copied,
   what is already present, what needs re-embedding and which Agents exceed the
   database backend's limit. Nothing is written.
2. Run it without `--dry-run`. The configured backend keeps serving while each
   ready generation's vectors are copied for the same chunk rows. Every copy is
   verified (count, SHA-256 checksum over chunk ids and float32 bytes, and a
   retrieval probe) before it counts. Switching to `pgvector` provisions the
   extension, the `vector(N)` column and the index first, even if the
   conditional migrations ran earlier under another backend.
3. Vectors are copied only when every chunk carries the generation's embedding
   identity (provider, model, dimensions, index version). Otherwise the source
   is listed for re-embedding; `--reembed` queues a normal ingestion job for
   active sources, and the next run copies the result.
4. A source that is ingesting blocks the cutover; rerun when it finishes.
   An interrupted run leaves unverified copies unused; the next run resumes.
5. When every generation that sources or live Agent versions need is verified,
   the command prints the cutover: set `AGENTIC_CHATBOT_VECTOR_BACKEND`, clear
   or rebuild the config cache, run `php artisan queue:restart`, then run the
   command again with `--from=<old backend>` to copy anything that finished
   ingesting in between.

The command never edits configuration, never deletes vectors in the old
backend and never moves package tables to another connection. Published
Agent versions keep their pins: after the cutover they read the verified
copies. Switching back is the same procedure in the other direction.

## Ingestion Fetch Limits

Website crawling has fixed safety bounds: 5 MiB per response, five redirects,
HTML/XHTML/plain-text pages, XML/gzip sitemaps, and the exact configured host
with public DNS addresses pinned into each connection. PDFs and other page
formats are skipped. robots.txt is required unless it returns 404 or 410.
The old `ingestion.max_redirects` and `ingestion.allowed_content_types` overrides
are removed; the private-network override does not apply to Websites.

HTTP responses request `Accept-Encoding: identity` and disable automatic decoding.
Unexpected gzip or zlib-wrapped deflate encoding is streamed through a decoded-byte
cap (5 MiB for pages and sitemaps, or a lower configured limit); other encodings,
including raw deflate, are refused. robots.txt has a separate 500 KiB cap.

Use a shared database or Redis default cache, an asynchronous ingestion worker
(timeout at least 300 seconds, queue `retry_after` between 300 and 900, such as
330), and the Laravel scheduler. Crawl runs checkpoint each work unit, resume
on redelivery and expire after their 900-second heartbeat lease. The cache
shares two in-flight slots and the largest active Crawl-delay per host across
Sources. Process-local cache stores are refused before fetching.

API-source fetches still use `AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` as a
cumulative pagination budget; the default is 5 MiB. Headers, transfer progress
and the final body size are checked before JSON decoding. Use API knowledge
sources for authenticated JSON records.

See [Knowledge Sources](KNOWLEDGE_SOURCES.md#website) for discovery, canonical
URLs, generation activation and capacity/removal rules.

## Runtime Write Pressure

Agent Access Tokens update `last_used_at` at most once per throttle window:

```env
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_LAST_USED_THROTTLE_MINUTES=5
```

Session and IP chat rate limits are configured independently with `AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE` and `AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE_PER_IP`.

## Streaming And The Shared Cache

While the worker runs a widget turn, the widget's request stays open and relays
the answer draft that the worker writes to the cache
(`AGENTIC_CHATBOT_CHAT_STREAM_CACHE_STORE`, default store). Web and queue
processes must share that store: database, Redis, or file on one host, not
`array`. Each open chat holds one PHP worker until its turn ends; size PHP-FPM
workers for concurrent chats. `AGENTIC_CHATBOT_CHAT_STREAM_RELAY_SECONDS`
(default 100, 0 disables streaming) bounds how long the request relays before
the widget falls back to polling. See [Chat Widget](CHAT_WIDGET.md).

## Scheduler

Run the Laravel scheduler every minute:

```cron
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

The package registers these commands:

| Command | Schedule | Purpose |
| --- | --- | --- |
| `filament-agentic-chatbot:read-back-sweep` (scheduled closure) | every minute | Requeues missed read-back checks and fences interrupted read workers without replaying writes |
| `filament-agentic-chatbot:heartbeat` (scheduled closure) | every minute | Records the scheduler heartbeat and queues the worker heartbeat job (see below) |
| `filament-agentic-chatbot:maintain-outbound-webhooks` | every minute | Ends idle conversations (`conversation.ended`), delivers and retries webhooks |
| `filament-agentic-chatbot:reconcile-ai-usage` | every minute | Settles expired usage reservations |
| `filament-agentic-chatbot:reconcile-workflow-resume-deliveries` | every minute | Redispatches due Workflow delays |
| `filament-agentic-chatbot:maintain-connector-completions` | every minute | Durable API connection completions |
| `filament-agentic-chatbot:prune-direct-read-continuations` | every 5 minutes | Removes expired read continuations |
| `filament-agentic-chatbot:collect-knowledge-gaps` | every 5 minutes | Collects knowledge gaps |
| `filament-agentic-chatbot:sync-knowledge-sources` | every 15 minutes | Re-syncs URL and API sources set to daily or weekly |
| `filament-agentic-chatbot:prune-action-reviews` | daily 02:15 | Removes expired approvals |
| `filament-agentic-chatbot:prune-chat-attachments` | daily 02:30 | Removes expired chat attachments |
| `filament-agentic-chatbot:prune-channel-inbound-attachments` | daily 02:35 | Removes expired channel attachments |
| `filament-agentic-chatbot:prune-conversation-diagnostics` | daily 02:40 | Removes expired diagnostics |

Usage reconciliation, resume reconciliation, knowledge sync, knowledge gaps and
API connection completions can be switched off in config when the host runs the same
command centrally; the webhook maintenance command is always scheduled because
the read API reports the conversation status it maintains.

### Scheduler And Worker Heartbeat

The panel always shows whether live chats can be answered. The scheduled
closure writes the scheduler heartbeat (a Unix time) to the shared cache every
minute and dispatches `RecordWorkerHeartbeat` onto the chat queue
(`AGENTIC_CHATBOT_CHAT_QUEUE`, default `agentic-chat`, on
`AGENTIC_CHATBOT_CHAT_QUEUE_CONNECTION`). The job writes the worker heartbeat
when a worker processes it. At most one heartbeat job waits per connection and
queue, so a stopped worker does not collect a backlog of them.

| Cache key | Written by |
| --- | --- |
| `agentic-chatbot:heartbeat:{install}:scheduler` | the scheduled closure |
| `agentic-chatbot:heartbeat:{install}:worker:{connection}:{queue}` | `RecordWorkerHeartbeat`, on the queue worker |

`{install}` is a short keyed hash of `APP_KEY`, so installations that share a
cache never read each other's heartbeats; the connection and queue make a
second chat queue a separate heartbeat. Set
`AGENTIC_CHATBOT_HEARTBEAT_CACHE_STORE` to a store that the web, scheduler and
queue worker processes share (database, Redis, or file on one host; not
`array`). `AGENTIC_CHATBOT_HEARTBEAT_STALE_AFTER_SECONDS` (default 180) is the
age after which a heartbeat is stale.

A banner on the Agents list and the Health page reports exactly what the
timestamps prove and refreshes every 30 seconds. It is one line with a link to
Health, shown to administrators only (`setup.diagnostics`), and an
administrator can dismiss it for the rest of the session; it returns when the
reported state changes:

| Evidence | Banner |
| --- | --- |
| Scheduler heartbeat stale or never recorded | Scheduler heartbeat is stale; scheduled work may be delayed. Worker status is unconfirmed. |
| Scheduler fresh, chat queue heartbeat stale or never recorded | Chat queue heartbeat is delayed; check workers and queue backlog. |
| The cache cannot be read, discards writes or is private to one process | The status cannot be confirmed; the banner says so instead of blaming the scheduler or a worker. |
| The chat queue connection is `sync` or its `retry_after` does not exceed the chat execution time | Widget turns cannot be queued, so website visitors cannot be answered. There is no synchronous fallback for widget turns. |

A stale timestamp never proves that every webhook or chat stopped: a worker
that is still running while the scheduler is stopped keeps its own heartbeat
fresh, and the banner then names only the scheduler. The measured facts (queue
connection and name, age of each heartbeat, jobs waiting on the chat queue)
need the `setup.diagnostics` ability, which is admin (ADR 0053).
After the scheduler or the worker restarts the banner disappears within two
minutes. The old toast on the Agents list is gone.

## Go-Live Baseline

Before production launch:

- Laravel host app is on `12.61.1+` or `13.12.0+`
- Doctor shows **Vector backend** and **Package storage** without `FAIL`: the `database` backend within its limits, or pgvector (PHP `ext-pdo_pgsql`, `CREATE EXTENSION vector`) or a healthy Chroma server
- The application database is MySQL 8.4+, MariaDB 11.4+, PostgreSQL 15+ or SQLite 3.39+ (SQLite for single-server installs only)
- Queue worker process is supervised (systemd/Supervisor/Horizon)
- Database queue installs have migrated `jobs`, `failed_jobs`, and `job_batches`
- Laravel scheduler runs every minute
- Web and queue processes share one cache store
- `AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true` with a strong signing key
- If `AGENTIC_CHATBOT_COMMERCIAL_MODE=true`, set `AGENTIC_CHATBOT_ANYSTACK_ID`, `AGENTIC_CHATBOT_DOCS_URL`, and `AGENTIC_CHATBOT_SUPPORT_EMAIL`
- Domain allowlist configured per Agent
- Header-only widget token transport for public embeds
- Every Live Agent is published (no **Publish needed**) and its tests pass
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

## Recovery Workflow

- If ingestion fails: inspect `bot_knowledge_sources.meta.error`, retry ingestion from Sources table.
- If ingestion is pending: inspect `bot_knowledge_sources.meta.retry_after` and `bot_knowledge_sources.meta.retry_delay_seconds`.
- If a scheduled re-sync does not run: inspect `bot_knowledge_sources.next_sync_at` and `sync_failures`, run the sync command with `--dry-run`, and verify that `php artisan schedule:run` runs every minute.
- If you changed vector backend/model settings: use `Re-Ingest Bot Sources` (bot page) or `Re-Ingest All Sources` (sources list).
- If bot setup still feels unclear: use `Test Retrieval`, `Test Bot Answer`, and `Setup Check` before you debug deeper infrastructure.
- If chat rate-limited: reduce traffic burst and add retry backoff in clients.
- If a Workflow appears stuck: run `filament-agentic-chatbot:doctor`, inspect active `workflow_runs` and `bot_pending_interactions`, and verify the running/delayed/resolving timeout settings above.
- If retrieval quality drops: tune `top_k`, `min_similarity`, and source quality.

## App data tools (`query_data_resource` and `mutate_data_resource`)

For Workflows that use app data tools:

- Define the required resources in **Agentic Chatbot > Connect > Data**. Choose an Eloquent model, then select columns from the detected database table instead of typing column names by hand.
- Use config-backed resources only as install-time seeds or reviewed defaults. After migrations, **Sync from config** can create or update UI-managed resources when you intentionally want that.
- Restrict each bot to the minimum required resource keys and narrow fields per bot when needed.
- Add `field_metadata` for fields users may describe naturally, especially dates, numbers, prices, status enums, and names. This helps generated Workflows map phrases like "newest", "top", "highest", "lowest", or "cheapest" to safe sort/filter fields.
- Keep direct Agent app data tools read-only. For a Workflow write, explicitly enable only `insert` and/or `update`, require a server-resolved ownership scope, and select the minimum writable, required, and exact-identity fields. Updates also require an integer or date-time optimistic-lock column.
- Verify the confirmation text contains only policy-approved business fields. Confirm that stale versions, invalid values, multiple matches, replays, and cross-tenant targets fail closed and that the side-effect ledger records the exact result identity.
- Re-check permissions, migrations, and cache after changing global resources.
- Validate one real Workflow run against representative production data before go-live.

## Upgrade Checks

An existing installation upgrades with `filament-agentic-chatbot:upgrade`
(ADR 0055; `UPGRADING.md`, "Upgrade order"). Run the read-only preflight in
the new release directory before traffic switches to it:

```bash
php artisan filament-agentic-chatbot:upgrade --dry-run
```

It writes nothing and includes the storage preflight
(`filament-agentic-chatbot:storage-preflight`), the embedding billing
cutover (`filament-agentic-chatbot:embedding-billing-preflight` lists the
Sources and records the acceptance) and the administration authorization mode.
It also proves that every live Agent version and every Workflow version it
pins executes, that every waiting Workflow run resumes with its pinned
versions, which pending visitor confirmations keep their authority, and
whether workers are active. Fix every `blocked` check; nothing changes until
it passes. When Sources still use an Agent's embedding key, the dry run warns
that the acceptance is recorded during the upgrade: apply stops at the billing
migration, you accept with `embedding-billing-preflight --accept-app-key`, and
the next apply continues.

Then back up the database, stop the queue workers and the scheduler, wait 90
seconds and apply:

```bash
php artisan filament-agentic-chatbot:upgrade --operator="ops@example.com" --backup-confirmed --workers-stopped
```

A worker or scheduler heartbeat younger than 90 seconds, or a reserved job in
a `database` queue, refuses the apply before any change. A heartbeat cannot
prove that workers are stopped, so `--workers-stopped` is always required.
Apply runs the package and AgentGraph migrations, expires pending
confirmations whose Agent version or run cannot be preserved, verifies every
live version again and reruns the preflight. Progress is stored in
`agentic_upgrade_runs` (operator, backup confirmation time, finished phases,
evidence such as the expired confirmation IDs); after an interruption run the
same command again and it continues with the first unfinished phase. When
apply fails, fix the cause and rerun, or roll back: stop the workers, restore
the backup and switch back to the previous release. Afterwards run
`php artisan optimize:clear`, `php artisan filament:assets`, start the workers
and the scheduler and check `filament-agentic-chatbot:doctor`.

For host upgrade checks, see [supported-upgrade smoke and recovery evidence](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#supported-upgrade-smoke-and-recovery-evidence).

`filament-agentic-chatbot:doctor` reports removed runtime-mode and engine environment variables by name. Delete those variables; there is no replacement mode selector. Values are never printed. Doctor also reports an active Agent that lacks one verified Agent deployment and fails invalid deployment or Workflow pins.

## Handoff notification delivery

Run the Laravel scheduler every minute and a queue worker on the default queue.
To select another connection or queue, set
`bot_handoff_requests.notifications.queue.connection` and
`bot_handoff_requests.notifications.queue.queue` (environment:
`AGENTIC_CHATBOT_HANDOFF_NOTIFICATION_QUEUE_CONNECTION` and
`AGENTIC_CHATBOT_HANDOFF_NOTIFICATION_QUEUE`). Both default to empty, using the
host queue defaults.
`DeliverHandoffNotificationJob` dispatches after the handoff transaction commits.
Its five attempts use backoff of 60, 300, 900 and 3,600 seconds; the worker timeout
is 120 seconds. Configure the queue's `retry_after` above that timeout. The
notification ledger is stored on the package database connection. Panel users
also need the host's normal Laravel `notifications` table and `Notifiable` support
and the hosting panel must enable `->databaseNotifications()` for the in-panel
mailbox.
On PostgreSQL, Filament requires the `data` column of the host's `notifications`
table to be `json` or `jsonb` (Laravel's default migration creates `text`); without
that change the panel fails with a database error as soon as it loads the
notification bell. Alter the column once, for example `ALTER TABLE notifications
ALTER COLUMN data TYPE jsonb USING data::jsonb`. The package never changes
host tables. The same notifications carry unverified-action alerts.

The scheduled `filament-agentic-chatbot:handoff-notifications` task queues due
pending rows idle for at least five minutes, recovering a failed after-commit
queue dispatch without requeueing every minute. Database claims
serialize duplicate workers. A database claim left for ten minutes returns to
pending with the backoff for its attempt; after five attempts it becomes a visible
failed delivery. An interrupted final attempt shows a reminder to check the queue worker
before retrying. A stale email claim becomes uncertain. Database retries use a
stable notification ID so an already persisted mailbox entry cannot be duplicated.

Open the handoff in the Inbox to inspect notification channels, statuses, attempts
and bounded errors. **Retry notifications** requires `handoffs.manage` for that
handoff and queues only failed rows. It creates neither a new handoff nor new
notification rows. Users and approved email settings are rechecked before every
send; revoked or removed recipients are skipped.

Mail delivery and the ledger cannot commit atomically over SMTP. A worker that
dies during mail sending may have sent the message. Such deliveries show
**Delivery uncertain** and are excluded from automatic retries. Inspect transport
records, then use **Resend** on the handoff if needed. It requires
`handoffs.manage` and confirmation that the recipient may get the email twice. Transport exception details are not
stored or logged by this job; only the exception class is exposed, so message
content, addresses and credentials cannot leak through error messages.

User recipients require one unambiguous auth provider across panels hosting the
plugin. With different panel user providers, Notify user lookup fails closed
because a stored user ID alone cannot distinguish the accounts. Use approved
email recipients or one shared panel user provider.

## Connection health notifications

The API and MCP connection lists show OAuth refresh health and failure times.
**Last refresh failed** means a reviewed replay-safe refresh exhausted its bounded
network/5xx retry budget. Keep the Connection enabled and inspect provider
availability. **Reconnect required** includes revoked credentials and
unreviewed `refresh_uncertain`: the provider may have consumed a rotating token.
Do not reset the refresh journal or replay that token. Use the existing API credential
setup or MCP **Connect account** flow to reconnect. For explicitly reviewed
replay-safe credentials, an `unknown` attempt is recoverable on the next request
with a new fenced dispatch. Its label and notification say **Refresh uncertain,
retrying**; reconnection is requested only after a definitive credential rejection.
Unreviewed credentials remain blocked. Saving a
changed client secret or authentication method releases only a rejected
`reconnect_required` attempt, never an `unknown` attempt. A successful original
refresh may resolve uncertainty if its fenced commit still owns the credential identity.
Health is refresh evidence, not a provider availability monitor.

Every health-state transition records a durable event on the package database.
Delivery runs after commit on the host's default queue. The minute scheduler
`filament-agentic-chatbot:connection-health-notifications` recovers undelivered
events idle for five minutes, including a lost queue dispatch. It also marks
expired refresh dispatch leases as uncertain for unreviewed credentials, or
as a retryable refresh failure for an unchanged reviewed credential, without
sending any token request. Jobs retry with
60 and 300 second backoff. Each event has durable limits of three delivery
attempts and three failed or presumed-lost dispatches. Enqueueing a job does not
consume the dispatch-failure budget. An undelivered dispatch idle for five minutes
is presumed lost for bounded scheduler recovery; this does not prove that a
backlogged job cannot still deliver. After exhaustion the event records
`failed_at` and the bounded `error_code`
`delivery_attempts_exhausted` or `dispatch_attempts_exhausted`; the same code and
event ID are logged once. Exhausted events are no longer requeued. A late job may
still deliver after dispatch exhaustion while fewer than three delivery attempts
have run, clearing the dispatch failure marker. Delivery exhaustion is terminal.
Fix the host storage or worker configuration before expecting later transitions
to notify; failed historical events are retained for diagnosis.
Run a queue worker and enable `->databaseNotifications()` on the hosting panel.
The host needs its Laravel `notifications` table and a notifiable Eloquent user
provider. Mail is not sent for connection health.

Recipients are users of the unambiguous user provider shared by the hosting
panels, checked with `AdminAuthorizer` for both `connections.view` and
`connections.manage` on that exact Connection. In abilities mode this requires
admin; configure or operate alone is insufficient. The host's record-aware grant
must enforce its tenant scope. Panel access and current grants are rechecked at
delivery. Different panel user providers fail closed. Handoff Notify email-only
recipients are not connection administrators and are never reused here.
Each delivery scans the provider's user table in chunks of 200 by primary key.
The scan is O(number of users), with two authorization checks per candidate and
authorization rechecks before each notification insert. This bounds memory,
not the total authorization cost; large hosts should budget queue capacity for
that scan per transition and attempt.

A stable transition/recipient notification ID deduplicates retries, overlapping
workers and interruption after the mailbox insert. Queued events for older
health versions, credentials or environments are discarded. Notifications contain
only the connection ID, translated health and time, never saved names, URLs,
provider bodies, credentials or raw exceptions. The refresh journal retains
bounded status/error codes and credential hashes, not token values. The
`agentic_connection_health_events` table records delivery/failure timestamps and
attempt counts for diagnosis.
