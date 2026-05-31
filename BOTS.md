# Bots

This is the specific documentation page to share when someone asks:

- what a bot is
- how to create an assistant in Filament Agentic Chatbot
- what can be customized per bot
- how public and internal bots differ

## What A Bot Is

A bot is one assistant configuration inside Filament Agentic Chatbot.

Think of it as the persisted product definition for one assistant experience. A bot tells the system:

- what the assistant is for
- which knowledge sources it can use
- how retrieval should behave
- whether the assistant may use tools and workflows
- who can access it
- how the widget should look

This is why one Laravel + Filament app can run multiple assistants with different behavior from one panel.

## Runtime Model

By default, a bot runs through the assistant chat graph. The assistant keeps the conversation natural and chooses between:

- answering directly from the bot prompt and conversation memory
- calling `KnowledgeSearchTool` to retrieve source-backed context
- calling `run_workflow` to start or resume the active workflow
- using any other registered tool available to that bot

Source-grounded retrieval is still important, but it is not the whole chatbot. It is the knowledge capability behind `KnowledgeSearchTool` and workflow Knowledge Base nodes.

The UI now makes this split explicit with **Chat behavior** on the bot edit page and **Chat Mode** in the bots table. Sources make direct bots useful; active workflows must explicitly search sources. If a bot has sources and no active workflow, direct chat can retrieve from those sources. If an active workflow is live, the workflow controls the conversation and must include a reachable Knowledge Base node for source-grounded answers.

The legacy `ParentAgent` and `KnowledgeAgent` classes remain as compatibility aliases. Do not treat them as the default product architecture.

## What You Can Customize Per Bot

Each bot owns its own:

- name and public ID
- system prompt and response behavior
- provider and model
- retrieval settings
- capability mode
- allowed internal data resources
- allowed domains
- context areas
- widget branding and prompts
- linked sources

In practice, this means you can create:

- a public product-help bot
- an admin-only setup assistant
- a customer-facing onboarding bot
- a tenant- or customer-specific knowledge bot

## How To Create A Bot

1. Open **Agentic Chatbot > Bots** in your Filament panel.
2. Click **Create**.
3. Enter a clear **name** and stable **public ID**.
4. Write the **system prompt** that defines the bot's job.
5. Select the **provider** and **model**.
6. Configure **retrieval** settings.
7. Configure **allowed domains** and **context areas**.
8. Customize the **widget** title, subtitle, welcome message, and quick prompts.
9. Save the bot.
10. Add one or more [Knowledge Sources](KNOWLEDGE_SOURCES.md) and test retrieval.

Creating the bot is only the first step. A bot becomes useful when it has the right sources and retrieval settings behind it.

## Confidence Checks On The Bot Page

After saving a bot, use the edit page as your rollout checklist before you publish or embed it widely.

- **Readiness** shows the active chat provider, model, key path, embedding setup, and infrastructure status currently backing the bot.
- **Production readiness** also surfaces widget signing/domain posture and knowledge chunk readiness so public rollout issues are visible before you copy the embed snippet.
- **Live Preview** renders the current widget theme, copy, and area-specific styling choices directly inside the bot form.
- **Test Retrieval** checks whether the bot is grounding on the right source material.
- **Test Bot Answer** runs the full answer path so you can spot provider, prompt, or retrieval issues early.
- **Setup Check** gives you a quick vector-backend and queue-readiness signal. Use the doctor command for the fuller release blocker.
- **Embed Snippet** gives you a ready-to-paste script tag for the bot's default area and signing mode.
- **Analytics** becomes the next stop once you have live conversations, because it surfaces feedback, citation coverage, traffic, and knowledge gaps.

## Important Bot Fields

### Name

The human-readable label used in Filament and often in the widget header.

Use a name that tells the visitor what the bot is for, such as:

- `Filament Agentic Chatbot Guide`
- `Customer Onboarding Assistant`
- `Internal Ops Assistant`

### Public ID

The stable identifier used by the widget and public chat endpoints.

This is what your embed snippet references. Keep it predictable and slug-like because it is part of the integration surface.

### Instructions

The instructions field defines the bot's role, scope, tone, and response rules.

Use it for:

- role definition
- audience targeting
- answer style
- boundaries and fallback behavior
- docs-linking behavior

Do not use it as a substitute for real source content. Instructions guide behavior; sources provide the grounded knowledge.

### Provider And Model

You can choose which provider and model a bot uses for chat.

This lets you optimize different bots for:

- speed
- response quality
- cost
- provider-specific capabilities

The built-in provider picker supports Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, Azure OpenAI, and OpenAI-compatible gateways. Each provider includes a small curated model list, and the **Manual ID** option lets you enter exact model identifiers from your provider.

Use OpenRouter for routed models such as Qwen or DeepSeek variants without adding a provider-specific integration for each model family. Use **OpenAI-Compatible** when the provider exposes a chat-completions-style API with a custom base URL, such as Qwen DashScope compatible mode or a private gateway. Enter the base URL on the bot, or configure it globally with:

```env
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_DRIVER=openrouter
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
AGENTIC_CHATBOT_OPENAI_COMPATIBLE_API_KEY=...
```

The custom base URL is used by both normal bot replies and workflow AI steps. It should include the provider's `/v1` path when that provider requires it.

For production examples, see [OpenAI-Compatible Providers](OPENAI_COMPATIBLE_PROVIDERS.md).

### Retrieval Settings

The most important retrieval settings are:

- `top_k`: how many chunks to retrieve
- `min_similarity`: how strict the relevance filter is
- context budget: how much retrieved content can be passed into the answer prompt

These settings strongly influence whether the bot feels too vague, too strict, or well-grounded.

### Capability Mode

Capability mode controls what linked workflows may do at runtime:

- `query_only` allows knowledge queries and read-only internal data lookups
- `write_only` allows structured writes or capture flows, but blocks query behavior
- `query_and_write` allows both

This matters most once a bot is linked to workflows.

- `query_data_resource` and knowledge search require query capability.
- `store_submission` requires write capability.
- `httpRequest` and `apiConnector` treat `GET` as query behavior and `POST` / `PUT` / `PATCH` / `DELETE` as write behavior.
- Custom workflow actions can opt into capability enforcement by declaring `capability: query` or `capability: write` in `filament-agentic-chatbot.workflow.actions`.
- Untagged custom actions are not auto-classified, so treat them as application-level responsibility.

### Allowed Internal Data Resources

Bots can opt into specific internal data resources that workflows may read through `query_data_resource`.

Each enabled resource is:

- defined globally in config
- allow-listed per bot
- read-only at runtime
- limited to the declared fields, filters, sort options, and max limit

Use this when a workflow needs safe access to internal business records such as customers, cases, or orders without exposing arbitrary database access.

If you need tenant-aware or actor-aware row filtering, add that through your model scopes or resource design. The registry controls which model fields are exposed, but it does not invent your business-specific authorization rules for you.

The built-in `bots` resource is scoped to the current bot by default. Expose a global bot catalog only by overriding that resource in your host app configuration.

### Smart Data Queries

The Behavior tab also includes **Smart Data Queries**. This is the admin-friendly layer above `query_data_resource`.

Admins choose:

- which data sources the bot may read
- whether generated workflows should accept natural data questions
- the default and maximum number of records for smart generated query flows
- a preview of each selected resource's sortable fields, filterable fields, returned fields, runtime scope, and resource limits

The workflow generator then handles phrases such as "newest workflow", "active products", "cheapest plan", or "highest priced item" by creating a structured query plan and passing it into `query_data_resource`. The runtime still validates all fields, filters, sorting, and limits against the allow-listed resource definition.

For product catalogs, define useful `field_metadata` for columns such as price, created date, availability, and name. Natural requests like "cheapest product" or "two newest products" work best when numeric and date fields have clear labels, types, aliases, and descriptions.

### Allowed Domains

Allowed domains limit where the widget can be embedded.

Use this when you want a public bot on your marketing site but do not want the widget embedded elsewhere.

Empty allowlists are compatibility-only when `AGENTIC_CHATBOT_WIDGET_ALLOW_ALL_DOMAINS=true`. Production bots should list exact hosts.

### Context Areas

Context areas help separate different assistant experiences such as:

- `public`
- `member`
- `admin`

Use different bots when access scope or audience meaningfully changes.

### Widget Settings

Each bot can have its own:

- title
- subtitle
- welcome message
- quick prompts
- accent color
- style template
- compact mode

This matters because the widget is what the end user actually sees. The title and subtitle should explain why the assistant exists on that page.

### Bot To Workflow Assignment

One bot can store multiple workflow records, but only one enabled workflow can own chat traffic at a time.

Use that model like this:

- keep extra workflows as drafts, alternates, or release history for the same bot
- enable the one workflow that should be exposed to the assistant as the live workflow tool
- create a separate bot when you need a genuinely different chatbot experience

This keeps routing, analytics, sessions, and UX understandable.

## How Bot Customization Affects The User Experience

### Prompt + Sources

This controls what the bot is supposed to do and what it can answer from.

### Retrieval Settings

This controls whether the bot feels grounded, noisy, or too narrow.

### Capability Mode And Data Access

This controls whether workflows attached to the bot can answer questions, capture structured data, or safely query internal records.

### Context And Access

This controls whether the bot is public, member-only, or admin-only.

### Widget Copy And Branding

This controls whether a visitor instantly understands the purpose of the assistant.

For example:

- a vague bot title creates confusion
- a clear subtitle explains why the bot is on the page
- strong quick prompts help users ask better questions

## When To Create A Separate Bot

Create a separate bot when you need a different:

- audience, such as public visitors vs internal admins
- source set, such as product docs vs internal runbooks
- tone or prompt behavior
- widget design or onboarding copy
- provider/model combination
- access policy
- live workflow behavior

Do not create separate bots only to change one small answer. Start with the bot prompt and source set first.

## Typical Bot Patterns

### Public Product Guide

Use for:

- presales questions
- onboarding questions
- public documentation
- feature discovery

### Internal Ops Assistant

Use for:

- admin-only support
- runbooks
- setup help
- maintenance workflows
- safe internal data lookups via `query_data_resource`

### Customer-Specific Assistant

Use when you need:

- customer-specific docs
- tenant-specific knowledge
- branded per-customer assistants

## Best Practices

- Keep each bot focused on one job and one audience.
- Use different bots when source quality or permissions differ.
- Write a system prompt that explains exactly what the bot is for.
- Give the widget title and subtitle a clear user-facing purpose.
- Add quick prompts that reflect real user intent.
- Test retrieval after adding or changing sources.
- Keep the assistant graph enabled unless you explicitly need the direct workflow compatibility path.
- Use workflows for task execution and guided flows, not for every simple factual answer.

## Related Docs

- [Core Concepts](CORE_CONCEPTS.md)
- [Agent Runtime Architecture](AGENT_RUNTIME_ARCHITECTURE.md)
- [Knowledge Sources](KNOWLEDGE_SOURCES.md)
- [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md)
- [Context Areas](CONTEXT_AREAS.md)
- [Chat Widget](CHAT_WIDGET.md)
- [API Integrations](API_INTEGRATIONS.md)
- [OpenAI-Compatible Providers](OPENAI_COMPATIBLE_PROVIDERS.md)
