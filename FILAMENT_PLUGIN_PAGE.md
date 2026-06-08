# Agentic Chatbot

A native Filament control plane for grounded AI assistants, embeddable chat widgets, and visual agentic workflows.

Filament Agentic Chatbot helps Laravel teams build assistants inside the admin panel they already use. Start with a source-grounded support bot, then add guided workflows when you need branching intake, lead qualification, API calls, data capture, quality checks, and human handoff.

This is a young commercial product that is being developed actively. The current public docs snapshot is `v0.13.1`; the installable runtime line is `^0.13.0` or newer. Purchases and commercial support directly fund maintenance, documentation, and new product updates.

## Live Demo

Try the public demo before buying:

**[filament-agentic-chatbot.heinerdevelops.tech](https://filament-agentic-chatbot.heinerdevelops.tech/)**

Use **Enter Demo** on the login page. The demo includes configured bots, sources, workflows, API connectors, quality tests, and the public widget.

## What It Is

- A Filament-native admin surface for bots, prompts, model settings, widget styling, sources, conversations, workflows, connectors, and quality checks
- A source-grounded chatbot runtime with citations, conversation history, feedback, and optional workflow execution
- A visual workflow editor for multi-step assistant behavior: ask, branch, search knowledge, call APIs, run backend actions, remember values, and reply
- A public embeddable widget that can be styled from the bot editor and reused across websites or authenticated Laravel areas
- Production-minded tooling for release gates, saved quality tests, handoff queues, usage tracking, provider diagnostics, and privacy workflows

## Product Tour

### Live Widget Preview

Style the embedded widget inside the bot editor and see the result immediately. Teams can tune template, font, accent color, size, copy, starter prompts, source visibility, and context-area overrides without leaving Filament.

![Widget live preview](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/02-bot-edit.png)

### Workflow Editor With Context

The workflow editor keeps the node catalog, canvas, floating toolbar, selected-node settings, minimap, draft status, and release readiness in one workspace. This screenshot uses a compact 15-node fit-advisor workflow so the structure stays readable instead of turning the page into a noisy node wall.

![Workflow editor with sidebar and inspector](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/08-workflow-editor-canvas.png)

### Focus Mode

When the graph needs attention, focus mode removes the surrounding Filament chrome and both side panels. The canvas stays zoomable and the graph remains small enough to understand the flow instead of showing oversized nodes.

![Workflow editor focus mode](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/09-workflow-editor-focus-mode.png)

### Dark Mode

The workflow editor follows Filament theme mode. Dark mode keeps nodes, handles, branches, toolbar controls, and labels readable for longer authoring or debugging sessions.

![Workflow editor dark mode](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/18-workflow-editor-dark-mode.png)

### Workflow Quality Checks

Saved workflow tests sit beside the draft. The Quality panel shows current pass state, release-gate status, expected checks, and publish readiness without sending operators to a separate QA tool.

![Workflow quality panel](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/10-workflow-quality-panel.png)

### Quality Test Creation

Create repeatable tests for a direct bot answer or a workflow draft. Quality tests can check required wording, expected paths, citations, latency, and release-blocking behavior.

![Create quality test](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/13-quality-lab.png)

### Conversation Review

Review full transcripts with citations, message feedback, session metadata, handoff actions, flags, and export controls. This makes the feedback-to-quality loop practical: inspect a real conversation, then turn important failures into saved tests.

![Conversation review](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/04-conversation-transcript.png)

### Public Widget Experience

The same bot configuration can power the Filament panel, public landing pages, product docs, authenticated Laravel areas, and API-backed channels. The widget supports signed tokens, context areas, per-bot styling, starter prompts, citations, and mobile layouts.

![Public widget experience](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/05-widget-desktop.png)

## What Ships

### Bots And Grounded Answers

- Multi-bot management with per-bot identity, model, prompt, retrieval settings, widget settings, access controls, and analytics
- Source types for URLs, files, text snippets, and API-fed JSON records
- PostgreSQL + `pgvector` vector storage by default, with Chroma available for teams that prefer it
- Source-grounded answers with citations, conversation history, feedback controls, and review screens
- Assistant profile controls for persona, tone, boundaries, fallback behavior, and answer style

### Visual Agentic Workflows

- Node catalog for triggers, replies, questions, branches, conditions, AI nodes, knowledge search, API connectors, HTTP requests, actions, memory, loops, delays, sub-workflows, and finish steps
- Canvas authoring with zoom, fit-to-view, minimap, grouping, locking, validation, import/export, focus mode, and light/dark theme support
- Workflow generation from a natural-language brief for teams that want a faster starting point
- Versioned releases with notes and rollback support
- Run tracing and draft debugging for workflow execution paths

### Quality, Operations, And Channels

- Saved quality tests for bots and workflow drafts
- Workflow-linked release gates so important checks can block publishing
- Feedback-to-test review loop for turning user feedback into repeatable checks
- Human handoff inbox for low-confidence, blocked, or operator-required conversations
- Reusable API connectors for external systems and API-backed knowledge sources
- Package-owned Telegram and Slack drivers that run through the same bot, workflow, usage, and budget runtime
- `php artisan filament-agentic-chatbot:doctor` for configuration, provider, vector store, queue, widget signing, and commercial-profile diagnostics

## Best Fit

This plugin is a good fit when you want AI assistants inside a Laravel/Filament product and you care about admin control, grounded answers, workflow logic, reviewability, and operator tooling.

It is especially useful for:

- product support assistants
- onboarding and setup guidance
- documentation assistants with citations
- lead qualification and guided intake
- internal ops assistants
- support triage with handoff
- workflow-driven demos, concierge flows, and feedback capture

## Not The Best Fit

Be cautious if you need a mature no-code enterprise chatbot platform with years of marketplace hardening, non-Laravel hosting, or a fully managed SaaS vendor. This is a Laravel package for teams that want ownership inside their app. It is actively improving, but it is still early enough that careful staging, quality tests, queue monitoring, and normal production review matter.

## Requirements

- PHP `8.3+`
- Laravel `12` or `13`
- Filament `5.2+`
- `laravel/ai` `^0.7 || ^1.0`
- PostgreSQL with `pgvector` recommended, or ChromaDB
- A Laravel queue worker for ingestion, workflow generation, and production background work
- At least one supported AI provider key

Supported chat providers include Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, Azure OpenAI, and OpenAI-compatible gateways. Embedding provider support includes Gemini, OpenAI, OpenRouter, Mistral, Ollama, Azure OpenAI, Cohere, Jina AI, and Voyage AI.

## Installation

```bash
composer require heiner/filament-agentic-chatbot:^0.13.0
php artisan vendor:publish --tag=filament-agentic-chatbot-config
php artisan migrate
php artisan queue:work
```

Composer installs `heiner/agent-graph` transitively for the `0.13` release line.

Register the plugin in your Filament panel provider:

```php
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            FilamentAgenticChatbotPlugin::make(),
        ]);
}
```

Include the package views in your custom Filament theme:

```css
/* resources/css/filament/admin/theme.css */
@source '../../../../vendor/heiner/filament-agentic-chatbot/resources';
```

Then rebuild your assets:

```bash
npm run build
php artisan filament:upgrade
```

## Configuration

New installs should use the `AGENTIC_CHATBOT_*` env namespace. The older `RAG_*` namespace remains as a temporary compatibility fallback for one upgrade window.

```env
# Vector backend
AGENTIC_CHATBOT_VECTOR_BACKEND=pgvector

# Dedicated pgvector connection
AGENTIC_CHATBOT_DB_CONNECTION=agentic_pgsql
AGENTIC_CHATBOT_DB_HOST=127.0.0.1
AGENTIC_CHATBOT_DB_PORT=5432
AGENTIC_CHATBOT_DB_DATABASE=filament_agentic_chatbot
AGENTIC_CHATBOT_DB_USERNAME=postgres
AGENTIC_CHATBOT_DB_PASSWORD=secret

# Providers and models
AGENTIC_CHATBOT_CHAT_PROVIDER=gemini
AGENTIC_CHATBOT_CHAT_MODEL=gemini-2.5-flash-lite
AGENTIC_CHATBOT_EMBEDDING_PROVIDER=gemini
AGENTIC_CHATBOT_EMBEDDING_MODEL=gemini-embedding-001
AGENTIC_CHATBOT_VECTOR_DIMENSIONS=1536

# Widget authentication
AGENTIC_CHATBOT_WIDGET_SIGNING_ENABLED=true
AGENTIC_CHATBOT_WIDGET_SIGNING_KEY=replace-with-a-long-random-secret

# Provider API key
GEMINI_API_KEY=your-key-here
```

Run the doctor command after configuration:

```bash
php artisan filament-agentic-chatbot:doctor
```

## Embedding The Widget

For a public site, add the package script:

```html
<script
    src="https://your-app.com/filament-agentic-chatbot/widget"
    data-bot="YOUR_BOT_PUBLIC_ID"
    data-token="SIGNED_TOKEN"
    data-area="public"
    defer
></script>
```

Generate signed tokens server-side when widget signing is enabled:

```php
use Heiner\FilamentAgenticChatbot\Support\WidgetEmbedToken;

$token = WidgetEmbedToken::make(
    botPublicId: $bot->public_id,
    host: 'docs.example.com',
);
```

React, Vue, and other bundled frontends can also use the NPM helper:

```bash
npm install @heiner/filament-agentic-chatbot-widget
```

## Documentation

- [Product overview](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRODUCT_OVERVIEW.md)
- [Quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md)
- [Core concepts](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CORE_CONCEPTS.md)
- [Agentic workflows](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENTIC_WORKFLOWS.md)
- [Quality loop](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUALITY_LOOP.md)
- [Chat widget](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md)
- [API connectors](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md)
- [Channel integrations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHANNELS.md)
- [Security and privacy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SECURITY_AND_PRIVACY.md)
- [Known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md)
- [Release notes v0.13.0](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v0.13.0.md)
- [Docs snapshot v0.13.1](https://github.com/heinergiehl/agentic-chatbot-filament-docs/releases/tag/v0.13.1)

## Support

Open an issue in the [public issue tracker](https://github.com/heinergiehl/filament-agentic-chatbot-issues). Response target: 2 business days.

See the full [Support Policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md).

## License

This is a commercial plugin. A license is required for production use. Source code distribution is not permitted.

See the full [Refund and License terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).
