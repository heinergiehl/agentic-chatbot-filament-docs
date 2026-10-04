# Agentic Chatbot for Filament

A Laravel and Filament package for building, testing, publishing, and operating AI Agents in your own application. An Agent answers from your content, reads and writes approved business data with visible visitor confirmation, hands over to people, and stays observable. Knowledge, data, APIs, MCP servers and Playbooks are attached only when an Agent needs them.

This repository is the public documentation source. The Filament marketplace has a separate entry point: configure its `docs_url` to the raw [`FILAMENT_PLUGIN_PAGE.md`](FILAMENT_PLUGIN_PAGE.md), not this README. That standalone page uses absolute GitHub links because Filament does not resolve repository-relative documentation links.

The files here mirror the package's canonical docs; `scripts/release/docs-drift-check.php` in the package lists the mirrored guides and fails when a copy differs. Keep the marketplace page independent of the package release number.

The current release is `v0.20.0`. **Release status:** Approved. The GitHub release and its attached archive are authoritative. These guides describe `v0.20.0`; changes listed under **Unreleased** in the [changelog](CHANGELOG.md) ship with the next release.

## What the package provides

- Agents with their own instructions, model, knowledge, tools, Safety settings and widget; a test chat on the saved draft, saved Agent tests, and **Publish** and **Restore** of immutable versions
- Shared knowledge sources from text, files (PDF, DOCX, CSV, XLSX and more), web pages and JSON APIs, with daily or weekly re-sync
- Data Resources set up on one screen: list, count, search, totals and groups, linked record names, and confirmed inserts and updates
- API Connectors, an Integration Studio for OpenAPI, Postman and cURL, and MCP servers with one-step tool import; one connection can serve several Agents
- Writes as tools that run only after the visitor confirms the exact values on a card
- Built-in human handoff to an Inbox and lead capture into Submissions
- Optional Playbooks for multi-step processes, built as a step list from templates or a description
- A streaming widget with tokenless bootstrap, typed SDK, private attachments and confirmation cards; Telegram, Slack, WhatsApp Cloud API, Mailtrap and Mailgun email
- Outbound webhooks with optional redacted content, a read API, usage reporting with default model prices, and English, German, French and Spanish UI

## Supported target

- PHP 8.3+ with `ext-zip`
- Laravel 12.61.1+ or 13.12.0+
- Filament 5.7.6+
- `laravel/ai` `^0.11.2` for provider and multi-step tool execution
- `heiner/agent-graph` `0.18.1` as the exact stable runtime dependency
- PostgreSQL 16 + pgvector is the certified Golden Path; ChromaDB is a supported buyer-staged alternative
- A supervised queue worker, the Laravel scheduler every minute, and a cache store shared by web and queue processes

Docker is used for reproducible release validation, not imposed as a customer deployment model. See [Compatibility and Certification](COMPATIBILITY.md).

## Install after purchase

```bash
composer config repositories.filament-agentic-chatbot composer https://YOUR-ANYSTACK-PRODUCT.composer.sh
composer require heiner/filament-agentic-chatbot:^0.20
```

Register `FilamentAgenticChatbotPlugin::make()` in the desired Filament panel before running the installer:

```bash
php artisan filament-agentic-chatbot:install
php artisan queue:work --queue=agentic-chat,default --timeout=150 --tries=1
```

The installer checks panel registration before publishing configuration, running migrations, and executing Doctor. Then add the scheduler (`* * * * * php artisan schedule:run`); see the [Quickstart](QUICKSTART.md).

## Public widget

Production snippets contain no long-lived token:

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

Set `AGENTIC_CHATBOT_WIDGET_SIGNING_TTL_MINUTES=10`, use a dedicated signing key, and configure every intended browser origin in Allowed Domains. The loader calls the tokenless, origin-checked `/bootstrap` endpoint, keeps the returned token in memory, and renews it before expiry. Session IDs are lookup keys, not anonymous conversation authority.

## Documentation

Start here:

- [Product overview](PRODUCT_OVERVIEW.md)
- [Quickstart and Golden Path](QUICKSTART.md)
- [Core concepts](CORE_CONCEPTS.md)

Build:

- [Agents](BOTS.md) and [Agent tests](AGENT_TESTS.md)
- [Knowledge sources](KNOWLEDGE_SOURCES.md) and [Ingestion and retrieval](INGESTION_AND_RETRIEVAL.md)
- [Agents and Playbooks](AGENTIC_WORKFLOWS.md), [Playbook Builder](PLAYBOOK_BUILDER.md), [Playbook JSON schema](WORKFLOW_JSON_SCHEMA.md) and [Playbook prompt templates](WORKFLOW_PROMPT_TEMPLATES.md)
- [Solution Kits](SOLUTION_KITS.md)

Connect:

- [Data Resources](DATA_RESOURCES.md)
- [API Connectors](API_CONNECTORS.md), [Integration Studio](INTEGRATION_STUDIO.md), [MCP servers](MCP_CONNECTIONS.md) and [Durable connectors](DURABLE_CONNECTORS.md)
- [Widget](CHAT_WIDGET.md), [Context areas](CONTEXT_AREAS.md) and [Channels](CHANNELS.md)
- [Server API](API_INTEGRATIONS.md), [Outbound webhooks](OUTBOUND_WEBHOOKS.md) and [Read API](READ_API.md)
- [OpenAI-compatible providers](OPENAI_COMPATIBLE_PROVIDERS.md)

Operate:

- [Conversations and messages](CONVERSATIONS_AND_MESSAGES.md)
- [AI usage and prices](AI_USAGE_ACCOUNTING.md)
- [Localization](LOCALIZATION.md)
- [Security and privacy](SECURITY_AND_PRIVACY.md), [Data retention](DATA_RETENTION_POLICY.md) and [Privacy policy template](PRIVACY_POLICY_TEMPLATE.md)
- [Operations](OPERATIONS.md)
- [Known limitations](KNOWN_LIMITATIONS.md)

Reference and release:

- [Public API](PUBLIC_API.md)
- [Agent runtime architecture](AGENT_RUNTIME_ARCHITECTURE.md) and [AgentGraph SDK usage](AGENTGRAPH_SDK_USAGE.md)
- [Compatibility and certification](COMPATIBILITY.md)
- [Upgrade guide](UPGRADING.md) and [Changelog](CHANGELOG.md)
- [Release notes v0.20.0](RELEASE_NOTES_v0.20.0.md)
- [Shipping checklist](SHIP_CHECKLIST.md)
- [Support](SUPPORT_POLICY.md) and [Refund and license terms](REFUND_AND_LICENSE.md)
- [Marketplace product page](FILAMENT_PLUGIN_PAGE.md)

## Upgrading to 0.20.0

`v0.20.0` overhauls the plugin: one transcript-based Agent loop, writes with visitor confirmation, built-in handoff and lead capture, one-step publish with restore, Agent tests, Safety settings, Playbooks as tools with a step-list editor, streaming, shared knowledge and connections, webhook events and a read API. It is a breaking upgrade: Quality Tests, Guardrail Policies and the release candidate flow are removed, the scheduler and a shared cache are required, and every Playbook and Agent must be published again. Several migrations drop tables and columns and cannot be rolled back, so back up the database first. Read [Upgrading](UPGRADING.md) before installing it.

## Support and license

Support: `webdevislife2021@gmail.com`. Response targets, supported release lines, and previous-line EOL dates are defined in [Support Policy](SUPPORT_POLICY.md).

The plugin is commercial proprietary software. The purchase record defines project/entity scope. Unless a broader tier is stated, the default is one legal entity and one Licensed Application, including its non-production environments. SaaS use of that application is allowed; plugin redistribution and resale of a general-purpose hosted builder are not.
