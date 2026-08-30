# Quick Start

This guide is optimized for first-time setup and clean-room testing of the current Commercial Early Access release line.

> Commercial Early Access note: the `0.x` line is intentionally sold before `1.0`. The install, widget, Agent runtime, Playbook, analytics, privacy, and server API foundations are already in place, but you should still expect occasional bugs and validate every rollout in staging. Early-access feedback is highly appreciated.

## Read This First If You Are New

If you are still learning the product model, start with:

- [Core Concepts](CORE_CONCEPTS.md)
- [Agents](BOTS.md)
- [Knowledge Sources](KNOWLEDGE_SOURCES.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Chat Widget](CHAT_WIDGET.md)

## 1. What You Are Installing

Filament Agentic Chatbot adds a managed grounded-assistant layer to a Laravel + Filament app:

- Filament resources for Agents, sources, optional Playbooks, and conversations
- Retrieval and provider controls per Agent
- Text, file, URL, and API knowledge sources for the retrieval pipeline
- An embeddable widget for your app or external frontend
- A responsive Playbook Builder for bounded steps, capabilities, runs, and immutable releases
- A guided Integration Studio for importing OpenAPI, Postman, or cURL as inactive API Connector drafts
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

### Anystack Buyer Access

Anystack displays the exact private Composer repository URL and license credentials after purchase. Run the repository command inside the target Laravel app before requiring the package:

```bash
composer config repositories.filament-agentic-chatbot composer https://YOUR-ANYSTACK-PRODUCT.composer.sh
```

Replace the placeholder with the URL shown by Anystack. Composer then prompts for the buyer email and license key during `composer require`. If the license policy uses activation fingerprints, enter the password in the exact `<license-key>:<fingerprint>` form shown by Anystack. Never commit the license key, Composer `auth.json`, or a credential-bearing repository URL. See the [official Anystack PHP Composer instructions](https://anystack.sh/docs/integrations/php).

### Path A: Existing Filament App

Install package:

```bash
composer require heiner/filament-agentic-chatbot
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
composer config repositories.filament-agentic-chatbot composer https://YOUR-ANYSTACK-PRODUCT.composer.sh
composer require heiner/filament-agentic-chatbot
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
AGENTIC_CHATBOT_CHAT_MODEL=gemini-3.7-flash
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
AGENTIC_CHATBOT_WIDGET_CONTEXT_ENABLED=true
AGENTIC_CHATBOT_WIDGET_CONTEXT_TTL_MINUTES=10
GEMINI_API_KEY=
```

The package's release-verified Gemini profiles are 3.7 Flash, 3.6 Flash, 3.5 Flash Lite, and 2.5 Flash Lite. Gemini 2.5 Flash Lite remains the lowest-cost verified option for bounded structured-output work. Unknown or retired models do not silently inherit current tool or structured-output capabilities.

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

## 5. Finish Installation + Start Queue Worker

```bash
php artisan filament-agentic-chatbot:install
php artisan queue:work
```

The install command idempotently publishes the config, runs pending migrations, checks panel registration, and runs the setup doctor. If provider credentials will be added later, use `--skip-doctor` once and rerun the doctor after configuring them.

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

## 6. Re-run Setup Validation Anytime

```bash
php artisan filament-agentic-chatbot:doctor
```

Treat `FAIL` as blocking.

## 7. Golden Path: Agent To Live Deployment

Use this path for the first production Agent. It keeps one clear authority: one
immutable Agent deployment with only its published knowledge and optional
Playbooks.

### 1. Create the Agent

1. Open **Agentic Chatbot > Build > Agents** and create an Agent.
2. Define its role, instructions, provider, model, access, and widget basics.
3. Choose the narrowest capability mode that covers its job, then save.

The Agent can already handle ordinary conversation. A canvas is not required.

### 2. Connect only what the Agent needs

- Add and ingest [Knowledge Sources](KNOWLEDGE_SOURCES.md) for grounded answers.
- Approve read-only [Data Resources](DATA_RESOURCES.md) for live application
  records and select them on the Agent under **Behavior**. A Playbook is not
  required for a direct read.
- Publish exact read [API Connector](API_CONNECTORS.md) operations and select
  their immutable revisions on the Agent. Use a Playbook Capability step only
  when the operation belongs to a controlled process.
- To start from an API description, open **Connect > API Connectors**, choose
  **Import integration**, and follow [Integration Studio](INTEGRATION_STUDIO.md).
  Its optional AI step reuses an existing centrally configured provider key;
  the imported service credential remains a separate encrypted Connector value.
- Keep writes behind Approval and the required confirmation and idempotency
  policy.

### 3. Add an optional Playbook

Create a Playbook only for a bounded multi-step process. Start with **AI Draft**
or add one of the twelve Playbook steps manually. Validate and publish the
Playbook, then explicitly assign it to the Agent. A draft or legacy live
workflow pointer grants no authority.

### 4. Publish, test, and activate a release candidate

Save the Agent and choose **Publish candidate**. Publication snapshots the Agent
behavior, model policy, knowledge, capability mode, budgets, explicitly assigned
guardrail policies, and exact Playbook deployments into one hash-verified contract without changing live
traffic. Run **Test release candidate** with a representative request. The test
uses the real persistent chat/runtime path and real reads, but the capability
gateway blocks productive writes. Only after that exact deployment hash and
saved Agent fingerprint have passing durable evidence can **Make candidate
live** atomically replace the previous live deployment. Later edits require a
new candidate and test.

### 5. Verify the live Agent

1. Confirm the active Agent deployment hash and attached capabilities.
2. Run normal, unexpected, and ambiguous wording through **Test live Agent**.
3. Check a grounded knowledge answer when sources are attached.
4. If a Playbook is assigned, test its branch, input waitpoint, approval, and
   result path.
5. Confirm usage and any Playbook execution or write evidence in Observe.

**Appearance preview** displays sample messages only; it neither calls the Agent
nor supplies release-test evidence. Add the exact production hosts to **Allowed
Domains** before embedding: an empty list blocks public widget access.

Knowledge status distinguishes the live deployment's verified pinned generation
from the latest indexing attempt. A failed replacement index does not remove
still-valid live knowledge. New indexed content becomes live only after a new
Agent candidate is published, tested, and activated.

## 8. Advanced: Playbook Building

Use [Agents and Playbooks](AGENTIC_WORKFLOWS.md),
[Playbook Builder](PLAYBOOK_BUILDER.md), and
[Playbook JSON Schema](WORKFLOW_JSON_SCHEMA.md) after the simple Agent path
works. Raw HTTP, saved API operations, transforms, bounded iteration, and
Sub-Playbooks remain advanced process features.

## 9. Embed Widget

For a page served by the same Laravel app, use the package component:

1. Open **Agentic Chatbot > Build > Agents** in Filament.
2. Confirm that the Agent is active and has one verified live Agent deployment, then run the `Use as public widget` row action.
3. Add the component to your Blade layout or page.

```blade
<x-filament-agentic-chatbot::chat-widget />
```

Every candidate must be active and backed by a hash-verified Agent deployment. The component resolves the uniquely marked public-widget Agent, then falls back to `AGENTIC_CHATBOT_WIDGET_BOT_PUBLIC_ID`, then the first runnable Agent. An explicit, configured, marked, or fallback Agent that is not runnable is rejected rather than activated or exposed implicitly.

For external websites or pages where you want a fixed Agent, use the `Embed Snippet` action on the Agent edit page.

Example:

```html
<script
    src="https://your-app.com/filament-agentic-chatbot/widget"
    data-bot="YOUR_BOT_PUBLIC_ID"
    defer
></script>
```

The script path is controlled by `widget.script_route`; update deployed snippets when you change it. The package registers that configured path only.

The generated snippet contains no token. The loader verifies the browser origin against the Agent's Allowed Domains, obtains short-lived access from the bootstrap endpoint, and renews it automatically. In production, an empty Allowed Domains list blocks bootstrap even when a permissive compatibility flag is present.

After the first real conversations land, open the Agent's **Analytics** page to review feedback and citation coverage. The **Knowledge** tab contains only high-confidence cases where a completed production turn durably recorded a Knowledge search, returned no source evidence, and used the safe capability fallback. It does not classify every uncited answer as a gap.

For each verified gap: review the original conversation, start work, create its Published Agent regression, update and ingest the relevant Knowledge Source, run the linked test against the current deployment, and then choose **Verify resolved**. The final action fails closed until the selected source has an active generation and the exact linked regression is currently passing.

## 10. Advanced: Server API And Channels

For server API clients or channel connections, create one Agent Access Token per integration in Filament and set the matching channel label for isolated reporting, rate limits, and budgets. Telegram is available by default; Slack and Mailtrap Email are real-provider-tested opt-ins. WhatsApp Cloud API and Mailgun Email are built in but intentionally unavailable by default until their separate real-provider acceptance is complete. Server clients call the JSON complete endpoint:

```http
POST /api/filament-agentic-chatbot/chat/{botPublicId}/complete
Authorization: Bearer fac_generated_token
```

The package-owned channel drivers use the same Agent runtime and the Agent's existing AI provider credential; do not create another AI key for each channel. Open **Connect > Channels**, choose an enabled provider, complete its guided credentials, save, copy the generated webhook URL, run **Diagnostics**, and perform one real inbound/outbound staging test. See [Channel Integrations](CHANNELS.md) for release status, provider setup, webhook verification, private inbound attachments, delivery statuses, and queue requirements. See [API Integrations](API_INTEGRATIONS.md) for the server request/response contract and common error codes.

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
5. Any source used by the Agent ingests to `completed`.
6. The Agent publishes one immutable candidate without changing live traffic.
7. **Test release candidate** records passing durable evidence for the exact deployment hash and saved Agent fingerprint before **Make candidate live** activates it.
8. The widget answers ordinary and unexpected wording through that verified live Agent deployment.
9. Optional Playbook execution appears in `Playbook Runs`, and any approved `store_submission` output appears in `Submissions`.

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
- `This domain is not allowed`: missing Agent `allowed_domains`, or host mismatch. Use host entries (`app.example.com`, `*.example.com`). `localhost:8000` and full URLs are accepted and normalized to host.
- `Please sign in to access this chat area`: area is non-public and current user/guard is not authorized, or session auth context is disabled. Keep `AGENTIC_CHATBOT_API_INCLUDE_SESSION_AUTH_CONTEXT=true` for `member/admin` areas.
- `Failed to clone the git@github.com:...` during `composer require`: GitHub VCS fallback hit SSH. For private repos, add a GitHub token (`composer config --global --auth github-oauth.github.com ...`) or pass `-GitHubToken` in the smoke script.
- `Authentication required (...composer.sh)`: use the buyer email and Anystack license key shown after purchase. When activation is enabled, include the displayed fingerprint after the license key, separated by a colon.
- `composer-runtime-api ^2.2` during `composer create-project` or `composer require`: your Composer is too old for Laravel 12. Update to Composer 2.2+ and rerun the install.
- `Filament panel provider not found`: `filament:install --panels` did not generate the admin panel provider on this host. Run `php artisan make:filament-panel admin` and continue.
- `Could not reach chroma ... /api/v2/heartbeat`: start Chroma and verify `AGENTIC_CHATBOT_CHROMA_URL`.
- `The route api/v2/heartbeat could not be found`: `AGENTIC_CHATBOT_CHROMA_URL` points to Laravel/app HTTP, not Chroma.
- `vector_backend_not_implemented`: the configured backend is not supported. Use `pgvector` (recommended) or `chroma`.
- `column cannot have more than 2000 dimensions for ivfflat index`: high-dimensional embedding + ANN index limit. Installation now skips ANN index in this case; retrieval still works.

## 12. Advanced: VPS Demo Deployment

If you maintain a separate public demo app on VPS, keep that deployment flow outside the buyer quick-start path. The package itself does not require a dedicated demo environment to install, migrate, or launch successfully.
