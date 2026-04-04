# Bots

This is the page to share when someone asks what a bot is, how to create one, and how classic RAG behavior differs from workflow-driven behavior.

## What A Bot Is

A bot is one assistant configuration inside Filament Agentic Chatbot.

Think of it as the runtime definition for one assistant experience. A bot tells the system:

- what the assistant is for
- which knowledge sources it can use
- how retrieval should behave
- which workflow logic may run
- who can access it
- how the widget should look

This is why one Laravel + Filament app can run multiple assistants with very different behavior from one panel.

## A Bot Can Be Simple Or Agentic

### Simple RAG Bot

Use this when you want grounded Q&A over a knowledge base.

Typical flow:

- user asks a question
- retrieval finds relevant chunks
- model answers with grounded context

### Agentic Bot

Use this when the assistant needs to do more than answer one message.

Typical flow:

- user starts a conversation
- workflow asks clarifying questions
- AI nodes classify or generate content
- knowledge-base nodes fetch supporting context
- actions or HTTP requests move the process forward

## What You Can Customize Per Bot

Each bot owns its own:

- name and public ID
- system prompt and response behavior
- provider and model
- retrieval settings
- allowed domains
- context areas
- widget branding and prompts
- linked sources
- workflow-driven behavior

## How To Create A Bot

1. Open **RAG Bots** in your Filament panel.
2. Click **Create**.
3. Enter a clear **name** and stable **public ID**.
4. Write the **system prompt** that defines the bot's role.
5. Select the **provider** and **model**.
6. Configure **retrieval** settings.
7. Configure **allowed domains** and **context areas**.
8. Customize the **widget** title, subtitle, welcome message, and quick prompts.
9. Save the bot.
10. Add one or more sources and test retrieval.
11. If needed, attach or build workflows for multi-step logic.

## Important Bot Fields

### Name

The human-readable label shown in Filament and usually in the widget header.

Use a name that tells the visitor what the assistant is for.

### Public ID

The stable identifier used by the widget and public chat endpoints.

Keep it slug-like because it becomes part of the integration surface.

### System Prompt

The system prompt defines the bot's role, audience, tone, boundaries, and fallback behavior.

It guides the assistant, but it is not a replacement for real source content or workflow logic.

### Provider And Model

Choose the provider and model per bot to optimize for speed, cost, or quality.

### Retrieval Settings

The most important retrieval settings are:

- `top_k`
- `min_similarity`
- context budget

These settings strongly influence whether a bot feels grounded, noisy, or too narrow.

### Allowed Domains

Allowed domains limit where the widget can be embedded.

### Context Areas

Context areas help separate experiences such as:

- `public`
- `member`
- `admin`

### Widget Settings

Each bot can have its own title, subtitle, welcome message, quick prompts, accent color, style, and compact mode.

## When To Create A Separate Bot

Create a separate bot when you need a different:

- audience
- source set
- prompt behavior
- workflow behavior
- widget design
- provider/model combination
- access policy

## Typical Bot Patterns

### Public Product Guide

Grounded public Q&A over docs and FAQs.

### Sales Qualification Assistant

Guided questions, branching, and escalation for high-intent leads.

### Internal Ops Assistant

Runbook retrieval plus workflow-based triage and action execution.

### Customer-Specific Assistant

Dedicated knowledge, prompting, and branding for a tenant or client.

## Best Practices

- Keep each bot focused on one job and one audience
- Start with a strong RAG foundation before adding complex workflow logic
- Use workflows where structure matters, not for every single interaction
- Give the widget title and subtitle a clear user-facing purpose
- Test retrieval and workflow branches separately

## Related Docs

- `CORE_CONCEPTS.md`
- `RAG_SOURCES.md`
- `INGESTION_AND_RETRIEVAL.md`
- `AGENTIC_WORKFLOWS.md`
- `CHAT_WIDGET.md`
