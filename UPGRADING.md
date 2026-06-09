# Upgrading

This document covers required steps when upgrading between public releases.

## Current release status

The current recommended Commercial Early Access release is **`v0.15.0`**.

The public line still starts at `v0.9.0-beta.1`. No stable `v1.0` release exists yet. Read [CHANGELOG.md](CHANGELOG.md) and [RELEASE_NOTES_v0.15.0.md](RELEASE_NOTES_v0.15.0.md) before upgrading.

> The git tag `v0.12.0` points to an early preview commit. Do not stay on that tag; install `^0.15.0` instead.

When upgrading, always:

1. Read the [CHANGELOG.md](CHANGELOG.md) for breaking changes.
2. Run `php artisan filament-agentic-chatbot:doctor` to verify your environment.
3. Run `php artisan migrate` to apply any new migrations.
4. Clear caches: `php artisan config:clear && php artisan view:clear && php artisan route:clear`.
5. Re-publish config if needed: `php artisan vendor:publish --tag=filament-agentic-chatbot-config`.

---

## Upgrading to v0.15.0

Update the package constraint to `^0.15.0` or to the exact marketplace version you receive:

```bash
composer update heiner/filament-agentic-chatbot --with-dependencies
php artisan migrate
php artisan filament:assets
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan filament-agentic-chatbot:doctor
```

`v0.15.0` focuses on commercial polish, safer live database answers, and release-hardening after `v0.14.0`.

Review these areas before public rollout:

1. **Data Resources**: create or sync approved live Eloquent resources in Filament, then verify returned fields, answer-ready fields, filters, sorting, result limits, and safety scopes.
2. **Bot approvals**: make sure each bot only approves the Data Resources it is allowed to use. Bot policy can narrow the global resource contract, but it should not be treated as a way to widen it.
3. **Workflow Query data steps**: test workflows that use `query_data_resource`, especially generated Smart Data Query workflows.
4. **Widget preview and launch readiness**: review theme, copy, context-area overrides, launcher behavior, Markdown-style answer rendering, signing, domain allowlists, and one real widget answer.
5. **Quality and release gates**: run saved quality scenarios, inspect workflow draft readiness, and check one API/channel answer if those surfaces are enabled.

No special destructive migration step is required for this release, but production installs that expose live data answers should verify Data Resources in staging before public traffic.

---

## Commercial hardening compatibility window

This line adds stricter production controls without breaking older embeds by default. If you published the config file, merge these keys:

- `widget.signing.allow_query_tokens`
- `widget.signing.allow_body_tokens`
- `widget.allow_all_domains`
- `vector.chroma.allow_threshold_bypass`
- `retrieval.hybrid.lexical_strategy`
- `ingestion.max_fetch_bytes`
- `ingestion.max_redirects`
- `ingestion.allowed_content_types`
- `bot_access_tokens.last_used_throttle_minutes`

Recommended production posture:

```env
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_QUERY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_SIGNING_ALLOW_BODY_TOKENS=false
AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=false
AGENTIC_CHATBOT_CHROMA_ALLOW_THRESHOLD_BYPASS=false
AGENTIC_CHATBOT_RETRIEVAL_HYBRID_LEXICAL_STRATEGY=simple_like
AGENTIC_CHATBOT_INGESTION_MAX_FETCH_BYTES=5242880
AGENTIC_CHATBOT_INGESTION_MAX_REDIRECTS=3
AGENTIC_CHATBOT_BOT_ACCESS_TOKEN_LAST_USED_THROTTLE_MINUTES=5
```

Notes:

- Widget query/body token support and empty domain allowlists are compatibility bridges. Move browser embeds to the `X-filament-agentic-chatbot-Token` header and configure exact bot domains.
- `/api/filament-agentic-chatbot/chat/{botPublicId}/config` now includes additive `bot.knowledge_health`. Existing keys are unchanged.
- The built-in `bots` data resource is scoped to the current bot by default. Override it in the host app only if a global bot catalog is intentional.
- URL ingestion now rejects oversized responses, unsupported content types, unsafe redirects, and private/reserved IP targets by default.
- Chroma threshold bypass is off by default. If enabled, returned chunks are marked with `threshold_bypassed=true`.

Run `php artisan filament-agentic-chatbot:doctor` after deploying. New warnings identify production posture issues before these compatibility defaults become stricter in a future release.

---

## Bot Access Token hardening

Releases that include Bot Access Token hardening change the Filament admin default to secure-by-default. After upgrading, define Gates for panel users that may view or manage tokens, otherwise the Bot Access Token resource and mutation actions are intentionally unavailable:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('filament-agentic-chatbot.view-bot-access-tokens', fn ($user) => $user->canReviewIntegrations());
Gate::define('filament-agentic-chatbot.manage-bot-access-tokens', fn ($user) => $user->canManageIntegrations());
```

The ability names can be changed in `filament-agentic-chatbot.bot_access_tokens.authorization`. Disabling this authorization block is supported for legacy apps, but production hosts should keep it enabled and define explicit Gates.

Run migrations after updating. Budget columns are widened for large UI values and a new reservation table is added for hard monthly budget checks. Cost budgets now require matching `usage.pricing` entries for the resolved provider/model; missing pricing blocks the request with `ai_cost_budget_pricing_missing` instead of allowing an unenforceable cost budget.

---

## Upgrading to v0.13.0

Run `composer update heiner/filament-agentic-chatbot --with-dependencies` so Composer also installs `heiner/agent-graph`. Do not add a custom root `repositories` entry for AgentGraph in production.

Run migrations after updating. This release adds an **irreversible cutover migration** that cancels in-flight legacy workflow runs (`running`, `halted`, `delayed`) that never started on AgentGraph. Plan a short maintenance window if you depend on long-lived paused workflows.

If you already published the config file, merge or re-publish these keys:

- `chat.assistant_graph` (preferred) or legacy `chat.parent_agent`
- `workflow.turn_planner`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`
- `data_resources.smart_queries`

After deployment:

1. Run `php artisan filament:assets` if your deploy process caches Filament package assets.
2. Clear caches.
3. Run `php artisan filament-agentic-chatbot:doctor`.
4. Test one normal knowledge answer, one halted Collect Input / Confirmation workflow, and any Smart Data Query workflow you rely on.

For marketplace production hosts with `AGENTIC_CHATBOT_COMMERCIAL_MODE=true`, also set `AGENTIC_CHATBOT_WIDGET_SIGNING_KEY`, `AGENTIC_CHATBOT_ANYSTACK_ID`, `AGENTIC_CHATBOT_DOCS_URL`, and `AGENTIC_CHATBOT_SUPPORT_EMAIL` before launch.

---

## Upgrading to v0.12.0

Do **not** target `v0.12.0` for new installs. Use [Upgrading to v0.15.0](#upgrading-to-v0150) for the current line, or [Upgrading to v0.13.0](#upgrading-to-v0130) only when you intentionally need that historical release.

The `v0.12.0` documentation below is kept for historical context on features that shipped in the `0.13.0` line:

Run migrations after updating. The planned `0.12.0` line extended the workflow run status vocabulary with `cancelled` and introduced agent-first chat configuration keys.

If you already published the config file, merge the `chat.parent_agent`, `workflow.input_interruption`, `workflow.choice_resolution`, `workflow.turn_router`, `workflow.store_submission`, and `data_resources.smart_queries` keys or re-publish the package config and apply your local overrides again.

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
