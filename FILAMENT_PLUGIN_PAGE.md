# Agentic Chatbot (Filament Plugin)

Build, manage, and embed production-ready **agentic AI assistants** directly from your Filament panel.

This plugin includes a full **RAG chatbot foundation** and extends it with **visual workflows**, **branching logic**, **AI agent nodes**, **actions**, and **HTTP integrations**.

## What you get

- Filament resources for bots, sources, workflows, and conversations
- Queue-based ingestion for text, file, and URL sources
- `pgvector` (recommended) or ChromaDB vector backends
- Streaming chat with grounded retrieval and citations
- Embeddable widget plus optional NPM loader
- Workflow builder for guided conversations and automations
- Privacy workflows for export and delete of chat history
- Operational readiness via `php artisan filament-agentic-chatbot:doctor`

## Product tour

### Bot list

Manage multiple assistants from a Filament-native control plane.

![Bot list](./images/agentic-chatbot/01-bot-list.png)

### Bot editing

Configure prompt, model, retrieval, access, and widget presentation per bot.

![Bot edit](./images/agentic-chatbot/02-bot-edit.png)

### Source ingestion

Track source status and ingestion progress directly in the panel.

![Source ingestion](./images/agentic-chatbot/03-source-ingestion-table.png)

### Conversation review

Inspect conversation history without leaving Filament.

![Conversation transcript](./images/agentic-chatbot/04-conversation-transcript.png)

### Widget desktop and mobile

The embeddable widget is polished out of the box across device sizes.

![Widget desktop](./images/agentic-chatbot/05-widget-desktop.png)

![Widget mobile](./images/agentic-chatbot/06-widget-mobile.png)

## Why this is different from the earlier RAG plugin

The earlier Filament RAG plugin is focused on grounded Q&A over a knowledge base.

This plugin keeps that and adds a workflow engine so the assistant can:

- ask follow-up questions
- classify intent
- branch into different paths
- collect structured data
- call backend actions or external APIs
- escalate when confidence is low

In short:

- **Filament RAG** = grounded chatbot
- **Filament Agentic Chatbot** = grounded chatbot **plus** guided task flows and automation

## Typical use cases

- Product documentation chatbot
- Lead qualification assistant
- Customer support triage assistant
- Onboarding wizard
- Internal helpdesk assistant
- AI copilots that mix retrieval with workflow logic

## Requirements

- PHP `8.4+`
- Laravel `12+`
- Filament `5.2+`
- PostgreSQL + `pgvector` (recommended) or ChromaDB
- An AI provider key compatible with `laravel/ai`

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

->plugins([
    FilamentAgenticChatbotPlugin::make(),
])
```

## Quick configuration

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

## Fastest path to value

1. Create a bot
2. Add one or more RAG sources
3. Wait for ingestion to complete
4. Test retrieval and answers
5. Embed the widget
6. Add workflows only when you need guided multi-step behavior

## Best next docs

- Product overview: `PRODUCT_OVERVIEW.md`
- How it differs from Filament RAG: `HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md`
- Quickstart: `QUICKSTART.md`
- Agentic workflows: `AGENTIC_WORKFLOWS.md`
- Support policy: `SUPPORT_POLICY.md`
- Refund and license: `REFUND_AND_LICENSE.md`
