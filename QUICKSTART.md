# Quick Start

Create an anonymous FAQ Agent first, then add authenticated customer data in a separate recipe. Published `v1.0.0` on `2026-10-19` at `17:40:33 UTC`. The verified [GitHub v1.0.0 Release](https://github.com/heinergiehl/filament-agentic-chatbot/releases/tag/v1.0.0) is the publication authority; approval metadata alone does not establish publication. See the [published source and archive identity](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v1.0.0.md#published-artifact). Check [Compatibility](COMPATIBILITY.md) against your download. Existing installations must follow [Upgrading to 1.0](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#upgrading-to-10) before migrations.

Prepare the framework, database, provider account, worker, scheduler and shared
cache before starting the FAQ recipe. Provisioning is separate from Agent setup.
No measured setup-time result is claimed for this release; record your own
elapsed time and blockers rather than treating the recipe as a timing guarantee.

## Fast path: a first FAQ answer on your website

1. `composer require heiner/filament-agentic-chatbot`, then
   `php artisan filament-agentic-chatbot:install`. Answer the four questions
   (provider key, queue connection, first administrator email, panel).
2. Add the lines the installer prints to `.env` yourself: the first
   administrator (`AGENTIC_CHATBOT_ADMIN_EMAILS=...`) and, on a stock Laravel
   queue, the queue visibility (for example `DB_QUEUE_RETRY_AFTER=360`). The
   installer publishes the panel styles and never writes `.env`.
3. Start the worker and the scheduler the installer prints, then run
   `php artisan filament-agentic-chatbot:doctor` until nothing blocks.
4. In the panel open **Agentic Chatbot > Agents**, choose **FAQ from your
   website**, keep the suggested name and press **Create**.
5. The Overview shows the setup guide. In **Knowledge & tools** choose
   **Add knowledge**, add your FAQ text or website, and wait until it is ready.
6. Press **Test** and ask a question your content answers.
7. In **Channels & handoff** allow your website, then **Publish**.
8. Copy the embed code from **Channels & handoff** into a page of that website
   and ask the same question there.

The sections below explain each step and the production settings.

## Try the live demos

Open the [product assistant](https://filament-agentic-chatbot.heinerdevelops.tech/) to ask about the plugin and inspect its [read-only admin](https://filament-agentic-chatbot.heinerdevelops.tech/demo-admin). No Store login is required.

For hands-on editing, open the [Glide Playground](https://filament-agentic-chatbot.heinerdevelops.tech/playground/) and start your private Filament backend. Change the Agent, add knowledge, test the fleet and APIs, edit a Playbook, publish and chat through the widget. Use the [guided exercises and coverage table](PLAYGROUND.md) to try confirmation, handoff, tests and versions.

The former Store account and Alex/Sam sign-in are retired. Authenticated customer data remains a supported integration recipe for your own host below. Public demo sandboxes are temporary and restricted; use fictional information only. See [demo limits](PLAYGROUND.md#limits-and-data) and the [privacy notice](https://filament-agentic-chatbot.heinerdevelops.tech/privacy).

## 1. Prepare your Laravel and Filament app

You need Composer 2.2+, PHP 8.3+ with the extensions required by Composer (including ZIP), Laravel 12.61.1+ or 13.12.0+, and Filament 5.10.2+ within 5.x. Install Filament in the host app before registering this plugin. Package storage uses the application's default database: MySQL 8.4+, MariaDB 11.4+, PostgreSQL 15+ or SQLite 3.39+.

Use your own AI provider account and keys. Provider charges and infrastructure are separate from the plugin license. Model/tool support depends on the selected provider and model; no live provider acceptance is implied by this guide.

For a brand-new app, create Laravel and install Filament first:

```bash
composer create-project laravel/laravel my-app "^13.0"
cd my-app
composer require filament/filament "^5.10.2"
php artisan filament:install --panels --no-interaction
```

If `app/Providers/Filament/AdminPanelProvider.php` was not created, run `php artisan make:filament-panel admin`. Existing Filament apps can proceed directly to step 2.

## 2. Install a fresh application

After purchase, copy your private Composer repository URL and credentials from Anystack. Replace the placeholder below. Never commit credentials or Composer `auth.json`.

```bash
composer config repositories.filament-agentic-chatbot composer https://YOUR-ANYSTACK-PRODUCT.composer.sh
composer require heiner/filament-agentic-chatbot:^1.0
```

The `^1.0` command selects the published 1.0 line through your purchased channel. Authenticate with the buyer email and license key shown by Anystack. If activation is enabled, use its displayed `<license-key>:<fingerprint>` password. See [Troubleshooting](TROUBLESHOOTING.md) for authentication and first-run errors. Follow [Anystack's Composer instructions](https://anystack.sh/docs/integrations/php) for authentication.

Register the plugin in your existing panel provider's `plugins()` list, retaining other plugins:

```php
use Filament\Panel;
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

public function panel(Panel $panel): Panel
{
    return $panel->plugins([
        FilamentAgenticChatbotPlugin::make(),
        // Keep your other plugins here.
    ]);
}
```

### Grant access

Panel login alone grants no plugin administration. Grant access deliberately in the panel provider. For a host with an `is_owner` boolean on its `App\Models\User`, this grants all plugin abilities only to owners:

```php
use App\Models\User;
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

FilamentAgenticChatbotPlugin::make()
    ->authorizeUsing(fn (User $user, string $ability): bool => $user->is_owner === true),
```

To get started without editing PHP, list your own panel login email in `.env` instead; it receives every ability in the default `abilities` mode:

```dotenv
AGENTIC_CHATBOT_ADMIN_EMAILS=you@example.com
```

Adapt that host-specific condition to your permission system. The five abilities are `filament-agentic-chatbot.view`, `.operate`, `.configure`, `.publish` and `.admin`. Admin includes the other four. Record-scoped grants also need scoped lists; see [administration abilities](SECURITY_AND_PRIVACY.md#administration-abilities). Upgraded installations retain their existing strict Gates until deliberately switched.

## 3. Configure keys and background services

Before running the installer, choose a persistent Laravel database or Redis queue and a cache shared by web, scheduler and worker processes. Do not use the `sync` queue or `array` cache for streaming widget chat. For Redis, provision the queue infrastructure; the installer does not run it for you.

```bash
php artisan filament-agentic-chatbot:install
```

The installer asks for your AI provider/key, queue connection, the email of your first administrator and, if needed, permission to register the panel plugin. It stores the provider key encrypted, publishes configuration, runs migrations, publishes the panel assets (`filament:assets`), creates missing queue tables, checks the chat queue `retry_after` and prints the exact `.env` line when it is too short, initializes the signing key and runs Doctor. It does not grant administrator access: for the email you enter it prints the `.env` line to add yourself. In a production environment, review pending migrations before using the installer's `--force-migrations` option to authorize them. A non-interactive run edits no host PHP and stores no provider key; use Settings afterward.

Start and supervise the worker. With the default chat and ingestion queues:

```bash
php artisan queue:work --queue=agentic-chat,default --timeout=150 --tries=1
```

Set the queue connection's `retry_after` above the worker timeout; 360 seconds covers the defaults. With Laravel's default database queue configuration, set `DB_QUEUE_RETRY_AFTER=360` in `.env` before starting the worker. `api.chat_queue.queue` defaults to `agentic-chat`; ingestion uses the host default unless `ingestion.queue` is set. If your host default queue or these settings differ, serve those queue names too.

Run the scheduler every minute, with your application's absolute path:

```cron
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

The scheduler and worker record heartbeats used by Setup. Source re-sync and other maintenance need the scheduler. Web, scheduler and workers must use the same shared cache. Each open streaming chat occupies a PHP worker; size your web workers for concurrent chats. On a single-process development server, set `AGENTIC_CHATBOT_CHAT_STREAM_RELAY_SECONDS=0` to use polling.

An administrator configures provider keys and the default chat/embedding profile on **Settings**. Fresh installs need no custom database or vector service settings; the package connection must not use a table prefix (the installer refuses one). Keep the default database vector backend within its per-Agent limits: warning at 800 text sections and refusal at 3,000 with 1,536 dimensions (limits scale down at larger dimensions). For larger collections see [Ingestion and retrieval](INGESTION_AND_RETRIEVAL.md).

### Provider environment keys

The installer and **Settings** store keys encrypted. For deployments managed through `.env`, these are the provider keys read by the runtime catalog and Laravel AI's `config/ai.php`. Agent-specific credentials take precedence over Settings, then environment configuration. Choose a model that supports the required chat or embedding functions; this table does not certify a live provider account.

| Provider | Environment key / endpoint | Use |
| --- | --- | --- |
| Google Gemini | `GEMINI_API_KEY` | Chat and embeddings |
| OpenAI | `OPENAI_API_KEY` | Chat and embeddings |
| Anthropic | `ANTHROPIC_API_KEY` | Chat |
| xAI | `XAI_API_KEY` | Chat |
| OpenRouter | `OPENROUTER_API_KEY` | Chat and embeddings |
| DeepSeek | `DEEPSEEK_API_KEY` | Chat |
| Groq | `GROQ_API_KEY` | Chat |
| Mistral | `MISTRAL_API_KEY` | Chat and embeddings |
| Azure OpenAI | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_URL`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | Chat and embeddings; configure the endpoint and deployments |
| Ollama | `OLLAMA_URL`, optional `OLLAMA_API_KEY` | Chat and embeddings; default URL `http://localhost:11434` |
| Cohere | `COHERE_API_KEY` | Embeddings |
| Jina AI | `JINA_API_KEY` | Embeddings |
| Voyage AI | `VOYAGEAI_API_KEY` | Embeddings |
| OpenAI-compatible | `AGENTIC_CHATBOT_OPENAI_COMPATIBLE_API_KEY`, `AGENTIC_CHATBOT_OPENAI_COMPATIBLE_BASE_URL`, `AGENTIC_CHATBOT_OPENAI_COMPATIBLE_DRIVER` | Custom chat endpoint; see [OpenAI-compatible providers](OPENAI_COMPATIBLE_PROVIDERS.md) |

Provider names, defaults and the custom endpoint options are configured in `config/filament-agentic-chatbot.php`; standard provider credentials and URLs are configured by Laravel AI. Keep keys out of browser code and source control. After changing cached environment configuration, rebuild the host's config cache and restart its supervised workers.

![Health page showing missing provider and worker prerequisites](images/agentic-chatbot/w10-2-setup.png)

Check required setup before serving visitors.

## 4. Short path: anonymous FAQ

1. Open **Agentic Chatbot > Agents**, choose the **Customer support with handoff** template (it answers from your content) and check the configured provider/model.
2. Add a text Source containing a short shipping FAQ. Wait for ingestion to complete. Attach only that Source, then press **Save draft**; leave customer data Tools unassigned.
3. **Test** a delivery question and inspect the answer and citation. Test unfamiliar wording and an unanswered question too.
4. Configure Handoff recipients who may operate this Agent's Inbox. Check business hours and the outside-hours message if you offer escalation.
5. **Publish**. The first Publish can make the Agent Live; keep it Paused if the website is not ready. Later publications and **Restore** preserve Live/Paused availability.
6. Follow the production website checks below, then copy the generated embed and verify one anonymous conversation.

No Workflow or host identity endpoint is needed for this public FAQ path. Answer quality depends on your content and model. Test uses the saved Draft and simulates writes; it is not proof of a production write. **Appearance preview** shows sample messages only.

If ingestion or retrieval fails, inspect the Source status, Health and Doctor
before publishing. A plausible answer without the expected Source citation does
not establish that retrieval worked. Keep customer Tools unassigned while
resolving the FAQ path; weakening identity or row scopes cannot fix retrieval.

![Current Agent Knowledge editor combined with retained FAQ Test conversation 4](images/agentic-chatbot/w10-2-faq-draft.png)

The answer is retained historical Test evidence, not a new Test of the current
Draft. Test your saved FAQ Draft before publishing.

## 5. Publish the website safely

Before production access, use the **Allowed hosts** field in the **Allowed websites** section of **Channels & handoff** to allow the intended website, configure a dedicated signing key and set `AGENTIC_CHATBOT_WIDGET_SIGNING_TTL_MINUTES=10` for the widget access token lifetime. Set `AGENTIC_CHATBOT_WIDGET_CONTEXT_TTL_MINUTES=10` separately for the signed customer context lifetime. The installer can initialize the key; never expose it in browser code. An empty **Allowed hosts** list blocks public widget access.

When the Agent allows several languages and has no custom visitor texts, the widget follows the browser language among those languages. Otherwise it keeps the configured widget language.

Copy the generated URL and Agent ID. The generated snippet contains no token:

```html
<script
    src="https://your-app.example/filament-agentic-chatbot/widget"
    data-bot="YOUR_BOT_PUBLIC_ID"
    data-area="public"
    data-size-preset="comfortable"
    data-font-preset="modern-sans"
    data-show-sources="true"
    defer
></script>
```

Production uses tokenless bootstrap at `POST /api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap` and short-lived tokens. Configure HTTPS, CSP and the shared cache as described in [Chat Widget](CHAT_WIDGET.md).

## 6. Separate recipe: signed-in order support

Customer data (signed-in visitors, App data tools, record scopes and the host
identity endpoint) is a separate recipe in the
[Customer Data Guide](CUSTOMER_DATA_GUIDE.md). Add it only after the FAQ path works.

## 7. Golden Path: Agent To Live Deployment

### 1. Create the Agent

Create an Agent in **Agentic Chatbot > Agents**. Configure the provider/model and the job it should do.

### 2. Connect only what the Agent needs

Attach [Knowledge Sources](KNOWLEDGE_SOURCES.md). Add reviewed [App data tools](DATA_RESOURCES.md) or an [API connection](API_CONNECTORS.md) only when needed. The authenticated recipe above is a prerequisite for personal data.

### 3. Add an optional Workflow

Add a Workflow only for a bounded multi-step process. A canvas is not required. Ordinary FAQ chat works without one.

### 4. Test and publish

**Test** the saved Draft, then **Publish**. The Agent answers through one hash-verified live deployment. **Restore** selects an earlier Version; later publication and restore preserve Live/Paused availability.

### 5. Verify the live Agent

Check an answer, an unanswered question and Handoff on the actual website. Check scoped reads and confirmed changes only if you configured those Tools. Review conversation and execution evidence in Filament.

## 8. Advanced: Workflow Building

Use a step list or canvas when input collection, branching, team approval or a defined sequence is needed. Test and publish the Workflow, assign it to the Agent Draft, then publish the Agent. Follow [Workflow Builder](PLAYBOOK_BUILDER.md) for supported Steps and limits.

## Final setup check

Run `php artisan filament-agentic-chatbot:doctor` after configuring keys, workers, scheduler and website access. Resolve required failures on Setup, verify queue heartbeats, then run your staging conversations. Setup time depends on the prepared host and configuration; no fixed setup time is promised.

[Operations](OPERATIONS.md) covers supervision and recovery. [Support](SUPPORT_POLICY.md) and [license/refunds](REFUND_AND_LICENSE.md) explain purchase coverage.
