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
- Laravel 12.61.1+ or 13.12.0+
- PostgreSQL with `pgvector` (default/recommended) plus PHP `ext-pdo_pgsql`, or ChromaDB as an optional backend
- A supported chat provider API key such as `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`, `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY`, or `AZURE_OPENAI_API_KEY`

The package supports Laravel 12 and 13, but Composer blocks framework versions below `12.61.1` and Laravel 13 versions below `13.12.0`. Upgrade the host app first if Composer reports a conflict against those patch levels.

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
AGENTIC_CHATBOT_WIDGET_SIGNING_TTL_MINUTES=10
AGENTIC_CHATBOT_WIDGET_SIGNING_REFRESH_BEFORE_SECONDS=120
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

For pgvector, make sure PHP has `pdo_pgsql` enabled. On hosts where the database user cannot create extensions, create the vector extension once as a privileged database user before migrations:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
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

If the host app uses Laravel's `database` queue driver and has not created queue tables yet, run this first:

```bash
php artisan queue:table
php artisan queue:batches-table
php artisan migrate
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

## 7. Golden Path: Bot To Live Deployment

Use this path for the first production-style bot. It keeps one clear authority: one bot, exactly one live main workflow, and only the capabilities that workflow is allowed to use.

### 1. Create the bot

1. Open **Agentic Chatbot > Build > Bots** and create a bot.
2. Choose what the bot may do under **What should this bot be allowed to do?** Start with the narrowest option that covers the workflow.
3. Configure the provider, model, instructions, access, and widget basics, then save.

### 2. Create and assign the main workflow

1. Open **Agentic Chatbot > Build > Workflows** and create a workflow.
2. Assign the bot you just created. This establishes the workflow's model, knowledge, and capability boundary.
3. Save the workflow and open its visual editor.

The bot may keep other draft or standby workflows, but only one published workflow can be its live main workflow.

### 3. Build with a recipe or Simple Builder

1. Choose **Workflow recipes** for a guided starting point, or add the focused steps shown by **Simple Builder**.
2. Keep the first flow small: start, ask or route if needed, answer or act, then finish.
3. Save the draft. Draft changes do not change live chat.

You do not need Advanced nodes for the normal path.

### 4. Connect only the modules this workflow needs

- For approved documents, add and ingest [Knowledge Sources](KNOWLEDGE_SOURCES.md), then use a Knowledge Answer step.
- For live application records, define the maximum policy in [Data Resources](DATA_RESOURCES.md), approve or narrow it on the bot, then choose that resource in a Data Answer step. The inspector shows the resource contract and its allowed information and filters.
- For an external service, create the saved connection and versioned operation in [API Connectors](API_CONNECTORS.md), then select that API Operation in the workflow. The node asks only for the operation's allowed inputs.
- For a write, enable the required bot ability and use an approved action or API Operation. Keep confirmation enabled unless the published contract explicitly proves it is unnecessary.

Do not configure the same module a second time in the workflow. The workflow selects from the bot-approved Knowledge, Data Resource, API Operation, and Capability contracts.

### 5. Test the draft

1. Use **Test** in the workflow editor and run the normal conversation path.
2. Add **Saved tests** for routes and answers that must keep working.
3. Open **Review**. Every blocker links directly to its step, bot setup, node picker, or Simple Builder location.
4. For a write path, verify that the bot asks for confirmation before the change is executed.

### 6. Review and publish

1. Select **Publish**.
2. In **Review before publishing**, confirm what the bot can and cannot do, which data it reads, which writes it can perform, and when confirmation is required.
3. Add a publish note when the workflow can change data or call a mutating service.
4. Resolve every blocker, then publish the draft.

Publishing creates a versioned deployment. It does not silently make another draft live.

### 7. Make the deployment live

Return to the workflow page or Workflows list and choose **Make deployment live**. If another workflow is live for this bot, the action replaces it so the bot still has exactly one live main workflow.

### 8. Verify the live bot

1. Open the bot **Overview** and confirm the expected **Live Deployment**, version/hash, capabilities, writes, confirmation policy, and health summary.
2. Run one real conversation through **Live Preview**, the widget, or your staging frontend.
3. Confirm the execution in **Workflow Runs** and inspect any saved submission or external side effect.
4. Use **Stop live deployment** immediately if the live behavior does not match the tested draft.

## 8. Advanced: Custom Workflow Building

Use these paths after the golden path works:

- **AI Draft** can generate a starting draft from a plain-language description; review and test it like any other draft.
- **Advanced nodes** expose expert workflow behavior without changing the main workflow/deployment model.
- Custom actions, raw HTTP, imports, subworkflows, retries, and detailed schema authoring belong in [Agentic Workflows](AGENTIC_WORKFLOWS.md), [Smart Workflow Builder](SMART_WORKFLOW_BUILDER.md), and [Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md).

Advanced authoring still uses the same bot approvals, Review checks, Publish Review, versioned deployment, and single-live-workflow rule.

## 9. Embed Widget

For a page served by the same Laravel app, use the package component:

1. Open `Bots` in Filament.
2. Confirm that the bot is active and has one verified live workflow deployment, then run the `Use as public widget` row action.
3. Add the component to your Blade layout or page.

```blade
<x-filament-agentic-chatbot::chat-widget />
```

Every candidate must be active and backed by a hash-verified live workflow deployment. The component resolves the uniquely marked public-widget bot, then falls back to `AGENTIC_CHATBOT_WIDGET_BOT_PUBLIC_ID`, then the first runnable bot. An explicit, configured, marked, or fallback bot that is not runnable is rejected rather than activated or exposed implicitly.

For external websites or pages where you want a fixed bot, use the `Embed Snippet` action on the bot edit page.

Example:

```html
<script
    src="https://your-app.com/filament-agentic-chatbot/widget"
    data-bot="YOUR_BOT_PUBLIC_ID"
    defer
></script>
```

The script path is controlled by `widget.script_route`; update deployed snippets when you change it. The package registers that configured path only.

The generated snippet contains no token. The loader verifies the browser origin against the bot's Allowed Domains, obtains short-lived access from the bootstrap endpoint, and renews it automatically. In production, an empty Allowed Domains list blocks bootstrap even when a permissive compatibility flag is present.

After the first real conversations land, open the bot `Analytics` page to review feedback, citation coverage, and potential knowledge gaps.

## 10. Advanced: Server API And Channels

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
4. pgvector installs show `ext-pdo_pgsql` enabled and `CREATE EXTENSION vector` available, or ChromaDB health is green.
5. Any source used by the workflow ingests to `completed`.
6. The main workflow draft tests cleanly, publishes, and is made live.
7. The widget answers a test prompt through that live workflow.
8. The execution appears in `Workflow Runs`, and any `store_submission` output appears in `Submissions`.

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

## 12. Advanced: VPS Demo Deployment

If you maintain a separate public demo app on VPS, keep that deployment flow outside the buyer quick-start path. The package itself does not require a dedicated demo environment to install, migrate, or launch successfully.
