# Agentic Chatbot for Filament

Answer support questions, help customers check their orders and let them confirm permitted changes in chat. Configure the Agent in **Laravel and Filament**, **self-host** it, and use **your own AI provider keys**.

For a shop, one Agent answers a public delivery FAQ from a Source, checks **Order status** after the customer's host login, asks them to **Confirm** a **delivery address** change, and offers **Handoff** to the team's Inbox. You configure the order model, fields, record scopes and policy first; the plugin does not automatically access customer data.

[Demo](https://filament-agentic-chatbot.heinerdevelops.tech/) · [Buy](https://checkout.anystack.sh/agentic-chatbot) · [Quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md) · [Support](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md)

**Release status:** Approved (release authorization); GitHub publication completed.

> Published `v1.0.0` on `2026-10-19` at `17:40:33 UTC`. The verified [GitHub v1.0.0 Release](https://github.com/heinergiehl/filament-agentic-chatbot/releases/tag/v1.0.0) is the publication authority; approval metadata alone does not establish publication. See the [published source and archive identity](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v1.0.0.md#published-artifact). See the [1.0.0 release notes](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v1.0.0.md) and [upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md).

Commercial proprietary software. The default license covers one legal entity and one Licensed Application, including development, staging and production. AI provider and hosting costs are separate. [License and refund terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).

Try the [live shop demo walkthrough](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md#try-the-live-shop-demo): fictional Alex/Sam accounts, cited shop policy, scoped orders and a confirmed address change. No real purchases, shipments or refunds occur. These online documentation updates follow publication; the tagged source and released ZIP retain their original documentation.

## Three use cases

- **Public FAQ:** answer shipping and returns questions from selected Sources, with citations when retrieved content supports the answer.
- **Customer order support:** look up only the signed-in customer's orders and confirm an allowed address change.
- **Team support:** send an unresolved question to the Inbox so an operator can continue the conversation.

![Shop chat showing a delivery answer and its Source citation](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-faq.png)

Answer a public delivery question from your approved Sources.

Actual anonymous FAQ answer and Source citation, captured on 2026-10-19 with
`claude-haiku-5-5` at effort `low` and `gemini-embedding-001` at 1,536 dimensions.
This is local C1 evidence, not final source/archive certification. The other
images retain their dated capture scope; see the
[screenshot provenance](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v1.0.0.md#evidence-and-release-readiness).

![Signed-in shop customer viewing the status of their own order](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-order-status.png)

Read Order status after the customer's normal host login.

![Delivery address confirmation showing the target order, proposed values and Confirm and Cancel controls](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-address-confirm.png)

Review a permitted delivery address change before confirming.

![Authorized operator replying to the customer's handed-off conversation](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-handoff.png)

Continue an unresolved conversation in the team's Inbox.

## Setup overview

Requirements: PHP 8.3+ with Composer-required extensions, Composer 2.2+, Laravel 12.61.1+ or 13.12.0+, Filament 5.10.2+ within 5.x, a supported database, a persistent queue worker, the scheduler and a cache shared by web and workers. Package storage supports MySQL 8.4+, MariaDB 11.4+, PostgreSQL 15+ and SQLite 3.39+. Production App data tools require a supported server database. [Compatibility and measured scope](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md).

1. Buy access and configure your private Anystack Composer repository. Install with `composer require heiner/filament-agentic-chatbot:^1.0`.
2. Register `FilamentAgenticChatbotPlugin::make()`, grant administrator access explicitly and configure your provider key.
3. Run `php artisan filament-agentic-chatbot:install`, supervise the worker and run the scheduler every minute.
4. Create an Agent, add a Source, **Test**, then **Publish**. Configure **Allowed hosts** and copy the embed. **Restore** selects an earlier Version while preserving Live/Paused availability.

Follow the [Quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md) for the anonymous FAQ path and the separate authenticated-data recipe. The latter covers the host identity endpoint, record scopes and authorization in queue workers. Installation does not include an AI provider account.

## Website integration

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

Use the generated URL and Agent ID. Production uses tokenless bootstrap at `/bootstrap`, short-lived tokens, a dedicated signing key and **Allowed hosts**. Set `AGENTIC_CHATBOT_WIDGET_SIGNING_TTL_MINUTES=10`. [Widget setup](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md).

## Tools and confirmation

Sources supply reference content. App data tools expose selected Eloquent fields and records; API tools and MCP tools expose selected operations. Optional Workflows define bounded multi-step processes. Ordinary FAQ chat needs no Workflow. A published Version pins the Agent's configuration and Tool contracts.

Confirmation is on by default. Personal App data tool writes, MCP writes, lead capture and updates with **Allow updating any record** require it. Administrators may disable **Ask visitor to confirm** for eligible operations. Team approval is separate; disabling confirmation does not bypass authorization. Unverified actions need reconciliation, and AI answers still need review for your use case.

## Privacy and retention

Review the [Data retention policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DATA_RETENTION_POLICY.md) and adapt the [Privacy policy template](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRIVACY_POLICY_TEMPLATE.md) to your host and provider use. Session-history export uses `GET /api/filament-agentic-chatbot/chat/{botPublicId}/history/export?session_id=...`; deletion uses `DELETE /api/filament-agentic-chatbot/chat/{botPublicId}/history` with the session identity and authorization required by the chat API. These endpoints cover the transcript and scoped memory, not complete account erasure. Active or unresolved work can block deletion; business evidence and backups follow the host's retention policy.

## Guides

- [Quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md), [Troubleshooting](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/TROUBLESHOOTING.md), [Compatibility](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md)
- [Product overview](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRODUCT_OVERVIEW.md), [Core concepts](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CORE_CONCEPTS.md), [Glossary](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/GLOSSARY.md)
- [Agents](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/BOTS.md), [Agent templates](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_TEMPLATES.md), [Agent tests](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_TESTS.md)
- [Sources](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWLEDGE_SOURCES.md), [Ingestion and retrieval](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/INGESTION_AND_RETRIEVAL.md), [App data tools](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DATA_RESOURCES.md)
- [API tools](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md), [MCP tools](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/MCP_CONNECTIONS.md), [Integration Studio](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/INTEGRATION_STUDIO.md), [API integrations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_INTEGRATIONS.md)
- [Workflow Builder](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PLAYBOOK_BUILDER.md), [Workflows](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENTIC_WORKFLOWS.md), [Workflow prompt templates](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/WORKFLOW_PROMPT_TEMPLATES.md), [Workflow JSON schema](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/WORKFLOW_JSON_SCHEMA.md)
- [Website widget](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md), [Channels](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHANNELS.md), [Audiences](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CONTEXT_AREAS.md), [Conversations and messages](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CONVERSATIONS_AND_MESSAGES.md)
- [Outbound webhooks](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OUTBOUND_WEBHOOKS.md), [Read API](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/READ_API.md), [Durable Connections](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DURABLE_CONNECTORS.md), [Side-effect integrity](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SIDE_EFFECT_INTEGRITY.md)
- [Privacy and retention](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/DATA_RETENTION_POLICY.md), [Privacy policy template](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRIVACY_POLICY_TEMPLATE.md), [Security and privacy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SECURITY_AND_PRIVACY.md)
- [Operations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPERATIONS.md), [Known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md), [Ship checklist](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SHIP_CHECKLIST.md), [AI usage accounting](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AI_USAGE_ACCOUNTING.md)
- [OpenAI-compatible providers](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/OPENAI_COMPATIBLE_PROVIDERS.md), [Localization](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/LOCALIZATION.md), [AgentGraph SDK usage](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENTGRAPH_SDK_USAGE.md), [Public host API](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PUBLIC_API.md), [Runtime architecture](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENT_RUNTIME_ARCHITECTURE.md)
- [Upgrading](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md), [Changelog](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHANGELOG.md), [Support](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md), [License/refunds](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md), [Product page](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/FILAMENT_PLUGIN_PAGE.md)

The runtime dependency is `heiner/agent-graph` `0.19.0`; it installs transitively. Supported constraints and historical certification evidence are in Compatibility.

Support: `webdevislife2021@gmail.com`. You operate the host app, queues, database, backups and provider account. Response targets are first-response targets, not resolution guarantees.
