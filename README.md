# Agentic Chatbot for Filament

A Laravel and Filament package for building, testing, publishing, and operating governed AI Agents in your own application. Knowledge, live data, registered capabilities, and visual Playbooks are attached only when an Agent needs them.

This repository is the complete public documentation source used by HeliDocs. The Filament marketplace has a separate entry point: configure its `docs_url` to the raw [`FILAMENT_PLUGIN_PAGE.md`](FILAMENT_PLUGIN_PAGE.md), not this README. That standalone page uses absolute GitHub links because Filament does not resolve repository-relative documentation links in the same way as HeliDocs or GitHub.

The documentation target is `v0.17.5`. **Release status:** Candidate. This version is not buyer-visible until the protected exact-source and exact-artifact workflow publishes an immutable GitHub release.

## What the package provides

- Filament administration for Agents, knowledge, approved live data, capabilities, optional Playbooks, conversations, quality, handoff, usage, privacy, and traces
- A deliberate release path in which an immutable candidate is tested through the persistent chat runtime before it becomes live
- Source-grounded answers with citations and controlled reads from approved Eloquent resources or published API operations
- Versioned Solution Kits, a Production Handoff Desk, evidence-backed outcomes, and exact candidate-versus-live quality comparisons
- Integration Studio for importing OpenAPI, Postman, or cURL definitions into inactive Connector drafts for review
- A tokenless public widget bootstrap, typed SDK, private attachments, suggested messages, and bounded page context instead of permanent browser credentials
- Telegram, Slack, WhatsApp Cloud API, Mailtrap Email, and Mailgun Email with explicit availability and acceptance boundaries
- Versioned compatibility, upgrade, security, operations, support, and release-assurance documentation

## Supported target

- PHP 8.3+
- Laravel 12.61.1+ or 13.12.0+
- Filament 5.7.6+
- `laravel/ai` `^0.11.2` for provider and multi-step tool execution
- `heiner/agent-graph` `0.16.2` as the exact stable runtime dependency
- PostgreSQL 16 + pgvector is the certified Golden Path; ChromaDB is a supported buyer-staged alternative
- Supervised asynchronous queue worker for production ingestion, delays, and background work

Docker is used for reproducible release validation, not imposed as a customer deployment model. See [Compatibility and Certification](COMPATIBILITY.md) for the supported-versus-certified distinction and provider boundaries.

## Install after publication

```bash
composer config repositories.filament-agentic-chatbot composer https://YOUR-ANYSTACK-PRODUCT.composer.sh
composer require heiner/filament-agentic-chatbot:^0.17
```

Register `FilamentAgenticChatbotPlugin::make()` in the desired Filament panel before running the installer:

```bash
php artisan filament-agentic-chatbot:install
php artisan queue:work
```

The installer checks panel registration before publishing configuration, running migrations, and executing Doctor. Custom Filament themes must include the package views in their source scan as shown in the [Quickstart](QUICKSTART.md).

## Public widget

Production snippets contain no long-lived token:

```html
<script
    src="https://your-app.example/filament-agentic-chatbot/widget"
    data-bot="YOUR_BOT_PUBLIC_ID"
    data-area="public"
    data-size="comfortable"
    data-font="system"
    data-show-sources="true"
    defer
></script>
```

Set `AGENTIC_CHATBOT_WIDGET_SIGNING_TTL_MINUTES=10`, use a dedicated signing key, and configure every intended browser origin in Allowed Domains. The loader calls the tokenless, origin-checked `/bootstrap` endpoint, keeps the returned token in memory, and renews it before expiry. Session IDs are lookup keys, not anonymous conversation authority.

## Documentation

- [Marketplace/product page](FILAMENT_PLUGIN_PAGE.md)
- [Quickstart and Golden Path](QUICKSTART.md)
- [Core concepts](CORE_CONCEPTS.md)
- [Bots and readiness](BOTS.md)
- [Agents and Playbooks](AGENTIC_WORKFLOWS.md)
- [Playbook Builder](PLAYBOOK_BUILDER.md)
- [Data Resources](DATA_RESOURCES.md)
- [Knowledge and retrieval](INGESTION_AND_RETRIEVAL.md)
- [API Connectors](API_CONNECTORS.md)
- [Integration Studio](INTEGRATION_STUDIO.md)
- [Widget](CHAT_WIDGET.md)
- [Channels](CHANNELS.md)
- [Outbound webhooks](OUTBOUND_WEBHOOKS.md)
- [Security and privacy](SECURITY_AND_PRIVACY.md)
- [Quality operations](QUALITY_OPERATIONS.md)
- [Operations](OPERATIONS.md)
- [Compatibility and certification](COMPATIBILITY.md)
- [Known limitations](KNOWN_LIMITATIONS.md)
- [Upgrade guide](UPGRADING.md)
- [Release notes v0.17.5](RELEASE_NOTES_v0.17.5.md)
- [Support](SUPPORT_POLICY.md)
- [Refund and license terms](REFUND_AND_LICENSE.md)

## Important 0.17 boundary

Version 0.17 removes the Compound Request runtime/modes, the legacy `loop` node, connector v1/v2 execution compatibility, old environment aliases, and static widget tokens. It adds the bounded `batchMap` primitive, connector v3 publication pins, and the tokenless widget bootstrap. This is a breaking minor release: back up, read the upgrade guide, use a maintenance window, migrate, republish retired workflows, run Doctor, and verify a real live conversation before reopening production traffic.

## Support and license

Support: `webdevislife2021@gmail.com`. Response targets, supported release lines, and `0.16` EOL are defined in [Support Policy](SUPPORT_POLICY.md).

The plugin is commercial proprietary software. The purchase record defines project/entity scope. Unless a broader tier is stated, the default is one legal entity and one Licensed Application, including its non-production environments. SaaS use of that application is allowed; plugin redistribution and resale of a general-purpose hosted builder are not.
