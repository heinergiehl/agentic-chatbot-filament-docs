# Quick Start

This guide is optimized for first-time setup and clean-room testing of the current Commercial Early Access release line.

> Commercial Early Access note: the `0.x` line is intentionally sold before `1.0`. The install, widget, workflow, analytics, privacy, and server API foundations are already in place, but you should still expect occasional bugs and validate every rollout in staging. Early-access feedback is highly appreciated.

## Read This First If You Are New

If you are still learning the product model, start with:

- [Core Concepts](CORE_CONCEPTS.md)
- [Bots](BOTS.md)
- [Knowledge Sources](KNOWLEDGE_SOURCES.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Chat Widget](CHAT_WIDGET.md)

## 1. What You Are Installing

Filament Agentic Chatbot adds a managed grounded-assistant layer to a Laravel + Filament app:

- Filament resources for bots, sources, workflows, and conversations
- Retrieval and provider controls per bot
- Text, file, URL, and API knowledge sources for the retrieval pipeline
- An embeddable widget for your app or external frontend
- A workflow editor for routing, actions, connectors, runs, and releases
- Operational checks, analytics, and privacy endpoints

It helps you ship AI assistants inside your product faster. It does not replace your core app logic, billing, tenancy, or every product-specific workflow.

## 2. Prerequisites

- PHP 8.3+ (PHP 8.4 is also supported)
- Composer 2.2+ (current 2.x recommended)
- Laravel 12 or 13
- PostgreSQL with `pgvector` (default/recommended), or ChromaDB as an optional backend
- A supported chat provider API key such as `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`, `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY`, or `AZURE_OPENAI_API_KEY`

## 3. Choose Your Start Path

### Path A: Existing Filament App

Install package:

```bash
composer require heiner/filament-agentic-chatbot
php artisan vendor:publish --tag=filament-agentic-chatbot-config
```

Register plugin in your panel provider:

```php
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

->plugins([
    FilamentAgenticChatbotPlugin::make(),
])
```

### Path B: Brand-New Laravel App (from scratch)

```bash
composer create-project laravel/laravel my-app
cd my-app
composer require filament/filament "^5.2"
php artisan filament:install --panels --no-interaction
composer require heiner/filament-agentic-chatbot
php artisan vendor:publish --tag=filament-agentic-chatbot-config
```

Then add `FilamentAgenticChatbotPlugin::make()` in `app/Providers/Filament/AdminPanelProvider.php`.

If Filament does not create `app/Providers/Filament/AdminPanelProvider.php`, run `php artisan make:filament-panel admin` once and then register the plugin there.

### For Maintainer Testing Only

If you are testing the package from a local checkout instead of Packagist, use a Composer `path` repository:

```bash
composer config repositories.filament-agentic-chatbot path ../filament-agentic-chatbot
composer require heiner/filament-agentic-chatbot:'*@dev'
```

If you need to install directly from GitHub VCS for a private fork, configure Composer auth first:

```bash
composer config --global --auth github-oauth.github.com YOUR_GITHUB_TOKEN
```

## 4. Configure `.env`

Minimum baseline:

```env
AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector
AGENTIC_CHATBOT_DB_CONNECTION=agentic_chatbot_pgsql
AGENTIC_CHATBOT_DB_HOST=127.0.0.1
AGENTIC_CHATBOT_DB_PORT=5432
AGENTIC_CHATBOT_DB_DATABASE=filament_agentic_chatbot
AGENTIC_CHATBOT_DB_USERNAME=postgres
AGENTIC_CHATBOT_DB_PASSWORD=secret
AGENTIC_CHATBOT_CHAT_PROVIDER=gemini
AGENTIC_CHATBOT_CHAT_MODEL=gemini-2.5-flash-lite
AGENTIC_CHATBOT_EMBEDDING_PROVIDER=gemini
AGENTIC_CHATBOT_EMBEDDING_MODEL=gemini-embedding-001
AGENTIC_CHATBOT_VECTOR_DIMENSIONS=1536
AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE=40
AGENTIC_CHATBOT_MAX_REQUESTS_PER_MINUTE_PER_IP=120
AGENTIC_CHATBOT_CONTEXT_DEFAULT_AREA=public
AGENTIC_CHATBOT_CONTEXT_ALLOWED_AREAS=public,member,admin
AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true
AGENTIC_CHATBOT_WIDGET_SIGNING_KEY=replace-with-a-long-random-secret
GEMINI_API_KEY=
```

Optional Chroma profile:

```env
AGENTIC_CHATBOT_VECTOR_BACKEND=chroma
AGENTIC_CHATBOT_CHROMA_URL=http://127.0.0.1:8001
AGENTIC_CHATBOT_CHROMA_TENANT=default_tenant
AGENTIC_CHATBOT_CHROMA_DATABASE=default_database
AGENTIC_CHATBOT_CHROMA_COLLECTION=filament-agentic-chatbot
```

Filament Agentic Chatbot auto-detects Chroma API (`/api/v2` first, then `/api/v1` fallback for older servers). Set `AGENTIC_CHATBOT_CHROMA_URL` to the server root URL (for example `http://127.0.0.1:8001`), not `/api/v2`.

Supported public backends today are `pgvector` and `chroma`. Pinecone is not supported yet, even if you notice scaffolded placeholders elsewhere in the package.

Production profile (recommended):

```env
AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector
AGENTIC_CHATBOT_DB_CONNECTION=agentic_chatbot_pgsql
AGENTIC_CHATBOT_DB_HOST=127.0.0.1
AGENTIC_CHATBOT_DB_PORT=5432
AGENTIC_CHATBOT_DB_DATABASE=filament_agentic_chatbot
AGENTIC_CHATBOT_DB_USERNAME=postgres
AGENTIC_CHATBOT_DB_PASSWORD=secret
```

If your main app DB is MySQL, use dedicated PostgreSQL for vector retrieval:

```env
AGENTIC_CHATBOT_DB_CONNECTION=agentic_chatbot_pgsql
AGENTIC_CHATBOT_DB_HOST=127.0.0.1
AGENTIC_CHATBOT_DB_PORT=5432
AGENTIC_CHATBOT_DB_DATABASE=filament_agentic_chatbot
AGENTIC_CHATBOT_DB_USERNAME=postgres
AGENTIC_CHATBOT_DB_PASSWORD=secret
```

Commercial profile metadata (required only when `AGENTIC_CHATBOT_COMMERCIAL_MODE=true`):

```env
AGENTIC_CHATBOT_COMMERCIAL_MODE=true
AGENTIC_CHATBOT_ANYSTACK_ID=your-anystack-product-id
AGENTIC_CHATBOT_DOCS_URL=https://github.com/heinergiehl/agentic-chatbot-filament-docs
AGENTIC_CHATBOT_SUPPORT_EMAIL=webdevislife2021@gmail.com
```

The doctor command warns if any of these commercial profile values are missing at launch time.

## 5. Run Migrations + Queue Worker

```bash
php artisan migrate
php artisan queue:work
```

Optional (recommended for deployments):

```bash
php artisan filament:assets
```

## 6. Validate Setup Immediately

```bash
php artisan filament-agentic-chatbot:doctor
```

Treat `FAIL` as blocking.

## 7. Create Your First Bot

1. Open Filament admin.
2. Open the `Agentic Chatbot` navigation group.
3. Create a bot in `Bots`.
4. Add a source in `Sources` (text/file/url).
5. Wait until source status is `completed`.
6. Review `Runtime Status` and `Live Preview` on the bot edit page.
7. Use `Test Retrieval` and `Test Bot Answer` on the bot edit page.
8. Use `Setup Check` actions on bot/source pages if anything is blocked.
9. Copy the `Embed Snippet` once the bot looks and behaves correctly.

## 8. Optional: Add Your First Workflow

After the knowledge foundation is working, you can layer in agentic behavior:

1. Open `Workflows` in the `Agentic Chatbot` navigation group.
2. Create a workflow for qualification, onboarding, triage, or escalation.
3. Draft the first version manually or use the `AI Draft` tab.
4. Test recent runs and inspect traces before publishing.
5. Publish only when the workflow behaves as expected.
6. If the workflow needs internal reads or structured writes, configure the bot capability mode and allowed internal data resources before publishing.

## 9. Embed Widget

Use the `Embed Snippet` action on bot edit page.

Example:

```html
<script
    src="https://your-app.com/filament-agentic-chatbot/widget"
    data-bot="YOUR_BOT_PUBLIC_ID"
    defer
></script>
```

Use `/filament-agentic-chatbot/widget` for new snippets. Existing snippets that use `/filament-agentic-chatbot/widget.js` are still supported for compatibility.

If signing is enabled, include `data-token` from generated snippet.

After the first real conversations land, open the bot `Analytics` page to review feedback, citation coverage, and potential knowledge gaps.

## 10. Optional: Server API / Channel Integration

For server API clients, Telegram bots, or Slack apps, create a Bot Access Token in Filament, set a channel label for reporting, and call the JSON complete endpoint:

```http
POST /api/filament-agentic-chatbot/chat/{botPublicId}/complete
Authorization: Bearer fac_generated_token
```

See [API Integrations](API_INTEGRATIONS.md) for the request/response contract, common error codes, and a Laravel Telegram webhook example.

Run the enterprise smoke test after migrations:

```bash
php artisan filament-agentic-chatbot:qa-enterprise-smoke --host=your-app.test
```

## 11. From-Scratch Test Checklist

Use this before publishing:

1. New Laravel app installs package without manual hacks.
2. `php artisan migrate` succeeds.
3. `php artisan filament-agentic-chatbot:doctor` has no `FAIL`.
4. A source ingests to `completed`.
5. Widget answers a test prompt.
6. If workflows are enabled, a draft saves and publishes cleanly.
7. At least one workflow execution appears in `Workflow Runs`, and any `store_submission` output appears in `Submissions`.

### One-Command Smoke Script (PowerShell)

Run from repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke/smoke-install.ps1 `
  -DbHost 127.0.0.1 `
  -DbPort 5435 `
  -DbUsername sail `
  -DbPassword password `
  -GeminiApiKey "<your-key>" `
  -RunIngestionProbe
```

Install from GitHub VCS instead of local path:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke/smoke-install.ps1 `
  -InstallMode vcs `
  -RepositoryUrl "https://github.com/heinergiehl/filament-agentic-chatbot.git" `
  -PackageConstraint "dev-main" `
  -GitHubToken "<optional-token-for-private-repo>" `
  -DbHost 127.0.0.1 `
  -DbPort 5432 `
  -DbUsername postgres `
  -DbPassword secret
```

## Common First-Run Issues

- `Source pending`: queue worker not running.
- `This domain is not allowed`: missing bot `allowed_domains`, or host mismatch. Use host entries (`app.example.com`, `*.example.com`). `localhost:8000` and full URLs are accepted and normalized to host.
- `Please sign in to access this chat area`: area is non-public and current user/guard is not authorized, or session auth context is disabled. Keep `AGENTIC_CHATBOT_API_INCLUDE_SESSION_AUTH_CONTEXT=true` for `member/admin` areas.
- `Failed to clone the git@github.com:...` during `composer require`: GitHub VCS fallback hit SSH. For private repos, add a GitHub token (`composer config --global --auth github-oauth.github.com ...`) or pass `-GitHubToken` in the smoke script.
- `composer-runtime-api ^2.2` during `composer create-project` or `composer require`: your Composer is too old for Laravel 12. Update to Composer 2.2+ and rerun the install.
- `Filament panel provider not found`: `filament:install --panels` did not generate the admin panel provider on this host. Run `php artisan make:filament-panel admin` and continue.
- `Could not reach chroma ... /api/v2/heartbeat`: start Chroma and verify `AGENTIC_CHATBOT_CHROMA_URL`.
- `The route api/v2/heartbeat could not be found`: `AGENTIC_CHATBOT_CHROMA_URL` points to Laravel/app HTTP, not Chroma.
- `vector_backend_not_implemented`: the configured backend is not supported. Use `pgvector` (recommended) or `chroma`.
- `column cannot have more than 2000 dimensions for ivfflat index`: high-dimensional embedding + ANN index limit. Installation now skips ANN index in this case; retrieval still works.

## 12. VPS Demo Deployment (Optional)

If you maintain a separate public demo app on VPS, keep that deployment flow outside the buyer quick-start path. The package itself does not require a dedicated demo environment to install, migrate, or launch successfully.
