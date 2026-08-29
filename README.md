# Agentic Chatbot for Filament

A Laravel/Filament plugin for building, validating, publishing, and operating source-grounded AI chatbots with explicit agentic workflows in your own application.

The documentation target is `v0.17.0`. **Release status:** Candidate. A tag may ship only after the governed contract is approved and every protected exact-source and exact-artifact job passes. Do not treat documentation availability as proof that a package version has been published.

## Why this product

- Native Filament management for bots, sources, Data Resources, workflows, connectors, quality checks, conversations, handoffs, usage, privacy, and traces
- Guided local OpenAPI/Postman/cURL import into inactive Connector drafts, with optional AI metadata suggestions that reuse central provider credentials
- Scheduled Published Agent regressions and a verified Knowledge Operations inbox that require durable runtime evidence and passing current tests
- One understandable production path: one immutable verified Agent deployment is live for each bot; Playbooks are optional pinned process tools
- One explicit rollout sequence: publish an immutable candidate, test that exact candidate through the persistent runtime, activate it atomically, then verify the live chat and trace
- AgentGraph-owned workflow state and one guarded external-capability boundary
- Tokenless public widget bootstrap and conversation credentials instead of permanent browser secrets
- Exact release artifact, SHA-256, per-entry manifest, embedded CycloneDX SBOM, clean Laravel 12/13 installs, and PostgreSQL/pgvector upgrade/rollback evidence

## Supported target

- PHP 8.3+
- Laravel 12.61.1+ or 13.12.0+
- Filament 5.2+
- `heiner/agent-graph` `^0.15.1`
- PostgreSQL 16 + pgvector is the certified Golden Path; ChromaDB is a supported buyer-staged alternative
- Supervised asynchronous queue worker for production ingestion, delays, and background work

Docker is used for reproducible release validation, not imposed as a customer deployment model. See [Compatibility and Certification](COMPATIBILITY.md) for the supported-versus-certified distinction and provider boundaries.

## Install after publication

```bash
composer require heiner/filament-agentic-chatbot:^0.17
php artisan vendor:publish --tag=filament-agentic-chatbot-config
php artisan migrate
php artisan filament-agentic-chatbot:doctor
php artisan queue:work
```

Register `FilamentAgenticChatbotPlugin::make()` in the desired Filament panel. Custom Filament themes must include the package views in their source scan as shown in the [Quickstart](QUICKSTART.md).

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
- [Release notes v0.17.0](RELEASE_NOTES_v0.17.0.md)
- [Support](SUPPORT_POLICY.md)
- [Refund and license terms](REFUND_AND_LICENSE.md)

## Important 0.17 boundary

Version 0.17 removes the Compound Request runtime/modes, the legacy `loop` node, connector v1/v2 execution compatibility, old environment aliases, and static widget tokens. It adds the bounded `batchMap` primitive, connector v3 publication pins, and the tokenless widget bootstrap. This is a breaking minor release: back up, read the upgrade guide, use a maintenance window, migrate, republish retired workflows, run Doctor, and verify a real live conversation before reopening production traffic.

## Support and license

Support: `webdevislife2021@gmail.com`. Response targets, supported release lines, and `0.16` EOL are defined in [Support Policy](SUPPORT_POLICY.md).

The plugin is commercial proprietary software. The purchase record defines project/entity scope. Unless a broader tier is stated, the default is one legal entity and one Licensed Application, including its non-production environments. SaaS use of that application is allowed; plugin redistribution and resale of a general-purpose hosted builder are not.
