# Filament Agentic Chatbot — Documentation

Public documentation for the [heiner/filament-agentic-chatbot](https://github.com/heinergiehl/filament-agentic-chatbot) plugin.

This repository is organized so buyers, evaluators, implementers, and support users can jump directly to the page they need instead of digging through one long README.

> For Filament marketplace `docs_url`, use [FILAMENT_PLUGIN_PAGE.md](FILAMENT_PLUGIN_PAGE.md), not this README. Filament renders a single raw Markdown file and does not resolve repository-relative links like GitHub does.

---

## 🚀 Live Demo

Try the plugin before you buy:

**[filament-agentic-chatbot.heinerdevelops.tech](https://filament-agentic-chatbot.heinerdevelops.tech/)**

Log in with the demo credentials on the login page. The demo includes pre-configured bots, ingested documentation sources, sample workflows, and a live chat widget.

---

## Start Here

If you are evaluating the plugin, read these in order:

1. [Product Overview](PRODUCT_OVERVIEW.md)
2. [How It Differs From Filament RAG](HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md)
3. [Core Concepts](CORE_CONCEPTS.md)
4. [Quickstart](QUICKSTART.md)

## What This Plugin Is

Filament Agentic Chatbot is the newer, broader plugin in the product line.

It keeps the grounded RAG chatbot capabilities of the earlier Filament RAG plugin and adds:

- visual workflows
- branching logic
- AI agent nodes
- action and HTTP nodes
- API connectors for external services
- guided intake, routing, and escalation flows

That means it can work as:

- a straightforward documentation chatbot
- a product onboarding assistant
- a lead qualification assistant
- a support triage assistant
- an internal ops assistant with workflow logic

## Product Tour

These are real screenshots from the current product surface.

### Bot management

Manage multiple bots from inside Filament.

![Bot list](./images/agentic-chatbot/01-bot-list.png)

### Bot configuration

Configure prompt, provider, retrieval, access, and widget settings per bot.

![Bot edit](./images/agentic-chatbot/02-bot-edit.png)

### Source ingestion visibility

Track ingestion status, chunk counts, and source health directly in the panel.

![Source ingestion table](./images/agentic-chatbot/03-source-ingestion-table.png)

### Conversation review

Inspect transcripts and assistant answers from inside Filament.

![Conversation transcript](./images/agentic-chatbot/04-conversation-transcript.png)

### Workflow library

See which workflows are active, which bot they belong to, and which drafts are ready to ship.

![Workflow list](./images/agentic-chatbot/07-workflow-list.png)

### Visual workflow editor

Design retrieval-aware, branching, agentic flows directly inside Filament.

![Workflow editor canvas](./images/agentic-chatbot/08-workflow-editor-canvas.png)

### Workflow generation, runs, and releases

Draft workflows from prompts, inspect execution traces, and publish changes with release notes.

![Workflow generate tab](./images/agentic-chatbot/09-workflow-generate-tab.png)

![Workflow runs tab](./images/agentic-chatbot/10-workflow-runs-tab.png)

![Workflow releases tab](./images/agentic-chatbot/11-workflow-releases-tab.png)

### API connectors

Manage reusable external API profiles for workflow nodes.

![API connectors list](./images/agentic-chatbot/12-api-connectors-list.png)

### Widget experience

Preview the embeddable widget on desktop and mobile.

![Widget desktop](./images/agentic-chatbot/05-widget-desktop.png)

![Widget mobile](./images/agentic-chatbot/06-widget-mobile.png)

## Documentation Map

### Evaluate The Plugin

- [Product Overview](PRODUCT_OVERVIEW.md)
- [How It Differs From Filament RAG](HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md)
- [Core Concepts](CORE_CONCEPTS.md)
- [Reference Links](REFERENCE_LINKS.md)

### Install And Launch

- [Quickstart](QUICKSTART.md)
- [Operations](OPERATIONS.md)
- [Security And Privacy](SECURITY_AND_PRIVACY.md)

### Learn The Product Model

- [Bots](BOTS.md)
- [RAG Sources](RAG_SOURCES.md)
- [Ingestion And Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Agentic Workflows](AGENTIC_WORKFLOWS.md)
- [API Connectors](API_CONNECTORS.md)
- [Workflow Prompt Templates](WORKFLOW_PROMPT_TEMPLATES.md)
- [Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md)
- [Chat Widget](CHAT_WIDGET.md)

### Policies And Support

- [Support Policy](SUPPORT_POLICY.md)
- [Refund And License](REFUND_AND_LICENSE.md)
- [Security And Privacy](SECURITY_AND_PRIVACY.md)

## Common Questions

- What does the plugin add? → [Product Overview](PRODUCT_OVERVIEW.md)
- How is it different from the older RAG plugin? → [How It Differs From Filament RAG](HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md)
- Can I use it as a simple RAG chatbot first? → [Quickstart](QUICKSTART.md)
- How do workflows fit in? → [Agentic Workflows](AGENTIC_WORKFLOWS.md)
- How do I set up API connectors for external services? → [API Connectors](API_CONNECTORS.md)
- How do workflow releases, traces, and connectors look in practice? → [Agentic Workflows](AGENTIC_WORKFLOWS.md)
- How do I generate workflow JSON? → [Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md)
- How do I embed the widget? → [Chat Widget](CHAT_WIDGET.md)

## Versioning

Docs should track plugin releases. If the plugin release is `vX.Y.Z`, the matching docs snapshot should be tagged the same way where practical.

## Related Repositories

- Plugin code: [heinergiehl/filament-agentic-chatbot](https://github.com/heinergiehl/filament-agentic-chatbot)
- Public docs: [heinergiehl/agentic-chatbot-filament-docs](https://github.com/heinergiehl/agentic-chatbot-filament-docs)
- Older RAG-only docs: [heinergiehl/rag-filament-docs](https://github.com/heinergiehl/rag-filament-docs)
