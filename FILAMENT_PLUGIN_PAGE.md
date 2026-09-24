# Agentic AI Chatbot Builder

Build and manage AI chatbots for your Laravel application directly in Filament. Configure each chatbot's instructions, knowledge base, approved tools, and embeddable chat widget, then test its answers and tool choices before making it available to users.

An Agent can choose when to answer a question, search your knowledge sources, read permitted application data, or invoke a visual Playbook for a task that needs several steps. You define the tools and access it receives. Application actions remain subject to authorization, confirmation, and execution rules.

**Commercial Early Access** · **Filament 5** · **Laravel 12 and 13** · **Bring your own AI provider keys**

- [Try the live demo](https://filament-agentic-chatbot.heinerdevelops.tech/)
- [Read the quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md)
- [Check compatibility and provider support](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md)

## What you can build

### Customer support and onboarding chatbots

Create a support chatbot that answers questions from your documentation, explains product features, and helps users find relevant information. Answers can include source citations. Your team can review conversations and feedback in Filament and take over through the Human Handoff Desk when needed.

### Internal AI assistants with access to Laravel data

Build an assistant that helps users look up information in your application. For example, it could retrieve a permitted order or find a record through a configured API. You choose the Eloquent resources, fields, filters, scopes, and API operations it may use; access stays within those approved boundaries.

### Conversational workflows for application tasks

Guide a user through collecting details, checking a condition, requesting approval, and calling a configured application action. The optional visual Playbook Builder lets you define those steps and inspect the resulting run. Each use case depends on the data, integrations, and permissions you configure.

## What makes the chatbots agentic?

Each Agent handles the conversation and selects from the knowledge and tools attached to its tested release. It can ask for clarification when required information is missing and use an optional Playbook when a request matches that Playbook's purpose.

Direct data and Connector tools provide approved reads. Actions that change application or external data run through the configured capability and Playbook contracts, including any required confirmation. An Agent does not receive unrestricted access to your database, application code, or arbitrary APIs.

A Playbook is never required for ordinary or knowledge-grounded chat. You can start with a knowledge assistant and add tools or visual workflows as your use case grows.

## Build and manage AI chatbots in Filament

Manage multiple Agents from your existing admin panel, with separate instructions, providers, models, knowledge settings, access rules, and widget presentation.

### Customize each chatbot for its role

- **Behavior and answers:** define the Agent's purpose, instructions, tone, and response policy.
- **AI provider and model:** choose the configured provider and model for each Agent.
- **Knowledge and tools:** attach the sources, Laravel Data Resources, API Connector operations, and optional Playbooks that serve its role. Developers can register custom application capabilities.
- **Chat experience:** adjust the widget's style template, colors, title, welcome guidance, suggested messages, and source presentation.
- **Access:** configure the intended audience and permitted website origins, alongside the permissions enforced by your application.

For example, a public support chatbot can use product documentation and a support Playbook, while an internal assistant uses a different model and selected application data. Each Agent has its own configuration and permitted tools.

### From configuration to a tested chatbot

1. **Create an Agent.** Define its role, response behavior, provider, and model.
2. **Connect its knowledge and tools.** Attach selected sources, Data Resources, API Connector operations, host capabilities, and optional Playbooks.
3. **Test representative conversations.** Check answers, tool choices, missing information, and failure behavior.
4. **Select a tested Agent release.** Use **Publish candidate**, run **Test release candidate**, and then **Select tested release** after that exact candidate has passing evidence. Selecting a release leaves the Agent's availability unchanged.
5. **Make it available where needed.** Configure availability and website access, then embed its chat widget or use a supported server or channel integration.

Saved behavior changes need a tested replacement release. Availability, website access, and credential changes take effect when saved. This lets you improve a draft while the active Agent continues using its tested configuration.

## Knowledge bases and RAG with source citations

Connect text, files, URLs, and configured API-fed sources to an Agent's knowledge base. Retrieval-augmented generation (RAG) retrieves relevant source material to help the Agent answer questions using your content.

- Configure retrieval settings for each Agent.
- Include source citations in answers where available.
- Re-ingest sources when their content changes.
- Review source use, user feedback, and knowledge gaps to identify content that needs improvement.

Source retrieval helps ground answers; AI output still needs testing and review for your intended use case.

## Connect Laravel Eloquent data and APIs

Use **Data Resources** to expose selected Eloquent data with explicit field, filter, sort, scope, result, and query-budget controls.

Use **API Connectors** to define the operations an Agent or Playbook may call. **Integration Studio** can import OpenAPI, Postman, or cURL definitions into inactive drafts for review. Developers can also register host application capabilities explicitly.

Versioned operation bindings, authorization checks, confirmation, duplicate-execution controls, redaction, and reconciliation govern execution. These controls support application integrations while keeping the permitted actions explicit.

## Connect remote MCP data sources

**Coming in the next release:** MCP data sources are implemented in the development build.

Connect an existing remote **Model Context Protocol (MCP)** server over HTTPS and choose the data-reading functions an Agent may use. Review and test each operation before attaching it to an Agent. The guided GitHub setup can prepare access to a specific repository's documentation, files, issues, and commits.

MCP access is read-only, including inside Playbooks. Use separately configured API Connector operations for actions that change data. Provider presets simplify connection setup; you still choose the account, permissions, and approved tools.

See the [MCP data-source setup guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/MCP_CONNECTIONS.md) for authentication and supported connections.

## Visual workflow builder with optional Playbooks

A **Playbook** is a visual workflow for a specific task that needs a defined sequence of steps. You describe when the Agent should use it and build the process on a canvas inside Filament. The Agent invokes it when a matching request needs that process.

![Filament visual workflow builder with input, decision, approval and human handoff steps for a support Playbook](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/2026-09-08-playbook-editor.png)

*Smart Support Concierge in the current development build: collect a support brief, choose a priority, request approval, and hand the conversation to your team.*

For example, a support Playbook could collect an issue description, look up an allowed record, branch on the result, ask for confirmation, and call your configured ticket-creation action. You supply the relevant data access and integration; the Playbook defines how those steps fit together.

Playbooks can collect input, branch on conditions, request approvals, call capabilities, wait for a result, perform AI tasks, transform values, and hand work to a person.

- Combine input, decision, action, and result steps.
- Use bounded iteration and sub-Playbooks for reusable processes.
- Validate a Playbook before publication.
- Inspect runs, checkpoints, waits, cancellations, and execution traces.
- Publish tested configurations so edits do not silently alter existing releases.

The Agent remains responsible for the conversation. A Playbook defines the controlled process for the requests that need one.

## Embeddable chat widgets for your website

Add a chatbot to your website or product frontend using the generated script snippet. Configure its appearance and welcome experience in Filament, including style templates, colors, titles, suggested messages, and source presentation.

<img src="https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/2026-09-08-chatbot-widget.png" alt="AI chatbot widget with a custom welcome screen and conversation starters for documentation, APIs and database questions" width="380" />

*The current development widget's welcome screen, captured from the local demo. Set your own branding and conversation starters in Filament.*

The browser integration includes streaming responses, private attachments, bounded page context, and a typed widget SDK with lifecycle events for application integration.

After creating and testing an Agent, copy its generated embed snippet into your website layout. It has this form:

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

Use the URL and Agent ID from your own generated snippet. Widget appearance and welcome settings are managed in the Agent editor.

Production embeds use a **tokenless bootstrap**: the snippet contains no permanent browser credential. The loader calls the origin-checked `/bootstrap` endpoint and keeps short-lived access tokens in memory. Configure a dedicated signing key and an exact Allowed Domains entry for each intended website origin.

[Read the widget setup and integration guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md).

## Human handoff, conversation review, and quality tests

Operate your chatbots from Filament with conversation history, feedback, usage reporting, privacy actions, and execution traces. The Human Handoff Desk supports assignment, internal notes, operator replies, and an explicit return to the Agent.

Versioned Solution Kits provide reviewed starting configurations, including Customer Support & Human Handoff. Quality scenarios and candidate-versus-live comparisons help you check how changes affect representative conversations before rollout.

Agent Access Tokens provide trusted server access. An optional Mailgun email adapter is included and requires separate provider setup and validation in your deployment before production use. Check the [compatibility matrix](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md) and [channel setup guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHANNELS.md) for its configuration and availability requirements.

## Requirements and installation

This is a commercial Laravel package installed in your own application. You need a compatible Laravel and Filament installation, your own AI provider account and keys, a supported database and vector store, and a supervised asynchronous queue worker.

PostgreSQL with pgvector is the documented release-validation database path. ChromaDB is an alternative vector-store adapter that buyers must validate in their own environment. Docker is used for reproducible release checks; it is not a requirement for customer hosting.

### 1. Install with Composer

After purchasing a license, copy the private Composer repository URL from your Anystack account. Run these commands inside your Laravel application, replacing the example URL with the one Anystack provides:

```bash
composer config repositories.filament-agentic-chatbot composer https://YOUR-ANYSTACK-PRODUCT.composer.sh
composer require heiner/filament-agentic-chatbot
```

Use the buyer credentials shown by Anystack when Composer requests authentication. Keep license credentials out of your application repository. Check the [compatibility matrix](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md) before choosing a package release.

### 2. Register the plugin in Filament

Add the plugin to your existing panel provider's `plugins()` list before running the installer. This example shows the relevant registration; keep the rest of your panel configuration and existing plugins:

```php
use Filament\Panel;
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

public function panel(Panel $panel): Panel
{
    return $panel->plugins([
        FilamentAgenticChatbotPlugin::make(),
    ]);
}
```

### 3. Configure and finish setup

Follow the [quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md) to configure your database, vector store, AI provider, and keys. Then run the installer:

```bash
php artisan filament-agentic-chatbot:install
```

The installer checks panel registration, publishes configuration, runs migrations, and executes Doctor setup diagnostics. Resolve reported failures before serving users. Start an asynchronous queue worker for ingestion and background work:

```bash
php artisan queue:work
```

Use a supervised worker in production. Complete the quickstart's theme and website-access setup, then create and test an Agent before embedding it for users.

Available package versions are listed in your Anystack account. The installation guides and compatibility matrix identify their documentation target; confirm that it matches the package you are installing. Before upgrading an existing installation, follow the [upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md) for backups, migrations, and any breaking changes.

## Common questions

### Is this a hosted chatbot service?

No. The builder runs inside your Laravel application and is managed through Filament. You operate the application, queues, database, storage, backups, and monitoring. Model requests go to the AI provider you configure.

### Are AI usage fees included?

No. This is bring-your-own-key software. You supply your own provider credentials and pay provider and infrastructure costs separately from the plugin license.

### Do I need a workflow for every chatbot?

No. An Agent can answer questions, use its knowledge base, and perform approved reads without a Playbook. Add a visual workflow when a task requires a defined sequence, approval, or application action.

### Can I use it in a SaaS application?

The default license allows use in one Licensed Application, including that application's SaaS use and development, staging, and production environments. Your host application remains responsible for tenancy, billing, users, business data, privacy, and final production policy. Broader rights depend on your purchase terms.

## Early access, documentation, and support

This product is sold as **Commercial Early Access**. Validate the provider, model, integrations, and operating environment you intend to use. An available adapter does not certify every provider or account configuration, and AI responses can be wrong.

- [Product overview](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PRODUCT_OVERVIEW.md)
- [Known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md)
- [Security and privacy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SECURITY_AND_PRIVACY.md)
- [Support policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md)

Support contact: `webdevislife2021@gmail.com`. Published response targets are first-response targets, not a resolution guarantee.

## License

This is commercial proprietary software. Unless your purchase record grants a broader tier, the default scope is one legal entity and one Licensed Application. Redistribution of the plugin or resale of a general-purpose hosted builder is not permitted.

[Read the refund and license terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).
