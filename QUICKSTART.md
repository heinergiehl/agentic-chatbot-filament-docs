# Quick Start

This guide is optimized for first-time setup and for buyers who want to answer one question quickly: can I get a source-grounded assistant running first, then grow into agentic workflows later?

Yes.

## What You Are Installing

Filament Agentic Chatbot adds a managed AI assistant layer to a Laravel + Filament app:

- Filament resources for bots, sources, workflows, and conversations
- Retrieval and provider controls per bot
- API-fed knowledge sources for JSON endpoints that should become searchable assistant knowledge
- An embeddable widget for your app or external frontend
- A visual workflow engine for routing, lead capture, onboarding, escalation, and automations
- Optional package-owned Telegram and Slack channel integrations
- Operational checks, privacy endpoints, and production-readiness tooling

It helps you ship AI assistants inside your product faster. It does not replace your app-specific billing, tenancy, or domain workflows.

## Prerequisites

- PHP 8.3+
- Laravel 12 or 13
- Filament 5.2+
- PostgreSQL with `pgvector` (recommended) or ChromaDB as an optional backend
- A supported chat provider API key such as `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`, `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY`, or `AZURE_OPENAI_API_KEY`

## 1. Install The Package

For a standard install:

```bash
composer require heiner/filament-agentic-chatbot
php artisan vendor:publish --tag=filament-agentic-chatbot-config
```

For the current public release line, use `^0.12.0` or newer:

```bash
composer require heiner/filament-agentic-chatbot:^0.12.0
```

If you are installing the post-`v0.12.0` AgentGraph SDK refactor branch before all packages are published to your Composer repository, add the SDK repository in the host app as well:

```bash
composer config repositories.agent-graph vcs https://github.com/heinergiehl/agent-graph.git
composer config repositories.filament-agentic-chatbot vcs https://github.com/heinergiehl/filament-agentic-chatbot.git
composer require heiner/filament-agentic-chatbot:'*@dev'
```

## 2. Register The Plugin

Add the plugin in your Filament panel provider:

```php
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

->plugins([
    FilamentAgenticChatbotPlugin::make(),
])
```

## 3. Configure `.env`

Minimum production-friendly baseline:

```env
RAG_VECTOR_BACKEND=pgvector
RAG_DB_CONNECTION=rag_pgsql
RAG_DB_HOST=127.0.0.1
RAG_DB_PORT=5432
RAG_DB_DATABASE=filament_agentic_chatbot
RAG_DB_USERNAME=postgres
RAG_DB_PASSWORD=secret

RAG_CHAT_PROVIDER=gemini
RAG_CHAT_MODEL=gemini-2.5-flash-lite
RAG_EMBEDDING_PROVIDER=gemini
RAG_EMBEDDING_MODEL=gemini-embedding-001
RAG_VECTOR_DIMENSIONS=1536

RAG_WIDGET_SIGNING_ENABLED=true
RAG_WIDGET_SIGNING_KEY=replace-with-a-long-random-secret

GEMINI_API_KEY=your-key-here
```

Optional Chroma profile:

```env
RAG_VECTOR_BACKEND=chroma
RAG_CHROMA_URL=http://127.0.0.1:8001
RAG_CHROMA_TENANT=default_tenant
RAG_CHROMA_DATABASE=default_database
RAG_CHROMA_COLLECTION=filament-agentic-chatbot
```

## 4. Run Migrations And Queue Worker

```bash
php artisan migrate
php artisan queue:work
```

If you are upgrading an existing app to the AgentGraph SDK refactor, read [Database And Breaking Changes](DATABASE_AND_BREAKING_CHANGES.md) before running migrations in production. The refactor adds `agent_graph_*` tables and intentionally cancels open legacy workflow runs that cannot be resumed by the new runtime.

Optional but recommended for deployments:

```bash
php artisan filament:assets
```

If you enable scheduled API knowledge sources, call the sync command from Laravel Scheduler:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('filament-agentic-chatbot:sync-rag-sources')->everyMinute();
```

## 5. Validate Setup

```bash
php artisan filament-agentic-chatbot:doctor
```

Treat `FAIL` as blocking before you move on.

## 6. Create A Source-Grounded Assistant First

If you want the fastest path to value, start with the knowledge layer before adding workflows:

1. Open Filament admin
2. Create a bot
3. Add a source in **Sources** (text, file, URL, or API)
4. Wait until source status is `completed`
5. Use the bot test actions to verify retrieval and answer quality
6. Generate the widget snippet and embed it

At this point you already have a grounded assistant.

For API-fed knowledge, create an API Connector first, then create an API Source from **Sources**. API Sources are best for relatively stable JSON records such as product catalogs, CMS entries, help-center articles, or structured public datasets. Use workflow API Connector nodes for live user-specific data or write actions.

## 7. Add Agentic Workflows When You Need More

Once source grounding is working, add workflows for cases such as:

- lead qualification
- support routing
- onboarding wizards
- confidence-based escalation
- structured intake flows
- API-backed task execution

Start with `AGENTIC_WORKFLOWS.md` and `WORKFLOW_PROMPT_TEMPLATES.md`.

## 8. Embed The Widget

Use the `Embed Snippet` action on the bot page.

Example:

```html
<script
  src="https://your-app.com/filament-agentic-chatbot/widget"
  data-bot="YOUR_BOT_PUBLIC_ID"
  data-token="SIGNED_WIDGET_TOKEN"
  defer
></script>
```

Use `/filament-agentic-chatbot/widget` for new snippets. Existing snippets that use `/filament-agentic-chatbot/widget.js` are still supported for compatibility.

## 9. Optional: Channel Integrations Or Server API

For Telegram or Slack, use the package-owned channel integrations: create a Bot Access Token, create a Channel connection, configure the provider webhook, and run channel diagnostics. See [Channel Integrations](CHANNELS.md).

For mobile apps, scheduled jobs, or custom backend integrations, create a Bot Access Token in Filament and call the JSON complete endpoint:

```http
POST /api/filament-agentic-chatbot/chat/{botPublicId}/complete
Authorization: Bearer fac_generated_token
```

See [API Integrations](API_INTEGRATIONS.md) for the request/response contract and common error codes.

Run the enterprise smoke test after migrations:

```bash
php artisan filament-agentic-chatbot:qa-enterprise-smoke --host=your-app.test
```

## Common First-Run Issues

- `Source pending`: queue worker is not running
- `This domain is not allowed`: missing or mismatched bot allowlist
- `Please sign in to access this chat area`: area is not public and current guard is not authorized
- `Could not reach chroma`: Chroma is not running or `RAG_CHROMA_URL` is wrong
- `vector_backend_not_implemented`: unsupported backend configured; use `pgvector` or `chroma`
- Workflow delays not resuming: queue driver is `sync` instead of a real queue backend

## Recommended Reading After Setup

- `PRODUCT_OVERVIEW.md`
- `HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md`
- `AGENTIC_WORKFLOWS.md`
- `RAG_SOURCES.md`
- `DATABASE_AND_BREAKING_CHANGES.md`
- `API_CONNECTORS.md`
- `API_SOURCE_ROADMAP.md`
- `API_INTEGRATIONS.md`
- `CHANNELS.md`
- `OPENAI_COMPATIBLE_PROVIDERS.md`
- `OPERATIONS.md`
