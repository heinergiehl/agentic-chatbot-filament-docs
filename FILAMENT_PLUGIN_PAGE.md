# Agentic Chatbot

Build, manage, and embed production-ready **AI assistants** directly in your Filament panel — from a simple grounded Q&A bot to guided agentic workflows with branching logic, AI nodes, backend actions, external API calls, and package-owned Telegram/Slack channels.

## Live Demo

Try every feature before you buy:

**[filament-agentic-chatbot.heinerdevelops.tech](https://filament-agentic-chatbot.heinerdevelops.tech/)**

Click **Enter Demo** on the login page. Pre-configured bots, ingested documentation sources, sample workflows, and a live chat widget are all ready.

## Screenshots

### Bot management

Manage multiple assistants from a Filament-native control plane. Each bot has its own model, prompt, retrieval settings, and analytics.

![Bot list](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/01-bot-list.png)

### Bot customization

Tune widget style, copy, quick prompts, area overrides, and live preview without leaving the bot editor.

![Bot widget customization](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/02-bot-edit.png)

### Knowledge sources

Add URL, file, raw-text, or API-fed JSON sources. Track ingestion status and refresh stale sources directly from the panel.

![Source ingestion table](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/03-source-ingestion-table.png)

### Conversation history

Inspect conversation transcripts without leaving Filament. Review what users asked, what was retrieved, and which citations backed each answer.

![Conversation transcript](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/04-conversation-transcript.png)

### Chat widget

Show the live embedded chat experience up close, including the branded header, structured replies, and quick prompts.

![Widget close-up conversation snapshot](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/05-widget-desktop.png)

### Visual workflow builder

Use the plugin feedback collector as a concrete example: the node library stays on the left, the canvas sits in the middle, and inline settings remain visible on the right while you build.

![Workflow list](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/07-workflow-list.png)

![Workflow editor with node library and settings panel](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/08-workflow-editor-canvas.png)

### AI-assisted drafting

Describe the flow you need in natural language, generate a draft workflow, then refine and publish.

![AI Draft tab](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/09-workflow-generate-tab.png)

### Run history and live tracing

Inspect every execution with completed-path highlighting, step traces, variables, halt reasons, and timestamps.

![Workflow runs tab — completed run selected](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/10-workflow-runs-tab.png)

![Workflow run trace — executed branch highlighted on canvas](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/10b-workflow-run-trace.png)

### Versions and releases

Publish versioned releases with notes and roll back to any prior version in seconds.

![Workflow releases tab](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/11-workflow-releases-tab.png)

### API connectors

Define reusable external API connection profiles and reference them across workflow nodes or API-fed knowledge sources.

![API connectors list](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/12-api-connectors-list.png)

---

## Features

### Source-grounded knowledge

- **Multi-bot management** — unlimited bots, each with its own identity, model, prompt, retrieval config, and access controls
- **Source types** — URL page, PDF / file upload, plain-text snippet, API-fed JSON records
- **Queue-based ingestion** — async chunking, embedding, and upsert with per-source status tracking
- **API knowledge sources** — sync records from authenticated `GET` JSON endpoints through reusable API Connectors
- **Vector backends** — PostgreSQL + `pgvector` (recommended) or ChromaDB; configurable dimensions
- **Provider support** — Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, and Azure OpenAI for chat; Gemini, OpenAI, OpenRouter, Mistral, Ollama, Azure OpenAI, Cohere, Jina AI, and Voyage AI for embeddings
- **Streaming chat** with optional grounded retrieval, inline source citations, and citation coverage metrics
- **Conversation history** — full transcripts with per-message retrieval context and citation links
- **Per-bot analytics** — conversation count, message volume, source health score, citation coverage chart

### Visual agentic workflows

- **Broad node catalog**: Trigger, Send Message, Collect Input, AI Agent, Knowledge Base, Answer, Switch/Router, Condition, Action, HTTP Request, API Connector, Memory Read/Write, Delay, Loop, Sub-Workflow, and more
- **Multi-branch canvas** powered by Vue Flow — drag, connect, and organize nodes freely
- **AI Agent node** — configurable Provider, Model, and System Prompt per node within the same workflow
- **Knowledge Base node** — inline source retrieval mid-flow, configurable result count
- **Switch/Router node** — N branches + default; route by intent, field value, or AI classification
- **HTTP Request node** — call external APIs with variable interpolation in body and headers
- **Scoped workflow memory** — keep normal chat state in the conversation scope and one-run scratch state in workflow-run scope
- **Variable interpolation** — `{{variable_name}}` syntax in system prompts, messages, and node configs
- **AI Draft** — generate a complete workflow graph from a natural-language description in seconds
- **Run history** with step-level traces, current node, variable snapshot, halt reason, and timestamps
- **Versioned releases** with release notes; rollback to any prior version without re-editing
- **Import / Export** — share workflows as JSON between environments

### API connectors

- **Reusable connection profiles** — URL, auth method (Bearer, API Key, Basic Auth, Custom Header), default headers, SSL, and timeout
- **Referenced by name** in workflow API nodes and API knowledge sources; update credentials in one place

### Chat widget

- **Blade component** for Laravel views — authenticated or guest access
- **JavaScript loader** — single `<script>` tag embed for any external site (no npm required)
- **NPM package** for React, Vue, or any bundled frontend
- **Signed widget tokens** for access-controlled deployments (`RAG_WIDGET_SIGNING_ENABLED`)
- **Mobile-polished** — responsive layout, keyboard-safe positioning, iOS safe-area support
- **Customizable** — colors, placeholder text, greeting, launcher position, and z-index

### Channel integrations

- **Telegram and Slack drivers** — provider webhooks run through the same bot, workflow, conversation, usage, and budget runtime as the widget
- **Channel admin resource** — manage credentials, webhook URLs, linked Bot Access Tokens, diagnostics, test sends, and Telegram setup actions from Filament
- **Text-first rich rendering** — buttons, cards, sources, and images degrade cleanly to channel-safe text, with optional native Telegram buttons and Slack Block Kit
- **Production delivery safeguards** — webhook verification, inbound event deduplication, retry-aware outbound delivery, long-message splitting, raw payload redaction, and queue-based processing

### Production tooling

- **`php artisan filament-agentic-chatbot:doctor`** — pre-flight checks for config, DB, vector store, queue worker, and AI provider
- **Data retention policy** — scheduled pruning of old conversations with configurable age thresholds
- **GDPR / privacy endpoints** — export and delete conversation data per user on demand
- **Queue isolation** — ingestion jobs run on a configurable queue separate from your default queue
- **Scheduled API source sync** — periodically re-ingest API-backed knowledge sources with safety limits

---

## Requirements

- PHP `8.3+`
- Laravel `12 or 13`
- Filament `5.2+`
- PostgreSQL with `pgvector` extension (recommended) **or** a running ChromaDB instance
- AI provider API key such as `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`, `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY`, or `AZURE_OPENAI_API_KEY`
- A Laravel queue worker

---

## Installation

```bash
composer require heiner/filament-agentic-chatbot
php artisan vendor:publish --tag=filament-agentic-chatbot-config
php artisan migrate
php artisan queue:work
```

For the current public release line, install `v0.12.0` or newer:

```bash
composer require heiner/filament-agentic-chatbot:^0.12.0
```

If you are testing the post-`v0.12.0` AgentGraph SDK refactor branch before the SDK is published to your Composer repository, add the SDK repository to the host app root composer config before requiring the plugin:

```bash
composer config repositories.agent-graph vcs https://github.com/heinergiehl/agent-graph.git
composer config repositories.filament-agentic-chatbot vcs https://github.com/heinergiehl/filament-agentic-chatbot.git
composer require heiner/filament-agentic-chatbot:'*@dev'
```

Register the plugin in your panel provider:

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

Include the plugin views in your custom Filament theme:

```css
/* resources/css/filament/admin/theme.css */
@source '../../../../vendor/heiner/filament-agentic-chatbot/resources';
```

```bash
npm run build && php artisan filament:upgrade
```

---

## Configuration

`.env` reference — all values have sensible defaults, override only what you need:

```env
# Vector backend
RAG_VECTOR_BACKEND=pgvector          # pgvector | chromadb

# Dedicated DB connection for vector data (pgvector only)
RAG_DB_CONNECTION=rag_pgsql
RAG_DB_HOST=127.0.0.1
RAG_DB_PORT=5432
RAG_DB_DATABASE=filament_agentic_chatbot
RAG_DB_USERNAME=postgres
RAG_DB_PASSWORD=secret

# AI provider and models
RAG_CHAT_PROVIDER=gemini             # gemini | openai | anthropic | xai | openrouter | deepseek | groq | mistral | ollama | azure
RAG_CHAT_MODEL=gemini-2.5-flash-lite
RAG_EMBEDDING_PROVIDER=gemini
RAG_EMBEDDING_MODEL=gemini-embedding-001
RAG_VECTOR_DIMENSIONS=1536           # must match embedding model output

# Widget authentication
RAG_WIDGET_SIGNING_ENABLED=true
RAG_WIDGET_SIGNING_KEY=replace-with-a-long-random-secret

# Provider API key
GEMINI_API_KEY=your-key-here
```

Verify your configuration at any time:

```bash
php artisan filament-agentic-chatbot:doctor
```

---

## Usage

### Fastest path to a working bot

1. Create a bot in **Chatbots → Bots**
2. Add knowledge sources in **Knowledge → Sources** using text, file, URL, or API source types
3. Wait for ingestion to complete
4. Test from the bot edit screen using the **Test Widget** button
5. Embed the widget (see below)
6. Add workflows only when you need guided multi-step behavior

### Navigation customization

```php
FilamentAgenticChatbotPlugin::make()
    ->navigationGroup('AI')   // move all resources under a custom nav group
    ->navigationSort(80)      // control position in the sidebar
```

---

## Embedding the Chat Widget

### Option 1 — Blade component (Laravel views)

```blade
<x-filament-agentic-chatbot::widget
    bot-id="{{ $bot->id }}"
    :token="$widgetToken"
/>
```

Generate a signed token (when `RAG_WIDGET_SIGNING_ENABLED=true`):

```php
use Heiner\FilamentAgenticChatbot\Support\WidgetToken;

$token = WidgetToken::for(botId: $bot->id, userId: auth()->id());
```

### Option 2 — Script tag embed (any site)

```html
<script
  src="https://your-app.com/filament-agentic-chatbot/widget"
  data-bot="YOUR_BOT_PUBLIC_ID"
  data-token="YOUR_SIGNED_TOKEN"
  defer
></script>
```

The legacy `/filament-agentic-chatbot/widget.js` script URL remains supported for existing snippets.

### Option 3 — NPM package

```bash
npm install @heiner/filament-agentic-chatbot-widget
```

```jsx
import { ChatWidget } from "@heiner/filament-agentic-chatbot-widget";

<ChatWidget botId="YOUR_BOT_ID" token="YOUR_SIGNED_TOKEN" />;
```

---

## Workflow Node Types

| Node                  | Purpose                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| **Trigger**           | Entry point — fires when a new user message starts the conversation        |
| **Send Message**      | Send a text or formatted card message to the user                          |
| **Collect Input**     | Prompt the user for a value; store the reply in a named variable           |
| **AI Agent**          | Generate a response using a configurable LLM and system prompt             |
| **Knowledge Base**    | Run a vector search; inject top-N results into the AI context              |
| **Switch / Router**   | Route to N branches + default based on variable value or AI classification |
| **Join**              | Merge multiple parallel branches back into a single path                   |
| **Condition**         | Boolean if/else branch based on variable or expression                     |
| **Action**            | Run registered backend actions such as writes, data lookups, or image generation |
| **HTTP Request**      | Call an external API directly from the workflow                            |
| **API Connector**     | Reuse a saved external API profile with credentials and defaults           |
| **Memory Read/Write** | Store and retrieve small scoped workflow facts across turns or a single run |
| **Delay / Loop**      | Pause execution or iterate over a bounded collection                       |

---

## Importable Example Workflows

Fifteen ready-to-import examples covering common agentic patterns:

| Workflow                   | What it demonstrates                                   |
| -------------------------- | ------------------------------------------------------ |
| SaaS Onboarding            | Progressive intake + enterprise lead routing           |
| Support Ticket Router      | AI intent classification → 4-branch switch             |
| E-Commerce Order Status    | External API lookup + status-based responses           |
| Lead Qualification         | Multi-step data collection + CRM write action          |
| Early Access Feedback Triage | Structured feedback intake and submission capture     |
| FAQ with Confidence Check    | Two-stage AI confidence evaluation before answering    |
| Content Research Assistant   | KB search → outline → full draft generation            |
| Memory Labs                  | Conversation-scoped preference and correction memory   |
| Reliability Lab              | Interruptions, guardrails, confirmations, and recall   |

**[Browse workflow examples](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/examples/README.md)**

Import any JSON file via the workflow editor's **Import** button.

---

## Documentation

- [Product overview](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRODUCT_OVERVIEW.md)
- [Quick start guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md)
- [Core concepts](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CORE_CONCEPTS.md)
- [Agent runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md)
- [Agentic workflows — all node types explained](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENTIC_WORKFLOWS.md)
- [Sources and ingestion](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RAG_SOURCES.md)
- [Bots](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/BOTS.md)
- [Database and breaking changes](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DATABASE_AND_BREAKING_CHANGES.md)
- [API connectors](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md)
- [Channel integrations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHANNELS.md)
- [API source roadmap](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_SOURCE_ROADMAP.md)
- [Chat widget embedding](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md)
- [Conversations and messages](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CONVERSATIONS_AND_MESSAGES.md)
- [Workflow JSON schema reference](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/WORKFLOW_JSON_SCHEMA.md)
- [Workflow prompt templates](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/WORKFLOW_PROMPT_TEMPLATES.md)
- [Operations and production readiness](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md)
- [Security and privacy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SECURITY_AND_PRIVACY.md)
- [Data retention policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DATA_RETENTION_POLICY.md)
- [How it differs from Filament RAG](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md)
- [Release notes v0.12.0](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v0.12.0.md)
- [AgentGraph SDK refactor notes](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_AGENTGRAPH_SDK_REFACTOR.md)
- [Known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md)

---

## Support

Open an issue in the [public issue tracker](https://github.com/heinergiehl/filament-agentic-chatbot-issues). Response target: 2 business days.

See the full [Support Policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md).

---

## License

This is a commercial plugin. A license is required for production use. Source code distribution is not permitted.

See the full [Refund and License terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).
