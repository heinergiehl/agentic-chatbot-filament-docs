# Agentic Chatbot

Build, manage, and embed production-ready **AI assistants** directly in your Filament panel — from a simple grounded Q&A bot to fully guided agentic workflows with branching logic, AI nodes, backend actions, and external API calls.

## Live Demo

Try every feature before you buy:

**[filament-agentic-chatbot.heinerdevelops.tech](https://filament-agentic-chatbot.heinerdevelops.tech/)**

Click **Enter Demo** on the login page. Pre-configured bots, ingested documentation sources, sample workflows, and a live chat widget are all ready.

## Screenshots

### Bot management

Manage multiple assistants from a Filament-native control plane. Each bot has its own model, prompt, retrieval settings, and analytics.

![Bot list](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/01-bot-list.png)

![Bot edit](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/02-bot-edit.png)

### Knowledge sources

Add URL, file, sitemap, or raw-text sources. Track ingestion status and refresh stale sources directly from the panel.

![Source ingestion table](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/03-source-ingestion-table.png)

### Conversation history

Inspect conversation transcripts without leaving Filament. Review what users asked, what was retrieved, and which citations backed each answer.

![Conversation transcript](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/04-conversation-transcript.png)

### Chat widget

The embeddable widget ships as a polished landing-page experience with parallel light and dark themes.

![Widget — desktop](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/05-widget-desktop.png)

### Visual workflow builder

Design agentic flows visually without turning the canvas into noise. The editor keeps branching, AI, retrieval, and actions readable in one view.

![Workflow list](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/07-workflow-list.png)

![Workflow editor canvas](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/08-workflow-editor-canvas.png)

### Node configuration

Click any canvas node to configure it inline — AI Agent nodes expose Provider, Model, and System Prompt fields directly beside the flow.

![Workflow node config panel — AI Agent open](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/08b-workflow-node-config.png)

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

Define reusable external API connection profiles and reference them across any workflow HTTP Request node.

![API connectors list](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/12-api-connectors-list.png)

---

## Features

### RAG foundation

- **Multi-bot management** — unlimited bots, each with its own identity, model, prompt, retrieval config, and access controls
- **Source types** — URL page, PDF / file upload, plain-text snippet, XML sitemap
- **Queue-based ingestion** — async chunking, embedding, and upsert with per-source status tracking
- **Vector backends** — PostgreSQL + `pgvector` (recommended) or ChromaDB; configurable dimensions
- **Provider support** — OpenAI, Gemini, Anthropic, xAI, or any provider compatible with `laravel/ai`
- **Streaming chat** with grounded retrieval, inline source citations, and citation coverage metrics
- **Conversation history** — full transcripts with per-message retrieval context and citation links
- **Per-bot analytics** — conversation count, message volume, source health score, citation coverage chart

### Visual agentic workflows

- **10 node types**: Trigger, Send Message, Collect Input, AI Agent, Knowledge Base, Switch/Router, Join, Condition, Action (Database), HTTP Request
- **Multi-branch canvas** powered by Vue Flow — drag, connect, and organize nodes freely
- **AI Agent node** — configurable Provider, Model, and System Prompt per node within the same workflow
- **Knowledge Base node** — inline RAG retrieval mid-flow, configurable result count
- **Switch/Router node** — N branches + default; route by intent, field value, or AI classification
- **HTTP Request node** — call external APIs with variable interpolation in body and headers
- **Variable interpolation** — `{{variable_name}}` syntax in system prompts, messages, and node configs
- **AI Draft** — generate a complete workflow graph from a natural-language description in seconds
- **Run history** with step-level traces, current node, variable snapshot, halt reason, and timestamps
- **Versioned releases** with release notes; rollback to any prior version without re-editing
- **Import / Export** — share workflows as JSON between environments

### API connectors

- **Reusable connection profiles** — URL, auth method (Bearer, API Key, Basic Auth), custom headers
- **Referenced by name** in any HTTP Request node; update credentials in one place, all workflows update automatically

### Chat widget

- **Blade component** for Laravel views — authenticated or guest access
- **JavaScript loader** — single `<script>` tag embed for any external site (no npm required)
- **NPM package** for React, Vue, or any bundled frontend
- **Signed widget tokens** for access-controlled deployments (`RAG_WIDGET_SIGNING_ENABLED`)
- **Mobile-polished** — responsive layout, keyboard-safe positioning, iOS safe-area support
- **Customizable** — colors, placeholder text, greeting, launcher position, and z-index

### Production tooling

- **`php artisan filament-agentic-chatbot:doctor`** — pre-flight checks for config, DB, vector store, queue worker, and AI provider
- **Data retention policy** — scheduled pruning of old conversations with configurable age thresholds
- **GDPR / privacy endpoints** — export and delete conversation data per user on demand
- **Queue isolation** — ingestion jobs run on a configurable queue separate from your default queue

---

## Requirements

- PHP `8.4+`
- Laravel `12+`
- Filament `5.2+`
- PostgreSQL with `pgvector` extension (recommended) **or** a running ChromaDB instance
- AI provider API key (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `XAI_API_KEY`)
- A Laravel queue worker

---

## Installation

```bash
composer require heiner/filament-agentic-chatbot
php artisan vendor:publish --tag=filament-agentic-chatbot-config
php artisan migrate
php artisan queue:work
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
RAG_CHAT_PROVIDER=gemini             # gemini | openai | anthropic | xai
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
2. Add knowledge sources in **Knowledge → Sources**
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
  src="https://your-app.com/vendor/filament-agentic-chatbot/widget.js"
  data-bot-id="YOUR_BOT_ID"
  data-token="YOUR_SIGNED_TOKEN"
  defer
></script>
```

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
| **Action (Database)** | Persist collected variables to your database                               |
| **HTTP Request**      | Call an external API; reference an API Connector for credentials           |

---

## Importable Example Workflows

Seven ready-to-import examples covering common agentic patterns:

| Workflow                   | What it demonstrates                                   |
| -------------------------- | ------------------------------------------------------ |
| SaaS Onboarding            | Progressive intake + enterprise lead routing           |
| Support Ticket Router      | AI intent classification → 4-branch switch             |
| E-Commerce Order Status    | External API lookup + status-based responses           |
| Lead Qualification         | Multi-step data collection + CRM write action          |
| Webhook Inventory Alert    | Headless webhook trigger → multi-channel notifications |
| FAQ with Confidence Check  | Two-stage AI confidence evaluation before answering    |
| Content Research Assistant | KB search → outline → full draft generation            |

**[Browse and download on GitHub](https://github.com/heinergiehl/agentic-chatbot-workflow-examples)**

Import any JSON file via the workflow editor's **Import** button.

---

## Documentation

- [Product overview](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRODUCT_OVERVIEW.md)
- [Quick start guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md)
- [Core concepts](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CORE_CONCEPTS.md)
- [Agentic workflows — all node types explained](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENTIC_WORKFLOWS.md)
- [RAG sources and ingestion](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RAG_SOURCES.md)
- [Bots](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/BOTS.md)
- [API connectors](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md)
- [Chat widget embedding](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md)
- [Conversations and messages](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CONVERSATIONS_AND_MESSAGES.md)
- [Workflow JSON schema reference](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/WORKFLOW_JSON_SCHEMA.md)
- [Workflow prompt templates](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/WORKFLOW_PROMPT_TEMPLATES.md)
- [Operations and production readiness](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md)
- [Security and privacy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SECURITY_AND_PRIVACY.md)
- [Data retention policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DATA_RETENTION_POLICY.md)
- [How it differs from Filament RAG](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md)
- [Known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md)

---

## Support

Open an issue in the [public issue tracker](https://github.com/heinergiehl/filament-agentic-chatbot-issues). Response target: 2 business days.

See the full [Support Policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md).

---

## License

This is a commercial plugin. A license is required for production use. Source code distribution is not permitted.

See the full [Refund and License terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).
