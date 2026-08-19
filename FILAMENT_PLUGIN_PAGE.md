# Agentic Chatbot for Filament

A Filament-native control plane for building, validating, publishing, and operating source-grounded AI chatbots with explicit agentic workflows inside your Laravel application.

The documented target is `v0.17.0`. It is a release candidate until the protected release contract is approved and the exact commercial ZIP passes every required gate. After publication, install with:

```bash
composer require heiner/filament-agentic-chatbot:^0.17
```

## Product promise

Build a useful support, onboarding, qualification, or internal-operations chatbot without handing your application state to an opaque hosted builder. Administrators work in Filament; the Laravel host keeps ownership of users, tenancy, business data, policies, queues, credentials, and deployment.

The shortest production path is intentionally explicit:

1. Create a bot and configure one chat provider/model.
2. Add knowledge or an approved Data Resource when the bot needs grounded data.
3. Create or generate a workflow, then resolve the editor's readiness issues.
4. Validate and publish an immutable deployment.
5. Make that verified deployment live for the bot.
6. Run the real behavior check or public widget chat.
7. Inspect the resulting conversation, workflow run, and trace.

A bot without one verified live workflow deployment stays blocked. Draft edits do not silently change live behavior.

## What ships

### Filament control plane

- Multi-bot management for identity, provider/model, prompt behavior, retrieval, widget presentation, access, and readiness
- Guided setup and launch status with permission-aware actions and direct links to the next fix
- Knowledge source ingestion for URLs, files, text, and bounded API-fed JSON
- Approved Eloquent Data Resources with returned/filterable/sortable fields, tenant/actor scope, result limits, and query budgets
- Conversation review with citations, feedback, handoff, privacy export/deletion, and lifecycle guards
- Usage, quality, provider diagnostics, Doctor checks, reconciliation queues, and run/trace inspection

### Visual agentic workflow editor

- Draft, validation, quality scenarios, immutable publication, explicit live activation, and rollback history
- Triggers, replies, questions/forms, conditions, switch routing, AI steps, knowledge retrieval, Data Resources, connectors, read-only raw HTTP, actions, confirmation, transforms, variables, structured output, guardrails, bounded `batchMap`, delays, joins, sub-workflows, and terminal states
- Focus mode, minimap, zoom/fit, searchable node catalog, structured field editors, keyboard operation, dark mode, and responsive Filament integration
- AI-assisted workflow generation that always produces a draft and must pass deterministic validation before publication
- Read-only node inspection for raw HTTP (`GET`/`HEAD`) with allowlist, DNS-pinned transport, and streaming response-size limits

### Production runtime

- One immutable, hash-verified workflow deployment per live bot
- AgentGraph-owned checkpoints, interrupts, resume, delay, cancellation, and task semantics through `heiner/agent-graph` `^0.15.1`
- One productive external capability boundary with authorization, exact payload binding, confirmation, idempotency, encrypted ledgers, secret-aware redaction, unknown-outcome handling, and operator reconciliation
- Durable chat turns with client idempotency, per-conversation serialization, committed JSON/SSE replay, and crash-safe terminal recovery
- API Connector v3 contracts with exact revision/schema/environment pins, bounded pagination/polling, typed outcomes, and fail-closed write handling
- Retrieval strategies for vector, hybrid, and lexical-only search with evidence/status contracts and index identity checks

### Public widget and channels

- Tokenless browser snippet: an origin-checked `/bootstrap` call issues a short-lived token kept in memory and renewed before expiry
- Separate high-entropy conversation credentials so a leaked or guessed session ID alone cannot read, export, mutate, or delete anonymous production history
- Configurable template, accent, typography, size, copy, starter prompts, citations, source visibility, context area, and responsive layout
- Slack and Telegram package drivers that route through the same bot/workflow/usage boundaries
- Bot Access Tokens for trusted server-to-server API integrations; they are never browser widget credentials

## Supported Golden Path

| Component | Supported / certified target |
| --- | --- |
| PHP | 8.3+ |
| Laravel | 12.61.1+ or 13.12.0+ |
| Filament | 5.2+ |
| Workflow SDK | AgentGraph ^0.15.1 |
| Certified database path | PostgreSQL 16 + pgvector |
| Alternative vector store | ChromaDB, buyer-staged |
| Background work | Supervised asynchronous Laravel queue worker |

Docker is used by the release process to reproduce clean Laravel 12/13 PostgreSQL hosts. Docker is not a customer deployment requirement. The plugin can be installed in any Laravel/Filament host that satisfies the supported Composer, extension, storage, queue, and network contracts.

Provider adapters are available for Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, Azure OpenAI, and OpenAI-compatible chat gateways. Embedding adapters include Gemini, OpenAI, OpenRouter, Mistral, Ollama, Azure OpenAI, Cohere, Jina AI, and Voyage AI. Availability is not a blanket live-certification claim: only provider/model/profile rows present in the retained successful protected release report are certified for that artifact. Stage your exact account, model, region, and structured-output/tool profile.

## Install

After `v0.17.0` is published:

```bash
composer require heiner/filament-agentic-chatbot:^0.17
php artisan vendor:publish --tag=filament-agentic-chatbot-config
php artisan migrate
php artisan filament-agentic-chatbot:doctor
php artisan queue:work
```

Register the plugin in the desired Filament panel:

```php
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

public function panel(Panel $panel): Panel
{
    return $panel->plugins([
        FilamentAgenticChatbotPlugin::make(),
    ]);
}
```

If the host uses a custom Filament theme, include the package views in the theme source scan and rebuild the host assets:

```css
@source '../../../../vendor/heiner/filament-agentic-chatbot/resources';
```

## Embed the widget

Copy the generated snippet from the bot editor. It contains public presentation settings but no long-lived credential:

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

Production requires widget signing, a dedicated signing key, and an exact Allowed Domains entry for every browser origin. The loader obtains and renews its access token through tokenless bootstrap. It may retry safe reads after renewal; it never automatically replays chat sends or other writes.

## Security and privacy boundaries

- Sensitive Filament pages and actions authorize server-side; hiding navigation is not treated as access control.
- Raw HTTP editor inspection is read-only. Productive writes use published connector/action contracts and the capability gateway.
- External responses and ingestion downloads are bounded while streaming, before full payload materialization where the transport supports it.
- Logs and UI error events use bounded/redacted diagnostics rather than raw provider exception messages.
- Conversation inspect/export/delete share one privacy lifecycle authority. Active, waiting, unknown, or unreconciled work blocks destructive deletion, and deletion reports retained record classes/counts instead of claiming unverifiable total erasure.
- The buyer remains responsible for application authorization, tenant policy, retention periods, privacy notices, provider data-processing terms, backups, queue supervision, secrets, and incident response.

## Important 0.17 upgrade boundary

This is not a drop-in patch update from 0.16.1:

- the old top-level Compound Request subsystem and engine modes are removed;
- the old `loop` runtime node is removed in favor of bounded `batchMap`;
- API Connector v1/v2 execution compatibility is removed in favor of v3 publication pins;
- legacy environment aliases and runtime mode switches are removed;
- static widget tokens in HTML are removed;
- legacy workflow deployments may be retired and require review/republishing;
- cutover migrations include irreversible cleanup.

Back up the database, read the 0.17.0 upgrade guide and release notes, use a maintenance window, rotate affected credentials, run migrations and both Doctor commands, republish replacements, test the exact live workflow, and only then reopen traffic.

## What this product is not

- It is not a hosted no-code SaaS; you operate it inside your Laravel application.
- It does not make arbitrary LLM-generated actions safe. Deterministic contracts and host policy remain authoritative.
- It does not promise every model exposed by every adapter behaves identically.
- It does not replace queue/database monitoring, backups, staging, privacy/legal review, or incident response.
- It is pre-1.0. Minor releases may be breaking and require the documented upgrade procedure.

## Release assurance

The sold ZIP is generated from a clean commit, byte-hashed, self-verified, and shipped with an embedded release manifest and CycloneDX SBOM plus an external per-entry manifest. Protected jobs install the same downloaded bytes into clean Laravel 12 and Laravel 13 PostgreSQL/pgvector hosts, exercise the supported upgrade and migration rollback/re-apply, run deterministic and live-provider gates, and run a sustained concurrency/budget soak.

A missing credential, skipped external check, stale public document, path-only install, or committed checklist is not passing evidence. Release status remains `candidate` until the governed contract is explicitly approved.

## Documentation and support

- [Product overview](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRODUCT_OVERVIEW.md)
- [Quickstart and Golden Path](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md)
- [Workflow authoring](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/AGENTIC_WORKFLOWS.md)
- [Chat widget](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md)
- [API Connectors](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/API_CONNECTORS.md)
- [Security and privacy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SECURITY_AND_PRIVACY.md)
- [Compatibility and certification](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md)
- [Known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md)
- [Release notes v0.17.0](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v0.17.0.md)
- [Support policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md)
- [Refund and license terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md)

Support contact: `webdevislife2021@gmail.com`. First-response targets and version/EOL rules are defined in the support policy; they are not resolution guarantees unless a written agreement says otherwise.

This is commercial proprietary software. The purchase record defines the licensed scope. Unless a broader tier is stated, the default is one legal entity and one Licensed Application, including its development/staging/production environments. SaaS use of that application is allowed; redistribution or resale of the plugin or a general-purpose hosted builder is not.
