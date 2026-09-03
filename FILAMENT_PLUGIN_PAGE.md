# Agentic Chatbot for Filament

Build and operate governed AI Agents inside your Laravel application.

Connect each Agent to approved knowledge, selected live application data, and registered capabilities. Add a visual Playbook only when a request needs a bounded process. Test an immutable release candidate before it receives live traffic.

**Commercial Early Access** · **Filament 5** · **Laravel 12 and 13**

The documented release is `v0.17.2`. **Release status:** Approved. The GitHub release and Composer listing are authoritative for buyer-visible availability.

- [Try the current live demo](https://filament-agentic-chatbot.heinerdevelops.tech/)
- [Read the quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md)
- [Read the 0.17 upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md)

## What you can build

### Grounded support and onboarding

Answer questions from sources that an administrator has attached and ingested. Responses can include citations, and operators can review the conversation, feedback, and source use in Filament.

### Assistants that use approved application data

Let an Agent read selected Eloquent resources or published API operations without giving it broad access to the host application. The deployment records the exact fields, filters, limits, scopes, revisions, and environments that are allowed.

### Bounded processes

Use an optional visual Playbook when a request needs several controlled steps, such as collecting input, checking a condition, requesting approval, calling a capability, waiting for a result, or handing work to a person.

## How it works

1. Create an Agent and define its behavior, response policy, provider, and model.
2. Attach only the knowledge, Data Resources, Connector operations, host capabilities, and optional Playbooks that it needs.
3. Test ordinary chat, expected capability choices, failure behavior, and any Playbook paths.
4. Use **Publish candidate**, run **Test release candidate** through the persistent runtime, then use **Make candidate live** only after the exact candidate has passing evidence.

Draft edits do not change live behavior. A live Agent uses one immutable, verified deployment with exact dependency pins. A Playbook is never required for ordinary or knowledge-grounded chat.

## What is included

### Agent control plane

- Agent identity, behavior, provider, model, retrieval, access, widget presentation, and readiness in Filament
- Versioned Solution Kits for reviewed starting configurations, including Customer Support & Human Handoff
- Candidate publication, candidate testing, deliberate activation, and deployment inspection
- Conversation review, evidence-backed outcomes, feedback, handoff, usage, privacy actions, and traces

### Knowledge and live data

- URL, file, text, and bounded API-fed knowledge sources
- Source-grounded answers with citations
- Approved Eloquent Data Resources with field, filter, sort, scope, result, and query-budget controls
- PostgreSQL with pgvector as the certified database path, with ChromaDB available as a buyer-staged alternative

### Integrations and capabilities

- API Connectors with versioned operation and environment bindings
- Integration Studio for importing OpenAPI, Postman, or cURL definitions into inactive drafts for review
- Explicit host-registered capabilities governed by Laravel authorization and package execution policy
- Confirmations, idempotency, redaction, and reconciliation for productive side effects

### Optional visual Playbooks

- A Filament-integrated canvas for bounded multi-step processes
- Semantic steps for input, capabilities, decisions, approvals, waits, AI tasks, transforms, bounded iteration, sub-Playbooks, and results
- Deterministic validation before publication
- Immutable deployments, run inspection, checkpoints, interrupts, delays, cancellation, and traces

### Delivery and operations

- Embeddable browser widget with a tokenless bootstrap
- Typed widget SDK, private attachments, suggested messages, bounded page context, and lifecycle events
- Trusted server access through Agent Access Tokens
- Telegram, Slack, WhatsApp Cloud API, Mailtrap Email, and Mailgun Email with the supported and opt-in boundaries in the versioned compatibility matrix
- Production Handoff Desk with assignment, SLA, encrypted notes, operator replies, and deterministic Agent handback
- Scheduled quality scenarios, exact candidate-versus-live comparisons, knowledge-gap operations, provider diagnostics, Doctor checks, and operational queues

## Best fit

This plugin is a good fit when:

- your product already runs on Laravel and Filament;
- you want assistant administration inside the application you operate;
- answers should use approved sources or selected live data;
- application actions need explicit authorization, confirmation, and audit evidence;
- some requests need a bounded process, but ordinary conversation should remain ordinary conversation;
- your team is prepared to stage provider, queue, database, and integration behavior before production use.

## Not the best fit

Choose another product if you need:

- a hosted chatbot SaaS with no Laravel application;
- a general-purpose workflow automation platform;
- a mature no-code platform with a large template marketplace;
- an autonomous system that may call arbitrary application code;
- a product that operates providers, queues, databases, backups, and incident response for you.

## Operating boundaries

- The package runs inside your Laravel application. Model traffic goes to the provider that you configure.
- The package is bring-your-own-key (BYOK). The Composer distribution contains no maintainer-owned AI credential; every installation must use the buyer's own provider account and keys.
- Provider fees, infrastructure, queues, databases, vector storage, backups, and monitoring are not included.
- AI output can be wrong. Saved tests, candidate evidence, review, and application policy remain necessary.
- Adapter availability is not a blanket certification of every provider, model, region, or account profile.
- Write behavior is limited to published capabilities and the policies, confirmations, and payload contracts that authorize them.
- The buyer remains responsible for tenancy, privacy terms, retention, provider agreements, and final production policy.

## Requirements

| Surface | Supported target |
| --- | --- |
| PHP | 8.3+ |
| Laravel | 12.61.1+ or 13.12.0+ |
| Filament | 5.7.6+ |
| Certified database path | PostgreSQL 16 with pgvector |
| Alternative vector store | ChromaDB, staged by the buyer |
| Background work | A supervised asynchronous Laravel queue worker |
| AI access | At least one configured provider and model |

Docker is used for reproducible release checks. Customers do not have to deploy the package with Docker.

## Install after publication

Copy the private Composer repository URL from the buyer's Anystack page, then install the released package:

```bash
composer config repositories.filament-agentic-chatbot composer https://YOUR-ANYSTACK-PRODUCT.composer.sh
composer require heiner/filament-agentic-chatbot:^0.17
```

Register `FilamentAgenticChatbotPlugin::make()` in the target Filament panel before running the installer:

```php
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

public function panel(Panel $panel): Panel
{
    return $panel->plugins([
        FilamentAgenticChatbotPlugin::make(),
    ]);
}
```

Finish setup and start a supervised worker:

```bash
php artisan filament-agentic-chatbot:install
php artisan queue:work
```

The installer checks panel registration before it publishes configuration, runs package migrations, and executes Doctor. Treat every Doctor failure as blocking.

## Embed the widget

Copy the generated snippet from the Agent editor. It contains presentation settings but no permanent browser credential:

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

The loader calls the origin-checked `/bootstrap` endpoint, keeps the short-lived token in memory, and renews it before expiry. Production requires a dedicated signing key and an exact Allowed Domains entry for every browser origin.

## Upgrading from 0.16.1

Version 0.17 is a breaking Agent-first cutover, not a drop-in patch. It removes the Compound Request subsystem, old runtime modes, legacy environment aliases, static widget tokens, obsolete Connector execution contracts, and the old live-workflow pointer.

Back up first. Use a maintenance window, rotate affected credentials, run the documented migrations and Doctor commands, republish replacement Agent deployments, recopy widget snippets, and verify a real live conversation before reopening traffic.

[Read the complete 0.17 upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md).

## Documentation and support

- [Product overview](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRODUCT_OVERVIEW.md)
- [Quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md)
- [Compatibility and provider boundaries](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md)
- [Known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md)
- [Security and privacy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SECURITY_AND_PRIVACY.md)
- [Support policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md)

Support contact: `webdevislife2021@gmail.com`. Published response targets are first-response targets, not a resolution guarantee.

## License

This is commercial proprietary software. Unless the purchase record grants a broader tier, the default scope is one legal entity and one Licensed Application, including its development, staging, and production environments. SaaS use of that application is allowed. Redistribution of the plugin or resale of a general-purpose hosted builder is not.

[Read the refund and license terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).
