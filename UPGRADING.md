# Upgrading

This document covers required steps when upgrading between public releases.
Start with the section for the release you are moving to; older sections stay
below for hosts that skip releases.

## Upgrading to 1.0

**Release status:** Approved, conditional on required gates and publication.

Selected release `v1.0.0`; intended publication `2026-10-19`. Approval is conditional release authorization, not completed acceptance. The source remains a release candidate until required local gates and publisher finalization pass. Final source and archive certification are pending. The last shipped release remains `0.20.5` until publication. The intended `0.20` security/critical EOL is `2027-01-17`, 90 days after the intended publication date. If publication moves, revise the date, EOL and mirror pin before freezing a new source candidate.

This is a migration from `0.20.5`, not a drop-in patch. Begin with the
[ordered procedure](#ordered-0205-to-10-procedure), then use the breaking-change
sections below to review your host's affected configuration and extensions.
The [compatibility matrix](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md)
separates supported ranges from recorded verification. The development
upgrade/restore rehearsal does not certify a final commercial archive.

Before scheduling an upgrade, inventory existing pgvector settings, host Gates,
personal Tool actor mappings, package-model Tools and host template extensions.
Keep unresolved writes and waiting work in that inventory. Do not treat a
dependency update, a successful migration or a new Agent publication as evidence
that an uncertain external write failed or may be retried. The ordered procedure
requires a quiesced host and a verified paired backup; it covers pending cards,
explicit dependent publication, restart checks and restoration.

The reference below keeps the exact old and new names. It does not authorize
production installation of the unreleased candidate.

### Fixed local release evidence inventory

The required recorder/publisher gate `knowledge_retrieval_pgvector` is replaced
by `targeted_runtime_security`. Broad pgvector qualification is optional and
recorded as `optional_qualification.knowledge_retrieval_pgvector: not_run`
when omitted. Keyless Laravel 12/13 exact-artifact install gates no longer run
`--run-ingestion-probe` or require `GEMINI_API_KEY`; actual RAG and native Confirm
remain required real local-host acceptance. Existing evidence missing the new
targeted gate cannot publish. Follow `docs/release/RELEASE_POLICY_1.0.md` for the
fixed inventory; retain historical reports unchanged.

### Isolated staging write identity reviews (W111b-STAGING-ACTOR)

`DataResourceWriteTestRunner` no longer stores the original operator in the
mutable `WorkflowState::variables['__data_resource_staging_operator']` entry.
The internal readonly `DataResourceWriteTestPermit::operatorIdentity` now pins
its class, key and canonical type; `hostActorTypesHash` pins the complete
validated `context.host_actors.types` map. Both enter the reviewed hash.
Discard in-memory staging reviews from older code and create a fresh review
after updating or changing that map. Resolution and dispatch recheck these
bindings around host callbacks and inside the write transaction. This does
not change productive visitor identity or authorize replay of unknown writes.

### Local release publication (W11.2)

The maintainer publisher's `--staging-evidence=<path>` argument is removed and
now fails with `Unknown argument`. Use `--phase=finalize`, `--version=<version>`
and `--evidence=<path>` with the same reviewed local evidence used for
`--phase=prepare`. Local assurance precedes the annotated tag and draft;
finalize revalidates the exact candidate and assets before GitHub publication.
Deploy the exact published artifact directly to Live afterward with normal
backup, migration, health-check and rollback protections. There is no separate
VPS staging prerequisite. Product App data tool write-test staging and permits
are unchanged. See the maintainer policy `docs/release/RELEASE_POLICY_1.0.md`.

### Package page polish (UXB6)

- **Agent Access Tokens** becomes **Access tokens** and **Agent Access Token**
  becomes **Access token**, matching the Developers navigation.
- **Handoff Requests** becomes **Handoffs**; the list page title is **Inbox**,
  matching its heading and navigation. **Bot Submissions** is **Submissions**.
- The App data tools **Resource** column becomes **App data tool**. Technical
  keys move into a separate, copyable **Key** column, hidden by default.
- German **Unterhaltung / Unterhaltungen** becomes **Gespräch / Gespräche**;
  **Neu abrufen** becomes **Erneut synchronisieren** for Source re-sync.
- English labels use sentence case. Lists hide the page-size selector when
  the filtered results fit the smallest page; larger lists keep page controls.
  Card lists label their default sort **Default order**. Routes, stored values,
  translation keys and permissions remain unchanged.

### Conversations and Usage tabs (UXB5)

- **Insights > Submissions** is now **Conversations > Submissions**.
- **Insights > Usage** is now **Conversations > Usage**. The **Model prices**
  header button is now a **Model prices** tab beside **Usage** and **All calls**.
  The existing `/ai-usage`, `/ai-usage/calls`, `/ai-usage/prices` and submission
  resource URLs stay the same, as do their authorization requirements.
- The Conversations **Recent request** column becomes **First message**.
  **Review state** and its **Clear** badge are removed from the list; flags
  remain available in the conversation view. **Outcome** reports persisted
  activity, with **In progress** for records without a completed answer.
- Usage summaries and chart axes use the operator's locale. Monetary values
  and stored prices do not change. Select the cost tile's missing-usage link
  to inspect the matching visitor calls for the current month.

### Anthropic default and release acceptance model

The Anthropic default changes from `claude-3-5-haiku-latest` to
`claude-haiku-5-5`. New curated options are `claude-haiku-5-5`,
`claude-sonnet-5-5` and `claude-opus-5-5`. The unqualified curated options
`claude-3-5-haiku-latest`, `claude-3-5-sonnet-latest`,
`claude-3-7-sonnet-latest` and `claude-sonnet-4-20250514` are removed from
selection. Existing saved model IDs and historical prices are not rewritten;
explicit older models require verified host capability declarations.

Set `runtime_config.agent.anthropic_effort` before publishing a Claude 5.5
Agent. Allowed values are `low`, `medium`, `high`, `xhigh`, `max`; absent means
the provider default (medium). Publish pins `model.anthropic_effort`.
Claude 5.5 requests omit `temperature`, `top_p` and `top_k` even in provider
options. Assistant prefill, thinking budgets, forced tools with adaptive
thinking and disabled thinking above `high` fail before dispatch.

Owner decision 2026-10-18 replaces the release acceptance pin
`gemini/gemini-2.5-flash-lite` with `anthropic/claude-haiku-5-5`, effort `low`.
Earlier Gemini evaluation evidence does not satisfy the new pin. Gemini stays
supported. The versioned fixture, receipt checks and report manifests bind the
new provider, model and effort. USD list prices use the existing bounded,
explicit EUR conversion for release caps.

### Settings page: AI providers by use (UXB1)

The **AI providers** section of **Settings** no longer lists all 14 providers
as a table of "Not set" rows. It lists the providers in use (an Agent's chat
provider, the embedding profile when an Agent has Sources, the defaults for
new Agents, any provider with a key) with a **Key** badge: Agent key, Settings,
.env or Missing. **Add provider** adds the others. **Edit** opens a slide-over
with the key, a connection test and the base URL under **Advanced**. The
**Remove the stored key** toggle became the confirmed **Remove key** action.
**Test connection** reads the model list through the outbound destination guard and stores only the time, the result and a keyed fingerprint; the result disappears when the endpoint or key changes.
Embeddings and the website signing key are Sections with badges. The Settings
page no longer links to Setup; use the Health tab of Settings.

One key resolver (Agent key, then Settings, then `.env`, per provider and
purpose) now feeds the Settings page, the Setup checks and the Agent checklist.
The Setup chat check counts an Agent as covered only when that Agent resolves a
key for the provider the check names. The Setup embedding check now warns when
no app-wide embedding key exists, even if an Agent key serves retrieval, because
source ingestion has no Agent; it reports retrieval by Agents next to it. The
Doctor shows the same WARN.

If your host overrides these translation keys, adopt the new wording:
`common.app_settings.providers_description`, `defaults_description`,
`embeddings_description`, `api_key_hint`, `base_url_hint`. These keys were
removed: `clear_api_key`, `key_env`, `key_none`, `key_not_required`,
`key_settings`, `setup_heading`, `setup_link`, `signing_source_app_key`,
`signing_source_env`, `signing_source_none`, `signing_source_settings`,
`embedding_source_env`, `embedding_source_settings`, `url_default`. The
`resources/views/filament/pages/agentic-chatbot-settings.blade.php` view is
gone; a host that published it must delete its copy, because the page now
renders through Filament schemas.

### Navigation, Health page, heartbeat banner and Overview widgets (UXB2)

The sidebar of the plugin group now has five top-level items instead of seven
(Dashboard excluded): **Build** (Agents, Workflows, Sources), **Connect**,
**Inbox**, **Conversations** and **Settings**.

| Before | Now |
| --- | --- |
| **Insights** (Conversations, Submissions, Usage as children) | **Conversations**, one item; Submissions and Usage are tabs. `NavigationSection::Insights` became `NavigationSection::Conversations` (value `conversations`) |
| **Setup** at the bottom of the group | **Settings > Health**. The URL `/agentic-chatbot-setup` is unchanged, so bookmarks keep working; the class `AgenticChatbotSetup` and the `setup.view` and `setup.diagnostics` abilities are unchanged |
| **Settings** as a separate item | **Settings > General** (same URL). `Settings` is now a `NavigationSection` case; a host that lists `navigationSections([...])` explicitly must add `NavigationSection::Settings` to keep the item |
| **Connect** overview page at `/agentic-chatbot-connect` | removed as a page. **Connect** opens the first entry you may use, and the old URL `/agentic-chatbot-connect` still works: it redirects to the first Connect entry the user may open and keeps an `agent` parameter only when it names an Agent the user may manage (403 when the user may open no Connect entry) |
| Connect children API connections (APIs & MCP), App data (Data), Webhooks; Access tokens and Tool Bridge reached through the overview | **Tools & data** (API connections, MCP servers, App data tools as tabs) and **Developers** (Access tokens, Webhooks as tabs). All resource URLs are unchanged |
| **Tool Bridge** in the Connect overview | **Settings > Developer tool providers**, now admin only: the page and its Preview action need the new action `developer_tools.view` (the `admin` ability, or the Settings Gate in the `strict` mode) in addition to the API ability that opened it before, so a configure-only user who used the URL is refused. The URL `/agentic-chatbot-capabilities` is unchanged |
| Agent editor **Connect** action opened the Connect overview | opens the Channels list with the same Agent context |
| Back to Connect actions on channel, token and webhook pages | removed with the overview |

A host that navigates to these pages by resource class keeps working: only the
sidebar registration changed. Resources that now live behind a tab bar set
`shouldRegisterNavigation()` to false, so a host that listed them in its own
navigation groups should link the tab entries instead. Global search now finds
Sources by name and conversations by session ID (never by message text), next
to Agents; results follow the same abilities and record scope as the lists.

The **Setup** page, now **Health**, shows problems first: a **Needs attention**
section with a status badge, the fix line, one **Fix in …** button and a copyable
command for each warning or failure, and one collapsed **n checks passed**
section. The old page failed with a JavaScript `SyntaxError` in the browser
console because of an `@js` directive inside a component attribute; the copy
button is now the standard copyable field.

The scheduler and worker heartbeat banner now shows on the Agents list and the
Health page only (it used to appear on every Agent page too), as one line with a
link to Health, to administrators only (`setup.diagnostics`), and can be
dismissed for the session. Operators without that ability no longer see it;
they still see the Health page and its required group.

The plugin can add **Overview** widgets to the panel dashboard: call
`FilamentAgenticChatbotPlugin::make()->dashboardWidgets()` to add a **Next step**
card and the stats **Live Agents**, **Open handoffs**, **Waiting approvals** and
**Setup blockers**. They are off by default, so the dashboard of a host that does
not opt in does not change. A host with a custom dashboard page lists
`FilamentAgenticChatbotPlugin::overviewWidgets()` itself. Each widget and stat
appears only for users who may open its target, and Agent, handoff and approval
numbers come from the same scoped queries as those lists. **Setup blockers** and a
blocked-check **Next step** come from the installation-wide required checks, so
they are labelled *Installation-wide* and shown only to users with
`setup.diagnostics` (the record-less admin grant); a tenant-scoped user never
sees another tenant's failure. **Live Agents** links to the Agents list with the
new **Live** filter. The required checks run once per request for all widgets.

A host that passes `navigationSections([...])` also hides the tab bars of the
sections it leaves out.

### Confirmation continuation and server-bound record versions

Direct App data update tools previously asked the model for
`expected_version` alongside `record` and `changes`. Their model-facing schema
now accepts only `record` and `changes`. Remove `expected_version` from direct
tool callers; supplying it is rejected. The Gateway captures the scoped,
authorized record's version at proposal time and binds it into the encrypted
confirmation arguments. Confirm still rejects any intervening record change.
Republish affected Agents to refresh their immutable tool descriptions, which
previously told the model to read the version before proposing an update.
The Workflow action `mutate_data_resource.expected_version` keeps its existing
explicit input contract.

Gemini confirmation decisions and reconciled outcomes remain paired in
`meta.agent_transcript`. The provider adapter projects these server observations
as input data because Gemini rejects synthetic unsigned `function_call` steps.
Provider-generated replay blocks and thought signatures stay intact. No stored
transcript, confirmation or usage row is rewritten. Existing usage rows in
`reconciliation_required` still require verified reconciliation evidence.
Workflow technical fallbacks report the run's state without rendering internal
capability receipt fields.

### Inbox operator path and readable operator screens

Presentation only; no table, route, ability or configuration key changed.

- Inbox tabs: **Approvals** and **Unverified actions** show only when they have
  pending work or a history. A fresh install shows the handoff list without a
  tab bar.
- Handoff rows: **Reply** (primary, slide-over, claims an unassigned handoff)
  plus a row menu with **Claim**, **Resolve** and **View**. The slide-over has
  **Send and resolve**. Claim and ownership rules are unchanged and stay in
  `HandoffDeskService`.
- Handoff page: Infolist sections with at most three header actions (Reply,
  Resolve, **More**). The action named `reply` is now labelled "Reply" and
  opens a slide-over; `claim`, `internalNote`, `changePriority`,
  `returnToAgent`, `close`, `retryNotifications`, `resendNotifications` and the
  open links moved into More. Browser tests that press them by label must open
  More first. The internal classes `BotHandoffRequestForm` (now
  `BotHandoffRequestInfolist`) and the shared `HandoffDeskActions` are not part
  of the supported API.
- Stored machine values read as words: handoff source, Workflow run halt reason,
  step names, audiences and activity types. Session ids are shortened with the
  full value as tooltip and copy value. Times show relative with an absolute,
  locale-aware tooltip without seconds; overdue targets state their duration.
- Translation overrides: removed `common.overdue`,
  `observe.handoff_notifications.attempts`,
  `observe.bot_handoff_request_form.desk_status`, `.met_time`,
  `observe.view_bot_handoff_request.reply_customer`, `.reply_conversation` and
  `playbooks.workflow_run_form.count_label`; `...workflow_run_form.waiting_for_input`
  no longer takes `:name`. New keys are under `observe.presentation`,
  `observe.bot_handoff_request_form`, `observe.view_bot_handoff_request`,
  `playbooks.workflow_run_form` and `widget.turn_queued_slow`. The widget shows
  "Taking longer than usual. Your message is saved; we will answer here." after
  20 seconds in the queued stage.
- Widget language: unchanged rule, now documented. `data-lang` serves only
  until the configuration loads; the Agent's widget language then decides, or
  the visitor's browser among the allowed languages when the Agent has no
  written visitor texts.

### Buyer-path identity, proposal and embedding corrections

`context.host_actors.types` is supported in the published configuration inside
`context`. Remove runtime `AppServiceProvider` `config()` workarounds for that
same key and rebuild the configuration cache. Its values must be existing
Eloquent `Authenticatable` model classes. Malformed maps previously could appear
as `Not used`; they now block Setup and return `host_actor_unsupported` for
personal tools instead of becoming scope-only authority. A session model now matches a signed
alias through this map, with the same authentication ID required. Keep
`AGENTIC_CHATBOT_API_INCLUDE_SESSION_AUTH_CONTEXT=true` when combining session
and signed context; neither the key nor the signed token format was renamed.

Previously `context.host_actors.types` trimmed aliases and could silently
overwrite a mapping; it also accepted multiple aliases for one class. It now
requires aliases matching `[a-z][a-z0-9_-]{0,63}` exactly and each class only
once. Package models, their subclasses and abstract models are forbidden.
Class-name list entries remain supported for explicitly configured host user
models; do not mix them with alias entries. Replace malformed aliases with
valid ones in both the map and your signed context issuer, remove duplicate
classes, rebuild the configuration cache and issue fresh context tokens.
Invalid maps block Setup and return `host_actor_unsupported` for personal tools.
Session requests previously fell back to the raw class name when zero or
multiple aliases matched. They now require exactly one valid mapping or return
`403 widget_context_invalid`, including tokens issued directly from user models
and tenant-only tokens accompanied by a session user.

Direct App data updates previously returned `awaiting_confirmation` even when
the record was outside the visitor's scope or missing. They now return
`agent_write_target_unavailable` before storing a card, identically for both
cases. Version, row policy and host policy are checked before the card as well
as again at execution. Clients must handle this tool refusal without expecting
a confirmation ID. Existing cards still recheck authority at Confirm.

Successful Gemini embedding responses without positive usage previously entered
`reconciliation_required` and later `awaiting_evidence` with
`provider_usage_missing`. New successful calls settle a conservative estimate,
labelled `usage_measurement.type: estimated`, without holding reservations or
warning indefinitely. Other missing receipts and provider failures remain
unknown. Existing awaiting-evidence calls require verified evidence; they are
not bulk converted. See [AI usage accounting](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AI_USAGE_ACCOUNTING.md).

### Ordered 0.20.5 to 1.0 procedure

Use a restored copy first. The target is the **1.0 line**, not a selected release:
W11.4 chooses `1.0.0-alpha.N`, `1.0.0-rc.N` or `1.0.0`. Do not interpret the
last dated changelog entry as the candidate version. Commands below run from
the host application root, under its deployment account. Bash examples use
`$BACKUP`, a private directory outside the release and web roots, and
`$RELEASE_VERSION`, the exact reviewed target. Never paste secrets into a report.

1. **Old-install preflight and effective configuration, on 0.20.5.**
   Record these outputs before clearing caches or changing dependencies:

   ```bash
   umask 077
   export BACKUP=/private/backups/agentic-before-1.0
   mkdir -p "$BACKUP"
   php -v > "$BACKUP/php.txt"
   php artisan --version > "$BACKUP/laravel.txt"
   composer show heiner/filament-agentic-chatbot > "$BACKUP/package.txt"
   php artisan migrate:status > "$BACKUP/migrations.txt"
   php artisan filament-agentic-chatbot:doctor > "$BACKUP/doctor-before.txt"
   php artisan tinker --execute='$c = config("filament-agentic-chatbot.database.connection") ?: config("database.default"); dump(["connection" => $c, "driver" => DB::connection($c)->getDriverName(), "database" => DB::connection($c)->getDatabaseName(), "host" => DB::connection($c)->getConfig("host"), "port" => DB::connection($c)->getConfig("port"), "username" => DB::connection($c)->getConfig("username"), "vector" => Illuminate\Support\Arr::except(config("filament-agentic-chatbot.vector", []), ["chroma.token"]), "dimensions" => config("filament-agentic-chatbot.vector_dimensions"), "embedding_provider" => config("filament-agentic-chatbot.providers.embedding"), "embedding_model" => config("filament-agentic-chatbot.models.embedding"), "package_database" => Illuminate\Support\Arr::except(config("filament-agentic-chatbot.database", []), ["password", "url"]), "queue" => config("queue.default"), "chat_queue" => config("filament-agentic-chatbot.api.chat_queue"), "source_disk" => config("filament-agentic-chatbot.knowledge_sources.uploads.disk"), "attachment_disk" => config("filament-agentic-chatbot.attachments.disk")]);' > "$BACKUP/effective-config.txt"
   ```

   A failing old Doctor is a stop-and-investigate result. Inventory host Gate
   definitions, role/permission tables and tenant scopes; record one allowed and
   one denied operator for post-upgrade comparison. Retain the host release,
   `composer.json`, `composer.lock`, published config, `.env`, `APP_KEY` and
   `APP_PREVIOUS_KEYS` securely. The keys are required to decrypt retained data.
   Copy the old release metadata/config securely: `cp -p .env composer.json composer.lock "$BACKUP/"`
   and `tar -cpf "$BACKUP/config.tar" config`.
   Also capture the host default connection (which owns the `migrations` table)
   and the AgentGraph connection, even when the package uses another database:

   ```bash
   php artisan tinker --execute='foreach (["host" => config("database.default"), "package" => config("filament-agentic-chatbot.database.connection") ?: config("database.default"), "graph" => config("agent-graph.database.connection") ?: config("database.default")] as $name => $c) { dump([$name, $c, DB::connection($c)->getDriverName(), DB::connection($c)->getDatabaseName(), DB::connection($c)->getConfig("host"), DB::connection($c)->getConfig("port"), DB::connection($c)->getConfig("username")]); }' > "$BACKUP/database-map.txt"
   ```

   Record each local and remote storage disk root, bucket and object prefix;
   inspect host disk overrides without printing credentials.

   Make old implicit values explicit in the new release. In particular, an old
   pgvector installation must keep `AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector`,
   its effective `AGENTIC_CHATBOT_DB_CONNECTION`, database, username, host and
   port, or its configured URL. Keep its dimensions and embedding profile.
   Do not change backend or re-ingest as part of this upgrade. A dedicated
   PostgreSQL connection must still be explicitly defined or have the database
   or URL needed for package registration. See [storage defaults](#package-storage-and-vector-backend-defaults),
   [authorization](#administration-authorization), [provider keys](#settings-page-and-app-wide-provider-keys)
   and [removed WhatsApp channel](#whatsapp-channel-removed).

2. **Back up the databases and storage as one paired snapshot.** Inventory
   every distinct database from step 1: host default (migration repository,
   users/permissions), package and AgentGraph. An alias of the same physical
   database needs one dump; separate databases each need a dump. Record that
   mapping with the snapshot. When the package has its own explicit connection,
   Doctor requires AgentGraph to use that connection; a separate AgentGraph
   override is then a blocker, not permission to relocate its data. If
   inventory finds such a database, preserve it too before investigating. For three distinct PostgreSQL databases:

   ```bash
   pg_dump --format=custom --file="$BACKUP/host.dump" "$HOST_DATABASE_URL"
   pg_dump --format=custom --file="$BACKUP/package.dump" "$PACKAGE_DATABASE_URL"
   pg_dump --format=custom --file="$BACKUP/graph.dump" "$GRAPH_DATABASE_URL"
   psql "$PACKAGE_DATABASE_URL" --set=ON_ERROR_STOP=1 --command='SELECT extname, extversion FROM pg_extension ORDER BY extname;' > "$BACKUP/extensions.txt"
   for name in host package graph; do
     pg_restore --list "$BACKUP/$name.dump" > "$BACKUP/$name-contents.txt"
   done
   tar -cpf "$BACKUP/storage.tar" storage/app
   sha256sum "$BACKUP/host.dump" "$BACKUP/package.dump" "$BACKUP/graph.dump" "$BACKUP/storage.tar" > "$BACKUP/SHA256SUMS"
   ```

   Each URL is its privately supplied effective PostgreSQL DSN. For MySQL/MariaDB use
   `mysqldump --single-transaction --routines --triggers --result-file="$BACKUP/database.sql" "$DB_DATABASE"`
   with the host's private client credentials and explicit host/port. For SQLite,
   use `sqlite3 "$DB_DATABASE" ".backup '$BACKUP/database.sqlite'"`.
   Repeat the appropriate driver command for every distinct database, using
   unique filenames such as `host.sql`, `package.sql` or `host.sqlite`; never
   overwrite another database's snapshot, including on mixed-driver hosts.
   Back up remote disks and local roots outside `storage/app` with the storage
   provider's snapshot/versioning tools. A tar of `storage/app` alone is not a
   remote-disk backup. Restore into an isolated database and disk prefix to
   verify the backup before proceeding, using step 8 for **every** database.
   Compare the restored migration list and records with the captured baseline,
   and verify the storage digest. Dumps taken while writers are active are
   preparation checks; only the writer-free paired snapshot in step 3 is the
   recovery point. Never mix databases or storage from different snapshots.

   **Before quiescing production**, prepare the new release directory against
   this isolated restored copy and run step 4's storage preflight and
   `php artisan filament-agentic-chatbot:upgrade --dry-run --json` there. Resolve
   blocks on 0.20.5 before scheduling downtime. Keep its queues, scheduler,
   webhooks and outbound effects disabled. This dry run does not replace the
   final production preflight after quiesce.

3. **Quiesce and take the final consistent recovery snapshot.** Remove all web
   nodes from load-balancer admission, block webhooks/new chat requests, run
   `php artisan down` on every server, and disable scheduler cron/`schedule:work`
   and process-manager automatic restarts. With shared maintenance use
   `APP_MAINTENANCE_DRIVER=cache` and the same `APP_MAINTENANCE_STORE` everywhere.
   Drain queued 0.20.5 chat admissions as well as active jobs and long-lived
   SSE turns, then stop every worker
   and Horizon supervisor. `queue:restart` alone does not stop supervisors from
   starting a new process. Verify stopped processes in the process manager,
   zero reserved jobs on every queue backend, and no received/planned/executing
   chat turns before replacing code:

   ```bash
   php artisan tinker --execute='dump(Heiner\FilamentAgenticChatbot\Models\ChatTurn::query()->whereIn("status", ["received", "planned", "executing"])->count());'
   ```

   The count must be `0`. Verify no queued chat admissions remain on any queue,
   including delayed/retry jobs. On 0.20.5 use
   `php artisan filament-agentic-chatbot:reconcile-chat-turn --help` and its
   reviewed recovery options for stranded admissions; resolve unknown outcomes
   without replaying writes. See [queued identity admissions](#customer-identity-for-personal-tools-and-host-model-policies).
   Do not delete the ledger. Durable
   halted/delayed Workflow runs may remain if their pinned versions verify.
   Wait at least 90 seconds after the last worker/scheduler heartbeat. Repeat
   step 2 now while all writers are stopped, including the migration repository
   and stored files; this final snapshot is the rollback point. See
   [Unverified write migration admission](#unverified-write-projections-and-webhook-occurrence-keys).

4. **Update dependencies in the new release directory, still offline.**

   ```bash
   : "${RELEASE_VERSION:?Set the exact reviewed 1.0 version selected by W11.4}"
   composer require "heiner/filament-agentic-chatbot:$RELEASE_VERSION" --with-all-dependencies --no-interaction --no-scripts
   composer dump-autoload --no-interaction
   php artisan config:clear
   php artisan filament-agentic-chatbot:storage-preflight
   php artisan filament-agentic-chatbot:upgrade --dry-run --json
   ```

   Preserve and merge published config deliberately; **never force-publish
   package config over the captured host configuration**. Storage preflight
   must exit `0` on the same database/backend as before. Upgrade preflight is
   read-only: no `blocked` area is allowed. Resolve warnings explicitly, especially
   contracts, authorization and embedding billing. A blocked historical run must
   finish or be cancelled on 0.20.5 before trying again. See
   [Laravel AI 1.2](#laravel-ai-12), [AgentGraph](#agentgraph-019-and-mysqlmariadb-support)
   and [implementation pins](#package-implementation-pins-adr-0058).
   On an existing installation, `filament-agentic-chatbot:install` prints the
   upgrade dry run; it does not apply the upgrade.

5. **Migrate, then explicitly review publication.**

   ```bash
   php artisan filament-agentic-chatbot:upgrade --operator="ops@example.com" --backup-confirmed --workers-stopped
   ```

   This runs package and AgentGraph migrations only. Run host-owned migrations
   separately with their reviewed paths; do not run a blanket `migrate` before
   the upgrade preflight. If embedding billing stops at migration `000006`,
   review the app-wide key/billing owner, then run
   `php artisan filament-agentic-chatbot:embedding-billing-preflight --accept-app-key --operator="ops@example.com"`
   and repeat the upgrade. The command records completed phases in
   `agentic_upgrade_runs`; after interruption repeat the same command, never
   manually mark a phase complete. A completed repeat is safe.

   Supported 0.20.5 live contracts need no automatic derived publication.
   Stored deployment/revision bytes and hashes stay intact. Review any required
   Tool/Workflow correction from the per-item sections, publish the dependency,
   then review **Publish affected Agents** and explicitly confirm it; use
   **Resume publication** for unfinished targets. Authority changes require an
   ordinary reviewed Agent Publish. Dependent publication leaves unrelated Draft
   changes unpublished; ordinary Publish uses the reviewed Draft. Paused stays Paused. See [dependent publication](#reviewed-dependent-publication-and-the-upgrade-command),
   [permission-mode removal](#agent-permission-mode-removed),
   [read corrections](#w69-reviewed-read-corrections) and [host read policies](#w54-optional-host-read-policies).

   An upgrade never runs a waiting Workflow, confirms a card or re-dispatches
   an unknown write. Waiting runs retain their exact Workflow/Agent pins;
   pending cards keep authority only while their bound version/run is valid,
   otherwise they expire and tell the visitor the assistant was updated.
   Review the preflight warning that confirmed writes have no stored outcome
   yet: eligible confirmations resume only when workers restart, under their
   original authority and execution-time checks. Unknown outcomes still require
   reconciliation. Ordinary expiry and execution-time identity checks
   still apply. Unknown writes remain unknown and require reconciliation, never
   automatic retry (ADR 0009). Automated evidence: `UpgradeCommandTest`,
   `UpgradeInFlightCharacterizationTest`, `UpgradeBackupRestoreTest` and
   `UpgradeDataPreservationTest` under `tests/Feature/V1`.

6. **Workers and assets.** Run `php artisan optimize:clear`,
   `php artisan filament:assets`, then rebuild the host's config/route caches
   with the preserved environment. Start workers with the configured chat and
   ingestion queues and the scheduler. Keep public admission closed until the
   next step passes. Check deployed assets and worker code point to the new
   release on every node. See [heartbeat configuration](#scheduler-and-worker-heartbeat).

7. **Verify before admitting traffic.**

   ```bash
   php artisan filament-agentic-chatbot:storage-preflight
   php artisan filament-agentic-chatbot:upgrade --dry-run --json
   php artisan filament-agentic-chatbot:doctor
   php artisan agent-graph:doctor
   php artisan migrate:status
   ```

   Expected: exit `0`, correct storage/backend, no pending package migrations,
   no blocked preflight area, and Doctor with no `FAIL`. Worker activity now
   warns in the read-only preflight; it must not be mistaken for migration
   failure. Doctor warnings need an operator decision; after at least two
   scheduler ticks the Setup page should show fresh worker/scheduler heartbeats.
   Compare record counts, permissions (allowed and denied), stored-file hashes,
   retained artifact hashes, pending cards and unknown-write identity/status
   against the snapshot. Test a supported Workflow and the widget in the
   isolated host before `php artisan up` and restoring admission. A real
   provider question is a separate authorized live check, not part of the
   no-AI rehearsal recorded in `docs/release/UPGRADE_REHEARSAL_1.0.md`.

8. **Rollback by backup restore.** Keep admission, scheduler and workers stopped.
   Verify `sha256sum -c "$BACKUP/SHA256SUMS"`. Restore **every distinct database**
   in the final step-3 snapshot into a new isolated database, including the host
   default migration repository and separate package/AgentGraph databases.
   For PostgreSQL repeat the following per dump with the captured server and
   application owner explicitly. The DBA creates the database and extensions;
   the application role need not be a superuser or have `CREATE EXTENSION`:

   ```bash
   : "${ADMIN_DATABASE_URL:?Set the private maintenance DSN for the captured PostgreSQL server}"
   : "${RESTORE_DATABASE:?Name a new isolated restore database}"
   : "${RESTORE_OWNER:?Set the captured package database username}"
   : "${RESTORE_DATABASE_URL:?Set its DSN using the captured application role and server}"
   : "${RESTORE_ADMIN_DATABASE_URL:?Set its DSN using the DBA role and the new database}"
   : "${DUMP:?Select the matching host.dump, package.dump or graph.dump from this snapshot}"
   createdb --maintenance-db="$ADMIN_DATABASE_URL" --owner="$RESTORE_OWNER" "$RESTORE_DATABASE"
   pg_restore --list "$DUMP" > "$DUMP.restore.list"
   # DBA step, for every database whose dump contains vector:
   psql "$RESTORE_ADMIN_DATABASE_URL" --set=ON_ERROR_STOP=1 --command='CREATE EXTENSION vector;'
   # Skip only vector extension creation and its comment, retaining vector data/indexes:
   sed -E '/^[^;].* EXTENSION - vector( |$)/d; /^[^;].* COMMENT - EXTENSION vector( |$)/d' "$DUMP.restore.list" > "$DUMP.app.list"
   pg_restore --exit-on-error --single-transaction --no-owner --no-privileges --use-list="$DUMP.app.list" --dbname="$RESTORE_DATABASE_URL" "$DUMP"
   ```

   The restore DSN must name the newly created database. Stop on any nonzero
   exit; never restore into an existing target. Do not rely on the client's
   default host or user. Restore additional database roles/grants with the host
   DBA's reviewed procedure if that host requires them.
   Run the vector DBA step only when vector occurs in that database's archive
   list. Inventory other extensions and have the DBA create/filter their exact
   entries too if they require elevated privileges; never discard table/data
   entries or continue past a restore error. The extension version must match
   the captured installation. A pre-created extension alone is insufficient:
   the app role also cannot execute `COMMENT ON EXTENSION` owned by the DBA.
   Restore storage to its paired snapshot/prefix, the old host release and
   `composer.lock`, `.env`, config, `APP_KEY`/`APP_PREVIOUS_KEYS`. Point the old
   release at **all** restored databases, verify file digests, migration history,
   Doctor and permissions there, then restart old workers/scheduler and restore
   admission. Never run `migrate:rollback` across the 1.0 data conversions.
   Before-migration failures keep the old snapshot intact; after-migration
   failures require the paired restore. Restoring a local backup does not undo
   remote effects after the snapshot: reconcile unknown writes with provider
   evidence before admitting traffic or retrying anything.

   Before starting workers, run `php artisan migrate:status` on the restored
   old release and compare the **ran** names to step 1. No 1.0 migration may be
   recorded in the restored host default database. For this candidate an exact
   additional check on that connection is:

   ```sql
   SELECT migration FROM migrations WHERE migration LIKE '2026_10_14_%';
   ```

   Expected: zero rows (all candidate 1.0 migrations use the 2026_10_14 prefix).
   Re-check that set against the selected release before use. On the restored
   package database `to_regclass('public.agentic_upgrade_runs')` and
   `to_regclass('public.agent_publication_batches')` must both be null. Compare
   the full captured migration/schema lists too; unchanged record hashes alone
   cannot distinguish an upgraded database from a restored one.

### Renamed UI labels (W10.1)

The panel, the chat widget and the guides now use one set of product terms (see GLOSSARY.md in the docs). Configuration keys, class, table and route names are unchanged. Translation keys are unchanged except for the editor source-string keys listed below. Visible values changed in English, German, French and Spanish.

This matters if your host published the translations (`lang/vendor/filament-agentic-chatbot/`) and overrides any of the keys below. An override keeps winning, so it still shows the old term until you edit it. Compare your override files with the new package files and adopt the new wording.

| Key (file `resources/lang/en/`) | Old English value | New English value |
| --- | --- | --- |
| `common.playbook`, `playbooks.agent_workflow_resource.playbooks` | Playbook, Playbooks | Workflow, Workflows |
| `common.open_playbook_run`, `playbooks.workflow_run_resource.playbook_runs` | Open Playbook Run, Playbook Runs | Open Workflow Run, Workflow Runs |
| `data-resources.setup.data_resource`, `common.data_resources` | Data Resource, Data Resources | App data tool, App data tools |
| `api-connectors.api_connector_resource.api_connectors`, `common.api_connector`, `common.connector` | API Connectors, API Connector, Connector | API Connections, API Connection, Connection |
| `api-connectors.api_connector_operation_resource.connector_operation(s)` | Connector Operation(s) | API tool(s) |
| `agents.bot_knowledge_capabilities_form.capabilities`, `...add_capability` | Capabilities, Add capability | Tools, Add tool |
| `api-connectors.capability_bridge.capability_bridge` | Capability Bridge | Tool Bridge |
| `common.area`, `common.areas`, `common.context_area`, `common.default_area`, `common.allowed_areas` | Area, Areas, Context Area, Default Area, Allowed Areas | Audience, Audiences, Audience, Default Audience, Allowed Audiences |
| `common.open_test_area` | Open test area | Open test chat |
| `common.unknown_outcome` | Unknown outcome | Unverified action |
| `common.release`, `common.selected_version` | Release, Selected version | Version, Live version |
| `common.current_node`, `playbooks.workflow_run_form.node_history` | Current Node, Node History | Current Step, Step history |
| `knowledge.resource.source`, `knowledge.resource.sources` | Knowledge source, Knowledge sources | Source, Sources |
| `knowledge.knowledge_sources_table.chunks` | Chunks | Text sections |
| `agents.bot_form.agent_control_center` | Agent Control Center | Agent |
| `widget.error_area_not_allowed`, `widget.error_area_auth_required`, `widget.error_area_forbidden` | ... current area; ... access this chat area; ... use this chat area | This chatbot is not available here.; Please sign in to use this chat.; You are signed in, but you are not allowed to use this chat. |
| `widget.error_input_limit` | ... this bot's input limit ... | ... this chatbot's input limit ... |
| `widget.activity_notice_unknown` | A step has an unknown outcome. ... | A step has an unverified result. ... |

More than 300 English values changed in total, mostly Playbook to Workflow in sentences, Data Resource to app data tool, and connector to API connection. German is now consistently "du" (the setup checks and runtime messages used "Sie"), declines "Agent" as "den Agenten", uses "Tool" instead of "Werkzeug" and "Fähigkeit", and "Verbindung" instead of "Connector". French uses "connexion" and "outil"; Spanish is consistently "tú" and uses "herramienta" and "conexión". A few admin-visible texts that are not translated (setup check details, diagnostics titles, the "Workflow runs" label of the authorization messages) also say Workflow and API connection now.

The visitor-facing outcome text of a Workflow now says "Workflow" instead of "Playbook" (for example "The Workflow completed." instead of "The Playbook completed.", also in German, French and Spanish). It is stored with the assistant message and returned as `content` by the read API, so messages created before the upgrade keep the old wording and integrations that match on the exact text must accept both.

The Workflow editor now uses the same glossary. In `playbooks.php`, the editor groups `issues`, `operation_paths`, `editor_fixes`, `handles_*`, `workflow_editor_*`, `workflow_node_inspection`, `workflow_validation_issue`, `workflow_authoring_validator`, `workflow_json_validator` and `workflow_generation` keep their keys. For example, `workflow_validation_issue.duplicate_node_ids` changes from "Duplicate node IDs" to "Duplicate step IDs", `duplicate_edge_ids` from "Duplicate edge IDs" to "Duplicate path IDs", and `approval_required_before_write` from "Approval required before write" to "Confirmation required before write".

In `workflow-editor.php`, `texts` keys are the English source strings used by TypeScript. Move overrides from each old key to its new key in the table below in every overridden locale. Several old keys now share a single Data or Tool label; merge those overrides. There are no old-key aliases. Keys received from the server stay unchanged: for example `texts.Request approval` now displays "Request confirmation" (Bestätigung anfordern, Demander une confirmation, Solicitar confirmación). Runtime fields such as `nodes`, `edges`, `variables`, `outputVariable`, `area` and `capability` keep their names and values.

Version-diff counts now translate the source strings `step added`, `steps added`, `step updated`, `steps updated`, `step removed`, `steps removed`, `step changed`, `steps changed`, `path added`, `paths added`, `path removed`, `paths removed`, `path changed` and `paths changed`. Hosts that supplied their own `node added`, `nodes updated`, `link removed` or similar overrides for these previously uncatalogued strings must move them to the corresponding Step or Path keys.

<details>
<summary>Renamed editor source-string keys and their TypeScript call sites</summary>

| Old source key | New source key | TypeScript call sites under `resources/js/workflow-editor/src/` |
| --- | --- | --- |
| `1 setup area` | `1 setup section` | `readinessCopy.ts` |
| `:count connections moved to :path.` | `:count paths moved to :path.` | `store/workflowCommands.ts` |
| `:count connections were removed because their paths no longer exist on this step.` | `:count paths were removed because they no longer exist on this step.` | `store/workflowCommands.ts` |
| `:count edges` | `:count paths` | `components/sidebar/GeneratePanel.tsx` |
| `:count nodes` | `:count steps` | `components/sidebar/GeneratePanel.tsx` |
| `:count open run(s) remain pinned to an earlier immutable deployment` | `:count open run(s) remain pinned to an earlier Version` | `components/ReleasesPanel.tsx` |
| `:count open run(s) use the current published deployment` | `:count open run(s) use the current published Version` | `components/ReleasesPanel.tsx` |
| `:count operation input(s) still need a value.` | `:count tool input(s) still need a value.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `:count setup areas` | `:count setup sections` | `readinessCopy.ts` |
| `:field is already limited by this Data Resource.` | `:field is already limited by this app data tool.` | `components/settings-panel/node-fields/action-fields/QueryDataResourceFields.tsx` |
| `:method cannot be tested here. Use a confirmed Playbook test.` | `:method cannot be tested here. Use a confirmed Workflow test.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `:step writes Playbook memory.` | `:step writes Workflow memory.` | `hooks/useWorkflowActions.ts` |
| `A Playbook has only one start step.` | `A Workflow has only one start step.` | `semantic/semanticValidation.ts` |
| `A request is listed as an example and as not for this Playbook.` | `A request is listed as an example and as not for this Workflow.` | `semantic/semanticValidation.ts` |
| `Add a request this Playbook is not for.` | `Add a request this Workflow is not for.` | `semantic/semanticValidation.ts` |
| `Add the approval question.` | `Add the confirmation question.` | `nodeValidation.ts`, `workflowIssueRepairs.ts` |
| `Add what to send into the other Playbook.` | `Add what to send into the other Workflow.` | `nodeValidation.ts` |
| `Adding steps needs a schema v2 Playbook.` | `Adding steps needs a schema v2 Workflow.` | `semantic/semanticWorkflowBuilder.ts` |
| `Additional saved values when the Playbook collected them.` | `Additional data when the Workflow collected it.` | `components/settings-panel/node-fields/ActionNodeFields.tsx` |
| `Allowed Data Resources` | `Allowed app data tools` | `components/settings-panel/node-fields/action-fields/QueryDataResourceFields.tsx` |
| `Approve` | `Confirm` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Approved` | `Confirmed` | `components/SemanticWorkflowNode.tsx` |
| `Approved Data Resources` | `Approved app data tools` | `hooks/useWorkflowActions.ts` |
| `Approved knowledge sources` | `Approved Sources` | `hooks/useWorkflowActions.ts` |
| `Back to Playbooks` | `Back to Workflows` | `components/ErrorBoundary.tsx`, `components/WorkbenchHeader.tsx` |
| `Batch map ":label" requires an item body connection.` | `Batch map ":label" requires an item body path.` | `hooks/useWorkflowActions.ts` |
| `Built-in operation` | `Built-in tool` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Built-in variables` | `Built-in data` | `components/settings-panel/primitives.tsx` |
| `Calculate or compare saved values` | `Calculate or compare data` | `nodeCatalog.ts` |
| `Call an approved API or backend operation` | `Call an approved API or backend tool` | `nodeCatalog.ts`, `nodeCatalog.ts` |
| `Cancelled before the Playbook completed.` | `Cancelled before the Workflow completed.` | `components/ExecutionsPanel.tsx` |
| `Capabilities` | `Tools` | `components/sidebar/GeneratePanel.tsx` |
| `Capability` | `Tool` | `components/SettingsPanel.tsx`, `semantic/semanticStepPresentation.ts`, `semantic/semanticStepPresentation.ts` |
| `Changes in Playbook :workflow` | `Changes in Workflow :workflow` | `hooks/useWorkflowActions.ts` |
| `Check later steps when you replace this operation.` | `Check later steps when you replace this tool.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Check the runtime setup before inspecting Playbook steps.` | `Check the runtime setup before inspecting Workflow steps.` | `utils/runtimeDiagnostics.ts` |
| `Check the unavailable sources. Only original outputs can be returned.` | `Check the unavailable sources. Only original data can be returned.` | `components/settings-panel/VerifiedResultEditor.tsx` |
| `Choose Yes or No, or use a variable.` | `Choose Yes or No, or use data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `Choose a Playbook file or paste its content. It replaces the current draft.` | `Choose a Workflow file or paste its content. It replaces the current draft.` | `components/sidebar/PublishControls.tsx` |
| `Choose a capability result field` | `Choose a tool result field` | `components/settings-panel/VerifiedResultEditor.tsx` |
| `Choose a path from a deterministic condition or saved value.` | `Choose a path from a deterministic condition or data.` | `semantic/semanticCatalog.ts` |
| `Choose a published API operation before running a live test.` | `Choose a published API tool before running a live test.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `Choose a published API operation to inspect and test it.` | `Choose a published API tool to inspect and test it.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `Choose a published API operation.` | `Choose a published API tool.` | `nodeValidation.ts` |
| `Choose a published API or MCP operation` | `Choose a published API or MCP tool` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Choose a published Playbook` | `Choose a published Workflow` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Choose a published reusable Playbook owned by this Agent.` | `Choose a published reusable Workflow owned by this Agent.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Choose an Agent to test and use this Playbook.` | `Choose an Agent to test and use this Workflow.` | `problems/problemList.ts` |
| `Choose another Playbook to run.` | `Choose another Workflow to run.` | `nodeValidation.ts` |
| `Choose data resource` | `Choose app data tool` | `nodeCardPresentation.ts` |
| `Choose node to insert` | `Choose step to insert` | `components/DeletableEdge.tsx` |
| `Choose one of the declared values or use a variable.` | `Choose one of the declared values or use data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `Choose operation` | `Choose tool` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Choose the data resource to query.` | `Choose the app data tool to query.` | `nodeValidation.ts` |
| `Choose the published operation again before publishing.` | `Choose the published tool again before publishing.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx`, `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Choose the published operation this step may execute.` | `Choose the published tool this step may execute.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Choose the saved value that decides the path.` | `Choose the data that decides the path.` | `nodeValidation.ts` |
| `Choose where to remember the Playbook result.` | `Choose where to remember the Workflow result.` | `nodeValidation.ts` |
| `Choose which capability results to return.` | `Choose which tool results to return.` | `components/settings-panel/VerifiedResultEditor.tsx` |
| `Clear operation` | `Clear tool` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Collection variable` | `Collection data` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Compares saved values exactly; no guessing by AI.` | `Compares data exactly; no guessing by AI.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Configured Playbook variable` | `Configured Workflow data` | `components/settings-panel/node-fields/ActionNodeFields.tsx` |
| `Connect a capability before this Result. Name each output uniquely.` | `Connect a tool before this Result. Give each data item a unique name.` | `components/settings-panel/VerifiedResultEditor.tsx` |
| `Connect the :branch output before publishing.` | `Connect the :branch path before publishing.` | `workflowIssuePresentation.ts` |
| `Connector` | `Connection` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `Could not insert this Playbook step` | `Could not insert this Workflow step` | `components/DeletableEdge.tsx` |
| `Create Data Resource` | `Create app data tool` | `components/ProblemFixControl.tsx`, `components/ProblemFixControl.tsx`, `problems/problemList.ts` |
| `Create or import a Playbook before adding notes.` | `Create or import a Workflow before adding notes.` | `store/authoringActions.ts`, `store/authoringActions.ts` |
| `Create or import a Playbook before adding process steps.` | `Create or import a Workflow before adding process steps.` | `App.tsx` |
| `Create or import a schema v2 Playbook before adding steps.` | `Create or import a schema v2 Workflow before adding steps.` | `components/DeletableEdge.tsx` |
| `Current node` | `Current step` | `components/ExecutionsPanel.tsx` |
| `Current release` | `Current version` | `components/ReleasesPanel.tsx` |
| `Data resource` | `App data tool` | `nodeCardPresentation.ts` |
| `Default fields are the recommended fields of the Data Resource.` | `Default fields are the recommended fields of the app data tool.` | `components/settings-panel/node-fields/action-fields/QueryDataResourceFields.tsx` |
| `Defines what this step may read for this Playbook version.` | `Defines what this step may read for this Workflow version.` | `components/settings-panel/node-fields/action-fields/DataResourceContractSummary.tsx` |
| `Delete Playbook` | `Delete Workflow` | `utils/headerMenu.ts` |
| `Deployment details` | `Version details` | `components/ReleasesPanel.tsx` |
| `Do not use this when the Playbook collects email in chat.` | `Do not use this when the Workflow collects email in chat.` | `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Do not use this when the Playbook collects phone numbers.` | `Do not use this when the Workflow collects phone numbers.` | `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Document the canvas without changing Playbook execution.` | `Document the canvas without changing Workflow execution.` | `semantic/semanticCatalog.ts` |
| `Download Playbook file` | `Download Workflow file` | `utils/headerMenu.ts` |
| `Draft changes are not live. Publish the Playbook, then the Agent.` | `Draft changes are not live. Publish the Workflow, then the Agent.` | `components/ReleasesPanel.tsx` |
| `Drag from the :branch output of :step to the next step.` | `Drag from the :branch path of :step to the next step.` | `workflowIssuePresentation.ts` |
| `Drag its right edge to edit Playbook settings.` | `Drag its right border to edit Workflow settings.` | `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Each saved value maps to one output. No match has its own output.` | `Each saved value leads to one path. No match has its own path.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Enter a JSON list, for example [1, 2], or use a variable.` | `Enter a JSON list, for example [1, 2], or use data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `Enter a JSON object or use a variable.` | `Enter a JSON object or use data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `Enter a number or use a variable.` | `Enter a number or use data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `Enter a whole number or use a variable.` | `Enter a whole number or use data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `Enter text or use a variable.` | `Enter text or use data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `Every route needs a saved result from an earlier step.` | `Every route needs data from an earlier step.` | `workflowIssuePresentation.ts` |
| `Find passages in the knowledge sources` | `Find passages in the Sources` | `nodeCatalog.ts` |
| `Fix the JSON before publishing this Playbook.` | `Fix the JSON before publishing this Workflow.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Fix the input JSON before using guided operation inputs:` | `Fix the input JSON before using guided tool inputs:` | `components/settings-panel/node-fields/ApiOperationInputs.tsx` |
| `Form field names must use variable-safe names.` | `Form field names must work as data names.` | `nodeValidation.ts` |
| `Format or convert a saved value` | `Format or convert data` | `nodeCatalog.ts` |
| `HTTP capability` | `API tool` | `components/SettingsPanel.tsx`, `components/settings-panel/SemanticStepEditors.tsx`, `semantic/semanticStepPresentation.ts` |
| `How should this Playbook start?` | `How should this Workflow start?` | `components/PlaybookStartState.tsx` |
| `Import Playbook file` | `Import Workflow file` | `components/sidebar/PublishControls.tsx`, `utils/headerMenu.ts` |
| `Index variable` | `Index data` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Input / output` | `Step data` | `components/ExecutionsPanel.tsx` |
| `Input variable` | `Input data` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Insert node here` | `Insert step here` | `components/DeletableEdge.tsx` |
| `Insert variable` | `Insert data` | `components/settings-panel/primitives.tsx`, `components/settings-panel/primitives.tsx`, `components/settings-panel/primitives.tsx` |
| `Item variable` | `Item data` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Join ":label" requires at least two incoming connections.` | `Join ":label" requires at least two incoming paths.` | `hooks/useWorkflowActions.ts` |
| `Looks up an order. Needs your orders Data Resource.` | `Looks up an order. Needs your orders app data tool.` | `utils/playbookStarters.ts` |
| `Map Playbook values to the inputs of the operation.` | `Map Workflow data to the tool inputs.` | `components/settings-panel/node-fields/ApiOperationInputs.tsx` |
| `Map Playbook variables into the saved record.` | `Map Workflow data into the saved record.` | `components/settings-panel/node-fields/ActionNodeFields.tsx` |
| `Map variables to inputs when the simple controls are not enough.` | `Map data to inputs when the simple controls are not enough.` | `components/settings-panel/node-fields/ActionNodeFields.tsx` |
| `Name in Playbook` | `Name in Workflow` | `components/settings-panel/SemanticStepPanel.tsx` |
| `No Playbook runs recorded yet.` | `No Workflow runs recorded yet.` | `components/ExecutionsPanel.tsx` |
| `No Playbook variables changed for this sample.` | `No Workflow data changed for this sample.` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `No details yet. The Playbook starts without asking.` | `No details yet. The Workflow starts without asking.` | `components/settings-panel/EntryInputsEditor.tsx` |
| `No matching variables` | `No matching data` | `components/settings-panel/primitives.tsx` |
| `No node history recorded.` | `No step history recorded.` | `components/ExecutionsPanel.tsx` |
| `No result variable configured yet.` | `No result data configured yet.` | `components/settings-panel/node-fields/ActionNodeFields.tsx` |
| `No variables match this search.` | `No data matches this search.` | `components/Sidebar.tsx` |
| `No variables yet. Add details on Entry or steps that save a result.` | `No data yet. Add details on Entry or on steps that save a result.` | `components/Sidebar.tsx` |
| `Node ":label" has a branch connection without a branch handle.` | `Step ":label" has a branch path without a branch handle.` | `hooks/useWorkflowActions.ts` |
| `Node ":label" has an unknown recovery output.` | `Step ":label" has an unknown recovery path.` | `hooks/useWorkflowActions.ts` |
| `Node ":label" has multiple connections on its ":route" output.` | `Step ":label" has several paths on its ":route" exit.` | `hooks/useWorkflowActions.ts` |
| `Node ":label" has multiple connections on the same branch handle.` | `Step ":label" has several paths on the same branch handle.` | `hooks/useWorkflowActions.ts` |
| `Node ":label" has no outgoing connection.` | `Step ":label" has no outgoing path.` | `hooks/useWorkflowActions.ts` |
| `Node ":label" has several outgoing connections.` | `Step ":label" has several outgoing paths.` | `hooks/useWorkflowActions.ts` |
| `Node ":label" is not connected to the Trigger and never runs.` | `Step ":label" is not connected to the Entry step and never runs.` | `hooks/useWorkflowActions.ts` |
| `Node ":label" needs a next step or an explicit End node.` | `Step ":label" needs a next step or an explicit End step.` | `hooks/useWorkflowActions.ts` |
| `Node ":label" needs a success connection; the error path is optional.` | `Step ":label" needs a success path; the error path is optional.` | `hooks/useWorkflowActions.ts` |
| `Node ":label": :message` | `Step ":label": :message` | `hooks/useWorkflowActions.ts` |
| `Node ":label": Choose a published API operation.` | `Step ":label": Choose a published API tool.` | `hooks/useWorkflowActions.ts` |
| `Node ":label": Choose the operation again to refresh its contract.` | `Step ":label": Choose the tool again to refresh its contract.` | `hooks/useWorkflowActions.ts` |
| `Node ":label": Choose the operation again to refresh its schema.` | `Step ":label": Choose the tool again to refresh its schema.` | `hooks/useWorkflowActions.ts` |
| `Node run completed` | `Step run completed` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `Node settings` | `Step settings` | `App.tsx` |
| `One connection moved to :path.` | `One path moved to :path.` | `store/workflowCommands.ts` |
| `One connection was removed because its path no longer exists on this step.` | `One path was removed because it no longer exists on this step.` | `store/workflowCommands.ts` |
| `Only map inputs declared by the selected operation capability.` | `Only map inputs declared by the selected tool.` | `components/settings-panel/node-fields/ApiOperationInputs.tsx` |
| `Only this Playbook run` | `Only this Workflow run` | `components/settings-panel/primitives.tsx` |
| `Open node settings` | `Open step settings` | `App.tsx` |
| `Operation` | `Tool` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Operation contract unavailable` | `Tool contract unavailable` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Operation input JSON` | `Tool input JSON` | `components/settings-panel/node-fields/ApiOperationInputs.tsx` |
| `Operation input contract unavailable` | `Tool input contract unavailable` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Operation inputs` | `Tool inputs` | `components/settings-panel/node-fields/ApiOperationInputs.tsx`, `nodeValidation.ts` |
| `Operation inputs changed` | `Tool inputs changed` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Operation inputs need repair` | `Tool inputs need repair` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Operation options` | `Tool options` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Operation source` | `Tool source` | `components/settings-panel/SemanticStepPanel.tsx` |
| `Operations` | `Tools` | `nodeCatalog.ts` |
| `Optional execution details for this Playbook step.` | `Optional execution details for this Workflow step.` | `components/settings-panel/SemanticStepPanel.tsx` |
| `Optional output schema` | `Optional data schema` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Optional technical variable for later internal steps.` | `Optional technical data for later internal steps.` | `components/settings-panel/node-fields/ActionNodeFields.tsx` |
| `Optional value or variable` | `Optional value or data` | `components/settings-panel/node-fields/ActionNodeFields.tsx` |
| `Output` | `Data` | `components/ExecutionsPanel.tsx`, `components/runs/WorkflowRunsControl.tsx`, `components/settings-panel/NodeInspectionPreview.tsx` |
| `Output after` | `Data after` | `components/ExecutionsPanel.tsx` |
| `Output before` | `Data before` | `components/ExecutionsPanel.tsx` |
| `Output schema` | `Data schema` | `nodeValidation.ts` |
| `Output value` | `Data value` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `Output variable` | `Data` | `components/settings-panel/NodeInspectionPreview.tsx`, `components/settings-panel/SemanticStepEditors.tsx` |
| `Output variables` | `Data` | `components/settings-panel/node-fields/action-fields/FormatRecordsFields.tsx` |
| `Pinned operation unavailable` | `Pinned tool unavailable` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Playbook` | `Workflow` | `utils/headerMenu.ts` |
| `Playbook check` | `Workflow check` | `checkIssueGroups.ts`, `workflowIssuePresentation.ts` |
| `Playbook contains duplicate step id ":id".` | `Workflow contains duplicate step id ":id".` | `semantic/semanticValidation.ts` |
| `Playbook contains duplicate transition id ":id".` | `Workflow contains duplicate transition id ":id".` | `semantic/semanticValidation.ts` |
| `Playbook editor navigation` | `Workflow editor navigation` | `App.tsx` |
| `Playbook editor sections` | `Workflow editor sections` | `components/sidebar/PlaybookRail.tsx` |
| `Playbook editor unavailable` | `Workflow editor unavailable` | `components/ErrorBoundary.tsx` |
| `Playbook execution failed.` | `Workflow execution failed.` | `testResponse.ts`, `utils/runtimeDiagnostics.ts` |
| `Playbook has no Entry step. Add one to start.` | `Workflow has no Entry step. Add one to start.` | `hooks/useWorkflowActions.ts` |
| `Playbook memory` | `Workflow memory` | `components/ExecutionsPanel.tsx` |
| `Playbook memory:` | `Workflow memory:` | `components/ExecutionsPanel.tsx` |
| `Playbook must have exactly one Entry step.` | `Workflow must have exactly one Entry step.` | `hooks/useWorkflowActions.ts` |
| `Playbook name` | `Workflow name` | `components/WorkbenchHeader.tsx`, `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Playbook output` | `Workflow data` | `components/Sidebar.tsx` |
| `Playbook outputs` | `Workflow data` | `components/Sidebar.tsx` |
| `Playbook paused and is waiting for input.` | `Workflow paused and is waiting for input.` | `testResponse.ts` |
| `Playbook payload is not a valid semantic authoring document.` | `Workflow payload is not a valid semantic authoring document.` | `semantic/semanticValidation.ts` |
| `Playbook preview card image` | `Workflow preview card image` | `components/TestChatPanel.tsx` |
| `Playbook preview image` | `Workflow preview image` | `components/TestChatPanel.tsx` |
| `Playbook required` | `Workflow required` | `App.tsx`, `store/authoringActions.ts` |
| `Playbook run failed` | `Workflow run failed` | `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts` |
| `Playbook runs` | `Workflow runs` | `utils/headerMenu.ts` |
| `Playbook settings` | `Workflow settings` | `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Playbook step` | `Workflow step` | `components/SemanticWorkflowNode.tsx`, `components/SettingsPanel.tsx`, `hooks/useWorkflowActions.ts`, `hooks/useWorkflowActions.ts`, `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts` |
| `Playbook steps` | `Workflow steps` | `components/StepListView.tsx` |
| `Playbook test failed` | `Workflow test failed` | `utils/runtimeDiagnostics.ts` |
| `Playbook tools` | `Workflow tools` | `components/Sidebar.tsx` |
| `Previously selected Playbook is unavailable` | `Previously selected Workflow is unavailable` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Publish Playbook first` | `Publish Workflow first` | `components/ReleasesPanel.tsx` |
| `Publish a reusable Playbook for this Agent before selecting it here.` | `Publish a reusable Workflow for this Agent before selecting it here.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Publish an API operation for this Agent, then reload.` | `Publish an API tool for this Agent, then reload.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Publish an API operation or check its Agent, then refresh.` | `Publish an API tool or check its Agent, then refresh.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Publish this Playbook` | `Publish this Workflow` | `components/ReleasesPanel.tsx` |
| `Published API operation` | `Published API tool` | `components/settings-panel/NodeInspectionTools.tsx` |
| `Published API operation changed` | `Published API tool changed` | `hooks/useWorkflowActions.ts` |
| `Published API operation not selected` | `Published API tool not selected` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Published API operation unavailable` | `Published API tool unavailable` | `hooks/useWorkflowActions.ts` |
| `Published API or MCP operation` | `Published API or MCP tool` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Published Playbook` | `Published Workflow` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Published operation changed` | `Published tool changed` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Published output contract` | `Published data contract` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Published versions of this Playbook.` | `Published versions of this Workflow.` | `components/Sidebar.tsx` |
| `Publishing pins the exact child deployment and dependency closure.` | `Publishing pins the exact child Version and everything it depends on.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Publishing requires the latest Playbook release-control migrations.` | `Publishing requires the latest Workflow migrations.` | `hooks/useWorkflowActions.ts` |
| `Read operation test` | `Read tool test` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `Read records from a Data Resource` | `Read records from an app data tool` | `nodeCatalog.ts` |
| `Rebind operation` | `Rebind tool` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Redacted mapped output preview` | `Redacted mapped data preview` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `Refresh operation contract` | `Refresh tool contract` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx`, `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Reject HTTP and HTTPS links before the Playbook starts.` | `Reject HTTP and HTTPS links before the Workflow starts.` | `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Reload and choose the API operation again for its contract.` | `Reload and choose the API tool again for its contract.` | `nodeValidation.ts` |
| `Reload and choose the API operation again for its schema.` | `Reload and choose the API tool again for its schema.` | `nodeValidation.ts` |
| `Remove connection` | `Remove path` | `hooks/useWorkflowActions.ts`, `problems/problemList.ts` |
| `Remove extra connection` | `Remove extra path` | `semantic/semanticIssueMapping.ts` |
| `Rename Playbook` | `Rename Workflow` | `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Request, sign-in and response come from the operation.` | `Request, sign-in and response come from the tool.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Requests that should not start this Playbook` | `Requests that should not start this Workflow` | `components/sidebar/InvocationPanel.tsx` |
| `Reserved Playbook entry ids cannot be reused.` | `Reserved Workflow entry ids cannot be reused.` | `semantic/semanticValidation.ts` |
| `Restore v:version as the current Playbook release` | `Make v:version the current Workflow version` | `components/ReleasesPanel.tsx` |
| `Return selected, verified capability fields as the process outcome.` | `Return selected, verified tool fields as the Workflow outcome.` | `semantic/semanticCatalog.ts` |
| `Review the run trace and the stopped node configuration.` | `Review the run trace and the stopped step configuration.` | `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts` |
| `Run Node` | `Run Step` | `components/settings-panel/NodeInspectionTools.tsx` |
| `Run Playbook :workflow.` | `Run Workflow :workflow.` | `hooks/useWorkflowActions.ts` |
| `Run a pinned child Playbook for each item.` | `Run a pinned child Workflow for each item.` | `components/edgeInsertSuggestions.ts` |
| `Run another published Playbook` | `Run another published Workflow` | `nodeCatalog.ts` |
| `Run one approved backend, API, data or memory operation.` | `Run one approved backend, API, data or memory tool.` | `semantic/semanticCatalog.ts` |
| `Run one exact published child Playbook and continue with its result.` | `Run one exact published child Workflow and continue with its result.` | `semantic/semanticCatalog.ts` |
| `Run operation` | `Run tool` | `nodeCatalog.ts`, `semantic/semanticCatalog.ts` |
| `Run the host app migrations for the Playbook tables.` | `Run the host app migrations for the Workflow tables.` | `utils/runtimeDiagnostics.ts` |
| `Runs the read operation and shows a shortened, redacted result.` | `Runs the read tool and shows a shortened, redacted result.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `Saved details` | `Data` | `components/Sidebar.tsx`, `utils/headerMenu.ts` |
| `Saved results` | `Data` | `components/settings-panel/primitives.tsx` |
| `Say what this Playbook does.` | `Say what this Workflow does.` | `semantic/semanticValidation.ts` |
| `Say when the Agent should start this Playbook.` | `Say when the Agent should start this Workflow.` | `semantic/semanticValidation.ts` |
| `Schema v2 Playbook required` | `Schema v2 Workflow required` | `components/DeletableEdge.tsx`, `hooks/useWorkflowActions.ts` |
| `Search approved knowledge sources.` | `Search approved Sources.` | `hooks/useWorkflowActions.ts` |
| `Search fields or capabilities` | `Search fields or tools` | `components/settings-panel/VerifiedResultEditor.tsx` |
| `Search variables` | `Search data` | `components/Sidebar.tsx`, `components/settings-panel/primitives.tsx` |
| `Search variables…` | `Search data…` | `components/Sidebar.tsx`, `components/settings-panel/primitives.tsx` |
| `Select a Playbook step on the canvas to configure it.` | `Select a Workflow step on the canvas to configure it.` | `components/SettingsPanel.tsx` |
| `Select a Playbook step to inspect its settings.` | `Select a Workflow step to inspect its settings.` | `components/SettingsPanel.tsx` |
| `Send a message to start this Playbook.` | `Send a message to start this Workflow.` | `components/TestChatPanel.tsx` |
| `Showing the latest 50 Playbook runs` | `Showing the latest 50 Workflow runs` | `components/ExecutionsPanel.tsx` |
| `Similar requests that are not for this Playbook, one per line.` | `Similar requests that are not for this Workflow, one per line.` | `components/sidebar/InvocationPanel.tsx` |
| `Start of the Playbook` | `Start of the Workflow` | `nodeCatalog.ts` |
| `Status variable` | `Status data` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Step :step has an invalid operation Path. Pending and unverified outcomes cannot use Done.` | `Step :step has an invalid tool Path. Pending and unverified outcomes cannot use Done.` | `semantic/semanticTransitionPolicy.ts` |
| `Sub-Playbook` | `Sub-Workflow` | `components/settings-panel/SemanticStepEditors.tsx`, `nodeCatalog.ts`, `semantic/semanticCatalog.ts` |
| `Test Read Operation` | `Test Read Tool` | `components/settings-panel/NodeInspectionTools.tsx` |
| `The Agent asks for these before the Playbook starts.` | `The Agent asks for these before the Workflow starts.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `The Playbook always asks this question.` | `The Workflow always asks this question.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `The Playbook could not be loaded. The editor needs schema v2 JSON.` | `The Workflow could not be loaded. The editor needs schema v2 JSON.` | `hooks/useWorkflowEvents.ts` |
| `The Playbook could not start: a database table is missing.` | `The Workflow could not start: a database table is missing.` | `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts` |
| `The Playbook failed before a step could finish: :reason` | `The Workflow failed before a step could finish: :reason` | `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts` |
| `The Playbook failed before a step-level error was reported.` | `The Workflow failed before a step-level error was reported.` | `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts` |
| `The Playbook needs a start step.` | `The Workflow needs a start step.` | `semantic/semanticValidation.ts` |
| `The Playbook stopped at :node during the test run.` | `The Workflow stopped at :node during the test run.` | `components/RuntimeIssuesPanel.tsx`, `utils/runtimeDiagnostics.ts`, `utils/runtimeDiagnostics.ts` |
| `The Playbook stopped during the test; no step diagnostic came back.` | `The Workflow stopped during the test; no step diagnostic came back.` | `utils/runtimeDiagnostics.ts` |
| `The operation and required inputs are configured.` | `The tool and required inputs are configured.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `The operation changed. Choose it again before publishing.` | `The tool changed. Choose it again before publishing.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `The operation changed. Choose it again before testing.` | `The tool changed. Choose it again before testing.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `The operation contract is incomplete. Choose it again before testing.` | `The tool contract is incomplete. Choose it again before testing.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `The operation inputs changed. Choose the operation again.` | `The tool inputs changed. Choose the tool again.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `The operation is no longer available. Choose it again before testing.` | `The tool is no longer available. Choose it again before testing.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `The operation is outdated. Choose it again before testing.` | `The tool is outdated. Choose it again before testing.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `The operation schema is incomplete. Choose it again before testing.` | `The tool schema is incomplete. Choose it again before testing.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `The pinned read operation completed through the connector runtime.` | `The pinned read completed through the API tool.` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `The pinned read operation did not complete successfully.` | `The pinned read tool did not complete successfully.` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `The run stopped before any Playbook step started.` | `The run stopped before any Workflow step started.` | `components/RuntimeIssuesPanel.tsx` |
| `The runtime still enforces capability policy and confirmation rules.` | `The runtime still enforces tool policy and confirmation rules.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `The selected data resource does not define any field metadata.` | `The selected app data tool does not define any field metadata.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `The service address. Variables like {{input}} are allowed.` | `The service address. Data like {{input}} is allowed.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `The single immutable entry into this Playbook.` | `The single immutable entry into this Workflow.` | `semantic/semanticCatalog.ts` |
| `The test chat runs with the Agent that uses this Playbook.` | `The test chat runs with the Agent that uses this Workflow.` | `components/TestChatPanel.tsx` |
| `The visitor asks a question the knowledge sources answer.` | `The visitor asks a question the Sources answer.` | `utils/playbookStarters.ts` |
| `The visitor confirms before the Playbook continues.` | `The visitor confirms before the Workflow continues.` | `semantic/semanticCatalog.ts` |
| `This API operation does not require Playbook inputs.` | `This API tool does not require Workflow inputs.` | `components/settings-panel/node-fields/ApiOperationInputs.tsx` |
| `This API operation is unavailable. Choose another one.` | `This API tool is unavailable. Choose another one.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `This Data Resource is not approved. Approve it or choose another.` | `This app data tool is not approved. Approve it or choose another.` | `components/settings-panel/node-fields/action-fields/QueryDataResourceFields.tsx` |
| `This Playbook does not change application data or memory.` | `This Workflow does not change application data or memory.` | `hooks/useWorkflowActions.ts` |
| `This Playbook does not read app data, service data, or memory.` | `This Workflow does not read app data, service data, or memory.` | `hooks/useWorkflowActions.ts` |
| `This Playbook is no longer available. Choose another one.` | `This Workflow is no longer available. Choose another one.` | `components/settings-panel/SemanticStepEditors.tsx` |
| `This Playbook uses an older format. Import or create a new one.` | `This Workflow uses an older format. Import or create a new one.` | `hooks/useWorkflowActions.ts` |
| `This editor accepts only schema v2 Playbook steps.` | `This editor accepts only schema v2 Workflow steps.` | `components/SettingsPanel.tsx` |
| `This editor requires a schema v2 Playbook before adding notes.` | `This editor requires a schema v2 Workflow before adding notes.` | `semantic/semanticWorkflowBuilder.ts` |
| `This number is too large to enter exactly. Use a variable.` | `This number is too large to enter exactly. Use data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `This operation cannot be verified. Reload or repair it.` | `This tool cannot be verified. Reload or repair it.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `This operation cannot be verified. Reload or republish it.` | `This tool cannot be verified. Reload or republish it.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `This step uses the published operation shown above.` | `This step uses the published tool shown above.` | `components/settings-panel/node-fields/IntegrationNodeFields.tsx` |
| `Too many outgoing connections` | `Too many outgoing paths` | `hooks/useWorkflowActions.ts` |
| `Unsupported Playbook format` | `Unsupported Workflow format` | `hooks/useWorkflowActions.ts`, `hooks/useWorkflowActions.ts`, `hooks/useWorkflowEvents.ts`, `hooks/useWorkflowInit.ts` |
| `Untitled Playbook` | `Untitled Workflow` | `App.tsx`, `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Use null or a variable.` | `Use null or data.` | `components/settings-panel/node-fields/apiOperationInputValues.ts` |
| `Use static form fields before publishing this node.` | `Use static form fields before publishing this step.` | `nodeValidation.ts` |
| `Use the previous message as the approval prompt` | `Use the previous message as the confirmation prompt` | `components/settings-panel/SemanticStepEditors.tsx` |
| `Used in the editor and Playbook lists.` | `Used in the editor and Workflow lists.` | `components/sidebar/PlaybookSettingsPanel.tsx` |
| `Value or variable` | `Value or data` | `components/settings-panel/node-fields/ActionNodeFields.tsx`, `components/settings-panel/node-fields/ApiOperationInputControl.tsx`, `components/settings-panel/node-fields/action-fields/QueryDataResourceFields.tsx` |
| `Variable` | `Data` | `components/settings-panel/primitives.tsx` |
| `Variable changes` | `Data changes` | `components/settings-panel/NodeInspectionPreview.tsx` |
| `Variable name for the formatted reply in later steps.` | `Data name for the formatted reply in later steps.` | `components/settings-panel/node-fields/action-fields/FormatRecordsFields.tsx` |
| `Variables` | `Data` | `components/ExecutionsPanel.tsx`, `components/ExecutionsPanel.tsx`, `components/Sidebar.tsx` |
| `Variables before step` | `Data before step` | `components/ExecutionsPanel.tsx` |
| `Variables changed` | `Data changed` | `components/ExecutionsPanel.tsx` |
| `Variables exposed for follow-up Reply nodes.` | `Data available to follow-up Reply steps.` | `components/settings-panel/node-fields/action-fields/FormatRecordsFields.tsx` |
| `Variables snapshot` | `Data snapshot` | `components/ExecutionsPanel.tsx` |
| `Waiting for the Playbook to receive the next input.` | `Waiting for the Workflow to receive the next input.` | `components/ExecutionsPanel.tsx` |
| `What does this Playbook do?` | `What does this Workflow do?` | `components/sidebar/InvocationPanel.tsx` |
| `What this Playbook does and when the Agent starts it.` | `What this Workflow does and when the Agent starts it.` | `components/Sidebar.tsx` |
| `Write operations cannot be dry-run here. Test with confirmation.` | `Write tools cannot be dry-run here. Test with confirmation.` | `components/settings-panel/NodeInspectionTools.tsx` |
| `choose approved capability` | `choose approved tool` | `semantic/semanticStepPresentation.ts` |
| `choose published API operation` | `choose published API tool` | `semantic/semanticStepPresentation.ts` |
| `choose published Playbook` | `choose published Workflow` | `semantic/semanticStepPresentation.ts` |
| <code>e.g. Can someone call me back?<br>Can you call me back?</code> | <code>e.g. Can someone call me back?<br>Können Sie mich zurückrufen?</code> | `components/sidebar/InvocationPanel.tsx` |
| `Step ":label" has several outgoing paths. Add a Route step.` | `Step ":label" has several outgoing paths. Add a Decision step.` | `semantic/semanticIssueMapping.ts` |
| `link` | `path` | `components/ReleasesPanel.tsx` |
| `links` | `paths` | `components/ReleasesPanel.tsx` |
| `node` | `step` | `components/ExecutionsPanel.tsx`, `components/ReleasesPanel.tsx` |
| `nodes` | `steps` | `components/ReleasesPanel.tsx` |
| `published API operation selected` | `published API tool selected` | `semantic/semanticStepPresentation.ts` |
| `runs Playbook :playbook` | `runs Workflow :playbook` | `semantic/semanticStepPresentation.ts` |
| `variable` | `data` | `nodeCardPresentation.ts` |
| `“:step” is not connected to the Playbook.` | `“:step” is not connected to the Workflow.` | `problems/problemList.ts` |

</details>

### W5.4 optional host read policies

The new **Check host policies for reads** option is off by default; existing
App data tools retain their contracts and behavior. Enable it in Advanced or
set `check_host_policies_for_reads: true` in a config-defined resource, register
a Laravel model policy and configure the W5.6 host actor resolver, then Publish.
`data_resources.policy_candidate_limit` defaults to 200. With the option on,
list results omit `total` and `has_more`; check `policy_filtered_incomplete`
before claiming completeness. Policy source changes require reviewed Workflow
and Agent publication. No existing option or public name is replaced, and no
migration is needed. The read contract is in the App data tools documentation.

### W5.3 visitor write confirmation and identity

App data write pins whose `scope_bindings` use `actor.*`,
`widget_context.actor.*`, `conversation.id` or `conversation.owner_*` must use
`confirmation: visitor`. Existing `confirmation: none` pins are refused at both
proposal and execution with `agent_write_confirmation_policy_invalid`, until
republished. Tenant and access-token bindings retain the ADR 0038 opt-out.

To find affected Agents, inspect the active `AgentDeployment` selected by each
Agent's `active_agent_deployment_id`. In `contract.authority.capabilities`, find
`type: data_resource_write` with `confirmation: none` and an authority-kind
`scope_bindings` entry whose `path` matches the paths above. Open each Agent,
review its App data tools, save the Draft and Publish. Publication forces visitor
confirmation even if `runtime_config.agent.write_confirmation` still contains
an old `false`. Do not edit immutable deployment rows.

**Only the signed-in visitor's records** now binds both `actor.id` and
`actor.type`. The matching `*_type` field is selected automatically when present;
other type fields can be selected under Advanced. Without a type field, configure
exactly one valid type in `context.host_actors.types` (ADR 0057) or explicitly
choose one under Advanced before saving a new tool.
That type is stored as `actor_type` on the ID scope filter and pinned with it;
a different actor type is refused, including the admin playground's Filament user.
Existing tools keep their stored type when the owner field and source are
unchanged, including relabels and disabling **Available to Agents**. Advanced
shows the pinned type read-only. When the host changes or adds configured types,
**Change visitor type** lets an admin explicitly retarget the tool to a currently
configured valid type. Publish affected Agents to activate that new binding.
An actor-ID-scoped write without its type pair now fails validation.
The warning key `data-resources.simple.update_needs_visitor_type` is removed;
translation overrides now use `data-resources.simple.visitor_type_required` and
`data-resources.simple.configure_host_actor_types` for validation failures.

### W5.3 App data tool form

The App data tool form (Connect > Data and the Agent editor's **Add App data tool**) has a Simple section and a collapsed Advanced section. Stored tools are not migrated. Agent, tenant and Custom rules round-trip unchanged; a saved visitor rule must meet the identity-pair requirements above.

- **Whose records?** has no default any more. A new tool must choose **Only the signed-in visitor's records** or **All records**; a table with a `bot_id` column no longer starts with **This Agent's rows**. The Agent, tenant and Custom rules moved to Advanced, and a tool that uses one opens with **Custom (see Advanced)**.
- A visitor rule that names the conversation instead of the signed-in user also opens as **Custom (see Advanced)**.
- **Show**, **Search** and **Write** moved from the per-field table to the lists **Fields to show**, **Searchable fields** and **Fields the Agent may set**. The per-field table in Advanced keeps **Filter**, **Sort**, **Total**, **Group** and **Linked record**. Form state now uses only `shown_fields`, `search_fields` and `writable_fields`; the old per-field `returnable`, `text_search` and `writable` switches no longer decide these choices.
- **Writes** became **Allow changes** (off by default). A tool saved with changes enabled opens with it on.
- The key is generated from the name for new tools and fixed after the first save, as before.
- On SQLite outside `local` and `testing` an active App data tool cannot be saved (the runtime already refused to run it). Turn the tool off or use MySQL, MariaDB or PostgreSQL.
- Translation key changes in `data-resources.setup`: removed `agent_reads`, `data`, `fields`, `owner_column`, `search`, `show`, `write`, `writes`; added the groups `data-resources.simple` and `data-resources.advanced`. Overrides of removed keys have no effect.

### Workflow Runs drawer (W8.3)

`AgentWorkflowRuns` (`src/Filament/Resources/AgentWorkflows/Pages/AgentWorkflowRuns.php`)
and the `AgentWorkflowResource` page name `runs`, route suffix `.runs`, and path
`agent-workflows/{record}/runs` are removed. Replace
`AgentWorkflowResource::getUrl('runs', ['record' => $workflow])` with
`AgentWorkflowResource::getUrl('edit', ['record' => $workflow, 'runs' => 1])`
for editors. Use the edit URL with `run => $run->id` to select a specific run.
Run viewers without editor access continue to use
`WorkflowRunResource::getUrl('view', ['record' => $run])` (`workflow-runs/{record}`),
including incident reconciliation and exports. Package list actions and inspector
breadcrumbs choose these destinations according to current authorization.
The old page-only translation group `playbooks.agent_workflow_runs` is removed.

Editor run observations now also require `workflow_runs.view`, the host's run
scope and a conversation belonging to the Workflow's current Agent. Payload
details require the existing conversation diagnostic access and remain redacted
even with that access. Re-runs always create new simulated preview runs; old
runtime metadata and confirmation authority are never restored. Failure-badge
dismissal uses the existing cache, keyed by user and run. No migration is needed.

`EditAgentWorkflow::useWorkflowRunSample` and
`EditAgentWorkflow::debugWorkflowFromTrace` now also require
`WorkflowEditorRunPrivacy::canDiagnose($run)` for recorded input and Data.
Previously run-view and editor/preview authority alone admitted those actions.
Without diagnostic access they return a translated refusal and no recorded
input or Data. The drawer disables both actions and links each authorized run
to `WorkflowRunResource::getUrl('view', ['record' => $run])` for investigation.
Deleted or unauthorized `?run=<id>` links now leave the editor open without a
selection instead of returning 404.

### For each body Results (W8.7)

In Workflow Drafts, a terminal **Result** (`result`) inside a **For each**
(`forEach`) body is now replaced by implicit **Next item** when its output text
is empty, its status Data uses the defaults (`statusVariable`: `playbook_status`,
`statusValue`: `completed`), and its ownership is unambiguous. Load projects
this conversion; Save persists it under the existing revision check. Other body Results remain
in the Draft and block Publish. A Result cannot end a For each body. Move this
Result after the loop and use the item Data there. Results with custom status
Data, outgoing Paths, shared ownership or nested ambiguity are never converted
automatically. Paths leaving a body and item targets shared with another loop
or outside Path also block Publish; use Done to continue after the loop.
No migration is needed.

Published Versions keep their original hashes and execution, including body
Results that add text and then continue iteration. In-flight runs resume on
their pinned Version. Editing a Draft does not change a live loop.

### Workflow Test runs the saved Draft once (W8.8)

Run migration `2026_10_14_000033_create_agentic_workflow_test_requests_table`. It creates
`agentic_workflow_test_requests`, one row per Test request of an editor user, unique
over `agent_workflow_id`, `test_actor_key` and `test_request_id`. A repeat of any earlier
request, also a late one after the run moved on or was deleted, executes nothing. The test conversation
key of the editor is now bound to the editor user
(`editor-test:{workflow}:{user key}:{session}`), so another editor who knows a session id
cannot continue or clear it; open test sessions of the old key shape start again.

The editor's Livewire method `EditAgentWorkflow::testWorkflowDraftMessage` changes
from `(string $message, string $sessionId, ?array $resolution = null, ?array $inputs = null)`
to `(string $message, string $sessionId, string $requestId, string $revisionId, ?array $resolution = null, ?array $inputs = null)`.
`requestId` is a new id per Test click and `revisionId` is the saved Draft
fingerprint the editor shows (`draftFingerprint` of the usage payload). The same
two fields were added to the `workflow-test-message` event detail of the editor
bridge. A host that dispatches `testWorkflowDraftMessage` itself must send both.
The Test never took Draft JSON and still takes none. A Test of a Draft that no
longer is the named revision answers `code: draft_changed` and runs nothing.

The `workflow-test-response` event gained `status: duplicate` (with `runId`) for a
repeated request id, and `code`, `stepId` and `field` on errors that belong to a
step. The text `Save the draft before testing.` is removed: the Test saves pending
edits itself instead of waiting for them to be saved. In the editor, the
step picker gained the group `advanced` (For each, Sub-Workflow, Extract fields, Create
image, Transform, Calculate); runtime contracts and type ids are unchanged.
### W5.2 Import from Filament Resource

Run migration `2026_10_14_000032_add_data_resource_import_source`. It adds the
nullable `agentic_data_resources.source_resource` column, which stores the
imported Filament Resource class name for display only; existing tools keep
`null`. Nothing else changes for stored tools or published Agents. New
translation keys: the group `data-resources.import` in en, de, fr and es.
**Import from Filament Resource** sits beside **Add App data tool** in the Agent
editor and on the App data tools list. It lists only the Resources of the current
panel: another panel's guard, tenancy and tenant cannot be authorized from this
request, so to import from another panel, open the App data tool form in that
panel. It reads only static Resource metadata,
never grants access, and the operator must review fields, whose records and the
tenant scope before saving. Runtime never reads or calls Filament Resources.

### Workflow Tool Paths (W8.2)

The **Outcome paths** preset (`semantic:decisionOutcome`, `outcomeRouting`) is
removed from Add step. **Run tool** now owns **Done**, **Needs review**,
**Failed**, and **Unverified action** Paths for writes; reads own Done and Failed.
Needs review is offered only where an outcome can take it. Operator review and
pending connector outcomes halt at their waitpoint, so native HTTP/Memory writes,
resolved API/MCP operations, registered host write actions, and the package
handlers `store_submission`, `mutate_data_resource`, and `generate_image` do not
expose that handle. Only an operation whose contract cannot be resolved keeps it.
The editable `continueOnFail` option is removed. A Draft with
`continueOnFail: true` converts to an explicit Failed connection to its former
successor; a Step that ended a For each body gets a Failed connection to that
For each, so a failure still starts the next item. A `continueOnFail` Step
that ends a Path outside any For each converts with an unconnected Failed Path,
so a failure now ends the run Failed. Before W8.2 such a Draft could not be
published (`missing_outgoing_edge`). To complete the run after a failure,
connect the Failed Path to a Result. There is no replacement compatibility
flag.

On Draft load/save, a status Decision on `{{<outputVariable>_status}}` directly
after its operation converts only when its branches map unambiguously. Unknown
values, conflicting destinations, pending or unknown results sent to Done, and
legacy conditional or non-adjacent status Decisions on Done block validation
and publication with a translated issue naming the Step. The original Decision
stays available for repair. The released preset's **Awaiting review** branch
(`queued_for_operator_review`) never ran for a write that halts at its review
waitpoint, so conversion drops that branch instead of mapping it to Failed. When
its target Step then has no incoming Path, the Step stays in the Draft,
disconnected; publishing reports the existing disconnected-Steps error until you
connect or remove it. Value and condition Decisions on status Data after a
non-Done Path remain supported. Stored Drafts that fail current validation open
with their raw payload and blocking issues, so authors can repair them.

Legacy Knowledge and Memory read Steps that continued linearly on every status
receive an explicit Failed connection to the former successor. Other read Steps
keep their previous failure semantics. Knowledge `degraded` and
`insufficient_evidence` select Done; `unavailable` and read errors select Failed.
Evidence quality remains in Data. No database migration is required.

**No** on a multi-slot write confirmation keeps the existing correction interrupt
("Which detail should I change?"). It does not take Failed or continue to the
successor. Explicit Workflow cancellation stopped old runs as `cancelled`,
including old Drafts with `continueOnFail: true`; converted Drafts preserve that
behavior. A settled operation `cancelled` or `declined` status takes Failed.

Connector delays, operator approval interrupts, and visitor confirmations remain
AgentGraph waitpoints on newly compiled Versions as well as retained artifacts.
They take no Path while waiting. After resolution, approval and execution or
async completion route by the settled result; operator rejection and definite
job failure select Failed. A raw HTTP write returning `202 Accepted` selects
Unverified action because acceptance alone does not prove completion.

Preview/Test maps `simulated` to Done and logs **Test: nothing was saved**.
Live runs refuse that success classification. Unconnected non-Done Paths end
local execution honestly; `WorkflowRun::STATUS_NEEDS_REVIEW` (`needs_review`)
is a terminal local routing outcome. Unknown writes retain the explicit
`unknown` execution outcome. A Path never grants another write's confirmation
or permits replay of an unsettled write.

Published Version/artifact bytes and hashes stay unchanged. In-flight runs use
their pinned routing. Operator-review and durable connector waitpoints retain
the same ownership across both artifact generations.
Republishing a converted Draft creates a new artifact with the built-in Paths.

### W6.9 reviewed read corrections

Run migration `2026_10_14_000025_allow_repeated_integration_studio_connection_imports`.
It replaces unique index
`api_connector_integration_installations_api_connector_id_unique` with plain
index `integration_studio_connector_index`; installation-key uniqueness remains.
Rollback refuses multiple installation rows for one Connection rather than
deleting audit evidence. Restore a verified backup to revert those imports.

HTTP **Save and enable** now accepts GET, HEAD and OPTIONS only. POST, PUT,
PATCH and DELETE use the existing staging test and **Publish** flow. Integration
Studio keeps a reviewed-read claim over an imported write as an ambiguous write
Draft. Its preview reports blocked read contracts before installation.

New MCP publication adds `metadata.mcp_no_change_evidence_version: 1` before
interpreting host/API-authored `response.outcome.mcp_no_change`. Retained
revisions without that discriminator keep the previous UNKNOWN classification,
including revisions that already contain that key. MCP form saves preserve an
existing no-change sub-contract; changed drafts still need validation and review.

### Optional read-back reconciliation (W6.4)

The scheduler name `agentic-read-back-sweep` is now
`filament-agentic-chatbot:read-back-sweep`. Update any task monitoring by name.
Read-back jobs share a total 60-second read budget across initial transport,
inline polling and pagination, with a 90-second job timeout. Claims are fenced
after 150 seconds; duplicate deliveries cannot start another read in the same
slot. Only access credentials are pinned; terminal transitions clear those
credentials and headers while preserving pin identity for audit. Mapping
`idempotency_key` now requires `effect.idempotency_header` on the write.

Run migration `2026_10_14_000026_add_read_back_reconciliation` and restart chat
queue workers. The minute scheduler sweep and delayed queue jobs are required
for `effect.reconcile_with`. It adds encrypted ledger pins and
`agentic_read_back_attempts`; old rows without a pin stay manual-only. Existing
operation contracts and package implementation versions keep their meaning.
No operation or configuration names change. Package-owned strategies need no
republication. Host/custom strategies retain their source-hash checks: if their
dependency closure includes the changed credentials or planner files, publish
them and their dependent Agent/Workflow versions again (ADR 0058).
Only newly dispatched writes of versions declaring the optional contract gain
read-back checks. Rollback refuses to remove pins while any pinned execution
is unknown; resolve those actions or restore a matching verified backup.
See `docs/API_CONNECTORS.md`, "Read-back reconciliation of unverified writes",
for the strict predicate grammar and historical-account/authority limits.

### Operational analytics overview (W9.1)

The Analytics heading **Business Outcomes · Last 30 days** is now **Recorded outcomes**.
Operational conversation and feedback metrics exclude Agent tests and playground
conversations. **AI cost** includes all real spend; **AI cost per conversation**
uses visitor traffic only. **Open knowledge gaps** excludes ignored gaps. Write
metrics display **Unavailable** when access is restricted to selected write records.

`BotStatsOverview` changes from **Agent Analytics** to **Operational outcomes**.
The old lifetime **Conversations**, **Messages (24h)**, **Source Health** and
**Citation Coverage (24h)** overview cards are replaced by period-based
**Conversations**, **Conversations without handoff**, **Positive feedback**,
**Negative feedback**, **Response coverage**, **Handoff rate**, **Succeeded
writes**, **Open unverified actions**, **Open knowledge gaps**, **AI cost** and
**AI cost per conversation**. The default window is 30 local calendar days,
including today; **All Agents you may view** stays within the current tenant
and host visibility scope. Old `observe.bot_stats_overview.*` translation keys
are removed; the new keys are `dashboard.*`. Specialized usage, feedback,
recorded-outcome, knowledge and traffic tabs retain their stated periods.
See [metric definitions](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/BOTS.md#operational-analytics-10-candidate).
No migration or runtime accounting change is required.

### OAuth refresh journal and connection health (W6.5)

Run migration `2026_10_14_000021_add_oauth_refresh_health` before restarting
workers. Also run `2026_10_14_000024_bound_connection_health_delivery` to add
durable dispatch/delivery counters and terminal `failed_at`/`error_code` fields
to `agentic_connection_health_events`. Previously undelivered events could be
requeued indefinitely; they now stop after three dispatches or delivery attempts.
The old refresh dispatch identity
`api_connector_oauth_refresh_attempts.credential_fingerprint` becomes the
credential snapshot used for commit fencing; the new
`api_connector_oauth_refresh_attempts.refresh_identity` binds the token endpoint,
client ID and refresh token independently of mutable expiry/review metadata.
Existing unresolved attempts matching current encrypted credentials migrate to
`unknown` and **Reconnect required**, without replay. Existing secrets are not
rewritten. Do not delete these rows to bypass reconnection.

Automatic refresh replay remains off by default. Only the explicit encrypted
credential boolean `refresh_replay_safe_reviewed: true`, backed by a reviewed
non-rotation/replay contract, enables bounded retries and recovery of `unknown`
attempts by a new fenced dispatch. Without that boolean, `unknown` remains
blocked. Saving a changed `client_secret` or `client_auth` clears only
`reconnect_required` for the current identity; unchanged saves and `unknown`
attempts remain fenced. Null or blank response `refresh_token` values keep the
stored token and `token_type` keeps its 0.20.5 metadata behavior.
Reconnect through the existing credential setup or MCP browser flow. The internal
`OAuthRefreshOutcomeUnknownException::refreshCause()` accessor is removed;
inspect bounded refresh-journal error codes instead of retaining provider
exceptions that may contain secrets. No supported host API is removed.
The `core/connector` authentication strategy remains at behaviour-contract version
`1` under ADR 0058. Existing API and MCP tool pins continue to verify and execute
without republishing. Reviewed replay-safe retries are opt-in and default off;
refresh fencing and uncertainty handling preserve the existing request, result
and effect contracts. Immutable revisions and pending confirmations retain their
original pins and hashes.

See [API connections](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md#oauth-refresh-resilience-and-health)
and [Operations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md#connection-health-notifications).

### Image action destination (C6, ADR 0058)

`generate_image` input fields `url` and `headers` are removed. Configure
`filament-agentic-chatbot.workflow.image_generation.http.endpoint` and
`filament-agentic-chatbot.workflow.image_generation.http.headers` in host
configuration. The former internal configuration key
`workflow.image_generation.http.url` and environment variable
`AGENTIC_CHATBOT_WORKFLOW_IMAGE_HTTP_URL` are replaced by
`workflow.image_generation.http.endpoint` and
`AGENTIC_CHATBOT_WORKFLOW_IMAGE_HTTP_ENDPOINT`. Credentials belong only in
host configuration, for example headers populated from a host secret store.

Published configs without `workflow.image_generation` now apply the env-backed
image defaults, including `AGENTIC_CHATBOT_WORKFLOW_IMAGE_PROVIDER`,
`AGENTIC_CHATBOT_WORKFLOW_IMAGE_MODEL`, `AGENTIC_CHATBOT_WORKFLOW_IMAGE_HTTP_ENDPOINT`
and `AGENTIC_CHATBOT_WORKFLOW_IMAGE_HTTP_ALLOWED_HOSTS`. Published values override
these defaults; explicit `http.allowed_hosts` and `http.headers` values replace
the env values, including empty lists or maps. Resolved destinations require exact hosts and
pass the same outbound validation. Version 0.20.5 did not honour these image
environment variables.

Set `workflow.image_generation.http.allowed_hosts` to exact public hostnames.
The default is empty; `*`, hostname wildcards, localhost and private or reserved
destinations are refused. No private-network configuration grants an exception
for this action. HTTP redirects are refused, DNS addresses are validated and
pinned, and proxy fallback is disabled. HTTP response bytes are bounded by
`workflow.image_generation.http.max_response_bytes` (default 10 MiB, maximum
20 MiB), including decompressed bytes; the configured `timeout` is capped at
300 seconds with a connection timeout of at most 10 seconds. Input `timeout`
cannot extend those HTTP limits.

The `GenerateImageAction` behaviour-contract version changes from `1` to `2`.
Both legacy source-derived image pins and package version `1` image pins fail
closed. Upgrade preflight names the affected executable Workflows and Agents
and asks to republish after reviewing the image action. Configure the endpoint,
remove `url` and `headers` from Workflow input mappings, review the action and
publish the affected Workflows and dependent Agents again. A waiting run bound
to the old image contract cannot resume through this version change: finish or
cancel it before upgrading. No stored artifact, pin or pending payload is
rewritten. Other retained 0.20.5 contracts keep their existing compatibility.

### W9.2 Knowledge gap answers and publication evidence

Run `2026_10_14_000022_add_knowledge_gap_answers` before restarting workers.
The old **Verify resolved** action (`KnowledgeGapInboxTable` action `resolve`)
and `KnowledgeGapResolutionService::resolve()` are removed. Use **Add answer**
(action `add_answer`, `KnowledgeGapAnswers::add()`) instead. A completed
Draft-assigned Source is no longer sufficient evidence of resolution.
`KnowledgeGapAnswerReconciler` marks a gap addressed only after a deterministic
retrieval probe against the Agent's verified Live Source/profile binding.
Historical `resolved` gaps become `open`; their Source reference and operator
note are retained. The old `resolved_at`, `resolved_by_type` and `resolved_by_id`
values are preserved in `answer_evidence.legacy_resolution` before those columns
are cleared. Rollback restores `status: resolved` and that original triple;
later availability checks and operator actions retain this historical evidence.
No stored Agent deployment is rewritten.

The migration adds the unique nullable `agentic_bots.answers_knowledge_source_id`
and `bot_knowledge_gaps.answer_text` (encrypted), `answer_state` and
`answer_evidence` plus the last-check cursor `answer_checked_at`. Legacy Text
Sources named exactly `Answers` are linked only when exactly one Agent uses
them, counting Draft assignments and pins from all historical Agent deployments
across the installation. This is stricter than tenant-local ambiguity checks and cannot
link a cross-tenant shared Source. Deleted Agents count as users but cannot become
owners. If several exclusive Sources belong to one Agent, the lowest Source ID
is selected. Shared or unused `Answers` Sources stay unlinked and unchanged; the next Add answer creates an owned Text Source.
Owned Answers Sources can no longer be shared through source-assignment actions
or changed from Text. Publish and Restore also refuse Versions pinning another
Agent's owned Answers Source, including legacy historical Versions.
Editing, assigning, deleting, restoring or revoking them also requires
`agents.manage` on their owning Agent in addition to the existing Source and
admin permissions.

A new or newly assigned Answers Source changes only Draft and requires Publish.
An existing Live current-mode Source receives successful ingestion automatically;
frozen-mode Versions and profile changes need Publish. **Available to Agent**
replaces **Verified resolved** and makes no promise about future answer quality.
Probes use stored answer vectors with the Live retrieval settings and make no AI
calls. AI rerankers leave the gap unaddressed with **Manual review needed**
instead of **Publish needed**; failed ingestion shows **Indexing
failed** instead of **Answer drafted**. Pause, Resume and Source revocation
recheck availability after commit. Trashed Answers Sources require restoration;
force deletion clears the owner pointer so the next Add answer creates a new
Source. See
[Gap answers](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWLEDGE_SOURCES.md#gap-answers) for recovery and state details.

### Reviewed read Tool lifecycle (W6.9)

The old **Save draft**, test and **Publish revision** sequence remains available.
Reviewed READS can now use **Save and enable** after exact contract validation;
WRITES retain the staging test and explicit Publish sequence. Configure-only
operators keep **Save draft** and cannot enable Tools. Publish the Agent separately
to pin the revision; existing Agent Versions never follow mutable Tool edits.

Integration Studio no longer guesses read authority from an imported GET or
server metadata: an absent `operation_settings.reviewed_effect` becomes `write`,
while `read` requires an explicit `effect_review_reason`. The old inactive-only
installation has an opt-in `enable_reviewed_reads` batch with an exact
`reviewed_plan_hash`. Configure-only imports use `existing_connector_id`, an
unchanged authorized active Connection; new destinations and credentials remain
admin-only. Repeated requests reuse the existing installation.

MCP write errors formerly always stayed UNKNOWN. That remains the default; only
an explicitly reviewed and pinned `response.outcome.mcp_no_change.version: 1`
contract can prove FAILED without effects. Generic `isError` and mutable server
flags remain UNKNOWN. A changed error contract needs a new signed MCP write
review, staging evidence and publication. Declaration drift still refuses dispatch.

ADR 0058 decision: core implementation contract version **1 is unchanged**.
The new optional, versioned MCP evidence contract is an explicit opt-in; stored
contracts without it keep their original inputs, outputs and effect semantics.
The retained 0.20.5 artifacts and hashes are never rewritten or regenerated.
Host/custom classifier fingerprints include the changed response mapper and
therefore still require reviewed republication under ADR 0058.

### Package implementation pins (ADR 0058)

Core Connector bindings formerly stored `key`, `version` and a source-derived
`behavior_hash`. New package bindings store `key`, a reviewed contract `version`
and `owner: package`. Package action contracts replace the source-derived
`handler_implementation_hash` with `handler_implementation` (`owner`, handler
class `key`, behaviour-contract `version`); new action identities include it as
`implementation`. Host strategy and action source hashes keep their existing
format and fail-closed behavior.

Except for the deliberate image action version change above, existing 0.20.5
and predecessor pins remain executable without rewriting artifacts, changing
hashes or republishing. Legacy package action digests are
verified against the entire registered contract with retained fingerprints,
not accepted solely by action name. Package bug and security fixes preserving
the pinned contract no longer invalidate those pins. A deliberate semantic
contract version bump still refuses older versions; the upgrade preflight
reports BLOCKED and names affected API tools, Agents and Workflows. Resolve
those named mismatches through reviewed publication before applying the upgrade.
The reviewed version and dependency inventory is
`tests/Fixtures/V1/package-implementation-contracts.json`.

Host custom strategies still hash package dependencies. Request codecs include
`ApiRequestBuilder`, `ConnectorQuerySerialization` and `HttpUrl`; request-bound
decoders include `ConnectorRequestBoundResults` and `ConnectorCapabilityDispatcher`;
outcome classifiers include `CoreConnectorOutcomeClassifier`,
`HttpWriteResultContract`, `ConnectorResponseMapper` and
`WorkflowPayloadSchemaValidator`. A package fix in those files requires hosts
using the affected custom strategies to publish the operations and dependent
Agent and Workflow versions again.

Preflight now verifies exact live Agent pins (including Paused Agents), active
Workflow versions reachable from those Agents or waiting runs, their transitive
dependencies, and the historical Workflow and Agent versions bound to waiting
runs. A referenced contract-version or host-hash mismatch blocks both dry run
and apply. For a waiting run, the historical Agent version must retain its
integrity, executable runtime settings and matching Workflow pin; the run's
Workflow and supporting capabilities must still execute. Unrelated tools or
Workflows in that historical Agent version produce one advisory per version,
so deactivating an old direct tool does not prevent an independent run from
resuming. The next chat turn uses the live Agent version.
Invalid superseded API tool revisions and unused active Workflows
are warnings; a Workflow without an Agent is skipped with a warning. These
warnings do not bypass validation if a live pin or waiting run references the
artifact. Stored artifacts and hashes are never repaired in place.

### Reserved template key and staging validation

Host `AgentTemplateProvider` templates previously accepted the key `scratch`,
which collided with the Create Agent choice **Start from scratch** and discarded
the template requirements, Tools and Workflows. `AgentTemplateCatalog` now refuses
`scratch` with a diagnostic. Rename a host template from `scratch` to a unique
catalog key such as `custom-start`.

For `staging_binding_type: test_account`, re-verification now revokes previous
adapter evidence before checking the provider. Failed or interrupted verification
leaves the account unverified until another verification succeeds. A concurrent
older verifier cannot restore revoked evidence.

For host-policy bindings, `staging_account_binding.marker_header` must occur
exactly once in `default_headers` (case-insensitive). Operation headers,
authentication headers and registered authentication strategies previously could
replace the marker, for example `X-Test-Mode: 1` with `x-tEsT-mOdE: 0`. These
overrides are now refused before dispatch. Remove the marker from operation and authentication headers and keep
it only in the staging connector's `default_headers`.

Website crawl errors now replace query values in `WebsiteCrawlRun.errors` URLs
with `[REDACTED]`. Unexpected crawl failures previously passed the original
exception to the host exception reporter. They now log `website_crawl_failed`,
the exception class and the crawl run ID without exception messages or trace
arguments.

### Staging knowledge Source restriction

`ApiKnowledgeSource` previously accepted an active `ApiConnector` with
`is_staging_only=true`. It now refuses that Connection before fetching any data.
Use a productive Connection for API knowledge Sources.
`TestAccountStagingBinding::verify()` now refuses an outer database transaction;
call it after committing so evidence revocation commits before provider reads.

### Unverified write projections and webhook occurrence keys

Migration `2026_10_14_000023_preserve_write_projection_and_webhook_occurrences`
marks existing unsettled (`running` or `unknown`) direct writes with neither a
confirmation binding nor
`agent_confirmation_required` as legacy. Resolving these rows still settles the
ledger and removes them from Unverified actions. When the exact confirmation
invocation cannot be recovered, delivery skips card and transcript propagation
and records `legacy_projection_unavailable`; it does not exhaust retries.
New unbound writes still fail closed. Before migrating, put the host in
maintenance mode with `php artisan down` and stop its scheduler. For multiple
servers, configure `APP_MAINTENANCE_DRIVER=cache` with a shared
`APP_MAINTENANCE_STORE` before entering maintenance, or place every node in
maintenance separately. Remove all web nodes from load-balancer admission and
wait for active requests, including long-lived SSE turns, to finish. Maintenance
mode does not drain already running requests. On every server, gracefully
stop queue workers after active jobs finish and disable their automatic restart. Keep
web admission, workers and schedulers stopped through migration and recovery;
then restart workers and schedulers, run `php artisan up`, and restore web admission.

The old HMAC `usage.budget_threshold` deduplication identity becomes the stable
internal occurrence `usage_budget|<Agent id>|<YYYY-MM>|<metric>|<threshold>`.
The migration converts existing budget events using their stored payload facts.
Unreadable metadata or budget payloads are logged and skipped without changing
the row; the log contains only the table, row id and exception class. An
unreadable write stays unclassified: resolution cannot bypass its missing
confirmation binding, and exhausted propagation appears in **Delivery needs
attention**. An unreadable budget event may cause one repeat notice for that
period, metric and threshold; subsequent notices use the stable occurrence key.

Keep old encryption keys in `APP_PREVIOUS_KEYS` when rotating `APP_KEY`.
For skipped rows, restore the missing keys or restore their ciphertext from a
verified backup. Before reopening admission, rerun this migration's `up()` from
the installed package migration file to finish conversion; `php artisan migrate`
alone will not rerun an already recorded migration. With the default Composer
package path, run while all admission is still drained:

```bash
php artisan tinker --execute='(require base_path("vendor/heiner/filament-agentic-chatbot/database/migrations/2026_10_14_000023_preserve_write_projection_and_webhook_occurrences.php"))->up();'
```

Do not rerun the legacy classification after admitting new writes. If service has already resumed,
repair the affected write's exact confirmation binding and use **Retry delivery**
in **Delivery needs attention**; never invent a binding or repeat the write.
Budget threshold occurrence records survive webhook retention pruning for all
periods, including with `outbound_webhooks.retention_days=1`. Late usage
reconciliation has no maximum age, so these small deduplication records remain
retained. Unconverted rows can still repeat a notice until repaired; retaining
them alone does not convert their historical HMAC identity. Outgoing subject
IDs stay HMACs and internal occurrence keys are never sent. Existing payloads and
event IDs remain unchanged. The default Unverified actions list shows unknown
writes; the Resolved filter shows explicit operator and automatic resolutions;
exhausted deliveries have their own **Delivery needs attention** tab under the
same ability, including deliveries for settled writes.

### Removed private-network ingestion setting

Remove `ingestion.allow_private_network_urls` and its environment variable
`AGENTIC_CHATBOT_ALLOW_PRIVATE_NETWORK_URLS`. There is no replacement:
Website sources always require public network destinations.
The separate
`network.allow_private_request_urls` policy for API tools is unchanged.

### Outbound HTTP response handling

API tools (including pagination), MCP, the connector tester, API knowledge
sources, raw HTTP nodes, webhooks and Website fetches request
`Accept-Encoding: identity` and disable automatic decoding. Only gzip and
zlib-wrapped deflate are decoded, with a per-attempt cap on decoded bytes.
Brotli (`br`), Zstandard (`zstd`), raw deflate and other unsupported or invalid
encodings are refused. A response refusal after a write was sent is recorded
as a failure with dispatch started; it is not evidence that no write occurred.
These execution-time checks preserve published request codec hashes.

The HTTP image action (`generate_image`) now uses bounded response protection
and host-configured destinations under contract version `2`. Its `url` and
`headers` inputs are removed. Follow the image action destination instructions
above before publishing affected Workflows and Agents again.

### Numeric IPv4 aliases in outbound destinations

API tools, MCP, the connector tester, API knowledge sources, raw HTTP nodes,
webhooks and Website fetches refuse curl numeric IPv4 aliases such as
`2130706433`, `0x7f000001`, `127.1` and `0177.0.0.1`, including redirect targets
where redirects are followed. The pinned HTTP image action remains excluded.

### Converted Website sources, robots and redirects

Converted single-page Website sources now require a reachable `robots.txt`;
only 404 or 410 permits crawling without it. Redirects must keep the exact
host and normalized port, except that HTTP on port 80 may upgrade to HTTPS on
port 443. Downgrades and other port changes are refused. Apex-to-www redirects fail. Use the final URL
as the start URL before starting the crawl.

### Files writes use file_paths

Files writes must use `file_paths` (a list); writes with only `file_path` are
rejected. The old `KnowledgeSourceFileStorage::extractionMeta()` helper is
removed; use `referencesForSource()` to obtain verified per-file references.

### W5.5 Website and Files source types

`ContentExtractor::extract('website', $meta)` receives the crawler's fetched
`body`, `content_type` and `url`; passing only a URL no longer fetches anything.
The constructor no longer takes `SafeHttpFetcher $httpFetcher`; its optional
argument is now `KnowledgeSourceFileStorage $fileStorage`. Website fetching
belongs to the durable crawl jobs. Removed overrides `ingestion.max_redirects`
(`AGENTIC_CHATBOT_INGESTION_MAX_REDIRECTS`) and `ingestion.allowed_content_types`
are replaced by fixed Website limits of five redirects and HTML/XHTML/plain
text pages. Widget translation keys `source_type_web` and `source_type_file`
become `source_type_website` and `source_type_files` in `widget.php`.

Run migration `2026_10_14_000016_add_website_crawl_runs_and_files` before workers
restart. Source type key `url` becomes `website`; every existing row preserves
`meta.url`, gets `meta.website.mode=single_page` and `meta.website.max_pages=1`,
with discovery disabled. Source type key `file` becomes `files`; each existing
file stays one document, its private ownership attestation is retained, and its
path becomes the one-element `file_paths` list. New Files uploads accept up to
50 files. The form upload field changes from `file_path` to `file_paths` and
filename metadata from `meta.original_filename` to `meta.original_filenames`.
Update custom source creation/extraction calls to `website` and `files`;
the old type keys have no runtime compatibility path. Old immutable deployment
and generation contracts are not rewritten. Take a database backup before this
conversion: its down migration does not convert multi-page/multi-file sources
back into their lossy old representations.

Website settings are `meta.url` and `meta.website.{mode,max_pages,include,exclude}`;
modes are `crawl`, `sitemap`, `single_page`. The existing `sync_frequency` values
`never`, `daily`, `weekly` remain. Translation keys
`knowledge.knowledge_source_form.single_web_page` and
`knowledge.knowledge_source_form.file` become
`knowledge.knowledge_source_form.website` and
`knowledge.knowledge_source_form.files`. The former
`knowledge.knowledge_source_form.add_one_public_webpage_private_local` hint is
replaced by `knowledge.website.url_hint`.

Run the asynchronous ingestion queue worker configured through
`AGENTIC_CHATBOT_INGESTION_QUEUE_CONNECTION` / `AGENTIC_CHATBOT_INGESTION_QUEUE`
and the Laravel scheduler (`schedule:run`). Crawl jobs checkpoint each fetch or
provider batch and require a worker timeout of at least 300 seconds, with queue
`retry_after` greater than 300. A minute scheduler watchdog fails heartbeats
older than the run’s 900-second timeout, except while a scheduled provider retry
is still in the future; the existing scheduled sync command
dispatches due Websites. Use a shared database or Redis cache so all workers share the two
per-host request slots and start interval. Crawl actions and schedule changes
use `knowledge.crawl_start`, `knowledge.crawl_retry`, `knowledge.crawl_cancel`,
`knowledge.crawl_schedule`, mapped to the existing Source management ability.
Cancel an active crawl before changing its content settings.

Website fetching always rejects private/reserved IPs, cross-host redirects and
HTTPS downgrades, including when the old private-network ingestion override is
set. Websites skip PDFs and non-HTML/XHTML/plain-text pages. The database backend
checks per-Agent chunk capacity before embedding and activation; an overflow
keeps the previous generation and names the limit and pgvector/fewer-pages remedy.
See [Knowledge sources](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWLEDGE_SOURCES.md#website) for all bounds and
carry-forward/removal rules.

Website Sources use **Start crawl** / **Retry** for their durable runs.
Synchronous ingestion refuses Websites and directs operators to these actions.
Rebuild starts the same queued crawl; an already running crawl is skipped
without changing the Source status. The 900-second run heartbeat lease allows queue
redelivery after a 300-second worker timeout; configure queue `retry_after`
above 300 and below 900 seconds (for example, 330).

### Package-internal App data tool models

Before 1.0, the Data Resource picker offered all package `src/Models` classes,
including `Heiner\FilamentAgenticChatbot\Models\BotAccessToken`. In 1.0, classes
in `Heiner\FilamentAgenticChatbot\` and `Heiner\AgentGraph\`, plus host classes
that extend them, require an explicit entry in the new config key
`filament-agentic-chatbot.data_resources.package_model_allowlist`. Its default is
`[Heiner\FilamentAgenticChatbot\Models\BotSubmission::class]`. Each entry allows
only that exact class, not its subclasses. This applies even to models in
`data_resources.resources`. Allowlisting a package model is an explicit opt-in
to exposing its data through App data tools; review its fields and scope first.
An empty list excludes all package models. Classes whose ancestry cannot be
resolved are also refused.

Run `php artisan config:clear` **before migrating** so a cached pre-1.0 config
does not omit `package_model_allowlist` and deactivate `BotSubmission` tools.

The built-in `data_resources.resources.bots` and
`data_resources.resources.agent_workflows` definitions have been removed.
`bot_submissions` remains. If you need either removed key, explicitly allowlist
`Heiner\FilamentAgenticChatbot\Models\Bot` or
`Heiner\FilamentAgenticChatbot\Models\AgentWorkflow`, respectively, and define
the resource in your host `data_resources.resources` config with reviewed fields
and scope. Existing drafts report these keys as missing tools at publication;
old published pins still fail closed with `data_resource_model_not_allowed`.
Registry discovery drops forbidden definitions, and **Sync from config** skips
them and names their keys in the notification.

Migration `2026_10_14_000015_deactivate_package_model_data_resources` sets
`agentic_data_resources.is_active` to false for forbidden saved definitions,
using the allowlist effective when it runs. Host models and allowlisted models
stay active. Save the migration output: each changed key is printed as
`Deactivated App data tool: <key>`. Unresolved host classes also fail closed and
are printed separately as `Deactivated App data tool (model class not found): <key>`.
The migration is idempotent and its down
method does not reactivate tools. To keep a reviewed package model, add its
exact class to the allowlist before migrating, or review and explicitly
reactivate its definition afterward.

Saving a forbidden model now fails on the `model` field. Current restrictions
also apply to old published pins and manually re-enabled rows: Gateway reads
and writes return `data_resource_model_not_allowed`. A previous publication
cannot retain access after the host removes its opt-in.

### Handoff notifications and Agent business hours

The removed environment keys are `AGENTIC_CHATBOT_BOT_HANDOFF_TIMEZONE` and
`AGENTIC_CHATBOT_APP_TIMEZONE`. The removed config keys are
`filament-agentic-chatbot.bot_handoff_requests.desk.timezone` and
`filament-agentic-chatbot.bot_handoff_requests.desk.business_hours` (including its
weekday children). They are removed from the package and sandbox config. The new
Agent settings are `runtime_config.handoff.business_hours.timezone` and
`runtime_config.handoff.business_hours.days`, where each weekday holds a list of
`{open, close}` intervals. Notify is stored in
`runtime_config.handoff.notify_user_ids`, `runtime_config.handoff.notify_emails`
and `runtime_config.handoff.notify_channels`; the visitor text is
`runtime_config.handoff.outside_hours_text`. These settings apply on Save without
Publish. The built-in tool switch remains `runtime_config.agent.human_handoff.enabled`
and still needs Publish.

Migration `2026_10_14_000014_copy_handoff_desk_hours_to_agents` reads the old
published config timezone and `business_hours` schedule captured during package
registration first, then the old cached config, then falls back to
`env('AGENTIC_CHATBOT_BOT_HANDOFF_TIMEZONE')`, then
`env('AGENTIC_CHATBOT_APP_TIMEZONE')`, then `UTC`. A literal `null` desk timezone
in the environment means `UTC`, as in 0.20.5. Without a legacy schedule it uses
the old Monday to Friday 09:00 to 17:00 schedule. Missing weekdays use that default;
explicitly closed days and intervals whose close is at or before open stay closed.
Empty or invalid timezones become `UTC`; a malformed day window becomes a closed
day, while other days are preserved. Unknown schedule keys are ignored. A malformed
schedule container uses the old default week. Each correction prints a one-line note.
An old week with no staffed day was invalid and is skipped with a warning;
configure a valid schedule per Agent before resuming service.
There were no business-hours environment keys in 0.20.x; custom schedules were
published config values. The unprefixed `BOT_HANDOFF_TIMEZONE` and `APP_TIMEZONE`
were never read by the package's desk config and are ignored by this migration.
Keep the old env values until after the upgrade and run `php artisan config:clear`
before migrating. The corrected schedule is copied to each Agent without stored
`handoff.business_hours`. Existing hours, including explicit null (always open),
are preserved. With no legacy source present it silently copies nothing. Invalid
legacy values are corrected as above; successful copies print a count;
repeated runs do not overwrite settings. Keep custom published desk values until
the migration has copied them, then remove the old env and config keys.
`AGENTIC_CHATBOT_APP_TIMEZONE`, the old package timezone fallback, is also removed
after the upgrade. Other desk environment keys remain unchanged:
`AGENTIC_CHATBOT_BOT_HANDOFF_DEFAULT_TEAM`, `AGENTIC_CHATBOT_BOT_HANDOFF_POLL_AFTER_MS`,
`AGENTIC_CHATBOT_BOT_HANDOFF_DEFAULT_ASSIGNEE_TYPE`,
`AGENTIC_CHATBOT_BOT_HANDOFF_DEFAULT_ASSIGNEE_ID` and
`AGENTIC_CHATBOT_BOT_HANDOFF_DEFAULT_ASSIGNEE_LABEL`.

In 0.20.x, SLAs counted only Monday to Friday 09:00 to 17:00 in `UTC`
unless `AGENTIC_CHATBOT_APP_TIMEZONE` or `AGENTIC_CHATBOT_BOT_HANDOFF_TIMEZONE`
overrode it. In 1.0 an Agent without business hours is always open, so its SLAs
count around the clock. Set business hours per Agent if you relied on the old
default, including when no `AGENTIC_CHATBOT_BOT_HANDOFF_TIMEZONE` was explicitly set.

Existing Agents without a stored `runtime_config.agent.human_handoff.enabled`
remain off in the editor, readiness checks and draft saves. Only new Agents
(created directly or from templates) explicitly store `true` by default.

New Agents prefill Notify only with a creator who already has Inbox access.
Existing Agents receive no inferred recipients. Configure Notify explicitly;
webhook endpoints no longer clear the handoff notification readiness warning.
Adding approved email recipients requires `agents.handoff_email_recipients`
(admin); other live handoff settings require `agents.handoff_settings`
(configure), checked for the Agent. Handoff email links use the authenticated
panel route and grant no access. Run a queue worker and scheduler for delivery
and recovery.

### Laravel AI 1.2

The plugin requires `laravel/ai` `^1.2.1` instead of `^0.11.2`. Update with
`composer update heiner/filament-agentic-chatbot laravel/ai --with-all-dependencies`.
Laravel AI no longer installs `aws/aws-sdk-php`; the plugin does not use the
Bedrock provider. If your application requires `laravel/mcp` directly, it must
be `^1.0`. The plugin does not use Laravel AI's remembered conversations, so
the SDK's `agent_conversation_messages` migration does not apply to it.

Run `php artisan migrate`. Two irreversible data migrations run; back up the
database first:

- `2026_10_14_000001_move_ai_usage_receipts_to_laravel_ai_1` rewrites pending
  `ai_usage_calls.settlement_payload.usage` from `prompt_tokens` and
  `completion_tokens` (each 0.11 gateway's own semantics) to inclusive
  `input_tokens` and `output_tokens`, so a retried settlement stores the numbers
  the original settlement would have stored. Stored Gemini receipts
  (`settlement_payload.context.provider_billing_receipt` and
  `meta.partial_provider_receipt`) move from `usageMetadata` (`promptTokenCount`,
  `cachedContentTokenCount`, `candidatesTokenCount`, `thoughtsTokenCount`,
  `toolUsePromptTokenCount`, `totalTokenCount`, `*TokensDetails`) to the
  Interactions `usage` object (`total_input_tokens`, `total_cached_tokens`,
  `total_output_tokens`, `total_thought_tokens`, `total_tool_use_tokens`,
  `total_tokens`, `*_tokens_by_modality`); `responseId` becomes `id` and
  `modelVersion` becomes `model`. Settled counters and costs are unchanged.
- `2026_10_14_000002_move_agent_transcripts_to_replay_blocks` moves
  `bot_messages.meta.agent_transcript` from version 1 to version 2:
  `provider_content_blocks` becomes `replay_blocks` and `provider` becomes
  `replay_provider`. Gemini `generateContent` parts cannot be replayed to the
  Interactions API and are dropped; the tool calls and results of those turns
  are kept. The DeepSeek `reasoning_content` map becomes a
  `['type' => 'reasoning', 'reasoning_content' => ...]` replay block.

Behaviour and configuration changes:

- Gemini text generation, streaming, tools and structured output use the
  Interactions API (`POST .../interactions`) instead of `generateContent`.
  `runtime_config.agent.gemini_thinking_level` is now sent as
  `generation_config.thinking_level` instead of
  `generationConfig.thinkingConfig.thinkingLevel`. Host code that passes raw
  Gemini provider options must use the Interactions names: `thinkingConfig`
  becomes `thinking_level` and `thinking_summaries`, `toolConfig` becomes
  `tool_choice`, `cachedContent` no longer exists, and `safetySettings`,
  `serviceTier` and `store` become `safety_settings`, `service_tier` and `store`.
- Usage accounting: Laravel AI reports inclusive totals for every provider. The
  model profile flags `usage_prompt_includes_cache` and
  `usage_completion_includes_reasoning` now default to `true` for every provider
  instead of the former per-provider defaults. Stored `ai_usage_calls` and
  `bot_usage_events` numbers are unchanged for the same provider response,
  except xAI: Laravel AI now adds xAI reasoning tokens, which xAI reports
  outside `output_tokens`, so xAI calls with reasoning store more output and
  reasoning than before.
- `generate_image` with the `laravel_ai` transport requires an explicit provider
  and model (node input or `workflow.image_generation.provider` and
  `workflow.image_generation.model`). It no longer falls back to a Laravel AI
  default model; a missing value fails before any usage reservation.
- A provider stream that ends before the provider completes a step now fails
  the step (`Laravel\Ai\Exceptions\StreamErrorException`). Its usage stays
  reserved for reconciliation with `failure_code` `provider_call_failed`
  instead of `provider_usage_missing`.
- Package Agents (`BaseConversationalAgent::prompt()`, `stream()`, `queue()`,
  `broadcast()`, `broadcastNow()`, `broadcastOnQueue()`) accept the Laravel AI
  1.x input types `AgentInput|UserMessage|Decisions|string`; only a text prompt
  with separate attachments is executed. Laravel AI approval `Decisions` remain
  rejected.

### AgentGraph 0.19 and MySQL/MariaDB support

The plugin requires exactly `heiner/agent-graph` `0.19.0` instead of `0.18.1`
(AgentGraph 0.19.0 requires `laravel/ai` `^1.2.1`). Update both with
`composer update heiner/filament-agentic-chatbot heiner/agent-graph laravel/ai --with-all-dependencies`.

- **AgentGraph migration.** `2026_10_14_000000_add_identity_hash_to_agent_graph_memories`
  runs in the upgrade's `migrate` phase. It adds the unique
  `agent_graph_memories.identity_hash`, backfills it and deletes nothing; when
  concurrent writes had stored two records for one identity without a tenant,
  only the oldest gets the hash. `php artisan agent-graph:doctor` fails until it
  ran.
- **Published Workflows keep running.** Workflow versions published under
  AgentGraph 0.18.1 still execute and their waiting runs still resume; nothing
  needs to be published again (ADR 0056). New publishes record `0.19.0` in
  `agent_workflow_deployments.agent_graph_constraint`. Stored versions are not
  rewritten.
- **Memory identity limits.** AgentGraph rejects a memory scope id longer than
  191, a tenant id or namespace longer than 128 and a key longer than 255
  characters. Actor memory scopes whose `{owner_type}:{owner_id}` is longer than
  191 characters now use `actor:v2:` plus its SHA-256 instead; shorter ones keep
  their id. Records stored under such a longer id (possible on PostgreSQL and
  SQLite only) are no longer recalled until they are moved to the new scope.
  They can still be exported and deleted. Editing moves the record in one
  database transaction (write the new scope, delete the old). A legacy key
  longer than 255 characters is skipped and preserved, with a
  `move_report` entry (`status: skipped`, `reason: legacy_memory_key_too_long`)
  and an operator warning. Export that record and recreate it with a shorter key.
  Workflow memory steps and conversation memory no longer write a key
  longer than 255 characters; they return `Memory key must not exceed 255
  characters.` instead.
- **Sub-workflow paths.** Publishing a Workflow whose nested sub-workflow step
  path (step ids joined by `/`) is longer than 760 characters is refused on
  every database.
- **Force-deleting an Agent** with a live version now clears
  `agentic_bots.active_agent_deployment_id` in the same transaction before the
  version rows are deleted.
- **Write lease renewal.** MySQL can report zero changed rows when a renewal
  keeps the same stored expiry. The ledger verifies the same running lease,
  token and requested live expiry with a locking primary read before accepting
  that result. A stale read replica or repeatable-read snapshot cannot
  authorize ownership replaced on the primary. Expired,
  replaced, interrupted and terminal leases remain refused.

The 1.0 candidate matrix covers MySQL 8.4.11 with `DB_CONNECTION=mysql` and
MariaDB 11.4.13-MariaDB-ubu2404 with either `DB_CONNECTION=mariadb` or
`DB_CONNECTION=mysql`. Both MariaDB driver combinations are certified for the
cases in `docs/COMPATIBILITY.md`; no driver refusal is needed. These settings
refer to the connection Laravel resolves for package storage, which can also be
a named connection selected by `AGENTIC_CHATBOT_DB_CONNECTION`.
The unmodified 0.20.5 migration chain cannot complete a fresh installation on
these engines:

- If an older installation stopped partway through its migrations, back up and
  preserve that database. Validate 1.0 in a separate empty database. The matrix
  does not certify resuming a partly applied old chain or retaining its business
  rows; recovery needs an explicit plan before changing those rows.
- If you published the AgentGraph migrations into `database/migrations`
  (`vendor:publish --tag=agent-graph-migrations`), a copy of
  `create_agent_graph_tables` from before 0.19.0 fails on MySQL with error 1071.
  Before migrating a fresh MySQL or MariaDB database, delete the published
  AgentGraph migrations that have not run and publish them again.
- The portability changes to fresh schemas follow the Laravel driver. With
  `mysql` (on MySQL or MariaDB), package `JSON`
  columns become `LONGTEXT` (native JSON reorders object keys, while stored
  contracts are compared byte for byte), and
  `agent_workflow_deployment_dependencies.node_path` changes from
  `VARCHAR(1024)` to `VARCHAR(760)`. With `mariadb`, fresh schemas keep the
  byte-preserving MariaDB JSON alias and `VARCHAR(1024)`; the publication limit
  remains 760 on every driver. On both engines, generated index and foreign key
  names longer than 64 characters keep their first 55 characters plus `_` and 8 hex characters of their SHA-256,
  `ai_model_prices.effective_from` and `ai_usage_calls.pricing_effective_from`
  change from `TIMESTAMP` to `DATETIME` (the bundled local-model price starts
  at the Unix epoch), and
  the generated guard columns that allow one open item per conversation are `VIRTUAL` instead of `STORED`.
  PostgreSQL and SQLite schemas and existing installations are unchanged.

The matrix verifies these fresh migrations and a broad runtime slice. It does
not certify the entire suite on MySQL or MariaDB, or dates outside remaining
`TIMESTAMP` columns' range; see `docs/KNOWN_LIMITATIONS.md`.

### WhatsApp channel removed

The WhatsApp Cloud API channel no longer exists. Telegram, Slack, Mailtrap
Email and Mailgun Email remain. Remove these from your application before
upgrading:

- Environment keys `AGENTIC_CHATBOT_CHANNELS_WHATSAPP_ENABLED` and
  `AGENTIC_CHATBOT_CHANNELS_WHATSAPP_GRAPH_API_VERSION`.
- The published config keys `channels.whatsapp.enabled` and
  `channels.whatsapp.graph_api_version`. Delete `whatsapp` from
  `bot_access_tokens.channels` if you overrode that list; existing Agent Access
  Tokens whose channel is `whatsapp` keep working and show the label as plain
  text.
- PHP symbols `ChannelConnection::CHANNEL_WHATSAPP` (`whatsapp`),
  `ChannelConnection::PROVIDER_WHATSAPP_CLOUD` (`whatsapp_cloud`),
  `WhatsAppCloudChannelDriver`, `WhatsAppChannelMessageRenderer` and the
  `ChannelCapabilities::$requiresTemplateForProactiveMessages` constructor
  argument and property (only WhatsApp set it). Drivers or renderers you
  registered under `channels.drivers` or `channels.renderers` for
  `whatsapp_cloud` stop being called. Custom `ChannelCapabilities` constructions
  must drop the `requiresTemplateForProactiveMessages` argument.
- Admin: the WhatsApp provider is gone from the channel connection wizard, its
  credential fields (`access_token`, `phone_number_id`, `app_secret`,
  `verify_token`), settings (`graph_api_version`, `preview_urls`) and the
  `whatsapp_phone_number` diagnostics check.

Run `php artisan migrate`. One irreversible data migration runs; back up the
database first:

- `2026_10_14_000003_remove_whatsapp_channel_data` deletes every
  `channel_connections` row with `provider = 'whatsapp_cloud'` together with its
  `channel_threads`, `channel_delivery_events` and `channel_inbound_attachments`
  rows and the staged attachment files that were not purged yet. Conversations
  and messages are kept: `bot_conversations.channel_connection_id` and
  `bot_handoff_activities.channel_delivery_event_id` become null, and
  `bot_conversations.channel` keeps the string `whatsapp` as history that no
  code reads. The webhook URLs of deleted connections stop resolving. Telegram,
  Slack and Email connections are not touched.

### Filament 5.10.2 minimum

The plugin requires `filament/filament` and `filament/infolists` `^5.10.2`
instead of `^5.7.6`. Filament 5.7.8 and older are affected by security advisory
GHSA-7m6h-rg42-m449 (CVE-2026-104181), fixed in 5.8.2, and Filament 5.10 starts
authorizing widgets when they mount, so a widget whose view gate denies the
user, such as the Playbook runs widget, now answers 403 at mount instead of
rendering without records. Update with
`composer update filament/filament filament/infolists livewire/livewire --with-all-dependencies`.
Filament 5.10 requires `livewire/livewire` `^4.4.7`. Host tests that assert on
Filament's loading markup should expect `wire:loading.attr="aria-disabled"`
with `wire:loading.class="fi-disabled"` on action buttons instead of `disabled`,
and host tests that read queued notifications from
`session('filament.notifications')` must read the notification mailbox
instead: since 5.10.2 Filament keeps them in a cache-backed
`Filament\Notifications\NotificationMailbox`.

### Package storage and vector backend defaults

1.0 lets a fresh install keep its knowledge in the application's own database
(W1.3, ADR 0047). Defaults changed:

| Setting | 0.20.5 | 1.0 |
| --- | --- | --- |
| `vector.backend` (`AGENTIC_CHATBOT_VECTOR_BACKEND`) | `pgvector` | `database` |
| `database.connection` (`AGENTIC_CHATBOT_DB_CONNECTION`) | none: the host's default connection | unchanged |
| `database.database` (`AGENTIC_CHATBOT_DB_DATABASE`) | `filament_agentic_chatbot` | none |
| `database.username` (`AGENTIC_CHATBOT_DB_USERNAME`) | `postgres` | none |
| Package-registered PostgreSQL connection | whenever `AGENTIC_CHATBOT_DB_CONNECTION` names a connection `config/database.php` does not define | only when `AGENTIC_CHATBOT_DB_URL` or `AGENTIC_CHATBOT_DB_DATABASE` is set as well |

New keys: `vector.database.warning_chunks`
(`AGENTIC_CHATBOT_VECTOR_DATABASE_WARNING_CHUNKS`, default 800) and
`vector.database.max_chunks` (`AGENTIC_CHATBOT_VECTOR_DATABASE_MAX_CHUNKS`,
default 3,000). New commands: `filament-agentic-chatbot:storage-preflight` and
`filament-agentic-chatbot:switch-knowledge-backend`. The never-supported
`pinecone` backend value is gone; any value other than `database`, `pgvector`
or `chroma` fails with "Unsupported vector backend".

An existing installation keeps its storage only if its effective values stay
the same. Nothing is relocated automatically:

1. **Before updating**, record the old effective values with the old
   installation (read-only):

   ```bash
   php artisan config:show filament-agentic-chatbot.vector.backend
   php artisan config:show filament-agentic-chatbot.database.connection
   php artisan config:show filament-agentic-chatbot.database.database
   ```

2. Set every value that differs from the 1.0 default explicitly. A typical
   0.20.5 pgvector install sets:

   ```env
   AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector
   # only if a dedicated connection was used:
   AGENTIC_CHATBOT_DB_CONNECTION=agentic_chatbot_pgsql
   AGENTIC_CHATBOT_DB_DATABASE=filament_agentic_chatbot
   AGENTIC_CHATBOT_DB_USERNAME=postgres
   ```

   If you published `config/filament-agentic-chatbot.php` before, its own
   defaults stay in effect until you publish it again; check its `vector` and
   `database` entries as well.

3. Update the package, then run the read-only preflight **before** any
   migration (`filament-agentic-chatbot:upgrade --dry-run` includes it):

   ```bash
   php artisan filament-agentic-chatbot:storage-preflight
   ```

   It prints the effective connection, driver, database, vector backend and
   which credentials are set (never their values). It fails when the named
   connection is undefined or unreachable, when package migrations are
   recorded but the package tables are missing on the connection (the storage
   is elsewhere: restore the old `AGENTIC_CHATBOT_DB_*` values), or when
   sources or live Agent versions need knowledge that the configured backend
   cannot search (restore the old `AGENTIC_CHATBOT_VECTOR_BACKEND`). Do not
   migrate until it passes. Doctor runs the same check as **Package storage**.

4. Run the upgrade (see "Ordered 0.20.5 to 1.0 procedure"). `2026_10_14_000004_create_database_vector_backend_tables`
   adds the empty tables `bot_knowledge_vectors` and
   `bot_knowledge_vector_replicas`. It refuses to run, and changes nothing,
   while the package tables are missing on the resolved connection or the
   existing knowledge needs another backend than the configured one. Its
   rollback drops only these two tables. Ingestion also refuses to write into
   a backend that cannot serve the existing knowledge.

To move existing knowledge to the `database` backend afterwards, run
`php artisan filament-agentic-chatbot:switch-knowledge-backend database --dry-run`
and follow `docs/OPERATIONS.md` ("Switching backends"). Knowledge above the
database backend's limits stays on pgvector or Chroma. After a cutover,
published Agent versions read the verified copies; an Agent shows unpublished
changes because a new compile names the new backend, and publishing it is
optional. Other behaviour changes:

- The service provider no longer skips the package migration
  `2024_01_01_000000_enable_vector_extension`; the migration itself runs only
  for the `pgvector` backend on PostgreSQL, as before.
- Retrieval no longer requires the configured backend to equal the backend a
  published version was compiled with. It requires every pinned generation to
  be searchable in the configured backend (built there or copied and verified
  by the switch) and fails closed otherwise.
- `ext-pdo_pgsql` is needed only for a PostgreSQL package connection.

### Administration authorization

1.0 adds a second administration model (W2.1, ADR 0053). Panel membership
alone never grants Agentic Chatbot administration.

| Setting | 0.20.5 | 1.0 |
| --- | --- | --- |
| `authorization.mode` (`AGENTIC_CHATBOT_AUTHORIZATION_MODE`) | none (per-surface Gates only) | `abilities` for new installations; `strict` for upgraded ones until set explicitly |
| `<surface>.authorization.require_gates` (`AGENTIC_CHATBOT_<SURFACE>_AUTHORIZATION_REQUIRE_GATES`) | `true` in production, `false` elsewhere | `true` in every environment |
| `outbound_webhooks.authorization.require_gates` (`AGENTIC_CHATBOT_OUTBOUND_WEBHOOK_AUTHORIZATION_REQUIRE_GATES`) | `true` in production, `false` elsewhere | `true` in every environment |

New: `FilamentAgenticChatbotPlugin::authorizeUsing()`,
`getAuthorizationCallback()`, `Support\Authorization\AdminAbility` with the
abilities `filament-agentic-chatbot.operate`, `.configure`, `.publish` and
`.admin`, and the read-only command
`filament-agentic-chatbot:authorization-preview`.

**Your installation keeps the `strict` mode** (the per-surface view and manage
Gates of 0.20.5, including their missing-Gate denials) when no mode is set and
any of these holds: your published `config/filament-agentic-chatbot.php` has no
top-level `authorization` key, an `AGENTIC_CHATBOT_*_AUTHORIZATION_REQUIRE_GATES`,
`*_AUTHORIZATION_ENABLED`, `*_VIEW_ABILITY` or `*_MANAGE_ABILITY` variable is
set, or one of the per-surface Gates (for example
`filament-agentic-chatbot.view-bots`) is registered. Doctor's **Sensitive admin
authorization** check names the evidence it found. Otherwise the installation
uses the `abilities` mode, which denies everyone until the host grants an
ability; it never grants more than the strict model did.

Breaking changes in the `strict` mode:

- Local, testing and staging environments no longer open package
  administration to every panel user. Register the per-surface Gates, set the
  surface's `REQUIRE_GATES` variable to `false` deliberately, or switch to the
  abilities mode.
- A user who implements `FilamentUser` must also pass `canAccessPanel()` for
  the panel that hosts the plugin, including on package routes outside the
  panel.
- Restore, force delete, replicate and reorder of package resources follow the
  resource's delete, edit and create decisions instead of Filament's policy-less
  default, which allowed them.
- Selecting the package-wide public widget Agent now checks the Agent manage
  Gate itself and refuses callers without an authenticated panel user.

To switch an upgraded installation to the abilities mode:

1. Grant the abilities in the panel provider
   (`FilamentAgenticChatbotPlugin::make()->authorizeUsing(...)`, see
   `docs/QUICKSTART.md`, "Grant access") or define Gates with the ability
   names.
2. Preview the effect. The command lists, per user, the actions gained and
   lost; it changes nothing:

   ```bash
   php artisan filament-agentic-chatbot:authorization-preview --to=abilities
   php artisan filament-agentic-chatbot:authorization-preview --to=abilities --user=12 --user=31
   ```

3. Set `AGENTIC_CHATBOT_AUTHORIZATION_MODE=abilities` (or `authorization.mode`
   in the published config) and rebuild the configuration cache. The
   per-surface Gates are then ignored; remove them when you no longer switch
   back. `strict` remains a supported mode.

### Settings page and app-wide provider keys

1.0 adds an **Agentic Chatbot > Settings** page (W2.2) for provider API keys
and base URLs, defaults for new Agents, the embedding profile and the website
signing key. Values are stored encrypted in the new table `agentic_settings`
(migration `2026_10_14_000005_create_agentic_settings_table`). Credentials now
resolve as: Agent-specific key, then the Settings page, then `.env`/config.
Your `.env` keys keep working; a key stored on the Settings page wins over
them. The website signing key resolves as: the key generated on the Settings
page, then `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`, then `APP_KEY`; generating or
rotating one invalidates website tokens signed with the previous key.

The page needs `filament-agentic-chatbot.admin` granted by a callback or Gate
that does not take a record. Under a record-aware grant (a callback declaring
`$record`, or a record-aware Gate) it stays unavailable, like model prices,
because a `null` record also means "class-level check" there. In the `strict`
mode it needs the new class-wide Gate `filament-agentic-chatbot.manage-settings`;
no 0.20.5 Gate grants it.

**Per-Agent embedding billing is removed.** The knowledge source field
"Embeddings billed to" is gone; ingestion of every source uses the app-wide
embedding key (Settings page, then `.env`). Agent-specific embedding keys stay
and are still used to embed visitor questions of that Agent. Usage history is
kept. Ingestion embedding calls are no longer charged to an Agent's usage
budget.

| 0.20.5 | 1.0 |
| --- | --- |
| `bot_knowledge_sources.billing_bot_id` | removed by `2026_10_14_000006_remove_knowledge_source_billing_agent` |
| `KnowledgeSource::billingAgent()`, `KnowledgeSource::ingestionAgent()` | removed |
| `KnowledgeSource::createForAgents($attributes, $agents, $billingAgentId)` | `KnowledgeSource::createForAgents($attributes, $agents)` |
| `IngestionDispatcher::assertEmbeddingCredentialsForAgent(?Bot)` | `IngestionDispatcher::assertEmbeddingCredentialsAvailable()` |
| `knowledge.library.billing_*` translations | removed |

The migration removes the relation only when nothing depends on it. A source
whose billing Agent supplied its own embedding key (an Agent embedding key, or
its chat key for the same provider) moves to the app-wide key, so the
migration refuses until both hold:

1. A usable app-wide key exists for the current embedding provider: store it
   on the Settings page (the settings migration ran before) or set it in `.env`.
2. An operator accepted the move for exactly those sources:

   ```bash
   php artisan filament-agentic-chatbot:embedding-billing-preflight
   php artisan filament-agentic-chatbot:embedding-billing-preflight --accept-app-key --operator="ops@example.com"
   php artisan filament-agentic-chatbot:upgrade --dry-run
   ```

The preflight lists every source with a billing Agent, the credential its
ingestion uses today and its active embedding profile, never a key. Sources
whose billing Agent already used the app key, or which no longer use their
billing Agent, need no acceptance. A source that is billed to an Agent key
after the acceptance makes the migration refuse again. Published Versions keep
their pinned knowledge either way.

### Declared model capabilities

1.0 lets an Agent use a model without a host or package profile once its
capabilities are declared in the Agent form (W2.6): tool calling (required),
structured output and vision. The migration
`2026_10_14_000007_create_agentic_model_capabilities_table` adds the empty
table `agentic_model_capabilities`. Profiles under
`filament-agentic-chatbot.models.capabilities` and the package profiles keep
precedence; existing Agents are unchanged. A first declaration needs
`filament-agentic-chatbot.configure` on the Agent; changing a stored one needs
an installation-wide admin grant (`strict` mode: the
`filament-agentic-chatbot.manage-settings` Gate).

The create wizard no longer preselects a chat
provider without a usable app-wide key (Settings page or `.env`); with no key
at all it preselects none. Host tests that create Agents through the wizard
without a key choose the provider explicitly.

### Scheduler and worker heartbeat

1.0 records two heartbeats (W2.3) and shows a persistent banner on the Agents
list and the Agent pages when one is stale. The scheduler must run
(`php artisan schedule:run` every minute) and a worker must process the chat
queue (`AGENTIC_CHATBOT_CHAT_QUEUE`, default `agentic-chat`); without them the
banner stays visible. Nothing needs to be migrated.

| 0.20.5 | 1.0 |
| --- | --- |
| Toast "Infrastructure checks failed" on opening the Agents list, and the Agents list action **Setup check** | removed; the banner and the Setup page replace them |
| (none) | scheduled closure `filament-agentic-chatbot:heartbeat` every minute and job `Jobs\RecordWorkerHeartbeat` on the chat queue |
| (none) | `operations.heartbeat.stale_after_seconds` (`AGENTIC_CHATBOT_HEARTBEAT_STALE_AFTER_SECONDS`, default 180) and `operations.heartbeat.cache_store` (`AGENTIC_CHATBOT_HEARTBEAT_CACHE_STORE`, default store) |

The heartbeat cache store must be shared by the web, scheduler and queue worker
processes; with the `array` store the banner says the status cannot be
confirmed. A chat queue connection that cannot carry widget turns (`sync`, or a
`retry_after` that does not exceed the chat execution time) is reported by the
banner; there is no synchronous fallback for widget turns.

### Setup page and Doctor registry

1.0 adds **Agentic Chatbot > Setup** (W2.4): the Doctor checks in the panel.
Every `filament-agentic-chatbot:doctor` check moved into a class of
`Support\Setup\Checks` that implements the internal `SetupCheck` interface and
is listed in `SetupCheckRegistry`; the command and the page render that
registry. The command keeps its table, its `FAIL` and warning semantics and its
exit codes; it adds a "How to fix" list after the table and one check,
**Scheduler and chat queue heartbeat**, which only warns. The Setup page needs
any of `filament-agentic-chatbot.operate`, `.configure` or `.publish` (required
group only); details, commands and the other groups need an installation-wide
`filament-agentic-chatbot.admin` (see the action map: `setup.view`,
`setup.diagnostics`). In the `strict` mode the page follows the Agents view Gate
and the `filament-agentic-chatbot.manage-settings` Gate.

| 0.20.5 | 1.0 |
| --- | --- |
| `Console\DoctorCommand` constructor with three repositories and `check*()` methods | `handle(SetupCheckRegistry $checks)`; one class per check in `Support\Setup\Checks` (internal, not part of the host API) |
| Agents list action **Setup check** and its toast | the **Setup** page and, on an empty list, a link to it while a required check needs attention |

### Interactive installer

`php artisan filament-agentic-chatbot:install` (W2.5) is now a guided setup on a
terminal and keeps its previous behavior with `--no-interaction`. It asks for the
AI provider, its API key (stored encrypted on the Settings page storage, never in
`.env`), the queue connection and whether to register the plugin in a detected
panel provider; it previews the panel provider diff and edits only after you
confirm. It also creates missing queue tables on the selected connection
(`jobs`, `job_batches`, `failed_jobs`; existing tables are never touched) and
generates the website signing key when neither the Settings page nor
`AGENTIC_CHATBOT_WIDGET_SIGNING_KEY` provides one. It never writes `.env` and
never grants access.

| 0.20.5 | 1.0 |
| --- | --- |
| The installer migrated whatever it found, including an existing installation | An existing installation (package tables without the `agentic_settings` table) is **not** migrated: the installer stops and prints `php artisan filament-agentic-chatbot:upgrade --dry-run` and this section. Follow "Upgrade order" above |
| Unreachable or ambiguous package storage surfaced only in Doctor afterwards | The installer runs the storage preflight first and refuses before changing anything |
| An unregistered plugin always failed the run | Interactively the installer offers to register it (previewed, confirmed edit); with `--no-interaction` it still fails and edits no host PHP |
| Queue tables were the host's job | The installer creates only missing queue tables of the selected connection |
| The **Chat provider/model** check read only `AGENTIC_CHATBOT_CHAT_PROVIDER` and `..._MODEL` | When the Settings page (or the installer) stored a default provider, the check validates that provider, model and key |

Deployment scripts that run the installer without a terminal need no change; a
run without a TTY is treated like `--no-interaction`. An upgrade script that
relied on the installer to migrate a 0.20 database runs
`filament-agentic-chatbot:upgrade` instead (see "Ordered 0.20.5 to 1.0 procedure").

### One Agent lifecycle: Draft, Live, Paused

An Agent is now **Draft** (no published version), **Live** (published,
visitors answered) or **Paused** (published, visitors not answered) (W3.1,
ADR 0045). The `is_active` column keeps its meaning (true is Live, false is
Paused or Draft); no migration runs and existing Agents keep their state. An unpublished Agent whose `is_active` was
switched on in 0.20.5 is a Draft and still gets no answers.

**The first Publish now makes the Agent live by default.** Its dialog has the
checkbox **Make the Agent live for visitors now**, checked by default;
unchecking it publishes and leaves the Agent Paused. Later publications and
restores never change Live or Paused. Code that calls
`AgentReleaseService::publish()` on a Draft gets a Live Agent unless it passes
`live: false` (the class is internal, not part of the host API).

| 0.20.5 | 1.0 |
| --- | --- |
| Publish never changed `is_active`; a new Agent stayed paused after its first Publish | The first Publish of a Draft sets `is_active` from the checkbox (default on) in the same transaction; later Publish keeps it |
| The **Availability** toggle (`is_active` field of `BotIdentityForm`, `includeAvailability` parameter) | Removed from every form; **Pause** and **Resume** header actions with a confirmation on the Agent editor and the read-only Agent view |
| The **Availability** section on the Overview (`BotSettingsPanel` group `availability`, `toggleAvailability()`; `BotSettingsSaver` group `availability`) | Removed; `AgentReleaseService::pause()` and `resume()` own availability; Resume refuses a Draft |
| **Enable visitor access** on the **Website** tab (`BotWebsitePanel::activate()`, step `activate`) | Removed; the tab names the status and points to **Resume** (step `paused`) |
| States "Not published", "Unpublished changes", "Republish needed", availability "Enabled"/"Paused" and the list column **Active** | One status: **Draft**, **Live**, **Paused**, **Live, unpublished changes**, **Paused, unpublished changes**, **Publish needed** (action **Publish**), shown by the header, Overview, Website tab and Agent list |

Pause and Resume need the `filament-agentic-chatbot.publish` ability (strict
mode: the Agents manage Gate), as Publish and Restore do. Translation
overrides of the removed keys (`agents.release_state.republish_needed`,
`agents.edit_bot.republish`, `common.availability_enabled` and the other
availability texts) no longer apply; the new texts live under
`agents.lifecycle.*`.

### Current knowledge under a pinned source set

New Agents serve completed re-syncs of their Sources without a Publish (W3.2,
ADR 0046). **Existing Agents and every existing Version keep published
(frozen) knowledge**: nothing changes on upgrade or on the first retrieval.
The upgrade runs the migration
`2026_10_14_000008_add_knowledge_generation_archival_and_source_revocations`
adds `bot_knowledge_generations.archived_at` and creates
`bot_knowledge_source_revocations`. No existing row is rewritten.

| 0.20.5 | 1.0 |
| --- | --- |
| Every Agent Version pinned one knowledge generation per Source; a re-sync reached visitors only after Publish | Draft key `runtime_config.knowledge.update_mode`: `current` (new Agents from the create wizard) serves the newest completed generation of each pinned Source built with the pinned embedding profile; `frozen` (absent key, every Agent from before 1.0) keeps the 0.20.5 behaviour. The field **Knowledge updates** in the Agent editor (Advanced, Knowledge retrieval) changes it; the change needs Publish |
| Knowledge authority format `knowledge_authority.v1` only | Frozen Versions still compile byte for byte to `knowledge_authority.v1`, so upgraded Agents show no unpublished change. Current Versions use `knowledge_authority.v2` with `update_mode: current` and Source pins without `generation_id`, `generation`, `generation_contract_hash` and `content_hash`. Stored deployments are never rewritten |
| Retrieval diagnostics without generations | `KnowledgeRetrievalDiagnostic` and the turn evidence (`chat_turn_execution_evidence.v7`, field `knowledge_retrieval`) carry `update_mode` and `generations` (`source_id`, `generation_id`); new error codes `embedding_credentials_missing`, `knowledge_source_revoked`, `knowledge_generation_unavailable` |
| A changed embedding profile showed only unpublished changes | Live Versions keep querying with their pinned profile and show **Publish needed**; Publish is refused until every Source has a completed generation under the new profile |
| Superseded generations were kept forever | `filament-agentic-chatbot:prune-knowledge-generations` (scheduled daily at 02:50) archives generations no Source, frozen Version, Workflow deployment or live current Version needs after `knowledge_sources.generation_retention.days` (`AGENTIC_CHATBOT_KNOWLEDGE_GENERATION_RETENTION_DAYS`, default 30, minimum 1); disable the schedule with `AGENTIC_CHATBOT_KNOWLEDGE_GENERATION_RETENTION_SCHEDULE_ENABLED=false`. Archived rows keep their hashes and counts |
| No way to stop a Source except deleting it after Publish | **Revoke Source** (admin ability, action `knowledge.revoke`): audited, one-way, makes every retrieval that pins the Source fail closed until the Agents are published without it |
| Editing a shared Source needed manage access to the Source | Editing, rebuilding and re-syncing also need edit access to every live Agent with current knowledge that uses the Source; assignment changes from the Agent editor need only the Source's manage access |
| `KnowledgeRetrievalService::retrieve(..., ?array $authority)` | `retrieve(..., array\|ResolvedKnowledgeAuthority\|null $authority)`; the class is internal, not part of the host API |

Host code that creates Agents directly (`Bot::create()`, seeders) gets frozen
knowledge unless it sets `runtime_config.knowledge.update_mode` to `current`.
Workflow knowledge steps keep frozen pins in 1.0. Vectors of archived
generations are removed only from the configured vector backend.

### Reviewed dependent publication and the upgrade command

A new API tool revision or Workflow version reaches the live Versions that pin
an older one without publishing their drafts (W3.3, ADR 0055). On the API tool
page, **Publish affected Agents** previews every affected Agent (Live or
Paused, version change, input or description changes, whether its draft keeps
other unpublished changes), the Agents that need their own Publish because
the new version would change what the Agent may do, the Drafts that are left
alone and the Workflows that pin an older revision. It needs the
`filament-agentic-chatbot.publish` ability on every affected Agent (strict
mode: the Agents manage Gate) and publishes nothing otherwise. Each Agent gets
a new Version derived from its live Version with only that pin replaced;
drafts, unpublished changes, Live and Paused stay. A concurrent Publish or a
newer dependency version after the preview is reported as a conflict for that
Agent; **Resume publication** retries Agents that failed without publishing
any Agent twice. The migration
`2026_10_14_000009_create_publication_batches_and_upgrade_runs` adds the
tables `agent_publication_batches`, `agent_publication_batch_targets` and
`agentic_upgrade_runs`.

| 0.20.5 | 1.0 |
| --- | --- |
| A new API tool revision reached an Agent only through a Publish of its whole draft | **Publish affected Agents** (API tool page) and **Resume publication**; Versions created this way have the note "Updated Tool ... to version ..." and the deployment source `dependency` |
| Publish after a Workflow rollback pinned the older Workflow version without a warning | Publish lists the older API tool or Workflow versions as warnings and needs the checkbox **Publish the older versions listed above**; `AgentReleaseService::publish()` refuses with `AgentDependencyRegression` unless `acceptOlderDependencies: true` (the class is internal, not part of the host API) |
| `AgentDeploymentPublisher::persist()` compiled, stored and verified in one method | `persist()` compiles the draft and calls `persistContract()`, which stores and verifies compiled and derived contracts (internal) |
| `php artisan migrate` after updating the package | `php artisan filament-agentic-chatbot:upgrade --dry-run`, then `filament-agentic-chatbot:upgrade --operator=... --backup-confirmed --workers-stopped` (see "Ordered 0.20.5 to 1.0 procedure") |

### Publish and update from the Workflow editor

A Workflow of a Live or Paused Agent goes live in one action (W3.4,
ADR 0048). The Workflow editor's primary button is **Publish and update
{Agent}**: it publishes the Workflow version and a new Agent Version derived
from the live Version in one database transaction, so the Agent's other draft
changes stay unpublished and Live or Paused stays. **Publish only** (behind the
arrow next to the button) keeps the 0.20.5 behaviour. No migration runs and no
existing row changes.

| 0.20.5 | 1.0 |
| --- | --- |
| Publish in the Workflow editor published the Workflow only; the Agent needed **Add to {Agent}** and its own Publish of the whole draft | **Publish and update {Agent}** needs the `filament-agentic-chatbot.publish` ability on the Workflow and on the Agent (strict mode: the Workflows and Agents manage Gates); when the Agent did not use the Workflow yet it also adds it to the Agent draft's Workflow list, which needs the `filament-agentic-chatbot.configure` ability on the Agent. Versions created this way have the note "Updated Workflow ... to version ..." and the deployment source `dependency` |
| The editor offered nothing when the Agent ran an older Workflow version | **Update {Agent}** makes the current Workflow version live in the Agent without a new Workflow version |
| The Publish button was enabled for users without the publish ability | The button is disabled with the tooltip "You cannot publish this Workflow."; without publish on the Agent, the button reads **Publish only** and names the reason |
| An Agent without a live Version showed the four steps to chat | Unchanged steps, plus the hint "Publish the Agent to use this Workflow"; the first Publish of the Agent decides Live or Paused |

When the Agent and Workflow tables resolve to different database connections
(for example through a host override of the Agent model), the editor offers
only **Publish only**, because one transaction cannot span two connections.

### One readiness service and a new Agent editor structure

The Agent editor has seven tabs in the order of the work (W4.1): **Overview**,
**Instructions**, **Knowledge**, **Tools**, **Channels**, **Handoff and access**
and **Test & versions**. Each tab states once, with a badge, whether its
changes go live on Publish or apply immediately. What is missing on an Agent
comes from one service, `AgentReadiness`; the Overview checklist, the Publish
dialog, the Agent list and the Channels prerequisites show the same checks. No
migration runs and no stored value changes.

| 0.20.5 and earlier 1.0 candidates | 1.0 |
| --- | --- |
| One tab **Website & channels** (query value `website`) mixed the embed code, allowed websites, appearance, handoff notification, the Agent's own API keys, channels and Pause | **Channels** (`channels`): embed code, allowed websites and audiences, **Customize widget**, other channels. **Handoff and access** (`access`): **Pause** and **Resume**, handoff recipients and business hours, the Agent's own API keys collapsed under **Advanced**. A bookmark with `bot-tab=website` opens the first tab; use `channels` or `access`. Every setting kept its permission and its saved value |
| Each tab said in a sentence ("Changes here apply immediately.", "Changes go live when you publish.") whether it needed Publish | One badge per tab: **Goes live on Publish** (Instructions, Knowledge, Tools) or **Applies immediately** (Channels, Handoff and access). Save draft and Publish work as before |
| Widget appearance and the appearance per audience were three accordions and a preview on the Website tab | **Customize widget** opens them with the live preview in a slide-over of **Channels** |
| The chat provider, model and the Agent's key were on different tabs, and the key status was only on the Overview | **Instructions** has a **Model** section with a badge for the key source: **Agent key**, **Settings key**, **.env key** or **Key missing** |
| The read-only Agent view repeated every editor tab for everyone, including users who may edit | Users who may edit the Agent are sent to the editor from `/{panel}/bots/{record}`; the read-only view remains for users without the edit ability. It no longer has an **Edit** action |
| The Agents list menu had **Analytics** and **Edit** | **Pause** and **Resume** are added for users with the publish ability, with the same confirmation as the Agent page |
| The create wizard step **AI connection** only showed "Not completed" | It says what is missing ("No API key found for Google Gemini. Add one in Settings, or under API key overrides below.") or that the model is ready |
| Publish saved the draft and showed "Published" | When the Agent is live, the notification also links to **Get embed code** on the Channels tab |

| 0.20.5 | 1.0 |
| --- | --- |
| Tabs **Overview**, **AI Setup**, **Knowledge & capabilities**, **Website**, **Advanced**, **Tests**, **Versions**; the query values were `overview`, `ai-setup`, `behavior`, `widget`, `advanced`, `tests`, `versions` | Tabs **Overview**, **Instructions**, **Knowledge**, **Tools**, **Channels**, **Handoff and access**, **Test & versions**; the query values are `overview`, `instructions`, `knowledge`, `tools`, `channels`, `access`, `tests-versions`. Bookmarks with an old value open the Overview |
| Six ways to save: the page Save button, and **Save website access**, **Save connection**, **Save appearance** in their own panels | Two: **Save draft** (Instructions, Knowledge, Tools; needs Publish) and **Save** (Channels, Handoff and access and **Customize widget**; applies immediately). The Overview has no save button |
| **Edit name & role** on the Overview; custom instructions in **Advanced** and again in the create wizard | The name is in **Instructions**; custom instructions appear once in the editor |
| The widget language was saved with the immediate appearance settings but compiled into the Version at Publish | **Default language** is an Instructions field: it saves with **Save draft** and needs Publish (its stored value and effect are unchanged) |
| **Agent save types** (key, label, version, statuses, duplicate check, duplicate policy, consent variable, payload fields with patterns, tracking schema) were edited in **Permissions & technical details** | They are configuration only (`submissions.schemas`). Save types stored on an Agent keep working; **Approved save types only** stays in **Tools** |
| `BotLaunchReadinessEvaluator`, `BotNextStepPresenter`, `BotReleaseReadinessPresenter`, `BotOverviewHealthProjector`, `BotPublishChecks` and `SolutionKitProgressPresenter` computed readiness separately | Removed (internal classes, not part of the supported API); `AgentReadiness` replaces them |
| A missing API key was only a warning in the Publish dialog | A missing model, no usable API key for the selected provider, or a Tool or Workflow that cannot compile disables **Publish** in the editor and in the read-only view. `AgentReleaseService::publish()` itself is unchanged |
| Overview technical details listed runtime services and resource health rows | They list the live version, tools, writes and usage; problems appear in the checklist |
| **Pause** and **Resume** were header actions only | Also in **Handoff and access** and in the Agents list; all open the same confirmation |
| Knowledge pages returned to the Agent tools with **Back to Agent tools** | **Back to Agent knowledge** returns to the Knowledge tab |

### Conflict checks for direct Agent writes

A write Tool with an API conflict check now runs that check before it is sent
when the Agent calls it directly (W6.3). Until 0.20.5 the check could not run
for a direct write and the call stayed claimed until its lease expired.

- **Publish again.** Agent Versions published before this release do not hold
  the check. Their direct write with a conflict check is refused with
  `agent_write_conflict_check_unpinned` and the message "Publish the Agent again
  to run it"; nothing is claimed or sent. It never runs without its check.
  Publish the Agent (or **Publish affected Agents**) once to pin it.
- A Data Resource conflict check cannot be pinned to a direct write. The Tool is
  refused for the Agent with "use a Playbook for it".
- A check that cannot complete now ends as `connector_conflict_check_failed`
  and the claim is released as `failed` with the error category `conflict`.

| 0.20.5 | 1.0 |
| --- | --- |
| The Agent write pin had no conflict check; the checker failed after the claim and left a `running` ledger row | The pin holds `supporting_capabilities.conflict_check`; a failed check releases the claim as `failed` (category `conflict`) |
| `SideEffectConflictCheckerRegistry` took `ApiConnectorOperationConflictChecker` and `DataResourceConflictChecker` as constructor arguments | `new SideEffectConflictCheckerRegistry(checkers: [], lazyCheckers: [...], resolver: ...)`; the built-in checkers are resolved on first use (internal) |

### Test-account staging binding

A write Tool of a provider with one API origin can now be published through a
test account (W6.1, ADR 0049).
The migration `2026_10_14_000010_add_test_account_staging_binding_to_api_connectors`
adds `staging_binding_type` (default `separate_endpoint`),
`staging_account_binding` and `staging_account_review` to `api_connectors`.
Existing Connections keep their separate-endpoint binding; their staging
binding hash, test evidence and published Tools do not change.

| 0.20.5 | 1.0 |
| --- | --- |
| A staging Connection on the production origin was always refused | Still refused for a `separate_endpoint` binding. A `test_account` binding may share the origin when credentials differ, a test marker holds and a reviewed adapter verified the accounts, or the host listed the origin in `api_connectors.test_account_staging.unverified_separation_origins` and an `.admin` user ran **Review test account** |
| `ConnectorStagingBindingResolver(ConnectorAccessPolicy, ConnectorRequestHeaderPolicy)` | `ConnectorStagingBindingResolver(ConnectorAccessPolicy, ConnectorCredentialFingerprints, TestAccountStagingBinding)` (internal) |
| Administrative action map without a test-account entry | `connections.test_account_review` (`.admin`; `strict`: the API connector manage Gate) |
| No `api_connectors.test_account_staging` configuration | `unverified_separation_origins` (default empty: blocked) `evidence_ttl_minutes` (`AGENTIC_CHATBOT_API_CONNECTORS_TEST_ACCOUNT_EVIDENCE_TTL_MINUTES`, default 1440) and `review_ttl_days` (`AGENTIC_CHATBOT_API_CONNECTORS_TEST_ACCOUNT_REVIEW_TTL_DAYS`, default 90) |

### Embed code always visible and installation detection

The **Channels** tab always shows the embed code and says where the
widget was seen (W4.2). A Draft or a Paused Agent no longer hides the code; the
prerequisites are listed below it with their status.

| 0.20.5 | 1.0 |
| --- | --- |
| The embed code appeared only after seven prerequisites; a Paused Agent had none | The script tag is always shown. The prerequisites are listed below it with their status |
| "Installation: not yet checked." (static) | Each host shows "Seen on {host}, last {time}" or "Not seen yet" |
| Any `localhost` origin needed an allowed host, also in development | In the `local` environment only, `localhost`, `127.0.0.1` and hosts ending in `.test` or `.localhost` are allowed without configuration (bootstrap, chat and CORS). Other environments are unchanged |

The migration `2026_10_14_000011_create_agentic_widget_installations_table` adds
the table `agentic_widget_installations` (one row per Agent and host:
`bot_id`, `host`, `page_url`, `first_seen_at`, `last_seen_at`; unique on Agent
and host; rows are deleted with the Agent). The widget script now sends the
path of the page (no query, no fragment) with its bootstrap request, so browsers
fetch a new script version. See "Installation Status" in
`docs/CHAT_WIDGET.md` for the limits that protect the table.
Translation overrides of the texts of the old Website steps
(`agents.website_panel.installation_not_yet_checked` and the other removed
`agents.website_panel.*` keys) no longer apply; the new texts live under
`readiness.*`.

### One placement concept, no implicit fallback

**Channels** shows three placement cards: **Any website (script
tag)**, **This Laravel app (Blade component)** and **Inside this admin panel**
(W4.3).

**Hosts that rely on the Blade component fallback must change their code.** The
component no longer picks an Agent on its own. Before the upgrade, a component
without an attribute resolved the marked Agent, then
`AGENTIC_CHATBOT_WIDGET_BOT_PUBLIC_ID`, then the first runnable Agent. Now add
`agent="YOUR_AGENT_PUBLIC_ID"` to every `<x-filament-agentic-chatbot::chat-widget />`
or mark one Agent with **Use as app default**. A component with neither renders
nothing and writes one warning to the log. Search your views for
`chat-widget` and check each result before you switch traffic.

| 0.20.5 | 1.0 |
| --- | --- |
| `<x-filament-agentic-chatbot::chat-widget />` resolved the marked Agent, then `AGENTIC_CHATBOT_WIDGET_BOT_PUBLIC_ID`, then the first runnable Agent | Shows the Agent of the `agent` attribute, or else the Agent marked as the app default. No other fallback; neither resolves, nothing renders and one warning is logged |
| Attribute `bot-public-id="..."` | `agent="..."`. The old attribute is ignored with a warning (it never shows the app default instead) |
| Environment value `AGENTIC_CHATBOT_WIDGET_BOT_PUBLIC_ID`, configuration key `widget.bot_public_id` | Removed. Delete the line from a published `config/filament-agentic-chatbot.php` and from `.env`; Doctor reports a leftover published key |
| Row action and header action **Use as public widget** (`useAsPublicWidget`) in the Agents list and the Agent editor | **Use as app default** on the Blade component card of **Channels**; the row and header actions are removed. Still one Agent for the whole installation and still admin only |
| Administration action `agents.public_widget` (`.admin`) | `agents.app_default` (`.admin`); the strict mode still uses the Agents manage Gate. Update `authorizeUsing` callbacks or previews that name the action |
| List column **Public Widget** | **App default**; the stored marker `runtime_config.public_widget.entrypoint` is unchanged, so existing marks keep working |

Translation overrides of the removed keys (`common.use_public_widget`,
`common.public_widget_agent_updated`, `common.public_widget_selection_blocked`,
`agents.edit_bot.public_widget` and the other texts of the removed actions) no
longer apply; the new texts live under `readiness.*` and `common.app_default_*`.

### Agent permission mode removed

The permission mode (**Read access**, **Approved write actions**, **Read access
and approved write actions**) is gone (W4.4, ADR 0054). An Agent may read
through every assigned read tool and its assigned Sources and may propose
writes through every assigned write tool; each write keeps its own **Ask
visitor to confirm** setting. **Collect leads** is a write tool switched on by
its own toggle in **Tools**, and each App data write has an **Allow** switch.

**Drafts are converted so nothing gains authority.** The migration
`2026_10_14_000012_remove_agent_permission_mode` (part of the upgrade's
`migrate` phase) reads each draft's mode (the stored value, else your
published `capabilities.default_mode`, else `query_only`) and removes what the
mode denied:

| Former mode | Removed from the draft |
| --- | --- |
| `query_only` (Read access) | API write tools, Workflows whose current version saves or changes data (also in a sub-Workflow), **Collect leads**, and the App data writes of each assigned resource (its read tool stays) |
| `write_only` (Approved write actions) | the assigned Sources (the Sources themselves stay in the library), App data reads, API read tools and Workflows whose current version reads data |
| `query_and_write` | nothing |

A draft that lost something shows a notice in **Tools** and **Knowledge** and a
warning on the Overview until someone dismisses it. Review it before the next
Publish; add a tool again if the Agent should now use it. The conversion runs
once, in one transaction, and records `agents.permission_mode_removal` in
`agentic_settings`; until it has run, 1.0 publishes no draft.

**Live versions are never rewritten.** A version published with a mode runs
unchanged when none of its tools, Sources or pinned Workflow steps reaches what
that mode denied (most `query_and_write` and `query_only` Agents). Otherwise 1.0
cannot run it with exactly its old authority: visitors see that the assistant
must be republished, its pending visitor cards expire, and the upgrade
preflight `contracts` check blocks with the Agent's name and the reason. Fix
it before the upgrade on 0.20.5 (change the mode to the one you want, or remove
the tool or Workflow, and publish) or after `php artisan migrate` on 1.0
(review the converted draft and publish), then run the upgrade again.
Typical cases: a Read access Agent whose pinned Workflow saves data, or an
Approved write actions Agent whose Workflow or tools read data.

| 0.20.5 | 1.0 |
| --- | --- |
| Draft field `runtime_config.capabilities.mode` (`query_only`, `write_only`, `query_and_write`) and the **What should this Agent be allowed to do?** control | Removed. The assigned tools are the authority; the draft action refuses the field |
| Configuration key `capabilities.default_mode` | Removed. Delete it from a published `config/filament-agentic-chatbot.php` after the upgrade (the migration reads it once) |
| Contract field `authority.capability_mode` | No longer written. Stored contracts keep it; 1.0 runs them only as described above |
| `BotCapabilityPolicy::mode()`, `allowsQueries()`, `allowsWrites()`, `allowsRequirement()`, `allowsHttpMethod()`, `MODE_*` constants and the denied-message methods | Removed. `BotCapabilityPolicy` keeps the static requirement classification (`normalizeRequirement()`, `requirementForHttpMethod()`, `classified()`) |
| `BotCapabilityView::$mode` and the `mode` key of `CapabilityCatalog::forBot()` (view version 3) | Removed (view version 4) |
| Workflow validation issues `agent_writes_disabled`, `agent_reads_disabled`, the fixes **Allow saving** / **Allow reading** (`allow-agent-writes`, `allow-agent-reads`, event `workflow-fix-agent-permission`, Livewire action `fixAgentPermission`) | Removed. A Workflow step needs no Agent permission |
| Agent status `capture_only` and the summary keys `allowsQueries`, `capabilityMode` of `BotChatBehaviorPresenter` | Removed |
| Section **Permissions and App data tool settings** (`advanced-permissions`) | **App data tool and save settings** (`advanced-tool-settings`) |
| A query-only Agent's draft could hold write tools that silently did nothing | The upgrade removes them with a notice |

Translation overrides of the removed keys (the `agents.bot_behavior_form.*` and
`agents.bot_capability_policy.*` groups, `common.read_access`,
`common.approved_write_actions`, `common.read_access_approved_write_actions`,
`agents.compile.operations_need_access`, `agents.compile.operation_reads`,
`agents.compile.operation_writes`, `agents.built_in_tools.collect_leads_needs_writes`,
`agents.release_state.live_capture_only_detail`,
`playbooks.agent_publication.live_version_cannot_write`, `playbooks.issues.allow_saving`,
`playbooks.issues.allow_reading`, `readiness.tools_permissions` and the other texts of the
removed controls) no longer apply; the new texts live under
`agents.permission_mode_notice.*`, `readiness.tools_settings` and
`readiness.permission_mode_removed`.

### Templates replace Solution Kits

Solution Kits are gone (W4.6). The built-in Customer Support & Human Handoff
Kit, the **Use template** modal and the Solution Kit wizard of **Build >
Agents** are replaced by Agent templates: cards in step 1 of **Create Agent**
and in the empty Agents list. See `docs/AGENT_TEMPLATES.md`.

**Nothing you created is touched.** Agents, Workflows and tests that a Kit
created are ordinary rows and stay as they are. The migration
`2026_10_14_000018_drop_solution_kit_installations` drops the table
`agent_solution_kit_installations`, which held only the audit evidence of each
install (it is not restored on rollback). The Overview of such an Agent no
longer shows the Kit progress steps.

| 0.20.5 | 1.0 |
| --- | --- |
| `Heiner\FilamentAgenticChatbot\SolutionKits\Contracts\SolutionKitProvider` (`solutionKits()`), tagged with `$this->app->tag(..., SolutionKitProvider::class)` | `Heiner\FilamentAgenticChatbot\Templates\Contracts\AgentTemplateProvider` (`templates()`), tagged with `$this->app->tag(..., AgentTemplateProvider::class)` |
| `SolutionKitDefinition` (array of `key`, `version`, `name`, `summary`, `description`, `agent`, `resource_slots`, `connector_slots`, `playbooks`, `tests`, `outcomes`) | `Heiner\FilamentAgenticChatbot\Templates\AgentTemplate` (final readonly: `key`, `title`, `description`, `icon`, `instructions`, `builtInTools`, `requiredToolKinds`, `workflows`, `afterCreate`) and `AgentTemplateRequirement` |
| Classes `SolutionKitCatalog`, `SolutionKitInstaller`, `SolutionKitPlanner`, `SolutionKitPlan`, `SolutionKitMappingCatalog`, `SolutionKitAdminAuthorization`, `SolutionKitInstallationResult`, `CustomerSupportHandoffKitProvider` | Removed. `AgentTemplateCatalog` collects the templates; there is no installer |
| Model `SolutionKitInstallation`, relation `Bot::solutionKitInstallation()`, table `agent_solution_kit_installations` | Removed (migration `2026_10_14_000018_drop_solution_kit_installations`) |
| Wizard `SolutionKitWizard`, header action `createFromSolutionKit` (**Use template**), readiness steps `solution_kit.*` | Removed. The Create Agent wizard and the empty Agents list show the template cards |
| Translation groups `agents.solution_kit_wizard.*`, `agents.solution_kit_progress.*`, `agents.list_bots.use_template`, `agents.list_bots.create_agent_solution_kit`, `agents.list_bots.install_solution_kit`, `agents.list_bots.solution_kit_installed`, `agents.list_bots.solution_kit_installation_already_completed`, `agents.list_bots.kit_agent_draft`, `agents.list_bots.configure_reviewed_starting_point_app`, `agents.bot_overview_form.solution_kit_next_step_step` | Removed. New texts live under `agents.agent_templates.*`, `readiness.template_requirement_missing`, `readiness.template_requirement_app_data` and `readiness.fix_set_up_app_data_tool` |
| Docs page `SOLUTION_KITS.md` | `AGENT_TEMPLATES.md` |
| Create Agent step 1 **Purpose** | **Start with**: the template cards, then the **Purpose** choice (conversation or content), name, job and boundaries |
| New Agents always start with Handoff on | A template decides: **Customer support with handoff** turns it on, **FAQ from your website**, **Lead capture** and **Order status** do not. **Lead capture** turns Collect leads on. **Start from scratch** keeps Handoff on |

#### Porting a SolutionKitProvider

1. Implement `AgentTemplateProvider::templates()` and return `AgentTemplate`
   objects instead of `SolutionKitDefinition`. Keep the registration, only the
   interface changes.
2. Map the Kit fields: `key` (lowercase slug; drop `version`), `name` to
   `title`, `summary` and `description` to one short `description`, add an
   `icon`, the `agent.assistant_profile` values (`role`, `boundaries`,
   `audience`, `tone`, `answer_length`, `uncertainty`, `fallback_behavior`,
   `citation_policy`) and `agent.system_prompt` to `instructions` (`system_prompt`
   becomes `custom_instructions`), and each `playbooks[]` entry to `workflows[]`
   with `key`, `name`, `description` and `workflow` (the same schema v2
   definition).
3. Drop what templates do not carry: `resource_slots`, `connector_slots`,
   `tests`, `outcomes`, `agent.widget`, `agent.requires_write_approval` and the
   installation approval. A template never selects or assigns Tools. If the
   Agent needs an App data tool, say so with
   `new AgentTemplateRequirement(AgentTemplateRequirement::APP_DATA, 'App data tool for orders')`;
   Publish then stays blocked until someone assigns one. To switch on
   Handoff or Lead capture, name them in `builtInTools` (`human_handoff`,
   `lead_capture`).
4. A template's Workflows are created as unpublished drafts of the new Agent.
   Publishing them and assigning them to the Agent follow the usual rules, as
   do Agent tests, which you add in the Agent editor.

An invalid or duplicate template is left out and logged with the provider's
class name instead of failing the Agents page.

### Customer identity for personal tools and host model policies

ADR 0057 defines how personal App data tools and host model policies find the
customer they act for. Three changes need attention:

1. **Host model policies use the host actor resolver.** Before 1.0 a
   registered Laravel model policy on an App data tool write required the
   current auth guard user (`Auth::guard()->user()`) to match the attested
   actor, so it refused every queued turn. In 1.0 the policy is evaluated for
   the attested customer through `Contracts\HostActorResolver`, and the guard
   is never read. Allow the actor type and define the host ability, or these
   writes fail closed with `host_actor_unsupported`:

   ```php
   // config/filament-agentic-chatbot.php (new keys)
   'context' => ['host_actors' => [
       'types' => ['customer' => App\Models\Customer::class], // or [App\Models\User::class] for same-origin guard users
       'ability' => env('AGENTIC_CHATBOT_CONTEXT_HOST_ACTOR_ABILITY', 'filament-agentic-chatbot.serve-customer'),
   ]],

   // AppServiceProvider::boot()
   Gate::define('filament-agentic-chatbot.serve-customer',
       fn (Customer $customer, HostActorReference $reference): bool => $customer->is_active);
   ```

   The Setup page and Doctor check **Host actor resolution** fail until a live
   write with a model policy has an allowed actor type and the ability exists.
   An isolated staging write test attests the confirming operator, so with a
   model policy that operator's class must be allowed in the staging app too.

2. **Signed context no longer serializes the user model.** Before 1.0,
   `WidgetContextToken::issueForBot(..., actor: $user)` copied the user's
   `name` (or `email`) into the token as `actor.label`. In 1.0 a model actor is
   signed as its class and key only. Pass
   `['type' => ..., 'id' => ..., 'label' => ...]` when a scope really needs
   `actor.label`. A tenant object (a model) is signed as its key only; pass an
   array to sign its type, slug, public ID or label. The token format is
   unchanged; issued tokens stay valid. `WidgetContextToken` and
   `WidgetContextTokenIssuance` are now supported API.

   **Pending cards proposed before the upgrade.** A 0.20.5 token issued for a
   user model carries `actor.label`, and the label is part of the authority
   scope that a confirmation card is bound to. After the first context renewal
   on 1.0 the label is gone, so pressing Confirm on such a card fails with
   `binding_mismatch` and nothing is written. Ask the customer to request the
   change again, or keep passing the same label explicitly
   (`['type' => $user::class, 'id' => $user->getKey(), 'label' => $user->name]`)
   until the old cards expired (30 minutes). The same applies to cards of
   same-origin guard users proposed before the upgrade: the runtime now attests
   a user model by class and key only.

3. **Personal tools without identity answer `sign_in_required`.** A tool whose
   scope binds `actor.*`, `tenant.*`, `widget_context.*`, `token.*` or
   `conversation.owner_*` returned `agent_tool_arguments_invalid` ("could not
   resolve scope source") without identity; it now returns `sign_in_required`
   and the widget shows a sign-in link. Set the new key `widget.sign_in_route`
   (`AGENTIC_CHATBOT_WIDGET_SIGN_IN_ROUTE`) to a route name, an absolute URL or
   a `/path`. A context endpoint should answer guests with `204 No Content`
   instead of `401`; the widget then stays anonymous. The same rule now
   applies to Playbook `query_data_resource` and `mutate_data_resource` steps.

4. **Stored identity is rechecked when work resumes.** Delayed Playbook
   continuations, connector completions and approved Human Reviews of a
   signed-context visitor are refused once the Agent's
   `context_token_version` was rotated or the host refuses the account
   (`context_token_rotated`, `identity_revoked`). After the signed context
   expired they resume, but personal steps and policy writes refuse with
   `sign_in_required`.
   Internal encrypted continuation tokens change from `version: 1` to
   `version: 2`, which requires `identity_unverified` and `actor_guard`.
   Existing `version: 1` tokens from 0.20.5 remain readable without rewriting
   their bytes. They resume public steps, connector completion wakeups and
   approved Human Reviews under their original deployment bindings. Their
   `actor_guard` is absent and their actor is unverified: personal steps need a
   listed type in `context.host_actors.types` and a currently authorized host
   resolver result, or refuse with a typed identity outcome (`host_actor_unsupported`,
   `host_actor_denied` or `sign_in_required`). Legacy tokens contain no original
   identity expiry or context version, so those missing values cannot be
   reconstructed; the host resolver must enforce current account authorization.
   Legacy token-only or tenant-only scopes also need a listed actor for personal
   steps. This restriction survives a later delay that issues a version 2 token
   (`host_actor_required`); ordinary version 2 token authority is unchanged.
   Malformed or tampered tokens still refuse. New tokens always use version 2.
   A refused new continuation closes the local run through AgentGraph cancellation,
   records its reason and reports the refusal in chat; it no longer stays open
   with a promise to continue. A resolver outage retries with bounded backoff
   before the same visible closure. Recovery reconciles committed outcomes first,
   while a failed guard or resolver recheck blocks remaining personal steps.
   No external write is redispatched by this refusal. Same-origin guard users
   have no signed-context expiry, but listed guard user classes are rechecked
   through the host resolver and revocation refuses their continuations.
   Version 2 also rechecks the original guard provider; deleted users are
   refused, and provider-less guards need a listed actor type for personal steps.
   Access-token checks and the signed widget context wire format are unchanged.

5. **Listed customer types exclude every other type.** Once
   `context.host_actors.types` lists a type, a personal tool refuses any
   other attested type (`host_actor_unsupported`). List every type that
   should use personal tools, including same-origin guard user classes.

The environment variable `AGENTIC_CHATBOT_CONTEXT_HOST_ACTOR_ABILITY` sets
`context.host_actors.ability`.

The widget now starts a new conversation whenever a renewed signed context
names another actor or tenant, also for `refreshContext({ startNewConversation: false })`.
`refreshContext()` also ignores the answers of chat and history requests that
were still in flight for the previous identity, even when the identity turns
out unchanged; call it only on an identity change.
Queued chat admissions carry identity as snapshot claims (envelope version 2).
An admission written by an earlier version fails closed with
`chat_turn_admission_invalid`; let workers drain the chat queue before
upgrading, or let visitors resend.

### Agents list, Publish dialog and Test knowledge search

No configuration, database or host API changes. What changes on screen:

| 0.20.5 | 1.0 |
| --- | --- |
| Toast "No Live Agent yet" on opening the Agents list | Removed. The empty list shows the template cards; the Overview of each Agent shows what is missing |
| Agents list columns Public ID, Provider, Model, Vector backend, Knowledge (sources count), Status (chat mode and blocking count), App default, Conversations (all time), Created | Five columns: **Agent** (with an **App default** badge), **State** (Draft, Live, Paused), **Channels** (Website hosts seen), **Conversations (last 7 days)**, **Updated**. The Public ID is part of the embed code on **Channels** |
| Agents list row button for the next step (add content, repair setup, Publish) | Removed; the same step is on the Overview of the Agent. `AgentReadiness::summary()` and the translation `readiness.list_blocking` are removed with it |
| **Test knowledge search** needed a published version ("Publish the Agent before testing its knowledge") | Searches the Sources assigned to the saved draft, so an unpublished Agent can use it |

The editor's test chat also lists the Sources an answer used, collapsed under
the answer. If you override package translations, these keys are gone: the
group `agents.list_bots`, all of `agents.bots_table` except `agent_actions`, and
`agents.edit_bot.publish_agent_before_probe`. New keys are
`agents.bots_table.app_default`, `conversations_last_days`, `more_hosts`,
`not_installed_yet` and `website_hosts`, `agents.edit_bot.probe_no_sources` and
`agents.playground.sources_used`.

### Unverified actions, Approvals and write events

Run the migrations: `2026_10_14_000020_create_agentic_capability_write_events_table`
adds the write event outbox. Keep the scheduler and a queue worker running;
the package schedules `filament-agentic-chatbot:capability-write-events` every
minute to recover interrupted deliveries (ADR 0050).

| 0.20.5 | 1.0 |
| --- | --- |
| Inbox tabs **Handoffs** and **Action Reviews** | **Handoffs**, **Approvals** and **Unverified actions** |
| An unknown direct Agent write could only be settled with the reconcile command, which changed the ledger row only | **Inbox > Unverified actions** lists every write with an unknown result; **Resolve** (admin) settles it, and the confirmation card and the next turn of the conversation learn the outcome. Nothing is sent again |
| Nobody was told about an unknown write | The Agent's **Notify** users who may see it receive one database notification; the Agent checklist warns when an Agent with write tools has none |
| `filament-agentic-chatbot:reconcile-side-effect <id> --outcome=... --reason="..." --force` | The same with a required `--evidence="..."`; a write that someone else already resolved ends with "already resolved" and a failure exit code |
| Workflow run page **Resolve unknown write** with one evidence text (the reason) | **Resolve unverified action** with separate **Provider evidence** and **Reason** fields |
| No webhook event for writes | Subscribable `capability_write.succeeded`, `capability_write.failed`, `capability_write.unknown` and `capability_write.reconciled`; existing endpoints receive them only after you subscribe |

Explicitly unconfirmed writes record before dispatch that no card is expected
and propagate transcript evidence only. A missing card without that durable
marker fails closed and remains retryable.

The queue worker must consume `chat.chat_queue.connection` and
`chat.chat_queue.queue`; `DeliverCapabilityWriteEventJob` previously used the
default queue. Exhausted propagation stays visible in the Inbox even when the
write has already been resolved; **Retry delivery** retries propagation under
the same scoped admin authority as **Resolve**. Missing required projections
remain pending until retries exhaust, never silently delivered. Delivered
outbox rows are retained as deduplication evidence, rather than pruned.

Webhook `data.capability_write.tool` now contains the public operation key,
for example `orders.create`, instead of `orders.create@revision:123`.
`subject.id` and `data.capability_write.id` for `capability_write.*`, and
`subject.id` for `usage.budget_threshold`, now use the application's `app.key`
instead of the constant `outbound-webhook-subject` HMAC key. Candidate-version
consumers must treat these as new opaque identifiers. The application key must
remain configured and stable. German **Nicht bestätigte Aktion(en)** is now
**Ungeprüfte Aktion(en)** throughout the Inbox, readiness and webhook labels.

Unchanged identifiers: the `action_review.requested` event, the
`action_review.*` configuration keys, the `human-review-queue` URL, the
`BotActionReviewRequest` model and the `common.action_reviews` translation key
keep their names; only the labels say Approvals.

Authorization: three actions join the map. `unverified_actions.view` is
`operate`; `unverified_actions.resolve` and `unverified_actions.retry` are
`admin`. A record-aware
`authorizeUsing()` callback is asked with the `BotSideEffectExecution` (its
`bot` relation loaded) and with its Agent; lists need your
`AdminAuthorizationQueryScope` as for other package lists. In `strict` mode
both use the side-effect reconciliation Gate
(`filament-agentic-chatbot.reconcile-side-effects`), so without it the tab is
hidden.

Code that called the internal finalizer: `WorkflowSideEffectReconciliationFinalizer`
is now `SideEffectReconciliationFinalizer`, and it and
`SideEffectReconciliationService::reconcile()` require an `evidence` argument
and throw `UnverifiedActionAlreadyResolved` (a `DomainException`) for a row
that is no longer unknown.

If you override package translations: `playbooks.view_workflow_run.verification_evidence`
and `playbooks.view_workflow_run.describe_where_how_verified_provider_outcome`
are gone. New keys are the group `observe.unverified_actions`,
`playbooks.view_workflow_run.provider_evidence`, `provider_evidence_help`,
`resolution_reason` and `resolution_reason_help`,
`readiness.unverified_actions_without_notification` and
`channels.outbound_webhook_event_type.capability_write_*`. Changed texts:
`common.action_reviews`, `observe.bot_action_review_request_resource.action_review`,
the `observe.bot_action_review_requests_table` empty states,
`observe.view_bot_action_review_request.action_review_*`,
`channels.outbound_webhook_event_type.action_review_requested` and
`action_waits_for_review`, `playbooks.view_workflow_run.resolve_unknown_write`,
`unknown_write` and `unknown_write_not_resolved`, and
`setup.checks.side_effect_reconciliation.fix`.

### Workflow editor: one command layer, no Agent instructions editor

No configuration or database changes. What changes in the editor:

| 0.20.5 | 1.0 |
| --- | --- |
| The Describe panel edited the Agent's instructions under **Advanced** | Removed. The panel shows **Edit Agent instructions**, a link to the Agent editor's Instructions tab, only for a user who may edit that Agent |
| **Remove all steps** removed Entry too, and a template applied afterwards did nothing | Keeps Entry (with Collect details), the use rules and the canvas notes |
| Delete on the canvas removed the step and left the steps around it unconnected; Entry and Results could be deleted | Reconnects the steps around it like the list. Entry and a Result a path leads to cannot be deleted in either view |
| A refused connection was listed under Checks, and a draft holding one lost it silently on Save | The reason appears next to the pointer and nothing changes. A stored draft that already holds a connection the rules refuse shows it as an invalid connection with a **Remove connection** fix in the Problems list; Save stops with one error until it is fixed |
| Changing a Decision's type or an AI task's result format left the old connections in the draft, invisible and blocking Save and Publish | Connections on paths that no longer exist are removed with the change as one undo step, with a message that says how many |
| Edits in the step list left the test chat as it was | Structural edits start a new test session from the list too, as canvas edits already did. **Arrange steps** keeps it |
| Ctrl+D duplicated a selected canvas node | Removed: it was an edit outside the command layer and did nothing for steps |
| Every list edit arranged all steps again | Only new steps are placed; **Arrange steps** is the only action that moves existing steps |

Hosts that embed the editor with their own page (not the supplied
`edit-agent-workflow` view) must drop the removed pieces: the Livewire event
`updateBotPrompt` and method `EditAgentWorkflow::updateBotSystemPrompt()`, the
browser events `workflow-update-bot-prompt` and
`workflow-bot-prompt-update-result`, the `data-bot-prompt` attribute and the
`botPrompt` field of the editor usage payload. The payload has a new field
`botInstructionsUrl` (null without permission to edit the Agent). The translation
key `playbooks.edit_agent_workflow.prompt_update_not_allowed` and the editor
texts that only served the removed panel are gone.

## Upgrading to v0.20.5

This covers the move from `0.20.0`, `0.20.1`, `0.20.2`, `0.20.3` or `0.20.4` to `0.20.5` ([CHANGELOG.md](CHANGELOG.md)).
It is a drop-in update: run `composer update heiner/filament-agentic-chatbot`.
There are no migrations, no configuration changes and no panel assets to
publish. The widget script version changes, so browsers load the new widget.
The empty state lays out conversation starters by its width; hosts that style
`.frw-conversation-starter` or `.frw-starter-group` should check their overrides
in a narrow and an expanded panel.

## Upgrading to v0.20.4

This covers the move from `0.20.0`, `0.20.1`, `0.20.2` or `0.20.3` to `0.20.4` ([CHANGELOG.md](CHANGELOG.md)).
It is a drop-in update: run `composer update heiner/filament-agentic-chatbot`,
then `php artisan filament:assets` so the panel serves the changed Agent page
stylesheet. There are no migrations and no configuration changes. Admins with
`view-bots` but without `manage-bots` now open Agents in a read-only view; check
that your Gates grant `view-bots` only to users who may see Agent setups.
Gemini 3 Agents may set `runtime_config.agent.gemini_thinking_level`; Agents
without it keep the provider default.

## Upgrading to v0.20.3

This covers the move from `0.20.0`, `0.20.1` or `0.20.2` to `0.20.3` ([CHANGELOG.md](CHANGELOG.md)).
It is a drop-in update: run `composer update heiner/filament-agentic-chatbot`.
There are no migrations and no configuration changes. The Playbook editor's
Canvas view draws the branches of "Ask visitor to confirm" steps again; stored
Playbooks and published artifacts are not changed.

## Upgrading to v0.20.2

This covers the move from `0.20.0` or `0.20.1` to `0.20.2` ([CHANGELOG.md](CHANGELOG.md)).
It is a drop-in update: run `composer update heiner/filament-agentic-chatbot`.
There are no migrations and no configuration changes. Widget answers now take
the full panel width under a sender line with the Agent's avatar, name and time;
host CSS that targeted `.frw-assistant-wrap .frw-avatar` or `.frw-sender-label`
no longer has an element to style.

## Upgrading to v0.20.1

This covers the move from `0.20.0` to `0.20.1` ([CHANGELOG.md](CHANGELOG.md)).
It is a drop-in update: run `composer update heiner/filament-agentic-chatbot`.
There are no migrations and no configuration changes. The widget script
version changes with the release, so browsers load the new widget. A host
that wants to keep the panel at its normal size sets `data-expandable="false"`
on the script tag or `:expandable="false"` on the Blade component.

## Upgrading to v0.20.0

This covers the move from `0.19.x` to `0.20.0` ([CHANGELOG.md](CHANGELOG.md)).
It is a breaking upgrade: plan a maintenance window, and expect to publish
every Playbook and Agent again. Old test and demo records that no longer fit
(quality scenarios, guardrail policies, candidate test evidence) are dropped,
not converted.

### 1. Before you update

1. Back up the application database and the plugin's PostgreSQL connection,
   and keep the old package version and configuration. The backup is the only
   way back (see "Rollback" below).
2. Note host customizations that change: published translation files, a
   published `widget/script.blade.php`, a host `AdminAuthorizationQueryScope`
   for knowledge sources, custom channel drivers, and code that calls
   `AgentReleaseService` or `KnowledgeSource::bot()`.
3. Pause public chat (or the Agents' availability), let open Playbook runs and
   pending confirmation cards finish, then stop queue workers. Open runs of an
   older Playbook version can only be cancelled after the upgrade, and open
   cards of the old runtime are not carried over.

### 2. New requirements

- **Scheduler:** run `php artisan schedule:run` every minute. It re-syncs
  knowledge sources, collects knowledge gaps, ends idle conversations, delivers
  webhooks, reconciles AI usage and prunes expired data.
- **Queue:** widget chat turns run on the `agentic-chat` queue
  (`AGENTIC_CHATBOT_CHAT_QUEUE`) of a persistent connection. Run
  `php artisan queue:work --queue=agentic-chat,default --timeout=150 --tries=1`
  and set `retry_after` above the chat job timeout (360 seconds for the default
  limit).
- **Shared cache:** web and queue processes must use the same cache store so
  the widget can stream answers (`AGENTIC_CHATBOT_CHAT_STREAM_CACHE_STORE`,
  default store; not `array`). Each streaming chat holds one PHP worker until
  its turn ends; on single-process servers set
  `AGENTIC_CHATBOT_CHAT_STREAM_RELAY_SECONDS=0`.
- **PHP and packages:** `ext-zip` and `openspout/openspout` are required for
  DOCX, CSV and XLSX knowledge sources.

### 3. Update and migrate

A configuration file published from 0.19.x calls
`QualityOperationsConfiguration`, which 0.20.0 removes, so the application
cannot boot with it. Move it aside before updating, publish the new file and
carry your changes over (the table in step 6 lists renamed keys):

```bash
mv config/filament-agentic-chatbot.php config/filament-agentic-chatbot.php.0.19
composer update heiner/filament-agentic-chatbot
php artisan vendor:publish --tag=filament-agentic-chatbot-config
# re-apply your changes from config/filament-agentic-chatbot.php.0.19, then delete it
php artisan migrate
php artisan filament:assets
php artisan config:clear && php artisan view:clear && php artisan route:clear
php artisan filament-agentic-chatbot:doctor
```

The migrations, among others:

- add `agent_releases` (each Agent's live deployment becomes version 1) and drop
  candidate pointers, candidate test evidence and candidate quality runs;
- add `agent_tool_confirmations` (write and Playbook approval cards);
- add `agent_tests` and `agent_test_runs`, and drop `bot_quality_scenarios`,
  `bot_quality_runs`, `bot_quality_run_turns` and the quality links of
  `bot_knowledge_gaps`;
- drop `guardrail_policies` and the stored policy assignments;
- replace `bot_knowledge_sources.bot_id` with
  `bot_knowledge_source_assignments` and add `billing_bot_id` and
  `sync_frequency`;
- add `public_id` to conversations, submissions, Playbook runs and action
  reviews, and activity columns to conversations (existing history counts as
  one ended period, so no flood of `conversation.ended` events is sent);
- add API Connector and MCP assignments, `agent_access` and import reviews;
- add `ai_model_prices`, and drop `ai_usage_non_dispatch_resolutions`.

### 4. Publish again

1. Open every Playbook, move values that are known at the start from Request
   Input steps to **Collect details** on the Entry step, and **Publish** it.
   Until then an Agent does not offer that Playbook.
2. Open every Agent. Agents whose live version uses an outdated pin show
   **Republish needed**. Check the new **Safety** section (guardrail policies
   are gone; recreate their checks there), **Built-in tools**, and the
   **Ask visitor to confirm** switch of each assigned write, then **Test** and
   **Publish**. A version published with guardrail policies does not answer
   until the Agent is published again.
3. Recreate important former quality scenarios as Agent tests, for example with
   **Create test** on a conversation, and run them.
4. Data Resources that used `filter_input_policies` get a new contract hash;
   publish their Playbooks and Agents again. A resource saved on the new setup
   screen without changes keeps its hash.

### 5. Removed pages and features

- **Quality Tests**, **Guardrail Policies**, the Launch Dashboard
  (`agentic-chatbot-launch`), the top-level Playbook Runs list
  (`workflow-runs`; the run inspector keeps its URL), the former **Test** page,
  and the **Observe** and **Improve** navigation sections. Navigation is now
  **Build**, **Connect**, **Inbox** and **Insights**.
- The release candidate flow ("Live test: Required", candidate quality gate,
  candidate comparison, routing coverage and waivers).
- The usage **Review receipt** action and the old usage widgets; call pages
  moved to `ai-usage/calls`.
- Scheduled quality runs (`run-due-quality-scenarios`), Playbook draft tests and
  their publish gate, and the composer scripts `assurance:runtime-release`,
  `assurance:provider-matrix`, `assurance:workflow-provider-evals` and
  `assurance:runtime-soak`.
- The built-in `bot_knowledge_sources` Data Resource.
- Widget approval quick prompts and `resources/views/widget/script.blade.php`.

### 6. Configuration and host code

| Before | After |
| --- | --- |
| `CHAT_HISTORY_MESSAGES`, `CHAT_SESSION_MEMORY_HISTORY_MESSAGES` (messages) | `CHAT_SESSION_MEMORY_HISTORY_TURNS` (**Turns to remember**, 1 to 100, default 20) |
| `quality_operations` config | `knowledge_gaps` (`enabled`, `lookback_days`, `scan_limit`) |
| `guardrails.authorization.*`, `GUARDRAIL_POLICY_*` | removed; Safety settings live on the Agent |
| `meta.api.sync` on API sources | `sync_frequency` (never, daily, weekly) |
| `usage.pricing` merged into package defaults | a host entry replaces the default for that model; panel prices win over both |
| `widget.default_*` texts defaulted to English | unset by default; the widget shows its translated texts |
| `KnowledgeSource::bot()`, `Bot::sources()` one-to-many | `KnowledgeSource::bots()`, many-to-many; filter through `bots` |
| `AgentDeploymentPublisher::publishCandidate` | `persist`; `AgentReleaseService` offers `publish`, `restore` and `versions` |
| Agent Access Token `*` | does not grant the new read API scopes (`submissions:read`, `conversations:read`, `handoffs:read`) |
| `UiText` and `filament-agentic-chatbot.php` translation file | namespaced area files; republish with `--tag=filament-agentic-chatbot-translations` and move overrides to the new keys |
| Widget `quick_prompts`, plain-string starters | `conversation_starters` objects (`label`, `prompt`, optional `icon` and `group`, up to 8); the migration converts stored settings, host Solution Kits must use the objects |

New settings: `CHAT_STREAM_RELAY_SECONDS` and `CHAT_STREAM_CACHE_STORE`,
`OUTBOUND_WEBHOOK_CONVERSATION_IDLE_MINUTES` (default 30),
`OUTBOUND_WEBHOOK_MAX_PAYLOAD_BYTES` (64 KiB), `READ_API_RATE_LIMIT_PER_MINUTE`
(default 60), `AGENT_TESTS_GRADING_MODEL` and
`INGESTION_MAX_EXTRACTED_BYTES` (all with the `AGENTIC_CHATBOT_` prefix).

Custom channel drivers that should receive writes needing confirmation
implement `ConfirmsAgentWrites` and verify their webhook signature; channel
connections get such writes only with their webhook secret configured.

### 7. After the upgrade

- Run `php artisan filament-agentic-chatbot:doctor` until it shows no `FAIL`.
- Chat with each public Agent in **Test**, run its Agent tests, then send one
  message through the real widget and check that the answer streams.
- Check **Insights > Usage > Model prices** and set prices for models without
  a default before relying on cost budgets.

### Rollback

Several 0.20.0 migrations drop tables and columns (quality scenarios and runs,
guardrail policies, candidate evidence, the former knowledge source owner
column, `ai_usage_non_dispatch_resolutions`) or rewrite stored settings. Their
data cannot be rebuilt: `php artisan migrate:rollback` stops at these
migrations or leaves the removed data gone, and 0.20.0 makes no rollback claim
for them.
To go back, stop web and queue processes, restore the backup taken in step 1,
reinstall the 0.19.0 package with its configuration and published assets, and
clear the caches. Data written after the upgrade is lost by the restore.

---

## Earlier changes in this release

The sections below record changes made before the overhaul that ship in the
same release. Run their steps as part of the migration above.

## 0.20.0: private knowledge source uploads

Older published configurations may contain only `knowledge_sources.authorization`.
Missing upload settings now resolve to disk `local`, visibility `private`, and
directory `filament-agentic-chatbot/knowledge-sources`. This fallback applies only
to absent keys. Explicit null, blank, malformed, public, or unconfigured storage
settings remain invalid. Text, URL, and API source forms work independently;
invalid file setup shows repair guidance and blocks file-source submission.

Review the host's `local` disk and merge this block into the existing
`knowledge_sources` section of `config/filament-agentic-chatbot.php` to select a
different private disk or honor the upload environment variables:

```php
'uploads' => [
    'disk' => env('AGENTIC_CHATBOT_KNOWLEDGE_SOURCE_UPLOAD_DISK', 'local'),
    'visibility' => env('AGENTIC_CHATBOT_KNOWLEDGE_SOURCE_UPLOAD_VISIBILITY', 'private'),
    'directory' => env('AGENTIC_CHATBOT_KNOWLEDGE_SOURCE_UPLOAD_DIRECTORY', 'filament-agentic-chatbot/knowledge-sources'),
],
```

Keep the existing authorization settings. Uploads require a configured disk
other than `public`, private visibility, and a safe relative directory. Ensure
the host does not expose that directory through a public storage link or URL.
Rebuild the configuration cache and run `php artisan filament-agentic-chatbot:doctor`.
Its `Knowledge source uploads` check validates the effective configuration;
verify an actual upload to check storage permissions.

For pre-1.0 file sources that still use `meta.path` on the public disk, run package
migrations, configure private storage, and inspect the migration dry run:

```bash
php artisan filament-agentic-chatbot:migrate-knowledge-source-files
php artisan filament-agentic-chatbot:migrate-knowledge-source-files --source=123
```

Back up the source files and database before adding `--execute`. Execution copies
active legacy files to private source-owned storage, commits their ownership,
and removes the public originals. For soft-deleted sources it removes the legacy
public file. Ambiguous ownership or invalid paths fail without adopting the file.
Existing source-owned files are skipped when their private contract is valid.
See [Knowledge source file storage](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md#knowledge-source-file-storage)
for ongoing checks.

## 0.20.0: concrete Playbook write approval

Explicit Approval steps now capture and show the exact downstream action before
waiting for the visitor. The prepared request stays immutable; a trusted input
correction or a confirmation older than ten minutes requires a new displayed
request and another confirmation. Pending approvals created by older code have
no captured request and cannot grant a write silently after the upgrade. The
existing engine confirmation at the write step obtains the required proof.
Custom button labels and cancellation retain their authored behavior.
## 0.20.0: governed Data Resource writes

Run `php artisan migrate` to add the append-only Data Resource staging-evidence
table before importing evidence or publishing a write Playbook. Configure a
dedicated `AGENTIC_CHATBOT_DATA_RESOURCE_WRITE_TEST_SIGNING_KEY` with at least
32 characters in the trusted production and isolated staging applications.
Set distinct `AGENTIC_CHATBOT_DATA_RESOURCE_ENVIRONMENT` values. Existing host
configs need the `data_resources.write_testing` block documented in
[Data Resources](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DATA_RESOURCES.md).

Write-enabled Data Resource contracts now pin their database target and registered
model policy. Re-export the exact Playbook candidate, run each insert/update
step with concrete confirmation against a separate staging database, import
its signed evidence, and republish the Playbook and consuming Agent. Do not set
`production_targets` overrides in the production application. The test mapping
never switches a live Eloquent connection. Ordinary Agent and candidate tests
remain unable to perform writes.

Registered Eloquent create/update policies now run on the exact scoped record
inside the transaction. The authenticated host actor must match the runtime's
attested actor; an unrelated signed-in administrator cannot supply that identity.
Updates reject stale versions and preserve fractional timestamp precision.
Cancelled model saves fail and roll back instead of reporting success.
Read-only resource contracts gain no write permission. Prior deployments,
write ledgers, unknown outcomes and evidence remain retained. A rollback with
stored evidence requires restoring a verified backup; it cannot silently drop
that history. See [runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md).

## 0.20.0: remote MCP connections

Run package migrations before opening Connector administration. The additive
MCP migration adds `api_connectors.transport` (existing rows default to `http`)
and an optional provider-profile key. MCP connections use encrypted credentials
and the existing operation/release tables; no provider accounts are connected
automatically. HTTP environment serialization remains unchanged, while MCP binds
the exact endpoint including its trailing slash and the selected transport.

This version changes shared Connector implementation bindings. Re-test and
republish affected Connector operations, their Playbooks and Agent candidates
through the normal release lifecycle before activation. Existing deployment
records are not rewritten or silently upgraded. The package continues to reject
stale implementation fingerprints.

MCP reads retain their separate read review. Synchronous create/update writes
now require `mcp_write_access_review.v1`, fixed targets, tenant/actor scope,
concrete confirmation, business-success and record-identity checks, and a
successful isolated staging test for the exact candidate before publication.
This optional operation contract field needs no MCP database migration. Existing
unreviewed MCP writes remain blocked; no migration converts a read review into
write permission. Preserve historical ledgers and reconcile prior unknown
outcomes before any new attempt. Direct Agent tools remain read-only. See
[reviewed MCP writes](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/MCP_CONNECTIONS.md#reviewed-workflow-writes).

Existing custom MCP reads must be explicitly reviewed again in **MCP data sources
> Review operations**, tested and republished before use. Their signed review
binds the exact server, definition and request scope; changing those values or
the application key requires another review. Curated GitHub reads require the
official endpoint, an approved read tool, and fixed owner/repository arguments.
Guided setup now offers image and screenshot links without a visitor-supplied
path. Add this function to the Agent draft and test the resulting candidate
before activation. Existing drafts and deployments are never silently expanded.

MCP operations may now publish compact `metadata.mcp_source` for the source name,
configured scope and optional HTTPS source link. This additive contract field
needs no database migration. Guided GitHub setup fills it from the bound
repository; other MCP imports and the operation workbench offer optional public
source fields. Existing operations keep their metadata until explicitly edited
and reviewed. Re-test and republish the operation and Agent to expose these facts
in chat. The runtime deduplicates source context and retains normal input budgets.
The configured model can answer source-link questions directly from this context;
verify its tool selection and follow-up answers in candidate tests. Source metadata
never grants access or changes the signed data-read review.

OAuth connections can now register a public client automatically when the MCP
server advertises RFC 7591 registration, S256 PKCE and token authentication
`none`. Save the connection and select **Connect account**. Existing client IDs
and connected accounts remain unchanged; providers requiring their own client
registration use **Manual OAuth settings**. This addition needs no database
migration and does not approve any read functions or change live Agent grants.

The MCP declaration, document projection and answer redaction fixes change the
pinned `core/mcp` implementation binding. Retest and republish existing MCP
operation drafts, then publish, test and activate their dependent Agent
candidates before using the updated implementation. Existing data scopes and
source metadata can remain unchanged; old implementation pins are never accepted
as the new implementation.

Rollback refuses to drop MCP transport columns while MCP connections exist.
Remove their deployment dependencies and connections first, or restore a verified
backup with its matching package version. See [MCP Data Sources](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/MCP_CONNECTIONS.md)
for setup, provider-specific prerequisites and the supported protocol subset.

## 0.20.0: verifiable usage and configured token costs

New calls retain the exact tariff, provider/model identity, currency, unit scale
and integrity hash in `AiUsageCall.meta.pricing_snapshot` before dispatch.
Settlement uses this snapshot. Editing a tariff under the same version name
does not reprice an existing call. Missing or invalid input/output prices no
longer mean free usage. A zero rate must be explicit; an unconfigured reasoning
or cache rate makes the cost unknown when that category is reported.

Configure non-negative integer rates in micro-minor-units per million tokens.
Declare `currency_code` and `minor_units_per_unit` on each tariff when its
currency differs from the global setting. No currency conversion occurs. Fixed
bundled USD prices now retain their USD identity even if the display currency
changes. A hard cost reservation requires a known upper bound for every token
category that it may use; configure those rates before enabling a cost budget.

Dashboards and reports count all recorded calls, including pending, failed and
reconciliation-required calls. Full totals are nullable when usage or pricing
is incomplete; known subtotals are separately labelled. Consumers must handle
these nullable totals. Historical rows without a verifiable currency-bound
pricing snapshot retain their stored amounts, but those amounts are excluded
from current-currency totals. This change does not invent or backfill historical
tariffs. Unknown or incompatible historical costs in the current monthly budget
scope prevent new calls under a hard cost limit. New expiry transitions retain
the reservation in `awaiting_evidence`; legacy failed/released rows remain
explicitly reconcilable.

Package adapters now preserve complete native streaming receipts and account
for each model step through the same owner as synchronous calls. Unsupported
protocols, missing terminal events and zero-token embedding DTOs without presence
evidence remain unknown. A successful answer or positive partial counter alone
does not establish a complete receipt. Native SDK aggregates remain transport
data, not a source for reported token costs.

Run package migrations before enabling this version's AI transports. The new
`ai_provider_receipt_claims` and `ai_usage_reconciliations` tables enforce shared
native/operator request uniqueness and retain encrypted audit evidence. Enable
the explicit AI Usage management gate only for operators authorized to verify
provider receipts. The review action and existing reconciliation command can
settle verified missing usage without replaying a provider call.

Flat standard-text tariffs remain supported. Use V2 variants for context bands,
service tiers, modality-specific rates or cache-write lifetimes. Bundled Gemini
tariffs now declare input modalities and the distinct 2.5 audio-input/cache
rates. Complete previously frozen tariffs remain immutable; historical evidence
can supply missing tariffs or additive unpriced dimensions while preserving all
known rates. See [AI usage accounting](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AI_USAGE_ACCOUNTING.md).

Calculated token costs describe the
configured tariff applied to recorded plugin calls. They are not imported
provider invoices or a claim to include account credits, taxes, storage,
provider-hosted tool fees or other charges. See
[AI usage reconciliation](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md#ai-usage-reconciliation).

## 0.20.0: explicit task context and model-step budgets

The runtime now supplies capability-specific instructions only when those tools
are available. Conversation summaries preserve their newest bounded turn records.
An output-only answer repair can receive the two newest complete admitted public
turns as a request-bound snapshot of at most 3,000 UTF-8 bytes. This is untrusted
task wording, not factual evidence, input values or execution authority; repair
still has no tools and does not reload history or attachments.

Review AI Tasks that implicitly depended on a preceding node's `context`,
`kb_context` or `knowledge_context`. The plain AI executor no longer imports
those variables automatically. Reference each required value explicitly in the
AI Task input template, or in an explicitly configured context source for a
supported custom node. Republish affected Playbooks and dependent Agents using
the normal candidate/test/activation path. Existing artifacts and hashes are not
rewritten. The editor continues to compile AI Tasks with conversation memory off.

Playbook text input admission now checks the complete utterance. A model cannot
save `Berlin` from “Bitte nicht Berlin.” Unsupported surrounding wording keeps
the question open. Exact valid values and explicit supported affirmative or
correction forms remain usable. Bound widget and approval controls retain their
existing authority.

Synchronous and supported streaming invocations reserve and settle usage per native SDK model
step. Consumers of operational usage rows must not assume one `AiUsageCall` per
whole tool loop; correlate step rows through `meta.invocation_id` and
`meta.model_step`, with the existing turn and deployment attribution. A rejected
follow-up step retains already delivered evidence and does not rerun tools.
Both paths preserve monthly reservation checks and conservative token admission.
Apply the receipt-claim migrations described above before enabling traffic.

These are local runtime changes, not a claim that the Gemini empty-completion
cause has been established or that provider routing quality has been certified.

## 0.19.0: Connector contracts and editor/runtime corrections

Version 0.19.0 changes the hash-bound authentication and pagination code and
adds request construction and parameter serialization to the request-codec
implementation binding. Every previously published Connector operation needs
a fresh test and publication, including operations using a custom request
codec. Old revisions remain immutable and fail implementation verification;
their hashes must not be rewritten to make them appear current.

Before switching traffic, finish or reconcile in-flight external operations on
their matching release. Install the matching package dependencies, then:

1. Open each used operation in the workbench, review its request and allowed
   output fields, and test the current draft. Publish the new revision.
2. Select the new operation revisions in dependent Playbooks, review and publish
   them, including parents of republished Sub-Playbooks.
3. Update Agent dependencies, publish and test each new candidate, then activate
   it. Existing conversation-bound deployments do not adopt these new pins.
4. Refresh the shipped Filament editor assets and start fresh test conversations
   before reopening traffic.

These corrections add no database migration. Existing compiled Playbooks retain
their saved input semantics; changing an authoring input type takes effect only
after republishing. Free text now needs an Agent interpretation before resolving
a text waitpoint. Typed and configured Choice answers keep their deterministic
shortcut, and approvals keep their existing bound controls. Terminal provider
completion errors remain errors even when accompanied by nonempty text.

OpenAPI imports now report unsupported parameter/schema forms explicitly. Review
those diagnostics instead of treating an imported operation as ready to run.
Input and response nullability with one non-null type is preserved. Ambiguous
unions still require an explicitly reviewed supported mapping; retained input
compositions fail publication with their field path.

## Existing conversations after runtime upgrades

A compatible live Agent does not make an older conversation-bound deployment
compatible. When an open Playbook is bound to an unsupported Agent runtime
contract, the chat now commits clear, non-retryable advice before any model
dispatch. It does not cancel, rebind, migrate, delete, or replay that old work.
Operators must review unfinished work under the existing reconciliation and
cutover procedures. Starting a new conversation is appropriate for new requests,
not proof that a previous external action failed or can be repeated.

This change adds no database migration. Compatible published Playbooks need no
rebuild solely because of the new conversation error handling. Structured widget
and operator waitpoints keep their existing authorized controls while no longer
offering an unusable textual continuation to the model.

## Durable Connector jobs and mixed Playbook answers

Run these three additive migrations before restarting the application and
queue workers:

- `2026_08_30_000007_add_durable_connector_continuations.php`
- `2026_08_30_000008_create_connector_completion_events.php`
- `2026_08_30_000009_add_chat_turn_presentation_receipts.php`

Quiesce writers, take and verify a restorable schema/data backup, and preserve
the matching package, host configuration and encryption key first. The
migrations classify existing continuation rows as `inline`, add durable job
correlation and notification indexes, and add encrypted mixed-turn presentation
receipts. They do not rewrite Connector revisions, Agent deployment hashes, or
existing messages. An unchanged operation form also preserves its saved
completion policy without injecting new defaults into the contract.

This release changes the hash-bound core authentication and continuation
implementations. Operations pinned to those previous implementations must be
tested and published again, and their dependent Agent/Playbook deployments must
be rebuilt and tested before traffic resumes. This also applies to ordinary
read operations: unchanged business settings do not authorize changed runtime
code. Do not rewrite old hashes or weaken the strategy verification. Finish
in-flight work on its matching release, or reconcile it before the cutover.

Durable completion is opt-in through a newly published operation and pinned
Playbook deployment. Existing HTTP operations do not acquire webhook or
background-job semantics automatically. Configure persistent queues, supervised
workers, Scheduler, a public HTTPS callback origin and encrypted signing
credentials as described in [Durable Connectors](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DURABLE_CONNECTORS.md).
Run Doctor and verify representative read/write pending, completion, failure,
cancellation and JSON/SSE replay behavior before reopening traffic.

The public chat result may now retain independent verified reads in
`read_answer` alongside a terminal Playbook error. Custom clients must preserve
that error's retry lock and display its status even when read results exist.
The bundled widget does so. See [Public API](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PUBLIC_API.md).

Do not use a code-only rollback or discard active job/receipt state.
Continuation rollback refuses any durable rows, callback rollback refuses
active events, and receipt rollback is intentionally blocked. Restore the
verified database backup and matching package/configuration/key as a unit;
first reconcile any external writes accepted after that backup.

## Historical references to displayed records

This addition uses the existing encrypted `presentation_receipts` column; it
does not require another migration, change deployment hashes, or rewrite old
messages. `chat_turn_presentation_receipts.v1` has optional private
`scope_fingerprint`, `source_question_sha256` and `answer_presentation` members.
The nested proof uses `agent_answer_presentation.v1` and is finalized only at
the normal canonical outcome commit. `chat_turn_execution_evidence.v5` has
optional bounded `historical_sources` diagnostics and historical decision codes.
Public JSON/SSE message shapes and external capability contracts are unchanged.

Existing receipts remain readable for their original recovery purpose. Without
the new displayed-record proof and scope fingerprint they cannot ground a new
historical factual answer. The original question is usable as source metadata
only when its new hash matches. No upgrade job reconstructs facts or ordering
from old prose, summaries, traces or current API results.

Deploy matching readers and writers together. Older package readers may reject
these additional private fields; do not perform a code-only rollback across
unfinished turns with new receipts. Finish or reconcile those turns on the
matching version, and follow the existing verified database/package/config/key
restore procedure when a rollback is necessary. Do not delete or backfill
receipt fields to make an older runtime accept them. Completed canonical
responses remain replayable without rerunning historical selection.

## Curated Connector answers

Connector operations now publish `response.agent_output` (`mapped` or
`response`) and optional `presentation` metadata on their existing
`response.output_mapping` fields. New forms and imported drafts start in mapped
mode. Removing every selected field shares no result values; it does not enable
raw response access. Hidden fields are excluded before the model, repair and
delivered-evidence boundary, including semantic role aliases. Workflow values
remain available under the workflow contract.

No database migration or rewrite of existing revisions is required. Absent
mode/metadata is interpreted without changing the signed payload: an existing
nonempty mapping is curated with summary fields; an empty mapping retains its
previous selected-response exposure. Read-only review can identify that latter
case with `response.output_mapping` empty and `response.agent_output` missing
or `response`. Review those operations before enabling sensitive APIs.

Configure labels, units, standard/detail/hidden visibility and required context
in the operation's Mapping tab, then test and publish a new operation revision.
Publish, test and activate a replacement Agent candidate to use those new pins.
Do not edit historical revisions, rewrite deployment hashes or mutate stored
chat answers. Retain the previous deployment and reviewed draft/export for
rollback through the normal tested release process.

Nonempty mappings that produce no approved values no longer fall back to full
provider data. Explicit null, empty string/list and zero values remain distinct;
mapping no longer silently clips long strings or lists. Oversized model results
use the existing incomplete-evidence boundary. A role alias cannot populate a
different declared mapping field when its own provider path is absent. Invalid
colliding keys, unknown presentation fields and missing/hidden context targets
are rejected rather than interpreted ambiguously.

Positive answer fixtures may use `fields: ["field_key"]` or `detail: "all"` in a
section. Curated scalar selections retain only their declared context rather
than every sibling. Labels, units and localized numeric formatting are server-rendered;
update assertions that expected technical field paths, without weakening value,
identity, permission, source or replay checks. Programmatic callers of the
internal form mapper must use its row-based form state, not the removed
`output_mapping` textarea state; the published JSON contract keeps
`response.output_mapping`.

### Per-operation answer presentation

Mapped Connector operations may now publish the optional, versioned
`response.answer_presentation` policy and exact localized `value_labels` on
visible output fields. Omission keeps the existing automatic behavior without
rewriting the signed contract. The policy can bind a subject, list record title,
layout, localized intro or closing, and bounded allowlisted templates to the
same verified input and output selectors. It cannot be combined with
`agent_output: "response"` because full response mode has no closed semantic
field boundary for those references.

No database migration or historical-revision rewrite is required. To enable a
policy, save and publish a new immutable operation revision, then publish and
test a replacement Agent deployment that pins its exact revision and hash.
Existing revisions without the field remain readable. The literal admitted
visitor input is now included, redacted, in new direct-read evidence identities
so an alias such as a localized product name can be presented while the
canonical value is sent to the API. Existing evidence and presentation receipts
without that optional member remain verifiable; do not backfill them.

This addition changes the closed Connector v3 schema definition. A runtime that
predates this policy can reject a newly published revision even though it can
still read older revisions. Do not perform a code-only downgrade after activating
new pins. Roll back by activating the retained, tested Agent deployment whose
operation revisions match the older package, or restore the verified package,
database, configuration, and encryption key together under the normal rollback
procedure.

## Direct-read answer rendering and source-scoped continuation

Direct-read answers now use a closed evidence-selection document:
`{"language":"de","layout":"auto","sections":[{"evidence_id":"exact-call-evidence-id","pointer":"/data"}]}`.
This is ordinary model JSON; no native structured-output capability or new
provider is required. Only actual delivered `/data` references are accepted;
the optional closed layout enum changes presentation only when the visitor asks.
Knowledge mixed with direct reads may select `/context`. The server renders
verified values with readable labels and record context instead
of accepting factual model prose through word-distance or number heuristics.
No `records`/`items` naming convention is required. Visitor input and public
chat transport remain unchanged. Update positive model test fixtures to select
ledger IDs also present in their execution trace; do not change failing quality
assertions to accept `safe_evidence_fallback`.

An invalid selection permits one output-only repair on the same immutable
Agent deployment, provider, and model. It has no tools, conversation history,
or attachments, a 20-second timeout, and usage stage `agent_answer_repair`.
Failure or a usage-budget refusal preserves the bounded evidence fallback and
available sources, without another API call or a visitor understanding
question. Entire rendered answers include markup and provenance in their
UTF-8 byte budget: `short` 3,000, `balanced` 8,000, `detailed` 16,000, with
visible truncation. Pure conversation and Knowledge answers remain prose;
source identity is not proof of semantic truth. Committed evidence remains
v5 with additive, allowlisted `evidence_guard`/`answer_repair` diagnostics and
no raw model/provider payloads.

The required migration is
`2026_08_30_000006_scope_direct_read_continuations_to_source_messages.php`.
Treat it as an authority change, not a schema change to run under live writers:

1. Quiesce public chat, channel/webhook ingress, Scheduler, and production
   workers; drain or reconcile in-flight work. Take and verify a restorable
   database backup, including schema and data. Preserve the matching package,
   host lockfile/config, and application encryption key.
2. Install the matching package and run `php artisan migrate --force` while
   writers remain stopped. The migration adds `binding_version` with default
   `1`, creates the unique source-message scope, and removes the old broader
   uniqueness constraint. It does not rewrite ciphertext or modify Agent
   deployments.
3. Verify migration status and controlled read/follow-up conversations before
   reopening traffic. New bindings use `binding_version: 2` and include
   `source_message_id` in the conversation/deployment/capability scope. A read
   in the current turn must preserve the prior turn's binding. Different
   targets for the same capability and source create a sticky empty `[]`
   binding; later reads must not select the last target automatically.
4. Run the relevant routing/quality checks and canonical JSON/SSE replay check.
   Require complete expected task coverage and an `answer` decision; a safe
   fallback is not passing release evidence. Resume workers/Scheduler and
   traffic only after the applicable checks pass.

Existing version-1 rows are intentionally not executable: they may have lost
earlier targets under the old uniqueness scope. They remain encrypted and
unchanged until normal TTL cleanup; do not re-sign, convert, or infer missing
targets from them. Fresh successful reads create version-2 authority under
their own source message. Deployment snapshots are not automatically rebuilt;
any intentional changes to published input or response contracts still use the
normal candidate/test/activation path.

There is no automatic `down()` for this migration. Do not collapse source rows,
drop the version column, or use `migrate:rollback` to reintroduce last-target
selection. Rollback requires restoring the verified pre-migration database
schema **and data** together with the matching package release, host config,
and encryption key. Code-only rollback is not a supported recovery procedure.

## Guardrail, result, and channel-delivery hardening

Run the pending package migrations before restarting workers. The additive
`2026_08_30_000005_add_channel_delivery_progress.php` migration adds durable
reply-handoff and Telegram chunk journals to channel delivery events. Reply
snapshots are encrypted; preserve the application key while deliveries are
pending. The migration does not infer receipts for historical sends. A possibly
dispatched message without trustworthy
progress remains unknown and must be reconciled with the provider, not resent
blindly. Provider acceptance is not a delivery/read receipt.

Do not drop the new column to roll back after recording delivery progress:
the down migration refuses to discard that evidence. Restore a verified
pre-migration backup when rollback is necessary. Use an asynchronous production
queue; a synchronous queue returns retryable webhook backpressure when work
must wait instead of acknowledging a retry it cannot schedule.

Guardrail records now require explicit input/output assignment on the Agent.
Publish, test, and activate a replacement Agent release to enable or change
them. Existing unassigned releases retain baseline safety; enabling a policy in
the catalog does not silently apply it globally. Disabling/deleting a policy
does not change already-pinned live releases. Move legacy Rules JSON into the
supported structured checks before publishing an assigned policy.

New Playbook runs capture signed result-field evidence. Result templates select
canonical capability fields rather than exposing literal internal prose; old
checkpoints without evidence retain the safe status fallback. Unknown costs
remain unpriced, not zero. Complete the manual candidate/live, channel retry,
and appearance checks described in the public guides before customer rollout.

## Agent-first runtime cutover

Every chat now requires exactly one hash-verified live Agent deployment.
Ordinary conversation and approved knowledge access need no Playbook. Optional
Playbooks are deployment-pinned process tools and never own the top-level turn.
Former workflow-first routing, live-workflow pointers, runtime modes, starter
workflows, and request-time fallback paths are removed.

The supported release baseline is `v0.16.1`; rehearse this procedure on a
restored copy before the production maintenance window. Keep public chat,
channel/webhook ingress, Scheduler and production queue workers stopped until
the final checks pass. Drain or explicitly reconcile outstanding work before
the backup. Retain restricted operator access for the release steps below.

1. Take and verify a restorable database backup, preserve the matching old
   package and host lockfile/config, and retain any externally stored Knowledge
   files. Inventory unresolved runs and all legacy
   `active_workflow_deployment_id` values, including inactive or soft-deleted
   Agents. No migration decides which customer data or old live behavior may be
   discarded.
2. Install the new package and its required dependencies, merge the config/API
   changes below, and run `php artisan migrate --force` in the closed maintenance
   window **before** trying to publish a candidate. Laravel commits completed
   migrations individually. Earlier cutover checks still apply; resolve any
   earlier failure before proceeding, without marking migrations as completed
   or ignoring their guards.
3. If legacy live pointers remain, the cutover migration,
   `2026_08_30_000004_remove_legacy_workflow_runtime_state.php`, deliberately
   stops with **Agent-first cutover blocked**. This is a safe checkpoint, not a
   completed upgrade. The preceding migrations have already installed the
   candidate pointer, Agent deployment/ChatTurn bindings, immutable Knowledge
   generation fields and signed candidate-quality evidence fields. Confirm
   those preceding entries are completed with `php artisan migrate:status`.
   Keep traffic and production workers closed. If no legacy pointer remains,
   this cutover migration completes on the first run; continue with Agent release
   verification anyway.
4. Rebuild Knowledge sources whose former indexes have no immutable generation
   identity, and review the migrated capability/Playbook contracts. Open each
   Agent that will serve traffic, assign only approved Knowledge, capabilities
   and optional published Playbooks, then choose **Publish candidate**. Run
   **Test release candidate** with representative paths; it uses the persistent
   runtime while blocking productive writes. Run any required candidate-quality
   comparisons again; unsigned historical runs are not passing release evidence.
5. Use **Select tested release** only after the exact deployment hash, current
   authoring fingerprint and required capability/quality coverage pass the
   existing release gates. Verify a controlled live conversation and its
   run/trace while ingress remains closed. For each old pointer, record the
   verified replacement and only then clear that exact Agent's legacy pointer
   using the host's reviewed data-change procedure. Do not bulk-clear pointers
   or fabricate test evidence to unblock the migration. For inactive/deleted
   Agents, explicitly review restoration or retirement under the host's data
   policy before clearing their pointers.
6. Run `php artisan migrate --force` again. The final cutover now removes the
   retired pointer column, obsolete workflow `is_active` flag, old
   entry-clarification/work-event tables and continuation-clarification rows.
   The subsequent channel-delivery progress and source-scoped direct-read
   continuation migrations then complete normally.
   Verify migration status, then run
   `php artisan filament-agentic-chatbot:doctor` and
   `php artisan agent-graph:doctor`. Reopen traffic and resume workers/Scheduler
   only after all required checks pass.

The retained legacy column during this checkpoint is data awaiting an operator
decision, **not a productive legacy runtime or fallback**. The new runtime still
requires a verified Agent deployment. A stop at any point keeps traffic closed;
rollback means restoring the verified pre-cutover database, matching old package
and host configuration together, not `migrate:rollback`. The final destructive
migration explicitly refuses an in-place `down()`.

The final cutover was moved from its unreleased `2026_08_24_000001_...` filename
so it cannot run ahead of its own candidate-release prerequisites. That old file
was not present in `v0.16.1` or `v0.17.0-rc.1`/`rc.2`. If testing an intermediate
unreleased checkout, inspect host-published migration copies as well: back up
and remove only an obsolete, **unapplied** copy of that package migration before
running the new release. Do not rewrite completed migration history. A database
that already completed the old cutover needs no recreated legacy state.

Public-widget selection now has one stored key: `runtime_config.public_widget.entrypoint`. The irreversible `2026_08_23_000001_cut_over_public_widget_entrypoint.php` migration moves the former `widget.public_entrypoint` flag and removes that alias before productive code starts. Conflicting old and canonical values block the migration instead of choosing one silently.

### Supported-upgrade smoke and recovery evidence

`scripts/smoke/smoke-upgrade.sh` now provisions the exact `v0.20.5` baseline using
that local tag's own installer. Pass `--target-version` explicitly in the 1.0
line; see [the ordered procedure](#ordered-0205-to-10-procedure). It pins the
tag commit and checks the installed baseline reference; it does not call the
current package installer against a version that never had that command. Keep
the local baseline tag available. Another baseline needs an explicitly reviewed
version-specific contract, not an arbitrary Composer range.

For artifact mode, the requested version must match the metadata of the selected
ZIP. The existing release verifier checks that ZIP and its sidecar first. The
smoke then copies only those verified bytes into a private single-archive
repository; other ZIPs beside the caller's file are never offered to Composer.
SHA256 checks bind both upgrade attempts to that copy. Before application hooks
or migrations, the installed package must match its expected version, exact
local dist URL/SHA1 in both Composer lock and installed metadata, and the full
archive file inventory. Changed, missing or additional installed files block
the smoke. Artifact installation initially disables Composer scripts; discovery
runs only after this verification. Checkout mode does not claim this immutable
release-artifact proof.

The smoke requires PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`,
`createdb`) in addition to PHP, Composer and Git. It backs up its newly created
baseline database and copies the matching baseline app/package before the
upgrade. Recovery restores that dump into a separately named **new** throwaway
database, verifies a synthetic data marker and exact migration history, binds
the copied baseline app to that database, and runs Doctor before re-applying
the same release artifact. An existing database is never cleaned or dropped;
backup/restore or verification errors stop the smoke immediately.

The pinned baseline installer protects its initial PostgreSQL target by issuing
an unconditional `CREATE DATABASE` and stopping on failure before package
migrations. The wrapper's later database-name check protects backup/restore
selection; it is not a pre-installation guard. The offline fixture separately
checks an already-existing baseline target and post-install configuration drift.

Keep the private run directory private: its app copies include generated config
and database connection settings. `--cleanup-on-success` removes only that run's
apps/backups; both generated databases are retained and named in the output.
This gate covers baseline schema installation, forward upgrade and synthetic
backup recovery. Customer-specific live pointers, unresolved work, external
Knowledge files and live providers still need the staging rehearsal above.
An offline process-contract test does not replace the real PostgreSQL/exact-
artifact release job.

## Public API cutover

- `FilamentAgenticChatbotPlugin::contentExtractor()`, `textChunker()`, and
  `sourceUrlResolver()` were removed. Bind `ExtractsContent`, `ChunksText`, and
  `ResolvesSourceUrls` in the host application's service provider.
- Capability discovery classes and custom workflow actions now use one
  `CapabilityProvider` implementation tagged with `CapabilityProvider::class`.
  The former registry tag, `capabilities.discovery.providers`, and
  `workflow.actions` extension paths are not public.
- Every `CapabilityActionDefinition` must now provide a non-empty
  `resultSchema` in addition to `requestSchema`. Add a schema matching the
  handler's exact return value; registration fails before chat traffic when
  either contract is missing.
- The legacy `/filament-agentic-chatbot/widget.js` and canonical route aliases
  were removed. Use the named `filament-agentic-chatbot.widget.script` route.
- The complete supported host surface is listed in the [Public API](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PUBLIC_API.md) guide.

## Configuration cutover

Republish `config/filament-agentic-chatbot.php` and carry forward only the
`config_keys` allowlisted in the Public API guide. Runtime schemas,
dictionaries, planner topology, Eloquent model aliases, `workflow.actions`,
and `workflow.action_schemas` are internal or removed; values copied from an
older published file are ignored. Run
`php artisan filament-agentic-chatbot:doctor` after the update—Doctor fails and
prints an exact instruction for every removed key it detects.

Rename every `AGENTIC_WORKFLOW_GENERATION_*` variable to the matching
`AGENTIC_CHATBOT_WORKFLOW_GENERATION_*` name. Remove the old workflow-turn
planner and write-safety relaxation variables; turn-planner topology and the
write confirmation/schema/integrity baseline are no longer configurable.

Production now defaults Data Resource administration and Filament side-effect reconciliation to strict Gate mode. Register `filament-agentic-chatbot.view-data-resources`, `filament-agentic-chatbot.manage-data-resources`, and `filament-agentic-chatbot.reconcile-side-effects` before operators use those screens. Local and testing environments retain the authenticated-panel-user setup path. Doctor fails production when either surface is relaxed without a registered Gate.

The installer no longer accepts the ambiguous `--force` option. Use
`--force-config` only when you intentionally want to overwrite the host's
published package config, and use `--force-migrations` only when a production
deployment is authorized to run pending migrations. Automated production
installers that previously passed `--force` must choose one or both explicit
options; the legacy flag now exits before setup performs any work.

The built-in `query_data_resource` capability result contract is version 2. It removes the concrete `scope_filters_applied` object without adding replacement scope metadata. Republish workflows that use Data Resources so their immutable capability binding pins version 2; do not add a compatibility field carrying scope names or values. Treat this as a maintenance-window cutover: Doctor fails and inventories active deployments that still pin an obsolete action contract.

Data Resource query contracts are now version 3 and pin an estimated-row budget plus a cross-driver statement timeout. Run the package migrations to add `agentic_data_resources.query_safety`, review **Allow text search** and **Database query budget** for every UI-managed resource, then republish workflows that bind those resources. Doctor fails when the migration is missing, an active deployment still pins a stale Data Resource hash, or an active production resource uses a database without supported plan/timeout budgets, so run it before reopening chat traffic. The runtime now rejects PostgreSQL/MySQL/MariaDB plans above that budget before execution; SQLite is limited to local/testing Data Resource queries.

## AgentGraph 0.16.3 stable runtime

Current source builds require the exact stable `heiner/agent-graph:0.16.3` release:

```bash
composer update heiner/agent-graph heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

Run all pending package and AgentGraph migrations before reopening traffic. Resume acceptance is recoverable across process loss, queued frontiers can be redriven after dispatch loss, and SDK cancellation atomically resolves a pending interrupt. Remove any application-level best-effort interrupt cleanup performed after `AgentGraphManager::cancel()`; duplicate resolution is no longer part of the integration contract.

The package pins AgentGraph `0.16.3`. Artifacts compiled against another AgentGraph release remain inspectable but are not executable under the current stable contract. Recompile and republish affected Playbooks, then publish and verify replacement Agent deployments before reopening traffic. The plugin Doctor treats `AgentGraphManager::recover()` as required SDK surface.

The 0.16.2 to 0.16.3 update adds no database migration or public method signature change. Stop long-lived workers while updating and restart them on the same installed dependency set. Resume now rejects expired, mismatched, or substituted interrupt responses and preserves complete checkpoint schedules and local Send inputs. Input already lost from an older wait checkpoint must be reconciled from trusted application records; republication cannot reconstruct it.

Native Laravel AI tool approvals now fail explicitly with `AgentApprovalRequiredException`. The plugin adapter does not convert that failure into a synchronous fallback or another model attempt. Use the existing graph approval interrupts; native Laravel AI approval resumption is not implemented by `AgentNode`. Memory writes return their receipt without counting as a read, including when the saved item has already expired.

## Current release status

The current Commercial Early Access release is **`v0.20.5`**. **Release status:** Approved. The GitHub release and its attached archive are authoritative.

The public line still starts at `v0.9.0-beta.1`. No stable `v1.0` release exists yet. Read [CHANGELOG.md](CHANGELOG.md) and this `UPGRADING.md` before upgrading.

> The git tag `v0.12.0` points to an early preview commit. The `v0.17.0`, `v0.17.1`, and `v0.17.3` source tags were not promoted to buyer-visible releases.

When upgrading, always:

1. Read the [CHANGELOG.md](CHANGELOG.md) for breaking changes.
2. Follow the backup and maintenance procedure above before changing the package
   or database; preserve the old package/configuration for recovery.
3. Run `php artisan migrate` and resolve its documented checkpoints, then run
   `php artisan filament-agentic-chatbot:doctor` to verify the upgraded environment.
4. Clear caches: `php artisan config:clear && php artisan view:clear && php artisan route:clear`.
5. Re-publish config if needed: `php artisan vendor:publish --tag=filament-agentic-chatbot-config`.

---

## Upgrading to v0.18.0

Version 0.18.0 adds structured Widget conversation starters, a permission-checked read-only Playbook viewer, and responsive Widget and Playbook Builder improvements. It does not add a database migration, change Composer dependencies, or change the productive Agent or Playbook deployment ABI.

Existing Bot settings that still contain `quick_prompts` are normalized in memory and remain usable. The next administrator save persists the structured representation. Custom widget clients must read `conversation_starters` instead of `quick_prompts`. Each starter contains a short `label`, the exact `prompt` submitted as the visitor message, and an optional safe `icon` key.

Host-defined Solution Kits must replace string prompts:

```php
'conversation_starters' => [
    [
        'label' => 'Track an order',
        'prompt' => 'Where is my order?',
        'icon' => 'search',
    ],
],
```

The built-in Customer Support and Human Handoff Kit advances from `1.0.0` to `1.1.0`. Existing installed authoring state is not modified automatically. Review the Kit upgrade plan before applying the newer definition.

No new Agent or Playbook is required solely for this upgrade. After installation, clear caches, refresh Filament assets, run both Doctor commands, and verify the public Widget plus the Playbook viewer in the real host application.

```bash
composer update heiner/filament-agentic-chatbot:^0.18 --with-all-dependencies
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan filament:assets
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

---

## Upgrading to v0.17.5

Version 0.17.5 has no database migration, configuration key, dependency change, or Playbook republish requirement. It deterministically resumes short, unambiguous whole-message answers to active text and choice waitpoints before model dispatch. Questions, cancellation, conditions, uncertainty, quoted or multiline input, mixed statements, approvals, forms, and operator reviews retain their existing guarded paths.

Run both Doctor commands and repeat saved candidate tests for each live Playbook waitpoint path before activation. An admitted standalone answer no longer requires a provider call, but the complete Playbook still requires its normal capability, policy, and failure-path verification.

```bash
composer update heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

---

## Unreleased: scheduled quality and Knowledge Operations

Run `php artisan migrate` before enabling scheduled quality operations. The
`2026_08_29_000002_build_quality_operations.php` migration adds automation
claims and cadence to saved quality scenarios plus encrypted knowledge-gap and
immutable occurrence ledgers. Existing scenarios remain manual; old
conversations are not guessed into gaps.

Republish or merge the `quality_operations` config. Production must run Laravel
Scheduler and an asynchronous queue worker. Automation deliberately reuses the
existing Agent/provider credential chain; do not create a second API key for
the scheduler. Start with both commands in `--dry-run`, enable cadence on one
non-blocking Published Agent regression, and verify its persisted run before
enabling more scenarios. See [Quality Operations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUALITY_OPERATIONS.md).

---

## Unreleased: evidence-backed conversation outcomes

Run `php artisan migrate` before deploying this build. The
`2026_08_28_000001_create_bot_conversation_outcomes_table.php` migration adds an
idempotent business-outcome ledger with encrypted evidence references and
immutable Agent/Playbook attribution.

Existing conversations are intentionally not backfilled or classified by an
LLM. Analytics starts empty and becomes authoritative as verified events arrive.
New human-handoff requests record a handoff outcome automatically. Hosts may
record CRM, commerce, scheduling, ticketing, or other verified results through
the public `RecordsConversationOutcomes` contract documented in
[Public API](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PUBLIC_API.md#evidence-backed-business-outcomes). Use a stable
source idempotency key and never pass visitor- or model-authored success claims
through that trusted boundary.

After migration, verify one automatic handoff, one operator-recorded outcome,
and one idempotent host retry in staging. Conversation-history deletion may
retain and detach these business records under the host retention policy; its
disclosure now includes the `business_outcomes` category.

---

## Unreleased: app-aware Solution Kits

Run `php artisan migrate` before operators use **Use Solution Kit**. The
`2026_08_28_000002_create_agent_solution_kit_installations_table.php` migration
adds immutable, actor-attributed installation evidence and one-to-one Agent
ownership.

No existing Agent is modified or backfilled. A Kit installation creates a new
inactive Agent, unpublished Playbook drafts, and saved quality scenarios in one
transaction. It does not publish or activate deployments. After installation,
follow the Kit release path in Agent Overview and retain the existing **Publish
candidate**, **Test release candidate**, and **Select tested release** separation.

Hosts that register custom Kits must implement and tag the public
`SolutionKitProvider` contract. Definitions are strict: every Playbook needs an
active blocking current-draft test, write-capable Kits require explicit
installation approval, credentials are forbidden, and full workflow validation
runs before mutation. See [Solution Kits](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SOLUTION_KITS.md).

---

## Unreleased: Integration Studio

Run `php artisan migrate` before operators use **Import integration**. The
`2026_08_28_000003_create_integration_studio_installations.php` migration adds
optional synthetic test-input suggestions to operation drafts and creates the
immutable, actor-attributed Integration Studio installation ledger.

No existing Connector or Operation is modified or backfilled. Importing
OpenAPI, Postman, or cURL creates only inactive, untested, unpublished drafts in
one transaction and does not contact the external service. Review each draft,
complete write-integrity/result-identity policy, run the governed test path,
and publish an immutable revision explicitly.

The optional metadata assistant uses an already configured central AI provider
key; do not add a second wizard-specific secret store. The imported service's
credential remains a separate encrypted Connector value. See [Integration
Studio](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/INTEGRATION_STUDIO.md).

---

## Unreleased: production Handoff Desk

Run `php artisan migrate` before reopening chat traffic. The
`2026_08_29_000001_build_production_handoff_desk.php` migration maps legacy
`pending` requests to `waiting_operator`, adds public IDs, teams, optimistic
state versions, business-hour SLA timestamps, and the immutable encrypted
activity ledger. It also enforces one active handoff per conversation at the
database layer. If old data contains competing active requests, migration stops
and lists the affected conversation IDs; resolve that data deliberately rather
than deleting or merging it automatically.

Republish the package config and review `bot_handoff_requests.desk`: default
team, timezone, staffed hours, priority SLAs, optional team overrides, widget
poll interval, and optional default assignee. Keep provider/API secrets in their
existing central configuration; the desk adds no AI key.

Before rollout, register the handoff view/manage Gates, verify their SQL scope
for tenant-aware hosts, and exercise this sequence in staging: create, claim,
internal note, customer-visible reply, customer follow-up, stale-version
conflict, exact retry, resolve, and explicit return-to-Agent. For Telegram or
Slack, also verify the existing channel-thread binding and queued delivery.
Active handoffs now block conversation-history deletion; include completed
handoff activity in the host support/audit retention decision.

---

## Unreleased: fail-closed channel availability

Telegram remains available by default. Slack has completed its real-provider
acceptance but remains an explicit deployment opt-in. WhatsApp Cloud API,
Mailtrap Email, and Mailgun Email are absent from the Filament setup wizard and
rejected at the runtime and webhook boundaries unless their provider-specific
flags are enabled:

```env
AGENTIC_CHATBOT_CHANNELS_SLACK_ENABLED=false
AGENTIC_CHATBOT_CHANNELS_WHATSAPP_ENABLED=false
AGENTIC_CHATBOT_CHANNELS_MAILTRAP_ENABLED=false
AGENTIC_CHATBOT_CHANNELS_MAILGUN_ENABLED=false
```

Merge the new `channels.slack.enabled`, `channels.whatsapp.enabled`,
`channels.email.providers.mailtrap.enabled`, and
`channels.email.providers.mailgun.enabled` keys into published configuration.
The old broad `AGENTIC_CHATBOT_CHANNELS_EMAIL_ENABLED` switch is removed so one
email provider cannot accidentally expose the other. Existing connection records
are retained, but a disabled provider cannot be diagnosed, test-sent, activated,
or executed. Enable an unaccepted provider only in its dedicated acceptance
environment; mocked provider tests do not constitute live-provider evidence.

---

## Unreleased: secure multimodal channels

Run `php artisan migrate` before enabling attachments. The
`2026_08_29_000003_create_bot_message_attachments.php` migration creates the
canonical private Chat Turn attachment ledger. The follow-up
`2026_08_29_000004_create_channel_inbound_attachments.php` migration creates a
short-lived durable ingress ledger so Mailtrap downloads and Mailgun multipart
uploads survive queue dispatch without placing bytes, disk names, or storage
paths in the job payload.
Existing channel connections, conversations, and messages are not backfilled.

Republish or merge the `channels.whatsapp`, `channels.email.providers`, and attachment
retention settings. The existing Agent/provider AI key remains authoritative;
do not create a channel-specific AI key. WhatsApp, Mailtrap, and Mailgun require
their own encrypted delivery-provider credentials. For every file-enabled
channel, verify that `AGENTIC_CHATBOT_ATTACHMENTS_DISK` is private and writable
by both web and queue workers, keep Laravel Scheduler running, and exercise the
`filament-agentic-chatbot:prune-channel-inbound-attachments --dry-run` probe.

Telegram photos/documents, Slack files, WhatsApp images/documents, Mailtrap
downloads, and Mailgun attachments now cross the canonical chat-attachment validation, model-capability,
durable-turn, storage, and budget path. Re-run **Diagnostics** and test one real
file through each enabled provider. WhatsApp uses Meta App Secret signatures and
a separate Verify Token. Mailtrap uses two provider-issued webhook signing
secrets; Mailgun uses its Webhook Signing Key, not its API key.
See [Channel Integrations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHANNELS.md).

---

## Upgrading to v0.17.4

Version 0.17.4 has no database migration or dependency change. It makes each Data Resource tool state the exact argument names from its immutable deployment, including `sort_by` for current deployments and `sort_field` for compatible older pins. An undeclared alias remains blocked before execution; the model may correct only the same proposal using the exact published schema.

Run both Doctor commands and repeat the saved candidate tests that exercise Data Resources. Existing live deployments remain immutable and do not need to be republished solely for this patch.

```bash
composer update heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

The `v0.17.3` source tag was not promoted to an immutable GitHub release because its protected native Gemini routing gate correctly blocked an undeclared sort alias. Install `^0.17` to select the latest verified patch.

## Upgrading to v0.17.3

Version 0.17.3 requires Laravel AI `^0.11.2` and AgentGraph `0.16.2`. It fixes Gemini multi-step tool completion by preserving provider continuation state, including thought signatures, while keeping Connector recovery exact and fail closed. It adds no plugin database migration.

Treat the dependency update as a maintenance-window cutover because productive Playbook artifacts pin the exact AgentGraph release. Stop queue workers and schedulers, back up the package and AgentGraph stores, update both packages together, run migrations and both Doctor commands, then recompile and republish every live Playbook and its Agent candidate before reopening traffic. Candidate tests must exercise the exact Knowledge, Data Resource, Connector, and Playbook routes that the Agent exposes.

```bash
composer update heiner/filament-agentic-chatbot heiner/agent-graph laravel/ai --with-all-dependencies
php artisan migrate --force
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

Laravel AI's own tool-approval continuation is not a productive authorization path in this plugin. Do not replace AgentGraph approval interrupts or capability-gateway confirmation with SDK approval decisions.

## Upgrading to v0.17.2

Version 0.17.2 has no database, configuration, or productive runtime behavior delta from the 0.17.1 source tag. It corrects the protected live-provider gate so the documented deterministic evidence fallback is accepted only when every expected read succeeded, the evidence guard reports a repairable response-contract failure, and the single tool-free repair attempt was rejected. It also recognizes one exact fail-closed Data Resource grounding rejection without treating it as an executed read, and counts only successful executions when validating contextual follow-up inputs. Replays remain separately bounded to unique successful same-turn evidence. Partial evidence, unexpected productive capabilities, repeated proposal or replay loops, unsafe fallback reasons, and incomplete rendered answers remain release failures.

If you installed a 0.17.0 or 0.17.1 source tag, update to `^0.17`, run both Doctor commands, and then continue with the complete v0.17.0 cutover guide below.

```bash
composer update heiner/filament-agentic-chatbot heiner/agent-graph --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

## Upgrading to v0.17.1

Version 0.17.1 has no database, configuration, or runtime behavior delta from the 0.17.0 source tag. It corrects the protected live-provider assurance contract so one immutable replay is accepted for each distinct successful fanout item. Repeated replay loops remain a release failure.

The `v0.17.1` source tag was not promoted to an immutable GitHub release. Install `^0.17` to receive the latest verified patch, run both Doctor commands, and then continue with the complete v0.17.0 cutover guide below.

```bash
composer update heiner/filament-agentic-chatbot heiner/agent-graph --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

## Upgrading to v0.17.0

### Tokenless browser widget bootstrap

Republish or recopy every browser embed snippet. The loader no longer reads `data-token`; a static token in markup would expire and make a long-lived page fail. Current snippets contain only the public bot and presentation configuration. At runtime the loader calls the origin-checked widget bootstrap endpoint, holds its short-lived token in memory, and renews it before expiration.

Before reopening public widget traffic:

1. add every intended production browser host to each bot's Allowed Domains (an empty production allowlist now blocks bootstrap);
2. set a dedicated `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`;
3. remove `data-token` from custom snippets and SDK mount options;
4. allow `POST /api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap` through proxies/WAFs; and
5. monitor its independent rate limits and `429` responses.

The browser automatically retries only GET-based config, history, and exact-turn reads after renewal. It never automatically repeats chat sends or other writes.

### Authorized Turn Plan and API Connector v3 cutover

This cutover is irreversible and removes the productive Compound Request
subsystem. Back up the database and use a maintenance window:

```bash
php artisan down
php artisan migrate
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

`2026_07_28_000002_cut_over_authorized_turn_plans_and_connector_v3.php`:

- upgrades every non-empty API operation draft to connector contract version 3;
- creates a new immutable v3 revision for each published operation and moves
  the operation's published pointer to it;
- derives a closed literal/enum admission policy per public input, preserves
  declared result identity, and converts legacy batch metadata to bounded
  `batch_mode`;
- clears live pointers to deployments containing removed `compoundRequest`,
  `apiConnector`, or `loop` runtime nodes and cancels their active runs;
- removes `runtime_config.compound_requests`; and
- drops Compound Request tables and the obsolete side-effect foreign key.

Before reopening traffic, inspect every retired workflow, replace `loop` with
`batchMap`, bind API steps to exact published v3 revisions, test the draft, and
republish the workflow. Do not reintroduce an adapter for the old node or
connector contract. Database rollback requires restoring the pre-upgrade
database and application together.

Connector input aliases, normalization, ambiguity rules, and result-identity
checks now belong in the published operation contract. API-specific planner
branches are unsupported. An Agent may satisfy several independent read
objectives with separate calls from its closed deployment tool manifest. Each
call is authorized and bounded independently. Ordered, dependent,
interruptible, or write-bearing work belongs in an explicitly published
Playbook.

### Breaking runtime cleanup

This is a deliberately breaking cleanup. Before deploying it, back up the database, rotate every active Bot Access Token created before HMAC hash version 2 from **Connect > Bot Access Tokens**, and verify the replacement token in each server integration. Plaintext tokens are not recoverable from old hashes, so the migration revokes any still-active token whose `token_hash_version` is missing or not `2`.

Use a maintenance window and deploy in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

The irreversible `2026_07_15_000002_migrate_breaking_runtime_cleanup_data.php` migration performs the durable-data cleanup before old readers disappear. It moves conversation-local workflow memory into `workflow_memories`, moves historical run snapshots into `workflow_runs.workflow_snapshot`, revokes unsupported token hashes, and cancels non-executable legacy planning records. If any prerequisite table or column is missing, the migration fails with an explicit ordering error.

Public configuration and API changes:

| Before | After |
| --- | --- |
| `RAG_*` environment aliases | matching `AGENTIC_CHATBOT_*` variables only |
| runtime-mode environment variables and Bot `product_mode` values | removed; one Agent-first runtime with optional Playbooks |
| fine-grained runtime enable/engine switches | removed; the verified deployment contract owns executable behavior |
| AgentGraph `workflow_node_id` / `workflow_node_type` metadata | SDK `nodeMeta` only |
| SHA-256 Bot Access Token lookup | HMAC-SHA256 hash version 2 only; rotate before upgrade or the migration revokes it |
| conversation-meta workflow memory | canonical `workflow_memories` rows |
| `WorkflowRun.meta.__workflow_snapshot` | `workflow_runs.workflow_snapshot` |
| workflow-first planning/interpreter configuration | removed; the Agent interprets the turn and may invoke only deployment-pinned Playbooks and capabilities |

Prompt-JSON structured output remains available only for provider profiles that declare that transport capability. It is an external provider-format adapter and never grants routing, policy, or execution authority. The local release matrix continues to test native structured tools, prompt-JSON tools, and restricted no-tools profiles.

After migration, clear cached configuration and run the Doctor again. Old environment names, per-bot modes, and engine switches are ignored rather than translated at request time. An Agent without one verified live deployment fails closed.

### Canonical API Connector operation cutover

The unreleased API Connector architecture is deliberately breaking. Back up the database, confirm the production `APP_KEY`, and rehearse the complete migration on a production-shaped staging copy before the maintenance window. The cutover has no `down()` implementation; rollback means restoring both the pre-upgrade application and database.

Run the release in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
php artisan up
```

`2026_07_15_000003_cut_over_api_connector_operation_contracts.php` builds the one `filament-agentic-chatbot.connector-operation` version `2` draft, creates immutable published revisions where needed, assigns published pointers, upgrades compatible API-operation conflict checks to exact revision/hash references, verifies hashes, and drops legacy operation/revision fields. It aborts on invalid JSON or shape, missing or mismatched parents, ambiguous/unresolvable conflict operations, and incompatible scopes. It does not silently select a target or leave a supported lossy contract. Fix the pre-cutover source data and retry the rehearsed migration.

The version-2 contract now closes every server-owned nested object, not only the document root and `auth`. Unknown request/response/effect/execution, retry, metadata/capability, or write-integrity fields are invalid. Request/response payload schemas are closed to the constraints the runtime enforces; provider templates, mappings, and registered strategy policy objects remain extensible. Static credentials in serialized bodies, schema value keywords or annotations, capability presentation, or extensible policies block draft persistence, publication, and cutover. Capability metadata is reconstructed from the operation record, so remove any application code that stored custom or credential-bearing values below `metadata`; keep secrets in encrypted connector authentication configuration instead.

Base URLs must now be absolute HTTP(S) URLs without userinfo, query, fragment, or surrounding whitespace before the model can save. Move fixed query values into operation `query_params`/`query_pairs`; keep provider credentials in encrypted connector authentication. The cutover aborts on structurally unsafe legacy base URLs without echoing their value. Custom authentication can no longer replace a server-generated provider idempotency header: unsafe write retries and continuation requests require the exact server-attested header/key pair after authentication.

The follow-up migrations are also required:

- `2026_07_15_000004_create_api_connector_continuations_table.php` creates the encrypted, leased, bounded continuation journal. It is not a queue or scheduler; polling and pagination remain inside the owning connector invocation, while AgentGraph retains workflow wait/resume authority.
- `2026_07_15_000005_create_api_connector_operation_test_runs_table.php` stores bounded draft/published test evidence without making a draft productively executable.
- `2026_07_15_000006_harden_side_effect_execution_journal.php` encrypts side-effect request, result, and metadata payloads, clears the legacy plaintext JSON columns, and adds hashed lease-token fencing.

Public contract and configuration changes:

| Before | After |
| --- | --- |
| Mutable operation columns or a V1 adapter | one canonical draft plus immutable version-2 revisions |
| Workflow/deployment operation snapshot | exact `apiOperationRevisionId` + `apiOperationContractHash` + `apiOperationInputSchemaHash` + server-generated `environmentBinding`; runtime re-resolves and materializes the revision at every dispatch |
| planner/tool metadata at `metadata.label`, `description`, or `intent_examples` | `metadata.capability.label`, `.description`, and `.intent_examples` |
| provider JSON or legacy success/error projection | one `filament-agentic-chatbot.connector-result` version `2` envelope for every consumer |
| raw `compound_requests.api_connectors.capabilities` definitions | removed; publish connector v3 input/capability metadata and bind the exact revision in a workflow |
| `AGENTIC_CHATBOT_GOOGLE_CALENDAR_COMPOUND_CAPABILITY_ENABLED` | no replacement flag; publish the operation and allow its generated `api_operation_<operation-id>` key |
| owner identity from input, model output, workflow variables, or persisted plans | transient server-attested runtime authority only; missing/mismatched authority fails closed |

Legacy workflow nodes and immutable deployments are not silently rewritten. For every affected node, select the published operation revision and republish the workflow. The node stores the exact revision ID, full contract hash, closed input-schema hash, server-generated environment binding, and flow-owned input mapping/output/failure settings. HTTP method, executable URL, headers, credentials, retry, response mapping, and write policy come only from the verified revision. Old `__operationSnapshot` data and executable node overrides are not authority.

The API Connector edit page now inventories these persisted references without compiling workflows. Legacy `connectorId` nodes are listed as **Migration required** instead of breaking connector administration, but they are never executed or treated as valid pins. Create or publish the intended operation, select its immutable revision in each listed workflow, test the draft, and republish. The read-only legacy diagnostic is removed only after the upgrade inventory reaches zero unpinned references.

Every write operation must require confirmation and declare an explicit integrity mode, scope, and typed canonical `input.*` business identity when duplicates are not allowed. Unknown or expired writes are never automatically reclaimed or retried. Verify the provider outcome out of band, then use `php artisan filament-agentic-chatbot:reconcile-side-effect <id> --outcome=succeeded|failed --force --reason="..." --operator="..."`; reconciliation records the result and never dispatches the write.

For the supported Google Calendar example, provide OAuth values through `AGENTIC_CHATBOT_GOOGLE_CALENDAR_CLIENT_ID`, `AGENTIC_CHATBOT_GOOGLE_CALENDAR_CLIENT_SECRET`, and `AGENTIC_CHATBOT_GOOGLE_CALENDAR_REFRESH_TOKEN` (or the optional access-token variable), then run:

```bash
php artisan filament-agentic-chatbot:setup-google-calendar-connector \
  --bot=<bot-public-id> \
  --calendar=primary \
  --prompt-secrets
```

The command creates or updates the OAuth connector and publishes the canonical confirmation-required `create_google_calendar_event` operation. Before customer traffic, verify a read success, confirmed write, provider error, partial result, owner-scope denial, stale pin, `unknown` write, and operator reconciliation path in staging. See [API Connectors](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md).

### Calibrated retrieval strategy and versioned indexes

Retrieval now uses one explicit `vector`, `hybrid`, or `lexical_only` strategy and returns typed evidence/status contracts. The old `vector.chroma.allow_threshold_bypass` and `retrieval.hybrid.lexical_strategy` compatibility settings are removed. Merge the new `retrieval` config block, run migrations to create the PostgreSQL lexical GIN index, and re-ingest all sources so chunks receive the active `retrieval.index_version` plus embedding provider/model/dimensions. Unstamped or incompatible chunks fail closed by design.

Production defaults use vector-only retrieval. Hybrid and lexical-only installs must select a named calibration profile and run:

```bash
composer eval:retrieval-quality
```

The shipped `de_en_v1` profile is tied to `evals/retrieval/de_en_v1.php`; do not reuse its thresholds as universal lexical weights for a different corpus. PostgreSQL FTS has a candidate limit, transaction-local statement timeout, and required index. `simple_like` now requires an explicit index declaration or bounded small-dataset opt-in. The optional reranker is disabled until a provider/model with verified reranking capability and explicit candidate/input-token budgets is configured.

Retrieval context now consumes the G19 token budget, not a character limit. Traces record only a query fingerprint plus strategy/index/stage metadata. If retrieval is attempted but evidence is insufficient, the assistant and response composer abstain instead of presenting a model-generated answer as grounded.

### Token-aware pure context compilation

Runtime V2 context budgets now use model-relevant tokens instead of characters. If the host publishes the package config or sets context-budget environment variables, replace `RUNTIME_V2_CONTEXT_*_CHARACTERS` with the corresponding `RUNTIME_V2_CONTEXT_*_TOKENS` values and merge the new `runtime.v2.context_pack.total_tokens` / `lane_tokens` config. The old character keys are not a second fallback budget path.

### API connector auth and policy services

`ApiConnector` no longer exposes runtime authentication, HTTP, header/URL policy, or credential-form helpers. Replace direct model helper calls with `ConnectorCredentialService`, or with `ConnectorAccessPolicy` plus `ConnectorDefinition::fromConnector($connector)`. Use `ConnectorCredentials::fromConnector($connector)` only when an integration explicitly needs credential values; its debug and serialized forms are redacted.

This is a PHP API migration only; no database migration is required. OAuth refresh now uses a per-connector/owner single-flight lock, compares the current credential fingerprint before write, and stores access-token plus refresh-token rotation atomically. Automatic OAuth refresh does not advance the environment binding. Operator changes to authentication configuration/credentials or default headers do advance the binding version; with the default `requires_republish` policy, republish affected workflows. Even under `allow_without_republish`, the new secret-free binding hash/version changes the request-authority fingerprint, so an earlier confirmation or side-effect grant cannot authorize the changed environment.

Update connector request configuration through eventful model/service writes. Those writes use an optimistic binding-version compare-and-set and reject stale editors. Direct query-builder updates and `saveQuietly()` are unsupported for connector configuration; the internally row-locked automatic OAuth token refresh is the sole intentional quiet credential write.

Multipart request artifact references now require a valid `sha256` value. Existing integrations that supplied only `disk` and `path` must calculate and include the digest before planning; dispatch rechecks the exact bytes and fails closed if they changed.

### Deployment-only workflow runtime cutover

Published workflows now execute only from an immutable `AgentWorkflowDeployment`. The runtime no longer compiles `agent_workflows.workflow_data`, selects the latest deployment implicitly, writes new snapshots into run metadata, or resumes a snapshotless historical run against the current live graph.

Use a maintenance window and run the cutover in this order:

```bash
php artisan down
php artisan migrate
php artisan agentic-chatbot:materialize-workflow-deployments --dry-run
php artisan agentic-chatbot:materialize-workflow-deployments
php artisan filament-agentic-chatbot:doctor
php artisan up
```

The materialization command is the only compatibility bridge. It creates immutable artifacts for existing workflow versions and sets each published workflow's concrete `active_deployment_id`. The dry run performs the same contract validation inside a rolled-back transaction, and the real cutover is atomic: one invalid legacy version reports its workflow/version context and leaves no partial upgrade state. The command is never invoked by a chat request. Active workflows with a missing pointer, missing artifact, corrupt hash, or incomplete `workflow_runs` deployment columns fail closed with an operator-facing diagnostic.

New workflow runs persist `agent_workflow_deployment_id`, `deployment_hash`, `runtime_schema_version`, and `workflow_snapshot`. Rollback selects the exact existing historical deployment hash atomically; it does not recompile the old authoring payload. Editor draft tests and trace replays use separately identified immutable `editor_preview` deployments and never change the live deployment pointer.

Sub-workflow nodes are also deployment-bound after `2026_07_12_000002_pin_subworkflow_deployments.php`. Republish or rerun the materialization command after migrating: each parent artifact records the exact direct and transitive child deployment IDs/hashes, includes the sorted closure in its own hash, and protects referenced child artifacts from deletion. Runtime compilation never resolves a newer child workflow implicitly.

`2026_07_12_000003_add_subworkflow_dependency_contracts.php` completes that boundary with hashed input/output schemas and mappings. Parent manifests aggregate namespaced child capabilities, write effects, confirmation requirements, and policy metadata; Runtime V2 grants identify both the parent and effective child deployment. Child state is isolated by default and only declared output mappings cross back into the parent. Parent publication fails if a transitive child write has no complete payload schema. Run the materialization command again after this migration so existing parent deployments receive the complete contract closure.

Playbook execution remains deployment-only, but fresh chat turns enter the
Agent deployment rather than a Playbook. No request-time setting can enable a
deploymentless answer, a mutable draft, a global tool, or an unpinned Playbook.
The Agent interprets conversation; deterministic contracts authorize tools and
AgentGraph owns any invoked Playbook run.

The workflow runtime now validates `date` inputs and `date` validation rules as canonical `YYYY-MM-DD` only. If a workflow currently expects natural-language dates such as "tomorrow", "next Friday", or locale-specific date strings, normalize them with semantic extraction or a transform step before they reach deterministic validation.

Money validation is available as a validation rule (`money`, `money:EUR`, `money:USD`, `money:GBP`) rather than as a separate `inputType`.

Data Resource identity scopes are now fail-closed and request-attested. Remove `actor`, `tenant`, `token`, and `conversation` values from `data_resources.scope_values` and bot `runtime_config.data_resources.scope_values`; those reserved namespaces are intentionally ignored. Authenticated actor and Bot Access Token context is attached automatically. Tenant-aware hosts must set `RuntimeAuthorityContextFactory::TENANT_REQUEST_ATTRIBUTE` from trusted Laravel middleware on every chat/resume request. Do not copy tenant or identity values from request input, model output, workflow variables, or checkpoints. Also verify any custom Eloquent `$appends` assumptions: Data Resource results now contain only fields in the resolved select allow-list.

A new migration is required. `2026_07_09_000001_create_bot_chat_turns_table.php` adds the durable chat-turn ledger used for per-conversation serialization, workflow/deployment pinning, request idempotency, unknown-outcome protection, and exact JSON/SSE response replay. Run `php artisan migrate` before directing chat traffic to the upgraded application; the new runtime intentionally fails rather than silently executing without its ledger.

The follow-up migration `2026_07_09_000002_add_reconciliation_to_bot_chat_turns_table.php` adds explicit operator reconciliation fields for installations that already ran an earlier development build of the ledger migration. If the doctor reports an unknown or expired chat turn, verify its external outcome first, then use `php artisan filament-agentic-chatbot:reconcile-chat-turn <id> --force --reason="..." --operator="..."`. The command only abandons and unlocks the turn; it never retries it. See [Operations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md#durable-chat-turn-reconciliation).

`2026_07_09_000003_encrypt_api_connector_default_headers.php` encrypts existing API Connector default headers with the Laravel `APP_KEY`; back up the database and confirm the production key before migrating. Its earlier named-operation snapshot behavior is superseded by the canonical operation cutover above: current productive execution uses exact immutable revision, full-contract, input-schema, and environment pins and re-resolves the revision at dispatch. Republish a workflow intentionally after publishing a replacement operation revision; connector credentials and other connector-level secrets remain live encrypted configuration.

`2026_07_09_000004_add_reconciliation_to_bot_side_effect_executions_table.php` adds the audited outcome fields required for ambiguous external writes. When doctor reports an unknown side effect, verify the provider result out of band and run `php artisan filament-agentic-chatbot:reconcile-side-effect <id> --outcome=succeeded|failed --force --reason="..." --operator="..."`. This records the verified outcome and never dispatches the write again.

Top-level compound execution has been removed. Express multi-step work through published workflow steps and their explicit capability contracts.

API clients should send a stable `client_turn_id` in the JSON body or an `Idempotency-Key` header and reuse it only when retrying the same request. The server generates an ID when omitted, but a caller cannot receive retry deduplication unless it reuses the returned `X-Chat-Turn-Id`. Telegram, Slack, WhatsApp, and Email channel deliveries derive this ID automatically from their provider message identity. Existing conversation history is not backfilled; durable tracking begins with the first turn after migration.

---

## Upgrading to v0.16.1

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.16.1` constraint, or install the exact marketplace version you receive.

This patch release keeps the v0.16 runtime and database contracts unchanged. It fixes default `sendMessage` workflow nodes after internal action/tool steps so an inherited `internal` visibility flag cannot hide the final user-facing workflow response.

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Smoke-test one active workflow that sends a default/plain `sendMessage` after an internal action, tool, or AgentGraph-backed step.

No new migration is required when upgrading from `v0.16.0`.

---

## Upgrading to v0.16.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.16.0` constraint, or install the exact marketplace version you receive.

This release adds structured Compound Request planning/execution, workflow turn-understanding hardening, schema-v2 structured form preservation, and additional database constraints for pending conversation state. The default compound engine is `structured`; use `shadow` to audit generated structured plans before enabling execution for a cautious production rollout.

The mode and shadow settings in this historical v0.16.0 procedure were removed by the current Agent-first cutover. Do not carry them into the current published config; follow [Agent-first runtime cutover](#agent-first-runtime-cutover) instead.

After deployment:

1. Run `php artisan migrate`.
2. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
3. Run `php artisan filament-agentic-chatbot:doctor`.
4. Re-publish and merge the then-current config if you maintain an installation that remains on v0.16.0.
5. Run the v0.16.0 workflow-turn and multi-item evaluation scripts with provider credentials in staging.
6. Verify one pending workflow input, one interruption/replacement turn, one read-only multi-item workflow node, and one write-confirmation workflow path before public rollout.

MySQL/MariaDB installs receive generated-column unique guards for one pending interaction/request per conversation. PostgreSQL and SQLite keep the existing partial unique indexes.

---

## Upgrading to v0.15.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.15.0` constraint, or install the exact marketplace version you receive.

This release focuses on guided Data Resource administration, safer live database-answer defaults, complete readiness/localization coverage, and stricter release gates. No special destructive migration step is required, but run migrations normally and verify live data-answer policies in staging.

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Review **Connect > Data Resources** and confirm returned fields, filters, sorting, limits, and runtime safety scopes.
4. Open each production bot and approve only the Data Resources it should use.
5. Verify one workflow `query_data_resource` path and one normal widget/API answer.
6. Run channel diagnostics again if Telegram or Slack channels are part of the rollout.

If you need explicit production role separation for Data Resource administration, enable strict Gate mode with `AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true` and define the Data Resource view/manage Gates before opening the panel to operators.

---

## Upgrading to v0.14.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` from a `^0.14.0` constraint, or install the exact marketplace version you receive.

Run migrations after updating. This release adds the Quality Loop, handoff, assistant profile, Bot Access Token hardening, API connector hardening, and legacy RAG database-object normalization migrations. The migration set is intended to preserve compatibility, but it touches old RAG-era names, indexes, and workflow variables, so take a production database backup and verify the upgrade in staging first.

If Filament assets are cached in deployment, run:

```bash
php artisan filament:assets
```

After deployment:

1. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
2. Run `php artisan filament-agentic-chatbot:doctor`.
3. Verify one normal knowledge answer and one widget/API request.
4. Verify one workflow draft, publish, and test run.
5. Verify one saved quality scenario and review any generated fix suggestions.
6. Verify one handoff review path if operators will use human escalation.
7. Review Bot Access Token scopes, pricing entries for cost budgets, widget signing posture, domain allowlists, workflow trace privacy, and API connector safety warnings.

The workflow editor assets were rebuilt around shadcn-style primitives and Tailwind `fac` prefixing. Host apps with aggressive asset caches should publish fresh assets and clear browser/CDN caches for the Filament panel.

---

## Commercial hardening compatibility window

This line adds stricter production controls without breaking older embeds by default. If you published the config file, merge these keys:

- `widget.signing.allow_query_tokens`
- `widget.signing.allow_body_tokens`
- `widget.allow_all_domains`
- `ingestion.max_fetch_bytes`
- `ingestion.max_redirects`
- `ingestion.allowed_content_types`
- `bot_access_tokens.last_used_throttle_minutes`
- `bot_access_tokens.accept_authorization_bearer`
- `bot_access_tokens.bearer_prefix_required`
- `bot_access_tokens.invalid_attempts_per_minute`
- `bot_access_tokens.allow_unscoped_legacy_conversations`
- `bot_access_tokens.hash_key`
- `data_resources.authorization.require_gates`

Recommended production posture:

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES=5242880
AGENTIC_CHATBOT_INGESTION_MAX_REDIRECTS=3
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_LAST_USED_THROTTLE_MINUTES=5
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_BEARER_PREFIX_REQUIRED=true
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_INVALID_ATTEMPTS_PER_MINUTE=10
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_ALLOW_UNSCOPED_LEGACY_CONVERSATIONS=false
```

Notes:

- Widget query/body token support and empty domain allowlists are compatibility bridges. Move browser embeds to the `X-filament-agentic-chatbot-Token` header and configure exact bot domains.
- `AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES` is now enforced before materialization and cumulatively across a URL redirect chain or all pages of one API-source fetch. Raise it deliberately if a trusted source legitimately needs a larger total response budget.
- `/api/filament-agentic-chatbot/chat/{botPublicId}/config` now includes additive `bot.knowledge_health`. Existing keys are unchanged.
- The built-in `bots` data resource is scoped to the current bot by default. Override it in the host app only if a global bot catalog is intentional.
- Data Resource admin now supports optional strict Gate mode through `AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true`. Define `filament-agentic-chatbot.view-data-resources` and `filament-agentic-chatbot.manage-data-resources` Gates when you need production role separation.
- UI-managed Data Resources no longer fall back to every returnable field when no default field is selected. They use answer-ready fields first, then one safe returnable field. Runtime safety scope filters can protect ownership columns without exposing those columns as normal workflow filters.
- URL ingestion now rejects oversized responses, unsupported content types, unsafe redirects, and private/reserved IP targets by default.
- Chroma threshold bypass was off by default in this historical compatibility window and is removed by the current G21 retrieval contract.

Run `php artisan filament-agentic-chatbot:doctor` after deploying. New warnings identify production posture issues before these compatibility defaults become stricter in a future release.

---

## Bot Access Token hardening

Releases that include Bot Access Token hardening keep the Filament admin usable by default: authenticated panel users can view and manage Bot Access Tokens unless you opt into stricter authorization. For production role separation, define Gates for panel users that may view or manage tokens:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-bot-access-tokens', fn ($user) => $user->canReviewIntegrations());
Gate::define('filament-agentic-chatbot.manage-bot-access-tokens', fn ($user) => $user->canManageIntegrations());
```

Once a Bot Access Token Gate is defined, token administration becomes explicitly gated: the view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/rotate/revoke/delete actions. The ability names can be changed in `filament-agentic-chatbot.bot_access_tokens.authorization`.

If you want the resource to deny access until Gates exist, set:

```env
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_AUTHORIZATION_REQUIRE_GATES=true
```

Disabling the authorization block is supported for legacy apps, but production hosts should keep it enabled and use Gates or strict gate mode where admin role separation matters.

Run migrations after updating. Budget columns are widened for large UI values, a new reservation table is added for hard monthly budget checks, conversations gain Bot Access Token owner/channel scope columns, and tokens gain a hash-version column for HMAC-SHA256. Cost budgets now require matching `usage.pricing` entries for the resolved provider/model; missing pricing blocks the request with `ai_cost_budget_pricing_missing` instead of allowing an unenforceable cost budget.

At the time of the original token-hardening release, SHA-256 token hashes remained valid until rotation. The current G25 breaking cleanup supersedes that window: rotate them before upgrading or the cutover migration revokes them. Existing unscoped conversations are not readable by Bot Access Tokens by default; temporarily enable `AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_ALLOW_UNSCOPED_LEGACY_CONVERSATIONS=true` only if you need a short persistence-migration window for active sessions.

---

## Data Resource hardening

Releases that include Data Resource hardening keep the Filament admin usable by default: authenticated panel users can view and manage Data Resources unless you opt into stricter authorization. For production role separation, define Gates for panel users that may view or manage approved live data access:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-data-resources', fn ($user) => $user->canReviewDataResources());
Gate::define('filament-agentic-chatbot.manage-data-resources', fn ($user) => $user->canManageDataResources());
```

Once either Data Resource Gate is defined, administration becomes explicitly gated: the view Gate controls navigation/read access, an allowed manage Gate also grants read access, and the manage Gate controls create/edit/delete/sync actions. The ability names can be changed in `filament-agentic-chatbot.data_resources.authorization`.

If you want the resource to deny access until Gates exist, set:

```env
AGENTIC_CHATBOT_DATA_RESOURCE_AUTHORIZATION_REQUIRE_GATES=true
```

Review UI-managed resources after updating. Resources without an explicit default returned field now expose only one safe default field instead of every returnable field, and runtime safety scope filters remain active even when their ownership columns are not visitor-filterable fields.

---

## Upgrading to v0.13.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` so Composer also installs `heiner/agent-graph`. Do not add a custom root `repositories` entry for AgentGraph in production.

Run migrations after updating. This release adds an **irreversible cutover migration** that cancels in-flight legacy workflow runs (`running`, `halted`, `delayed`) that never started on AgentGraph. Plan a short maintenance window if you depend on long-lived paused workflows.

If you already published the config file, merge or re-publish these keys:

- `chat.assistant_graph`
- `workflow.turn_planner`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`
- `data_resources.smart_queries`

The legacy `chat.parent_agent.*` config tree and `PARENT_AGENT_*` environment fallbacks have been removed. Move any local overrides to `chat.assistant_graph.*` / `AGENTIC_CHATBOT_ASSISTANT_GRAPH_*`.

After deployment:

1. Run `php artisan filament:assets` if your deploy process caches Filament package assets.
2. Clear caches.
3. Run `php artisan filament-agentic-chatbot:doctor`.
4. Test one normal knowledge answer, one halted Collect Input / Confirmation workflow, and any Smart Data Query workflow you rely on.

For marketplace production hosts with `AGENTIC_CHATBOT_COMMERCIAL_MODE=true`, also set `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`, `AGENTIC_CHATBOT_ANYSTACK_ID`, `AGENTIC_CHATBOT_DOCS_URL`, and `AGENTIC_CHATBOT_SUPPORT_EMAIL` before launch.

---

## Upgrading to v0.12.0

Do **not** target `v0.12.0` for new installs. Use [Upgrading to v0.16.1](#upgrading-to-v0161) instead.

The `v0.12.0` documentation below is kept for historical context on features that shipped in the `0.13.0` line:

Run migrations after updating. The planned `0.12.0` line extended the workflow run status vocabulary with `cancelled` and introduced agent-first chat configuration keys.

If you already published the config file, merge the `chat.assistant_graph`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`, and `data_resources.smart_queries` keys or re-publish the package config and apply your local overrides again.

---

## Upgrading to v0.11.1

v0.11.1 is a patch release on top of v0.11.0. It does not add new migrations.

Upgrade for workflow editor UI polish, clearer workflow release-status copy, workflow-list default filter behavior, and refreshed release documentation. If Filament assets are cached in your deployment process, run `php artisan filament:assets` after updating.

---

## Upgrading to v0.11.0

Run migrations after updating. v0.11.0 adds package-owned Telegram/Slack channel tables and workflow memory storage.

If you plan to use Telegram or Slack channels, create one Bot Access Token per channel, create a Channel connection for the bot, configure provider credentials, set a public HTTPS webhook URL, and run channel diagnostics before sending production traffic. Production installs should run a real queue worker for inbound webhook processing and channel activity indicators.

If you already published the config file, merge the new `channels` and workflow image transport configuration keys or re-publish the package config and apply your local overrides again.

---

## Upgrading to v0.10.0

Run migrations after updating. v0.10.0 adds optional Bot Access Token ownership and channel columns used for admin filtering and AI usage reporting.

If you already published the config file, add the new `bot_access_tokens` config block manually or re-publish the package config and merge your local changes. Configure `owner_types` only when your app wants token ownership assignment in the admin UI; the package does not create users, teams, or tenants.

---

## Migration note for users who installed before v0.9.4 release

Three migration files were renamed to fix duplicate sequence-number prefixes:

| Old filename                                                           | New filename                                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `2026_04_02_000004_ensure_workflow_runs_has_workflow_snapshot.php`     | `2026_04_02_000005_ensure_workflow_runs_has_workflow_snapshot.php`     |
| `2026_04_02_000005_add_findings_to_workflow_generation_runs_table.php` | `2026_04_02_000006_add_findings_to_workflow_generation_runs_table.php` |
| `2026_04_02_000005_add_node_traces_to_workflow_runs_table.php`         | `2026_04_02_000007_add_node_traces_to_workflow_runs_table.php`         |

If you installed an earlier build, running `php artisan migrate` after upgrading may attempt to re-run these three migrations under their new filenames. All three are fully idempotent (they use `hasColumn`/`hasTable` guards) so re-running them is safe and causes no data changes. You can verify the current migration status with `php artisan migrate:status`.
